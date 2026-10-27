import test from 'node:test';
import assert from 'node:assert/strict';

import { layoutPostGraph } from '../lib/postGraphLayout.ts';

function makeGraph(count, edges = []) {
  return {
    nodes: Array.from({ length: count }, (_, index) => ({
      id: `post-${index}`,
      title: `Post ${index}`,
      href: `/posts/post-${index}`,
    })),
    edges,
  };
}

function assertBounded(positions) {
  for (const node of positions) {
    assert.ok(Number.isFinite(node.x), `${node.id} has a finite x coordinate`);
    assert.ok(Number.isFinite(node.y), `${node.id} has a finite y coordinate`);
    assert.ok(node.x >= 18 && node.x <= 302, `${node.id} respects horizontal inset`);
    assert.ok(node.y >= 18 && node.y <= 262, `${node.id} respects vertical inset`);
  }
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

test('post graph layout handles empty and single-node graphs', () => {
  assert.deepEqual(layoutPostGraph(makeGraph(0)), []);

  const graph = makeGraph(1);
  const positions = layoutPostGraph(graph);
  assert.equal(positions.length, 1);
  assertBounded(positions);
});

test('post graph layout is deterministic and leaves graph data unchanged', () => {
  const graph = makeGraph(24, [
    { source: 'post-0', target: 'post-1' },
    { source: 'post-1', target: 'post-2' },
    { source: 'post-4', target: 'post-9' },
  ]);
  for (const node of graph.nodes) Object.freeze(node);
  for (const edge of graph.edges) Object.freeze(edge);
  Object.freeze(graph.nodes);
  Object.freeze(graph.edges);
  Object.freeze(graph);

  const first = layoutPostGraph(graph);
  const second = layoutPostGraph(graph);
  assert.deepEqual(first, second);
  assertBounded(first);
});

test('disconnected posts remain visible and repel rather than overlap', () => {
  const graph = makeGraph(40);
  const positions = layoutPostGraph(graph);
  assert.equal(positions.length, graph.nodes.length);
  assert.deepEqual(positions.map((node) => node.id), graph.nodes.map((node) => node.id));
  assertBounded(positions);

  for (let first = 0; first < positions.length; first++) {
    for (let second = first + 1; second < positions.length; second++) {
      assert.ok(distance(positions[first], positions[second]) > 6, 'isolated nodes stay distinct');
    }
  }
  const xs = positions.map((node) => node.x);
  const ys = positions.map((node) => node.y);
  assert.ok(Math.max(...xs) - Math.min(...xs) > 120, 'nodes use horizontal space');
  assert.ok(Math.max(...ys) - Math.min(...ys) > 100, 'nodes use vertical space');
});

test('a real link attracts its endpoints while repulsion keeps them separate', () => {
  const unlinked = layoutPostGraph(makeGraph(2));
  const linked = layoutPostGraph(makeGraph(2, [{ source: 'post-0', target: 'post-1' }]));
  const linkedDistance = distance(linked[0], linked[1]);

  assert.ok(linkedDistance < distance(unlinked[0], unlinked[1]));
  assert.ok(linkedDistance > 18, 'linked nodes remain distinguishable in a compact graph');
  assertBounded(linked);
});

test('larger mixed graphs keep every post finite and inside the viewport', () => {
  const graph = makeGraph(160, Array.from({ length: 35 }, (_, index) => ({
    source: `post-${index}`,
    target: `post-${index + 1}`,
  })));
  const positions = layoutPostGraph(graph);

  assert.equal(positions.length, graph.nodes.length);
  assert.equal(new Set(positions.map((node) => node.id)).size, graph.nodes.length);
  assertBounded(positions);
});
