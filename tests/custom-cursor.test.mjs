import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const globalCss = fs.readFileSync(path.join(process.cwd(), 'app', 'globals.css'), 'utf8');

function getCssRule(source, selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = source.match(new RegExp(`${escapedSelector}\\s*\\{([\\s\\S]*?)\\}`));
  return match?.[1] ?? '';
}

function decodeCursorSvg(rule, variableName) {
  const escapedVariable = variableName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = rule.match(new RegExp(`${escapedVariable}:\\s*url\\("data:image/svg\\+xml,([^"]+)"\\)`));

  assert.ok(match, `${variableName} should be defined as an SVG data URI`);

  return decodeURIComponent(match[1]);
}

test('global theme defines SVG cursors for default and interactive states', () => {
  const rootRule = getCssRule(globalCss, ':root');
  const darkRule = getCssRule(globalCss, 'html.dark');

  assert.match(rootRule, /--cursor-default:\s*url\("data:image\/svg\+xml,/);
  assert.match(rootRule, /--cursor-pointer:\s*url\("data:image\/svg\+xml,/);
  assert.match(darkRule, /--cursor-default:\s*url\("data:image\/svg\+xml,/);
  assert.match(darkRule, /--cursor-pointer:\s*url\("data:image\/svg\+xml,/);
});

test('custom cursors use playful dumpling-inspired artwork', () => {
  const rootRule = getCssRule(globalCss, ':root');
  const defaultSvg = decodeCursorSvg(rootRule, '--cursor-default');
  const pointerSvg = decodeCursorSvg(rootRule, '--cursor-pointer');

  assert.match(defaultSvg, /<ellipse\b/);
  assert.match(defaultSvg, /<circle\b[^>]*#fb7185/);
  assert.match(defaultSvg, /M14\.5 21/);
  assert.doesNotMatch(defaultSvg, /M4 3L17 12\.5/);

  assert.match(pointerSvg, /<path\b[^>]*#fb7185/);
  assert.match(pointerSvg, /<circle\b/);
  assert.doesNotMatch(pointerSvg, /r='7'/);
});

test('page body and interactive controls use custom cursor fallbacks', () => {
  assert.match(getCssRule(globalCss, 'body'), /cursor:\s*var\(--cursor-default\), auto;/);
  assert.match(globalCss, /a\[href\],[\s\S]*?cursor:\s*var\(--cursor-pointer\), pointer;/);
  assert.match(getCssRule(globalCss, '.copy-button'), /cursor:\s*var\(--cursor-pointer\), pointer;/);
  assert.match(getCssRule(globalCss, '.prose summary'), /cursor:\s*var\(--cursor-pointer\), pointer;/);
  assert.match(getCssRule(globalCss, '.mermaid__toolbar-btn'), /cursor:\s*var\(--cursor-pointer\), pointer;/);
});
