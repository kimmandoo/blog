'use client';

import { useMemo, useRef, useState } from 'react';
import type { PostGraph as PostGraphData } from '@/lib/postGraph';
import type { PositionedPostGraphNode } from '@/lib/postGraphLayout';

export function PostGraph({ graph, positions }: { graph: PostGraphData; positions: PositionedPostGraphNode[] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [active, setActive] = useState<string | null>(null);
  // Reuse server positions: force calculations can differ slightly between JS engines.
  const { nodes, byId, neighbors } = useMemo(() => {
    const nodes = positions;
    const byId = new Map(nodes.map(node => [node.id, node]));
    const neighbors = new Map(nodes.map(node => [node.id, new Set<string>()]));
    for (const edge of graph.edges) {
      neighbors.get(edge.source)?.add(edge.target);
      neighbors.get(edge.target)?.add(edge.source);
    }
    return { nodes, byId, neighbors };
  }, [graph, positions]);

  function renderGraph() {
    return (
      <>
        <svg className="post-graph-svg" viewBox="0 0 320 280" role="group" aria-label="게시글 연결 그래프" onMouseLeave={() => setActive(null)}>
          <g aria-hidden="true">
            {graph.edges.map(edge => {
              const source = byId.get(edge.source)!;
              const target = byId.get(edge.target)!;
              return <line key={JSON.stringify([edge.source, edge.target])} x1={source.x} y1={source.y} x2={target.x} y2={target.y} className={`post-graph-edge-${edge.kind}${active === edge.source || active === edge.target ? ' is-active' : ''}`} />;
            })}
          </g>
          {nodes.map(node => (
            <a key={node.id} href={node.href} aria-label={node.title} onMouseEnter={() => setActive(node.id)} onFocus={() => setActive(node.id)} onBlur={() => setActive(null)} className={active === node.id || (active && neighbors.get(active)?.has(node.id)) ? 'is-active' : undefined}>
              <title>{node.title}</title>
              <circle cx={node.x} cy={node.y} r="11" fill="transparent" />
              <circle className="post-graph-dot" cx={node.x} cy={node.y} r={neighbors.get(node.id)?.size ? 4.5 : 3} />
            </a>
          ))}
        </svg>
        <p className="post-graph-selection">{active ? byId.get(active)?.title : '노드를 선택해 글로 이동'}</p>
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
      {nodes.length ? renderGraph() : <p className="post-graph-selection">아직 공개된 글이 없습니다.</p>}
      <p className="post-graph-caption">실선: 본문 링크 · 점선: 같은 카테고리</p>
      <dialog ref={dialog} className="post-graph-dialog" aria-label="전체 게시글 연결 그래프" onClose={() => setActive(null)}>
        <div className="post-graph-heading">
          <h2>글 연결</h2>
          <button type="button" className="post-graph-expand" aria-label="그래프 닫기" onClick={() => dialog.current?.close()}>×</button>
        </div>
        <p className="post-graph-caption">{nodes.length}개 글 · {graph.edges.length}개 연결</p>
        <p className="post-graph-caption">실선: 본문 링크 · 점선: 같은 카테고리</p>
        {renderGraph()}
      </dialog>
    </section>
  );
}
