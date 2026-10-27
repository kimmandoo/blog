import type { PostGraph, PostGraphNode } from './postGraph';

export type PositionedPostGraphNode = PostGraphNode & { x: number; y: number };

const WIDTH = 320;
const HEIGHT = 280;
const INSET = 18;
const ITERATIONS = 240;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

export function layoutPostGraph(
  graph: PostGraph,
): PositionedPostGraphNode[] {
  const count = graph.nodes.length;
  if (count === 0) return [];

  const halfWidth = WIDTH / 2 - INSET;
  const halfHeight = HEIGHT / 2 - INSET;
  const positions = graph.nodes.map((node, index) => {
    // A sunflower distribution keeps disconnected posts spread out from the start.
    const radius = Math.sqrt((index + 0.5) / count) * 0.85;
    const angle = index * GOLDEN_ANGLE;
    return {
      ...node,
      x: WIDTH / 2 + Math.cos(angle) * radius * halfWidth,
      y: HEIGHT / 2 + Math.sin(angle) * radius * halfHeight,
    };
  });

  if (count === 1) {
    positions[0].x = WIDTH / 2;
    positions[0].y = HEIGHT / 2;
    return positions;
  }

  // Each shared category becomes a virtual hub, so a category forms a tidy ring
  // instead of the knot that all-pairs category springs would produce.
  const hubs = new Map<string, number[]>();
  graph.nodes.forEach((node, index) => {
    if (!node.category) return;
    const members = hubs.get(node.category);
    if (members) members.push(index);
    else hubs.set(node.category, [index]);
  });
  const groups = [...hubs.values()].filter((members) => members.length > 1);
  const total = count + groups.length;
  for (const members of groups) {
    positions.push({
      ...positions[members[0]],
      x: members.reduce((sum, index) => sum + positions[index].x, 0) / members.length,
      y: members.reduce((sum, index) => sum + positions[index].y, 0) / members.length,
    });
  }

  const indices = new Map(graph.nodes.map((node, index) => [node.id, index]));
  const linkCount = graph.edges.filter((edge) => edge.kind === 'link').length;
  const memberCount = groups.reduce((sum, members) => sum + members.length, 0);
  const sources = new Int32Array(linkCount + memberCount);
  const targets = new Int32Array(linkCount + memberCount);
  const lengths = new Float64Array(linkCount + memberCount);
  let edgeCount = 0;

  const forceX = new Float64Array(total);
  const forceY = new Float64Array(total);
  const spacing = Math.min(64, Math.sqrt((halfWidth * halfHeight * 4) / count) * 0.55);
  const repulsion = spacing * spacing;
  const linkLength = Math.max(24, Math.min(40, spacing * 0.7));

  for (const edge of graph.edges) {
    if (edge.kind !== 'link') continue;
    const source = indices.get(edge.source);
    const target = indices.get(edge.target);
    if (source === undefined || target === undefined || source === target) continue;
    sources[edgeCount] = source;
    targets[edgeCount] = target;
    lengths[edgeCount] = linkLength;
    edgeCount++;
  }
  groups.forEach((members, group) => {
    // Larger categories need a wider ring to keep their members apart.
    const ringRadius = Math.max(12, (members.length * spacing * 0.42) / (2 * Math.PI));
    for (const member of members) {
      sources[edgeCount] = count + group;
      targets[edgeCount] = member;
      lengths[edgeCount] = ringRadius;
      edgeCount++;
    }
  });

  // Fixed iterations and a cooling movement cap avoid animation and timing-dependent results.
  for (let iteration = 0; iteration < ITERATIONS; iteration++) {
    for (let index = 0; index < total; index++) {
      // Gentle elliptical gravity prevents isolated nodes from piling up along the bounds.
      forceX[index] = -(positions[index].x - WIDTH / 2);
      forceY[index] = -(positions[index].y - HEIGHT / 2) * (halfWidth / halfHeight);
    }

    for (let source = 0; source < total; source++) {
      for (let target = source + 1; target < total; target++) {
        let dx = positions[source].x - positions[target].x;
        let dy = positions[source].y - positions[target].y;
        let distanceSquared = dx * dx + dy * dy;
        if (distanceSquared < 0.01) {
          // Deterministically separate coincident nodes without a random jitter.
          dx = 0.1;
          dy = 0;
          distanceSquared = 0.01;
        }
        const strength = repulsion / distanceSquared;
        const x = dx * strength;
        const y = dy * strength;
        forceX[source] += x;
        forceY[source] += y;
        forceX[target] -= x;
        forceY[target] -= y;
      }
    }

    for (let edge = 0; edge < edgeCount; edge++) {
      const source = sources[edge];
      const target = targets[edge];
      const dx = positions[target].x - positions[source].x;
      const dy = positions[target].y - positions[source].y;
      const distance = Math.hypot(dx, dy);
      if (distance <= lengths[edge]) continue;
      const strength = ((distance - lengths[edge]) / distance) * 1.4;
      const x = dx * strength;
      const y = dy * strength;
      forceX[source] += x;
      forceY[source] += y;
      forceX[target] -= x;
      forceY[target] -= y;
    }

    const maxMovement = 6 * (1 - iteration / ITERATIONS) + 0.05;
    for (let index = 0; index < total; index++) {
      const magnitude = Math.hypot(forceX[index], forceY[index]);
      const scale = magnitude > maxMovement ? maxMovement / magnitude : 1;
      positions[index].x = Math.max(
        INSET,
        Math.min(WIDTH - INSET, positions[index].x + forceX[index] * scale),
      );
      positions[index].y = Math.max(
        INSET,
        Math.min(HEIGHT - INSET, positions[index].y + forceY[index] * scale),
      );
    }
  }

  return positions.slice(0, count);
}
