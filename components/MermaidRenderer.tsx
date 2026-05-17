'use client';

import { useEffect } from 'react';

import { getMermaidSizing } from '@/lib/mermaidSizing.mjs';

const VIEWPORT_MARGIN = '200px';
const MIN_SCALE = 0.5;
const MAX_SCALE = 4;
const ZOOM_STEP = 0.15;
const PAN_STEP = 32;
const BUTTON_FEEDBACK_MS = 1400;

type MermaidApi = typeof import('mermaid').default;
type DiagramAction = 'zoom-in' | 'zoom-out' | 'reset' | 'copy-source' | 'download-svg';
type FeedbackState = 'idle' | 'success' | 'error';

const ACTION_BUTTONS: Record<DiagramAction, { label: string; icon: string }> = {
  'zoom-in': {
    label: 'Zoom in',
    icon: [
      '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">',
      '<path d="M5 12h14"></path>',
      '<path d="M12 5v14"></path>',
      '</svg>',
    ].join(''),
  },
  'zoom-out': {
    label: 'Zoom out',
    icon: [
      '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">',
      '<path d="M5 12h14"></path>',
      '</svg>',
    ].join(''),
  },
  reset: {
    label: 'Reset view',
    icon: [
      '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">',
      '<path d="M3 12a9 9 0 1 0 3-6.7"></path>',
      '<path d="M3 4v6h6"></path>',
      '</svg>',
    ].join(''),
  },
  'copy-source': {
    label: 'Copy Mermaid source',
    icon: [
      '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">',
      '<rect x="9" y="9" width="13" height="13" rx="2"></rect>',
      '<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>',
      '</svg>',
    ].join(''),
  },
  'download-svg': {
    label: 'Download SVG',
    icon: [
      '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">',
      '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>',
      '<path d="M7 10l5 5 5-5"></path>',
      '<path d="M12 15V3"></path>',
      '</svg>',
    ].join(''),
  },
};

function isDarkTheme() {
  if (document.documentElement.dataset.theme === 'dark' || document.documentElement.classList.contains('dark')) {
    return true;
  }

  return !document.documentElement.classList.contains('light')
    && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function resolveMermaidTheme() {
  return isDarkTheme() ? 'dark' : 'default';
}

function resolveMermaidThemeVariables() {
  if (isDarkTheme()) {
    return {
      background: '#1f2937',
      fontFamily: 'inherit',
      lineColor: '#94a3b8',
      mainBkg: '#111827',
      nodeBorder: '#475569',
      primaryColor: '#111827',
      primaryTextColor: '#f9fafb',
      secondaryColor: '#0f172a',
      tertiaryColor: '#020617',
    };
  }

  return {
    background: '#f9fafb',
    fontFamily: 'inherit',
    lineColor: '#64748b',
    mainBkg: '#ffffff',
    nodeBorder: '#cbd5e1',
    primaryColor: '#ffffff',
    primaryTextColor: '#0f172a',
    secondaryColor: '#f1f5f9',
    tertiaryColor: '#e2e8f0',
  };
}

function showSkeleton(container: HTMLElement) {
  container.classList.remove('mermaid--loaded', 'mermaid--error');
  container.classList.add('mermaid--loading');
  container.setAttribute('aria-busy', 'true');

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
  container.classList.remove('mermaid--loading', 'mermaid--loaded', 'mermaid--error', 'mermaid--zoomed');
  container.setAttribute('aria-busy', 'false');
  container.querySelector('.mermaid__skeleton')?.remove();
  container.querySelector('.mermaid__svg-wrap')?.remove();
  container.querySelector('.mermaid__fallback')?.remove();
  container.querySelector('.mermaid__toolbar')?.remove();
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
  svg.style.transformOrigin = '0 0';
  wrap.classList.toggle('mermaid__svg-wrap--portrait', isPortrait);
}

function clampScale(scale: number) {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
}

function shouldCapturePointerGesture(state: { scale: number; panX: number; panY: number }) {
  return state.scale > 1 || state.panX !== 0 || state.panY !== 0;
}

function createToolbarButton(action: DiagramAction) {
  const button = document.createElement('button');
  const content = ACTION_BUTTONS[action];

  button.type = 'button';
  button.className = 'mermaid__toolbar-btn';
  button.dataset.action = action;
  button.setAttribute('aria-label', content.label);
  button.title = content.label;
  button.innerHTML = `${content.icon}<span class="mermaid__button-label">${content.label}</span>`;

  return button;
}

function setButtonFeedback(button: HTMLElement, state: FeedbackState) {
  button.classList.toggle('is-success', state === 'success');
  button.classList.toggle('is-error', state === 'error');
}

function serializeSvg(svg: SVGSVGElement) {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.style.removeProperty('transform');
  clone.style.removeProperty('transition');

  if (!clone.getAttribute('xmlns')) {
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  }

  return clone.outerHTML;
}

function downloadSvg(svg: SVGSVGElement, container: HTMLElement) {
  const blob = new Blob([serializeSvg(svg)], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const diagramIndex = container.dataset.diagramIndex ?? '1';

  link.href = url;
  link.download = `mermaid-diagram-${diagramIndex}.svg`;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function attachDiagramControls(container: HTMLElement, wrap: HTMLElement) {
  const svg = wrap.querySelector<SVGSVGElement>('svg');

  if (!svg) {
    return () => {};
  }

  const state = { scale: 1, panX: 0, panY: 0 };
  const feedbackTimers = new Map<HTMLElement, number>();
  let dragging = false;
  let startX = 0;
  let startY = 0;
  let startPanX = 0;
  let startPanY = 0;
  let lastTouchDistance = 0;

  wrap.tabIndex = 0;
  wrap.setAttribute('aria-label', 'Interactive Mermaid diagram');

  const toolbar = document.createElement('div');
  toolbar.className = 'mermaid__toolbar';
  toolbar.setAttribute('aria-label', 'Mermaid diagram controls');
  toolbar.append(
    createToolbarButton('zoom-in'),
    createToolbarButton('zoom-out'),
    createToolbarButton('reset'),
    createToolbarButton('copy-source'),
    createToolbarButton('download-svg'),
  );
  container.insertBefore(toolbar, wrap);

  const showButtonFeedback = (button: HTMLElement, feedback: Exclude<FeedbackState, 'idle'>) => {
    const timer = feedbackTimers.get(button);
    if (timer) {
      window.clearTimeout(timer);
    }

    setButtonFeedback(button, feedback);
    feedbackTimers.set(button, window.setTimeout(() => {
      setButtonFeedback(button, 'idle');
      feedbackTimers.delete(button);
    }, BUTTON_FEEDBACK_MS));
  };

  const applyTransform = (smooth: boolean) => {
    svg.style.transition = smooth ? 'transform 150ms ease-out' : 'none';
    svg.style.transform = `translate(${state.panX}px, ${state.panY}px) scale(${state.scale})`;
    container.classList.toggle('mermaid--zoomed', shouldCapturePointerGesture(state));
  };

  const zoomAt = (delta: number, clientX: number, clientY: number) => {
    const rect = wrap.getBoundingClientRect();
    const offsetX = clientX - rect.left + wrap.scrollLeft;
    const offsetY = clientY - rect.top + wrap.scrollTop;
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

  const panBy = (deltaX: number, deltaY: number) => {
    if (!shouldCapturePointerGesture(state)) {
      return;
    }

    state.panX += deltaX;
    state.panY += deltaY;
    applyTransform(false);
  };

  const handleToolbarClick = (event: Event) => {
    const button = event.target instanceof Element
      ? event.target.closest<HTMLElement>('[data-action]')
      : null;

    if (!button) {
      return;
    }

    const action = button.dataset.action as DiagramAction | undefined;
    const rect = wrap.getBoundingClientRect();
    const centerX = rect.left + (rect.width / 2);
    const centerY = rect.top + (rect.height / 2);

    if (action === 'zoom-in') {
      zoomAt(ZOOM_STEP, centerX, centerY);
      return;
    }

    if (action === 'zoom-out') {
      zoomAt(-ZOOM_STEP, centerX, centerY);
      return;
    }

    if (action === 'reset') {
      resetZoom();
      return;
    }

    if (action === 'copy-source') {
      void Promise.resolve()
        .then(() => {
          if (!navigator.clipboard?.writeText) {
            throw new Error('Clipboard API is unavailable.');
          }

          return navigator.clipboard.writeText(container.dataset.source ?? '');
        })
        .then(() => showButtonFeedback(button, 'success'))
        .catch((error) => {
          showButtonFeedback(button, 'error');
          console.error('Failed to copy Mermaid source.', error);
        });
      return;
    }

    if (action === 'download-svg') {
      try {
        downloadSvg(svg, container);
        showButtonFeedback(button, 'success');
      } catch (error) {
        showButtonFeedback(button, 'error');
        console.error('Failed to download Mermaid SVG.', error);
      }
    }
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

  const handleKeyDown = (event: KeyboardEvent) => {
    const rect = wrap.getBoundingClientRect();
    const centerX = rect.left + (rect.width / 2);
    const centerY = rect.top + (rect.height / 2);

    if (event.key === '+' || event.key === '=') {
      event.preventDefault();
      zoomAt(ZOOM_STEP, centerX, centerY);
      return;
    }

    if (event.key === '-' || event.key === '_') {
      event.preventDefault();
      zoomAt(-ZOOM_STEP, centerX, centerY);
      return;
    }

    if (event.key === '0' || event.key === 'Escape') {
      event.preventDefault();
      resetZoom();
      return;
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      panBy(PAN_STEP, 0);
      return;
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      panBy(-PAN_STEP, 0);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      panBy(0, PAN_STEP);
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      panBy(0, -PAN_STEP);
    }
  };

  toolbar.addEventListener('click', handleToolbarClick);
  wrap.addEventListener('wheel', handleWheel, { passive: false });
  wrap.addEventListener('mousedown', handleMouseDown);
  wrap.addEventListener('touchstart', handleTouchStart, { passive: false });
  wrap.addEventListener('touchmove', handleTouchMove, { passive: false });
  wrap.addEventListener('touchend', handleTouchEnd);
  wrap.addEventListener('touchcancel', handleTouchEnd);
  wrap.addEventListener('dblclick', handleDoubleClick);
  wrap.addEventListener('keydown', handleKeyDown);
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);

  return () => {
    toolbar.removeEventListener('click', handleToolbarClick);
    wrap.removeEventListener('wheel', handleWheel);
    wrap.removeEventListener('mousedown', handleMouseDown);
    wrap.removeEventListener('touchstart', handleTouchStart);
    wrap.removeEventListener('touchmove', handleTouchMove);
    wrap.removeEventListener('touchend', handleTouchEnd);
    wrap.removeEventListener('touchcancel', handleTouchEnd);
    wrap.removeEventListener('dblclick', handleDoubleClick);
    wrap.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    feedbackTimers.forEach((timer) => window.clearTimeout(timer));
    feedbackTimers.clear();
    wrap.classList.remove('grabbing');
    wrap.removeAttribute('tabindex');
    wrap.removeAttribute('aria-label');
    container.classList.remove('mermaid--panning', 'mermaid--zoomed');
    toolbar.remove();
    svg.style.removeProperty('transition');
    svg.style.removeProperty('transform');
  };
}

function createDiagramContainer(source: string, diagramIndex: number) {
  const container = document.createElement('div');
  container.className = 'mermaid';
  container.dataset.diagramIndex = String(diagramIndex);
  container.dataset.source = source;
  container.setAttribute('role', 'group');
  container.setAttribute('aria-label', `Mermaid diagram ${diagramIndex}`);
  container.setAttribute('aria-busy', 'false');
  return container;
}

function replaceMermaidBlocks(containers: HTMLElement[]) {
  const blocks = Array.from(document.querySelectorAll<HTMLElement>('pre > code.language-mermaid'));

  blocks.forEach((block, index) => {
    const pre = block.parentElement;
    if (!pre) {
      return;
    }

    const codeBlockWrapper = pre.parentElement?.classList.contains('code-block-wrapper') ? pre.parentElement : null;
    const rougeWrapper = block.closest('.highlighter-rouge');
    const replaceTarget = rougeWrapper ?? codeBlockWrapper ?? pre;
    const container = createDiagramContainer(block.textContent || '', index + 1);

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
    const controlCleanupMap = new WeakMap<HTMLElement, () => void>();
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
      controlCleanupMap.get(container)?.();
      controlCleanupMap.delete(container);
      container.querySelector('.mermaid__svg-wrap')?.remove();
      container.querySelector('.mermaid__fallback')?.remove();
      container.querySelector('.mermaid__toolbar')?.remove();

      try {
        const mermaid = await loadMermaid();
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          suppressErrorRendering: true,
          theme: resolveMermaidTheme(),
          themeVariables: resolveMermaidThemeVariables(),
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

        const cleanupControls = attachDiagramControls(container, wrap);
        controlCleanupMap.set(container, cleanupControls);
      } catch (error) {
        if (disposed || renderTokenMap.get(container) !== renderToken) {
          return;
        }

        clearContainerState(container);
        container.classList.add('mermaid--error');

        const fallback = document.createElement('pre');
        fallback.className = 'mermaid__fallback';
        fallback.tabIndex = 0;
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

    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(() => {
        scheduleRerender();
      });

      containers.forEach((container) => resizeObserver.observe(container));
      resizeObserver.observe(document.documentElement);
      cleanupFns.push(() => {
        resizeObserver.disconnect();
      });
    } else {
      window.addEventListener('resize', scheduleRerender);
      cleanupFns.push(() => window.removeEventListener('resize', scheduleRerender));
    }

    cleanupFns.push(() => {
      if (resizeFrame !== 0) {
        window.cancelAnimationFrame(resizeFrame);
        resizeFrame = 0;
      }
    });

    cleanupFns.push(() => {
      containers.forEach((container) => {
        controlCleanupMap.get(container)?.();
      });
    });

    return () => {
      disposed = true;
      cleanupFns.forEach((cleanup) => cleanup());
    };
  }, []);

  return null;
}
