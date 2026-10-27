'use client';

import { useMemo, useRef, useState } from 'react';
import type { PostGraph as PostGraphData } from '@/lib/postGraph';
import type { PositionedPostGraphNode } from '@/lib/postGraphLayout';

export function PostGraph({ graph, positions }: { graph: PostGraphData; positions: PositionedPostGraphNode[] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [active, setActive] = useState<string | null>(null);
  // Reuse server positions: force calculations can differ slightly between JS engines.
  const { nodes, byId, neighbors, links, groups } = useMemo(() => {
    const nodes = positions;
    const byId = new Map(nodes.map(node => [node.id, node]));
    const neighbors = new Map(nodes.map(node => [node.id, new Set<string>()]));
    for (const edge of graph.edges) {
      neighbors.get(edge.source)?.add(edge.target);
      neighbors.get(edge.target)?.add(edge.source);
    }
    const links = graph.edges.filter(edge => edge.kind === 'link');
    // Categories are drawn as a shaded area with spokes instead of every pairwise edge.
    const members = new Map<string, PositionedPostGraphNode[]>();
    for (const node of nodes) {
      if (node.category) members.set(node.category, [...(members.get(node.category) ?? []), node]);
    }
    const groups = [...members].filter(([, group]) => group.length > 1).map(([name, group]) => {
      const x = group.reduce((sum, node) => sum + node.x, 0) / group.length;
      const y = group.reduce((sum, node) => sum + node.y, 0) / group.length;
      const r = Math.max(...group.map(node => Math.hypot(node.x - x, node.y - y))) + 8;
      return { name, x, y, r, members: group };
    });
    return { nodes, byId, neighbors, links, groups };
  }, [graph, positions]);
  const linked = new Set(links.flatMap(edge => [edge.source, edge.target]));
  const activeNode = active ? byId.get(active) : undefined;

  function renderGraph(labels: boolean) {
    return (
      <>
        <svg className="post-graph-svg" viewBox="0 0 320 280" role="group" aria-label="게시글 연결 그래프" onMouseLeave={() => setActive(null)}>
          <g aria-hidden="true">
            {groups.map(group => {
              const isActive = activeNode?.category === group.name;
              return (
                <g key={group.name} className={`post-graph-group${isActive ? ' is-active' : ''}`}>
                  <circle cx={group.x} cy={group.y} r={group.r} />
                  {group.members.map(node => <line key={node.id} x1={group.x} y1={group.y} x2={node.x} y2={node.y} />)}
                  {labels && <text x={group.x} y={group.y - group.r - 4} textAnchor="middle">{group.name}</text>}
                </g>
              );
            })}
            {links.map(edge => {
              const source = byId.get(edge.source)!;
              const target = byId.get(edge.target)!;
              // A slight bend separates links from the straight category spokes.
              const cx = (source.x + target.x) / 2 - (target.y - source.y) * 0.2;
              const cy = (source.y + target.y) / 2 + (target.x - source.x) * 0.2;
              return <path key={JSON.stringify([edge.source, edge.target])} d={`M${source.x} ${source.y}Q${cx} ${cy} ${target.x} ${target.y}`} className={`post-graph-link${active === edge.source || active === edge.target ? ' is-active' : ''}`} />;
            })}
          </g>
          {nodes.map(node => (
            <a key={node.id} href={node.href} aria-label={node.title} onMouseEnter={() => setActive(node.id)} onFocus={() => setActive(node.id)} onBlur={() => setActive(null)} className={active === node.id || (active && neighbors.get(active)?.has(node.id)) ? 'is-active' : undefined}>
              <title>{node.title}</title>
              <circle cx={node.x} cy={node.y} r="11" fill="transparent" />
              <circle className={`post-graph-dot${linked.has(node.id) ? ' is-linked' : ''}`} cx={node.x} cy={node.y} r={linked.has(node.id) ? 4 : 3.25} />
            </a>
          ))}
        </svg>
        <p className="post-graph-selection">
          {activeNode ? <>{activeNode.category && <span className="post-graph-selection-category">{activeNode.category}</span>}{activeNode.title}</> : '노드를 선택해 글로 이동'}
        </p>
      </>
    );
  }

  return (
    <section className="post-graph" aria-label="글 연결">
      <div className="post-graph-heading">
        <h2>글 연결</h2>
        {nodes.length > 0 && <button type="button" className="post-graph-expand" aria-label="글 연결 그래프 크게 보기" title="크게 보기" onClick={() => { setActive(null); dialog.current?.showModal(); }}>
          <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5" /></svg>
        </button>}
      </div>
      <p className="post-graph-caption">{nodes.length}개 글 · {graph.edges.length}개 연결</p>
      {nodes.length ? renderGraph(false) : <p className="post-graph-selection">아직 공개된 글이 없습니다.</p>}
      <p className="post-graph-caption">곡선: 본문 링크 · 묶음: 같은 카테고리</p>
      <dialog ref={dialog} className="post-graph-dialog" aria-label="전체 게시글 연결 그래프" onClose={() => setActive(null)}>
        <div className="post-graph-heading">
          <h2>글 연결</h2>
          <button type="button" className="post-graph-expand" aria-label="그래프 닫기" onClick={() => dialog.current?.close()}>×</button>
        </div>
        <p className="post-graph-caption">{nodes.length}개 글 · {graph.edges.length}개 연결</p>
        <p className="post-graph-caption">곡선: 본문 링크 · 묶음: 같은 카테고리</p>
        {renderGraph(true)}
      </dialog>
    </section>
  );
}
