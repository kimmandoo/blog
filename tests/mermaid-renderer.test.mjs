import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

function readRendererSource() {
  return fs.readFileSync(path.join(process.cwd(), 'components', 'MermaidRenderer.tsx'), 'utf8');
}

function readGlobalCss() {
  return fs.readFileSync(path.join(process.cwd(), 'app', 'globals.css'), 'utf8');
}

function getCssRule(source, selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = source.match(new RegExp(`${escapedSelector}\\s*\\{([\\s\\S]*?)\\}`));
  return match?.[1] ?? '';
}

test('Mermaid renderer exposes icon-only controls for diagram workflows', () => {
  const rendererSource = readRendererSource();
  const globalCss = readGlobalCss();

  assert.match(rendererSource, /copy-source/);
  assert.match(rendererSource, /download-svg/);
  assert.match(rendererSource, /mermaid__button-label/);
  assert.match(rendererSource, /navigator\.clipboard\.writeText/);
  assert.match(rendererSource, /URL\.createObjectURL/);
  assert.match(getCssRule(globalCss, '.mermaid__toolbar-btn'), /width:\s*2rem/);
  assert.match(getCssRule(globalCss, '.mermaid__button-label'), /clip:\s*rect\(0, 0, 0, 0\)/);
});

test('Mermaid diagrams are keyboard focusable and accessible as grouped content', () => {
  const rendererSource = readRendererSource();
  const globalCss = readGlobalCss();

  assert.match(rendererSource, /container\.setAttribute\('role', 'group'\)/);
  assert.match(rendererSource, /wrap\.tabIndex = 0/);
  assert.match(rendererSource, /handleKeyDown/);
  assert.match(getCssRule(globalCss, '.mermaid__svg-wrap:focus-visible'), /box-shadow:\s*0 0 0 2px/);
});

test('Mermaid theme updates include explicit light and dark palette variables', () => {
  const rendererSource = readRendererSource();

  assert.match(rendererSource, /resolveMermaidThemeVariables/);
  assert.match(rendererSource, /primaryTextColor: '#f9fafb'/);
  assert.match(rendererSource, /primaryTextColor: '#0f172a'/);
});
