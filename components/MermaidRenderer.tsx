'use client';

import { useEffect } from 'react';

import { getMermaidSizing } from '@/lib/mermaidSizing.mjs';

const VIEWPORT_MARGIN = '200px';
const MIN_SCALE = 0.5;
const MAX_SCALE = 4;
const ZOOM_STEP = 0.15;

type MermaidApi = typeof import('mermaid').default;

function resolveMermaidTheme() {
  if (document.documentElement.dataset.theme === 'dark' || document.documentElement.classList.contains('dark')) {
    return 'dark';
  }

  if (!document.documentElement.classList.contains('light') && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  return 'default';
}

function showSkeleton(container: HTMLElement) {
  container.classList.remove('mermaid--loaded', 'mermaid--error');
  container.classList.add('mermaid--loading');

  if (container.querySelector('.mermaid__skeleton')) {
    return;
  }

  const skeleton = document.createElement('div');
  skeleton.className = 'mermaid__skeleton';
  skeleton.setAttribute('aria-hidden', 'true');
  skeleton.innerHTML = [
    '<div class="mermaid__skeleton-bar" style="width:70%"></div>',
    '<div class="mermaid__skeleton-bar" style="width:90%"></div>',
    '<div class="mermaid__skeleton-bar" style="width:50%"></div>',
  ].join('');
  container.appendChild(skeleton);
}

function clearContainerState(container: HTMLElement) {
  container.classList.remove('mermaid--loading', 'mermaid--loaded', 'mermaid--error');
  container.querySelector('.mermaid__skeleton')?.remove();
  container.querySelector('.mermaid__svg-wrap')?.remove();
  container.querySelector('.mermaid__fallback')?.remove();
  container.querySelector('.mermaid__zoom-controls')?.remove();
}

function normalizeSvg(svg: SVGSVGElement, wrap: HTMLElement, container: HTMLElement) {
  const { isPortrait, targetWidth } = getMermaidSizing({
    viewBox: svg.getAttribute('viewBox'),
    widthAttr: svg.getAttribute('width'),
    heightAttr: svg.getAttribute('height'),
    containerWidth: container.clientWidth,
  });

  svg.removeAttribute('width');
  svg.removeAttribute('height');
  svg.style.width = targetWidth > 0 ? `${targetWidth}px` : '100%';
  svg.style.maxWidth = '100%';
  svg.style.height = 'auto';
  svg.style.display = 'block';
  wrap.classList.toggle('mermaid__svg-wrap--portrait', isPortrait);
}

function clampScale(scale: number) {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
}

function shouldCapturePointerGesture(state: { scale: number; panX: number; panY: number }) {
  return state.scale > 1 || state.panX !== 0 || state.panY !== 0;
}

function attachZoom(container: HTMLElement, wrap: HTMLElement) {
  const svg = wrap.querySelector<SVGSVGElement>('svg');

  if (!svg) {
    return () => {};
  }

  const state = { scale: 1, panX: 0, panY: 0 };
  let dragging = false;
  let startX = 0;
  let startY = 0;
  let startPanX = 0;
  let startPanY = 0;
  let lastTouchDistance = 0;

  const applyTransform = (smooth: boolean) => {
    svg.style.transition = smooth ? 'transform 150ms ease-out' : 'none';
    svg.style.transform = `translate(${state.panX}px, ${state.panY}px) scale(${state.scale})`;
  };

  const zoomAt = (delta: number, clientX: number, clientY: number) => {
    const rect = wrap.getBoundingClientRect();
    const offsetX = clientX - rect.left;
    const offsetY = clientY - rect.top;
    const previousScale = state.scale;
    const nextScale = clampScale(previousScale + delta);

    if (nextScale === previousScale) {
      return;
    }

    const ratio = nextScale / previousScale;
    state.panX = offsetX - ratio * (offsetX - state.panX);
    state.panY = offsetY - ratio * (offsetY - state.panY);
    state.scale = nextScale;
    applyTransform(false);
  };

  const resetZoom = () => {
    state.scale = 1;
    state.panX = 0;
    state.panY = 0;
    applyTransform(true);
  };

  const controls = document.createElement('div');
  controls.className = 'mermaid__zoom-controls';
  controls.innerHTML = [
    '<button type="button" class="mermaid__zoom-btn" data-zoom="in" aria-label="Zoom in" title="Zoom in">+</button>',
    '<button type="button" class="mermaid__zoom-btn" data-zoom="out" aria-label="Zoom out" title="Zoom out">-</button>',
    '<button type="button" class="mermaid__zoom-btn" data-zoom="reset" aria-label="Reset zoom" title="Reset zoom">100%</button>',
  ].join('');
  container.appendChild(controls);

  const handleControlsClick = (event: Event) => {
    const button = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-zoom]') : null;

    if (!button) {
      return;
    }

    const rect = wrap.getBoundingClientRect();
    const centerX = rect.left + (rect.width / 2);
    const centerY = rect.top + (rect.height / 2);

    if (button.dataset.zoom === 'in') {
      zoomAt(ZOOM_STEP, centerX, centerY);
      return;
    }

    if (button.dataset.zoom === 'out') {
      zoomAt(-ZOOM_STEP, centerX, centerY);
      return;
    }

    resetZoom();
  };

  const handleWheel = (event: WheelEvent) => {
    if (!event.ctrlKey && !shouldCapturePointerGesture(state)) {
      return;
    }

    event.preventDefault();
    zoomAt(event.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP, event.clientX, event.clientY);
  };

  const handleMouseDown = (event: MouseEvent) => {
    if (event.button !== 0 || !shouldCapturePointerGesture(state)) {
      return;
    }

    dragging = true;
    startX = event.clientX;
    startY = event.clientY;
    startPanX = state.panX;
    startPanY = state.panY;
    wrap.classList.add('grabbing');
    container.classList.add('mermaid--panning');
    event.preventDefault();
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (!dragging) {
      return;
    }

    state.panX = startPanX + (event.clientX - startX);
    state.panY = startPanY + (event.clientY - startY);
    applyTransform(false);
  };

  const handleMouseUp = () => {
    if (!dragging) {
      return;
    }

    dragging = false;
    wrap.classList.remove('grabbing');
    container.classList.remove('mermaid--panning');
  };

  const handleTouchStart = (event: TouchEvent) => {
    if (event.touches.length === 2) {
      event.preventDefault();
      lastTouchDistance = Math.hypot(
        event.touches[0].clientX - event.touches[1].clientX,
        event.touches[0].clientY - event.touches[1].clientY,
      );
      return;
    }

    if (event.touches.length === 1 && state.scale > 1) {
      dragging = true;
      startX = event.touches[0].clientX;
      startY = event.touches[0].clientY;
      startPanX = state.panX;
      startPanY = state.panY;
      wrap.classList.add('grabbing');
      container.classList.add('mermaid--panning');
    }
  };

  const handleTouchMove = (event: TouchEvent) => {
    if (event.touches.length === 2 && lastTouchDistance > 0) {
      event.preventDefault();

      const distance = Math.hypot(
        event.touches[0].clientX - event.touches[1].clientX,
        event.touches[0].clientY - event.touches[1].clientY,
      );
      const centerX = (event.touches[0].clientX + event.touches[1].clientX) / 2;
      const centerY = (event.touches[0].clientY + event.touches[1].clientY) / 2;

      zoomAt((distance - lastTouchDistance) * 0.005, centerX, centerY);
      lastTouchDistance = distance;
      return;
    }

    if (event.touches.length === 1 && dragging) {
      event.preventDefault();
      state.panX = startPanX + (event.touches[0].clientX - startX);
      state.panY = startPanY + (event.touches[0].clientY - startY);
      applyTransform(false);
    }
  };

  const handleTouchEnd = () => {
    dragging = false;
    lastTouchDistance = 0;
    wrap.classList.remove('grabbing');
    container.classList.remove('mermaid--panning');
  };

  const handleDoubleClick = (event: MouseEvent) => {
    event.preventDefault();
    resetZoom();
  };

  controls.addEventListener('click', handleControlsClick);
  wrap.addEventListener('wheel', handleWheel, { passive: false });
  wrap.addEventListener('mousedown', handleMouseDown);
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
  wrap.addEventListener('touchstart', handleTouchStart, { passive: false });
  wrap.addEventListener('touchmove', handleTouchMove, { passive: false });
  wrap.addEventListener('touchend', handleTouchEnd);
  wrap.addEventListener('touchcancel', handleTouchEnd);
  wrap.addEventListener('dblclick', handleDoubleClick);

  return () => {
    controls.removeEventListener('click', handleControlsClick);
    wrap.removeEventListener('wheel', handleWheel);
    wrap.removeEventListener('mousedown', handleMouseDown);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    wrap.removeEventListener('touchstart', handleTouchStart);
    wrap.removeEventListener('touchmove', handleTouchMove);
    wrap.removeEventListener('touchend', handleTouchEnd);
    wrap.removeEventListener('touchcancel', handleTouchEnd);
    wrap.removeEventListener('dblclick', handleDoubleClick);
    wrap.classList.remove('grabbing');
    container.classList.remove('mermaid--panning');
    controls.remove();
    svg.style.removeProperty('transition');
    svg.style.removeProperty('transform');
  };
}

function createDiagramContainer(source: string) {
  const container = document.createElement('div');
  container.className = 'mermaid';
  container.dataset.source = source;
  return container;
}

function replaceMermaidBlocks(containers: HTMLElement[]) {
  const blocks = Array.from(document.querySelectorAll<HTMLElement>('pre > code.language-mermaid'));

  blocks.forEach((block) => {
    const pre = block.parentElement;
    if (!pre) {
      return;
    }

    const codeBlockWrapper = pre.parentElement?.classList.contains('code-block-wrapper') ? pre.parentElement : null;
    const rougeWrapper = block.closest('.highlighter-rouge');
    const replaceTarget = rougeWrapper ?? codeBlockWrapper ?? pre;
    const container = createDiagramContainer(block.textContent || '');

    replaceTarget.replaceWith(container);
    containers.push(container);
  });
}

export function MermaidRenderer() {
  useEffect(() => {
    const containers: HTMLElement[] = [];
    replaceMermaidBlocks(containers);

    if (containers.length === 0) {
      return;
    }

    let disposed = false;
    let renderSequence = 0;
    let mermaidPromise: Promise<MermaidApi> | null = null;
    const cleanupFns: Array<() => void> = [];
    const zoomCleanupMap = new WeakMap<HTMLElement, () => void>();
    const renderTokenMap = new WeakMap<HTMLElement, number>();

    const loadMermaid = async () => {
      if (!mermaidPromise) {
        mermaidPromise = import('mermaid').then((module) => module.default);
      }

      return mermaidPromise;
    };

    const renderContainer = async (container: HTMLElement) => {
      const source = container.dataset.source;

      if (disposed || !source) {
        return;
      }

      const renderToken = (renderTokenMap.get(container) ?? 0) + 1;
      renderTokenMap.set(container, renderToken);
      showSkeleton(container);
      zoomCleanupMap.get(container)?.();
      zoomCleanupMap.delete(container);
      container.querySelector('.mermaid__svg-wrap')?.remove();
      container.querySelector('.mermaid__fallback')?.remove();

      try {
        const mermaid = await loadMermaid();
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          suppressErrorRendering: true,
          theme: resolveMermaidTheme(),
        });

        const { svg, bindFunctions } = await mermaid.render(`mermaid-diagram-${renderSequence++}`, source);

        if (disposed || renderTokenMap.get(container) !== renderToken) {
          return;
        }

        clearContainerState(container);

        const wrap = document.createElement('div');
        wrap.className = 'mermaid__svg-wrap';
        wrap.innerHTML = svg;

        const svgElement = wrap.querySelector<SVGSVGElement>('svg');
        if (svgElement) {
          normalizeSvg(svgElement, wrap, container);
        }

        bindFunctions?.(wrap);
        container.appendChild(wrap);
        container.classList.add('mermaid--loaded');

        const cleanupZoom = attachZoom(container, wrap);
        zoomCleanupMap.set(container, cleanupZoom);
      } catch (error) {
        if (disposed || renderTokenMap.get(container) !== renderToken) {
          return;
        }

        clearContainerState(container);
        container.classList.add('mermaid--error');

        const fallback = document.createElement('pre');
        fallback.className = 'mermaid__fallback';
        fallback.textContent = source;
        container.appendChild(fallback);

        console.error('Failed to render Mermaid diagram.', error);
      }
    };

    const observeContainers = () => {
      if (!('IntersectionObserver' in window)) {
        containers.forEach((container) => {
          void renderContainer(container);
        });
        return;
      }

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          observer.unobserve(entry.target);
          void renderContainer(entry.target as HTMLElement);
        });
      }, { rootMargin: VIEWPORT_MARGIN });

      containers.forEach((container) => observer.observe(container));
      cleanupFns.push(() => observer.disconnect());
    };

    const rerenderVisibleContainers = () => {
      containers.forEach((container) => {
        if (container.classList.contains('mermaid--loaded') || container.classList.contains('mermaid--error')) {
          void renderContainer(container);
        }
      });
    };

    let resizeFrame = 0;

    const scheduleRerender = () => {
      if (disposed || resizeFrame !== 0) {
        return;
      }

      resizeFrame = window.requestAnimationFrame(() => {
        resizeFrame = 0;
        rerenderVisibleContainers();
      });
    };

    observeContainers();

    const themeObserver = new MutationObserver((mutations) => {
      if (mutations.some((mutation) => mutation.attributeName === 'class' || mutation.attributeName === 'data-theme')) {
        rerenderVisibleContainers();
      }
    });

    themeObserver.observe(document.documentElement, { attributes: true });
    cleanupFns.push(() => themeObserver.disconnect());

    const resizeObserver = new ResizeObserver(() => {
      scheduleRerender();
    });

    containers.forEach((container) => resizeObserver.observe(container));
    resizeObserver.observe(document.documentElement);

    cleanupFns.push(() => {
      if (resizeFrame !== 0) {
        window.cancelAnimationFrame(resizeFrame);
        resizeFrame = 0;
      }
      resizeObserver.disconnect();
    });

    cleanupFns.push(() => {
      containers.forEach((container) => {
        zoomCleanupMap.get(container)?.();
      });
    });

    return () => {
      disposed = true;
      cleanupFns.forEach((cleanup) => cleanup());
    };
  }, []);

  return null;
}
