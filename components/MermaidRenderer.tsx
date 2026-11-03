'use client';

import { useEffect } from 'react';

import { getMermaidSizing, readSvgGeometry } from '@/lib/mermaidSizing.mjs';

const VIEWPORT_MARGIN = '200px';
const MIN_SCALE = 0.5;
const MAX_SCALE = 4;
const ZOOM_STEP = 0.25;
const getDiagramFontFamily = () => getComputedStyle(document.body).fontFamily;
const BUTTON_FEEDBACK_MS = 1400;

type MermaidApi = typeof import('mermaid').default;

// Mermaid owns global configuration and temporary DOM, including across React mounts.
let mermaidRenderQueue: Promise<unknown> = Promise.resolve();
let renderSequence = 0;
type DiagramAction = 'zoom-in' | 'zoom-out' | 'reset' | 'copy-source' | 'download-svg';
type FeedbackState = 'idle' | 'success' | 'error';
type DiagramControls = { resize: () => void; cleanup: () => void };

const ACTION_BUTTONS: Record<DiagramAction, { label: string; icon: string }> = {
  'zoom-in': {
    label: '확대',
    icon: [
      '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">',
      '<path d="M5 12h14"></path>',
      '<path d="M12 5v14"></path>',
      '</svg>',
    ].join(''),
  },
  'zoom-out': {
    label: '축소',
    icon: [
      '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">',
      '<path d="M5 12h14"></path>',
      '</svg>',
    ].join(''),
  },
  reset: {
    label: '초기화',
    icon: [
      '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">',
      '<path d="M3 12a9 9 0 1 0 3-6.7"></path>',
      '<path d="M3 4v6h6"></path>',
      '</svg>',
    ].join(''),
  },
  'copy-source': {
    label: 'Mermaid 원본 복사',
    icon: [
      '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">',
      '<rect x="9" y="9" width="13" height="13" rx="2"></rect>',
      '<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>',
      '</svg>',
    ].join(''),
  },
  'download-svg': {
    label: 'SVG 저장',
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
      fontFamily: getDiagramFontFamily(),
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
    fontFamily: getDiagramFontFamily(),
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
  container.classList.remove('mermaid--loading', 'mermaid--loaded', 'mermaid--error');
  container.setAttribute('aria-busy', 'false');
  container.querySelector('.mermaid__skeleton')?.remove();
  container.querySelector('.mermaid__svg-wrap')?.remove();
  container.querySelector('.mermaid__fallback')?.remove();
  container.querySelector('.mermaid__toolbar')?.remove();
  container.querySelector('.mermaid__hint')?.remove();
}

function clampScale(scale: number) {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
}

function createToolbarButton(action: DiagramAction) {
  const button = document.createElement('button');
  const content = ACTION_BUTTONS[action];

  button.type = 'button';
  button.className = 'mermaid__toolbar-btn';
  button.dataset.action = action;
  button.setAttribute('aria-label', content.label);
  button.title = content.label;
  button.innerHTML = `${content.icon}<span class="${action === 'reset' ? 'mermaid__reset-label' : 'mermaid__button-label'}">${content.label}</span>`;

  return button;
}

function setButtonFeedback(button: HTMLElement, state: FeedbackState) {
  button.classList.toggle('is-success', state === 'success');
  button.classList.toggle('is-error', state === 'error');
}

function serializeSvg(svg: SVGSVGElement) {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  const geometry = readSvgGeometry({
    viewBox: clone.getAttribute('viewBox'),
    widthAttr: clone.getAttribute('width'),
    heightAttr: clone.getAttribute('height'),
  });
  if (geometry) {
    clone.setAttribute('width', String(geometry.width));
    clone.setAttribute('height', String(geometry.height));
  }
  clone.style.removeProperty('width');
  clone.style.removeProperty('height');
  clone.style.removeProperty('max-width');

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

function attachDiagramControls(container: HTMLElement, wrap: HTMLElement): DiagramControls {
  const svg = wrap.querySelector<SVGSVGElement>('svg');
  const geometry = svg && readSvgGeometry({
    viewBox: svg.getAttribute('viewBox'),
    widthAttr: svg.getAttribute('width'),
    heightAttr: svg.getAttribute('height'),
  });
  if (!svg || !geometry) {
    throw new Error('Mermaid returned an SVG without valid dimensions.');
  }

  let userScale: number | null = null;
  let currentScale = 1;
  const feedbackTimers = new Map<HTMLButtonElement, number>();
  wrap.tabIndex = 0;
  wrap.setAttribute('role', 'region');
  wrap.setAttribute('aria-label', '다이어그램. 스크롤 또는 방향키로 이동, 더하기와 빼기로 확대 및 축소');

  const toolbar = document.createElement('div');
  toolbar.className = 'mermaid__toolbar';
  toolbar.setAttribute('role', 'group');
  toolbar.setAttribute('aria-label', '다이어그램 보기 설정');
  const zoomControls = document.createElement('div');
  zoomControls.className = 'mermaid__zoom-controls';
  const zoomOut = createToolbarButton('zoom-out');
  const zoomIn = createToolbarButton('zoom-in');
  const zoomLevel = document.createElement('output');
  zoomLevel.className = 'mermaid__zoom-level';
  zoomLevel.setAttribute('aria-label', '도표 배율');
  zoomLevel.setAttribute('aria-live', 'polite');
  zoomControls.append(zoomOut, zoomLevel, zoomIn, createToolbarButton('reset'));
  const actions = document.createElement('div');
  actions.className = 'mermaid__actions';
  actions.append(createToolbarButton('copy-source'), createToolbarButton('download-svg'));
  toolbar.append(zoomControls, actions);
  container.insertBefore(toolbar, wrap);

  const hint = document.createElement('p');
  hint.className = 'mermaid__hint';
  hint.textContent = '도표 안에서 스크롤해 이동할 수 있습니다.';
  container.appendChild(hint);

  const resize = () => {
    const { targetWidth } = getMermaidSizing({
      viewBox: svg.getAttribute('viewBox'),
      widthAttr: String(geometry.width),
      heightAttr: String(geometry.height),
      containerWidth: wrap.clientWidth,
    });
    currentScale = userScale ?? targetWidth / geometry.width;
    const width = geometry.width * currentScale;
    const height = geometry.height * currentScale;
    // Resize the SVG viewport, never its compositing layer. Shapes, text and
    // markers share the viewBox transform, and native scroll bounds stay valid.
    svg.setAttribute('width', String(width));
    svg.setAttribute('height', String(height));
    svg.style.width = `${width}px`;
    svg.style.height = `${height}px`;
    svg.style.maxWidth = 'none';
    zoomLevel.textContent = `${Math.round(currentScale * 100)}%`;
    zoomOut.disabled = currentScale <= MIN_SCALE;
    zoomIn.disabled = currentScale >= MAX_SCALE;
    hint.hidden = width <= wrap.clientWidth && height <= wrap.clientHeight;
  };

  const setScale = (scale: number) => {
    const nextScale = clampScale(scale);
    if (nextScale === currentScale) return;
    const viewport = wrap.getBoundingClientRect();
    const before = svg.getBoundingClientRect();
    const centerX = viewport.left + wrap.clientWidth / 2;
    const centerY = viewport.top + wrap.clientHeight / 2;
    const x = (centerX - before.left) / before.width;
    const y = (centerY - before.top) / before.height;
    userScale = nextScale;
    resize();
    const after = svg.getBoundingClientRect();
    wrap.scrollLeft += after.left + x * after.width - centerX;
    wrap.scrollTop += after.top + y * after.height - centerY;
  };

  const resetZoom = () => {
    userScale = null;
    resize();
    wrap.scrollLeft = 0;
    wrap.scrollTop = 0;
  };

  const showButtonFeedback = (button: HTMLButtonElement, feedback: Exclude<FeedbackState, 'idle'>) => {
    const timer = feedbackTimers.get(button);
    if (timer) window.clearTimeout(timer);
    setButtonFeedback(button, feedback);
    const label = feedback === 'success' ? '완료' : '실패';
    button.setAttribute('aria-label', label);
    button.title = label;
    feedbackTimers.set(button, window.setTimeout(() => {
      setButtonFeedback(button, 'idle');
      const originalLabel = ACTION_BUTTONS[button.dataset.action as DiagramAction].label;
      button.setAttribute('aria-label', originalLabel);
      button.title = originalLabel;
      feedbackTimers.delete(button);
    }, BUTTON_FEEDBACK_MS));
  };

  const handleToolbarClick = (event: Event) => {
    const button = event.target instanceof Element
      ? event.target.closest<HTMLButtonElement>('[data-action]')
      : null;
    if (!button) return;
    const action = button.dataset.action as DiagramAction;
    if (action === 'zoom-in') {
      setScale(currentScale + ZOOM_STEP);
    } else if (action === 'zoom-out') {
      setScale(currentScale - ZOOM_STEP);
    } else if (action === 'reset') {
      resetZoom();
    } else if (action === 'copy-source') {
      void Promise.resolve()
        .then(() => navigator.clipboard.writeText(container.dataset.source ?? ''))
        .then(() => showButtonFeedback(button, 'success'))
        .catch((error) => {
          showButtonFeedback(button, 'error');
          console.error('Failed to copy Mermaid source.', error);
        });
    } else if (action === 'download-svg') {
      try {
        downloadSvg(svg, container);
        showButtonFeedback(button, 'success');
      } catch (error) {
        showButtonFeedback(button, 'error');
        console.error('Failed to download Mermaid SVG.', error);
      }
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === '+' || event.key === '=') {
      event.preventDefault();
      setScale(currentScale + ZOOM_STEP);
    } else if (event.key === '-' || event.key === '_') {
      event.preventDefault();
      setScale(currentScale - ZOOM_STEP);
    } else if (event.key === '0' || event.key === 'Escape') {
      event.preventDefault();
      resetZoom();
    }
    // Direction keys, wheel and touch retain the browser's native scrolling.
  };

  resize();
  toolbar.addEventListener('click', handleToolbarClick);
  wrap.addEventListener('keydown', handleKeyDown);
  return {
    resize,
    cleanup: () => {
      toolbar.removeEventListener('click', handleToolbarClick);
      wrap.removeEventListener('keydown', handleKeyDown);
      feedbackTimers.forEach((timer) => window.clearTimeout(timer));
      feedbackTimers.clear();
      wrap.removeAttribute('tabindex');
      wrap.removeAttribute('role');
      wrap.removeAttribute('aria-label');
      toolbar.remove();
      hint.remove();
    },
  };
}

function createDiagramContainer(source: string, diagramIndex: number) {
  const container = document.createElement('div');
  // Keep article typography out of the diagram's own SVG text styling.
  container.className = 'mermaid not-prose';
  container.dataset.diagramIndex = String(diagramIndex);
  container.dataset.source = source;
  container.setAttribute('role', 'group');
  container.setAttribute('aria-label', `Mermaid diagram ${diagramIndex}`);
  container.setAttribute('aria-busy', 'false');
  return container;
}

function replaceMermaidBlocks() {
  const replacements: Array<{ container: HTMLElement; original: Element }> = [];
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
    replacements.push({ container, original: replaceTarget });
  });

  return replacements;
}

export function MermaidRenderer() {
  useEffect(() => {
    const replacements = replaceMermaidBlocks();
    const containers = replacements.map(({ container }) => container);

    if (containers.length === 0) {
      return;
    }

    let disposed = false;
    let mermaidPromise: Promise<MermaidApi> | null = null;
    const cleanupFns: Array<() => void> = [];
    const controlsMap = new WeakMap<HTMLElement, DiagramControls>();
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
      const isCurrent = () => !disposed && container.isConnected
        && renderTokenMap.get(container) === renderToken;

      // Keep a rendered diagram (and its height) while replacing its theme.
      if (!container.querySelector('.mermaid__svg-wrap')) {
        showSkeleton(container);
      } else {
        container.setAttribute('aria-busy', 'true');
      }

      try {
        const render = mermaidRenderQueue.then(async () => {
          if (!isCurrent()) return null;
          const mermaid = await loadMermaid();
          const fontFamily = getDiagramFontFamily();
          // Measure SVG labels only after their IBM font subsets are available.
          await document.fonts.load(`400 16px ${fontFamily.split(',')[0]}`, source);
          if (!isCurrent()) return null;

          mermaid.initialize({
            startOnLoad: false,
            securityLevel: 'strict',
            htmlLabels: false,
            fontFamily,
            suppressErrorRendering: true,
            theme: resolveMermaidTheme(),
            themeVariables: resolveMermaidThemeVariables(),
          });

          return mermaid.render(`mermaid-diagram-${renderSequence++}`, source);
        });
        // A failed diagram must not prevent the next queued diagram from rendering.
        mermaidRenderQueue = render.catch(() => {});
        const result = await render;

        if (!result || !isCurrent()) {
          return;
        }

        controlsMap.get(container)?.cleanup();
        controlsMap.delete(container);
        clearContainerState(container);

        const wrap = document.createElement('div');
        wrap.className = 'mermaid__svg-wrap';
        wrap.innerHTML = result.svg;
        container.appendChild(wrap);

        result.bindFunctions?.(wrap);
        container.classList.add('mermaid--loaded');

        controlsMap.set(container, attachDiagramControls(container, wrap));
      } catch (error) {
        if (!isCurrent()) {
          return;
        }

        controlsMap.get(container)?.cleanup();
        controlsMap.delete(container);
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

    const rerenderStartedContainers = () => {
      containers.forEach((container) => {
        if (renderTokenMap.has(container)) {
          void renderContainer(container);
        }
      });
    };

    const resizeContainer = (container: HTMLElement) => {
      controlsMap.get(container)?.resize();
    };

    observeContainers();

    let currentTheme = resolveMermaidTheme();
    const handleThemeChange = () => {
      const nextTheme = resolveMermaidTheme();
      if (nextTheme !== currentTheme) {
        currentTheme = nextTheme;
        rerenderStartedContainers();
      }
    };
    const themeObserver = new MutationObserver(handleThemeChange);

    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme'],
    });
    cleanupFns.push(() => themeObserver.disconnect());
    const colorScheme = window.matchMedia('(prefers-color-scheme: dark)');
    colorScheme.addEventListener('change', handleThemeChange);
    cleanupFns.push(() => colorScheme.removeEventListener('change', handleThemeChange));

    if (typeof ResizeObserver !== 'undefined') {
      const widths = new WeakMap<Element, number>();
      const resizeObserver = new ResizeObserver((entries) => {
        entries.forEach(({ target, contentRect }) => {
          if (disposed || widths.get(target) === contentRect.width) return;
          widths.set(target, contentRect.width);
          // Only refit the existing SVG. Rendering changes height and must never
          // feed back into Mermaid or reset the reader's zoom/scroll position.
          resizeContainer(target as HTMLElement);
        });
      });

      containers.forEach((container) => resizeObserver.observe(container));
      cleanupFns.push(() => {
        resizeObserver.disconnect();
      });
    } else {
      const handleResize = () => containers.forEach(resizeContainer);
      window.addEventListener('resize', handleResize);
      cleanupFns.push(() => window.removeEventListener('resize', handleResize));
    }

    cleanupFns.push(() => {
      containers.forEach((container) => {
        controlsMap.get(container)?.cleanup();
      });
    });

    return () => {
      disposed = true;
      cleanupFns.forEach((cleanup) => cleanup());
      // Effect replay (StrictMode) must see the original sources again.
      replacements.forEach(({ container, original }) => container.replaceWith(original));
    };
  }, []);

  return null;
}
