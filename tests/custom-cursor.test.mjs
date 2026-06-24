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

test('global theme does not define custom cursor artwork', () => {
  const rootRule = getCssRule(globalCss, ':root');
  const darkRule = getCssRule(globalCss, 'html.dark');

  assert.doesNotMatch(rootRule, /--cursor-/);
  assert.doesNotMatch(darkRule, /--cursor-/);
  assert.doesNotMatch(globalCss, /data:image\/svg\+xml/);
});

test('page body and interactive controls use native cursor styles', () => {
  assert.match(getCssRule(globalCss, 'body'), /cursor:\s*auto;/);
  assert.match(globalCss, /a\[href\],[\s\S]*?cursor:\s*pointer;/);
  assert.match(getCssRule(globalCss, '.copy-button'), /cursor:\s*pointer;/);
  assert.match(getCssRule(globalCss, '.prose summary'), /cursor:\s*pointer;/);
  assert.match(getCssRule(globalCss, '.mermaid__toolbar-btn'), /cursor:\s*pointer;/);
});
