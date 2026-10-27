import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

import { getMermaidSizing } from '../lib/mermaidSizing.mjs';

const compiled = ts.transpileModule(
  fs.readFileSync(new URL('../components/MermaidRenderer.tsx', import.meta.url), 'utf8'),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } },
).outputText;

// The renderer's browser boundary: retain node identity, observer deliveries and
// listener ownership without bringing a second DOM/browser dependency into tests.
class Element extends EventTarget {
  constructor(tagName) {
    super();
    this.tagName = tagName;
    this.children = [];
    this.dataset = {};
    this.attributes = new Map();
    this.className = '';
    this.clientWidth = 800;
    this.style = { removeProperty(name) { delete this[name]; } };
    this.classList = {
      contains: (name) => this.className.split(' ').includes(name),
      add: (...names) => { this.className = [...new Set([...this.className.split(' ').filter(Boolean), ...names])].join(' '); },
      remove: (...names) => { this.className = this.className.split(' ').filter((name) => !names.includes(name)).join(' '); },
      toggle: (name, enabled) => { this.classList[enabled ? 'add' : 'remove'](name); },
    };
  }
  get isConnected() { return this.tagName === 'document' || Boolean(this.parentElement?.isConnected); }
  set innerHTML(value) {
    this.children.forEach((child) => { child.parentElement = null; });
    this.children = [];
    if (value === '<svg></svg>') {
      const svg = new Element('svg');
      svg.setAttribute('viewBox', '0 0 1000 500');
      this.append(svg);
    }
  }
  setAttribute(name, value) { this.attributes.set(name, value); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  removeAttribute(name) { this.attributes.delete(name); }
  append(...children) { children.forEach((child) => this.appendChild(child)); }
  appendChild(child) {
    child.remove();
    child.parentElement = this;
    this.children.push(child);
    return child;
  }
  insertBefore(child, before) {
    child.remove();
    child.parentElement = this;
    this.children.splice(this.children.indexOf(before), 0, child);
  }
  replaceWith(replacement) {
    if (!this.parentElement) return;
    const parent = this.parentElement;
    parent.children[parent.children.indexOf(this)] = replacement;
    replacement.parentElement = parent;
    this.parentElement = null;
  }
  remove() {
    if (!this.parentElement) return;
    const siblings = this.parentElement.children;
    siblings.splice(siblings.indexOf(this), 1);
    this.parentElement = null;
  }
  matches(selector) {
    if (selector === 'pre > code.language-mermaid') {
      return this.tagName === 'code' && this.classList.contains('language-mermaid') && this.parentElement?.tagName === 'pre';
    }
    return selector.startsWith('.') ? this.classList.contains(selector.slice(1)) : this.tagName === selector;
  }
  closest(selector) { return this.matches(selector) ? this : this.parentElement?.closest(selector) ?? null; }
  querySelectorAll(selector) {
    return this.children.flatMap((child) => [...(child.matches(selector) ? [child] : []), ...child.querySelectorAll(selector)]);
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] ?? null; }
}

function setup(count = 1, renderResult = () => Promise.resolve({ svg: '<svg></svg>' })) {
  const document = new Element('document');
  document.documentElement = new Element('html');
  document.append(document.documentElement);
  document.createElement = (tag) => new Element(tag);
  const originals = Array.from({ length: count }, (_, index) => {
    const pre = new Element('pre');
    const code = new Element('code');
    code.className = 'language-mermaid';
    code.textContent = `flowchart TD\n A${index} --> B${index}`;
    pre.append(code);
    document.documentElement.append(pre);
    return pre;
  });
  const observers = { intersection: [], resize: [], mutation: [] };
  function observerClass(kind) {
    return class {
      constructor(callback) { this.callback = callback; this.targets = new Set(); observers[kind].push(this); }
      observe(target) { this.targets.add(target); }
      unobserve(target) { this.targets.delete(target); }
      disconnect() { this.targets.clear(); }
    };
  }
  const IntersectionObserver = observerClass('intersection');
  const ResizeObserver = observerClass('resize');
  const MutationObserver = observerClass('mutation');
  const media = Object.assign(new EventTarget(), { matches: false });
  const window = Object.assign(new EventTarget(), { IntersectionObserver, matchMedia: () => media, clearTimeout, setTimeout });
  const calls = [];
  let theme;
  let cleanup;
  let imports = 0;
  const exports = {};
  vm.runInNewContext(compiled, {
    exports, document, window, Element, IntersectionObserver, ResizeObserver, MutationObserver, console,
    require(specifier) {
      if (specifier === 'react') return { useEffect: (effect) => { cleanup = effect(); } };
      if (specifier === '@/lib/mermaidSizing.mjs') return { getMermaidSizing };
      if (specifier === 'mermaid') {
        imports++;
        return { default: {
          initialize: (config) => { theme = config.theme; },
          render: (id, source) => { calls.push({ id, source, theme }); return renderResult(); },
        } };
      }
      throw new Error(`Unexpected import: ${specifier}`);
    },
  });
  return {
    document, originals, observers, calls, get imports() { return imports; },
    mount: () => exports.MermaidRenderer(),
    unmount: () => cleanup(),
    enter(container) { observers.intersection.at(-1).callback([{ target: container, isIntersecting: true }]); },
    theme(value) {
      document.documentElement.className = value;
      observers.mutation.at(-1).callback([{ attributeName: 'class' }]);
    },
  };
}

const settle = () => new Promise((resolve) => setImmediate(resolve));

test('lazy diagrams retain their SVG and controls through height and width changes', async () => {
  const env = setup(2);
  env.mount();
  assert.equal(env.imports, 0);
  const [container, offscreen] = env.document.querySelectorAll('.mermaid');
  env.enter(container);
  await settle();
  assert.equal(env.calls.length, 1);
  const svg = container.querySelector('svg');
  const toolbar = container.querySelector('.mermaid__toolbar');
  svg.style.transform = 'translate(20px, 10px) scale(2)';
  const resize = env.observers.resize[0];
  assert.equal(resize.targets.has(env.document.documentElement), false);
  for (const height of [160, 400, 160, 400]) {
    resize.callback([{ target: container, contentRect: { width: 768, height } }]);
  }
  container.clientWidth = 360;
  resize.callback([{ target: container, contentRect: { width: 328, height: 400 } }]);
  await settle();
  assert.equal(env.calls.length, 1, 'resizes must not invoke Mermaid rendering');
  assert.equal(container.querySelector('svg'), svg);
  assert.equal(container.querySelector('.mermaid__toolbar'), toolbar);
  assert.equal(svg.style.width, '328px');
  assert.equal(svg.style.transform, 'translate(20px, 10px) scale(2)');
  env.theme('dark');
  assert.equal(container.querySelector('svg'), svg, 'keep the old diagram while rendering its theme');
  await settle();
  assert.equal(env.calls.length, 2);
  assert.equal(env.calls[1].theme, 'dark');
  assert.equal(offscreen.querySelector('svg'), null);
  env.theme('dark');
  await settle();
  assert.equal(env.calls.length, 2, 'unrelated root mutations do not rerender');
  env.unmount();
  assert.equal(env.document.querySelectorAll('.mermaid').length, 0);
  assert.deepEqual(env.document.documentElement.children, env.originals);
  for (const instances of Object.values(env.observers)) {
    assert.ok(instances.every((observer) => observer.targets.size === 0));
  }
  env.mount();
  env.enter(env.document.querySelector('.mermaid'));
  await settle();
  assert.equal(env.calls.length, 3, 'StrictMode effect replay still finds original source blocks');
  env.unmount();
});

test('in-flight cleanup and remount serialize Mermaid configuration and use unique IDs', async () => {
  let finish;
  let first = true;
  const env = setup(1, () => {
    if (!first) return Promise.resolve({ svg: '<svg></svg>' });
    first = false;
    return new Promise((resolve) => { finish = resolve; });
  });
  env.mount();
  const oldContainer = env.document.querySelector('.mermaid');
  env.enter(oldContainer);
  await settle();
  assert.equal(env.calls.length, 1);
  env.unmount();
  env.mount();
  const nextContainer = env.document.querySelector('.mermaid');
  env.enter(nextContainer);
  env.theme('dark');
  await settle();
  assert.equal(env.calls.length, 1, 'a later mount cannot initialize Mermaid during an active render');
  finish({ svg: '<svg></svg>' });
  await settle();
  assert.equal(env.calls.length, 2, 'obsolete queued theme requests are skipped');
  assert.equal(env.calls[1].theme, 'dark');
  assert.notEqual(env.calls[0].id, env.calls[1].id);
  assert.equal(oldContainer.querySelector('svg'), null, 'disposed work never publishes');
  assert.ok(nextContainer.querySelector('svg'));
  assert.equal(nextContainer.getAttribute('aria-busy'), 'false');
  env.unmount();
});
