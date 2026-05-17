import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

async function loadThemeConfig() {
  return import(pathToFileURL(path.join(process.cwd(), 'config', 'theme.config.ts')).href);
}

function getCssRule(source, selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = source.match(new RegExp(`${escapedSelector}\\s*\\{([\\s\\S]*?)\\}`));
  return match?.[1] ?? '';
}

test('code blocks show line numbers by default', async () => {
  const { themeConfig } = await loadThemeConfig();

  assert.equal(themeConfig.codeBlock.showLineNumbers, true);
});

test('code block copy and language controls are rendered in a toolbar', () => {
  const enhancerSource = fs.readFileSync(path.join(process.cwd(), 'components', 'CodeBlock.tsx'), 'utf8');
  const globalCss = fs.readFileSync(path.join(process.cwd(), 'app', 'globals.css'), 'utf8');

  assert.match(enhancerSource, /code-block-toolbar/);
  assert.match(globalCss, /\.code-block-toolbar\s*\{/);
  assert.match(getCssRule(globalCss, '.code-block-toolbar'), /display:\s*flex/);
  assert.doesNotMatch(getCssRule(globalCss, '.copy-button'), /position:\s*absolute/);
  assert.doesNotMatch(getCssRule(globalCss, '.language-badge'), /position:\s*absolute/);
});

test('copy control uses an icon button instead of visible text', () => {
  const enhancerSource = fs.readFileSync(path.join(process.cwd(), 'components', 'CodeBlock.tsx'), 'utf8');
  const globalCss = fs.readFileSync(path.join(process.cwd(), 'app', 'globals.css'), 'utf8');

  assert.match(enhancerSource, /copy-icon/);
  assert.match(enhancerSource, /copy-button-label/);
  assert.doesNotMatch(enhancerSource, /button\.textContent = 'Copy'/);
  assert.match(getCssRule(globalCss, '.copy-button'), /width:\s*2rem/);
  assert.match(getCssRule(globalCss, '.copy-icon'), /width:\s*1rem/);
});

test('line-number rendering does not add extra blank rows between code lines', () => {
  const enhancerSource = fs.readFileSync(path.join(process.cwd(), 'components', 'CodeBlock.tsx'), 'utf8');
  const globalCss = fs.readFileSync(path.join(process.cwd(), 'app', 'globals.css'), 'utf8');

  assert.doesNotMatch(enhancerSource, /createTextNode\('\\n'\)/);
  assert.doesNotMatch(getCssRule(globalCss, '.line-number'), /line-height:\s*2/);
  assert.match(getCssRule(globalCss, '.code-line-wrapper'), /line-height:\s*inherit/);
});

test('code block lines stay single-line with horizontal scrolling', () => {
  const globalCss = fs.readFileSync(path.join(process.cwd(), 'app', 'globals.css'), 'utf8');

  assert.match(getCssRule(globalCss, '.hljs'), /white-space:\s*pre;/);
  assert.match(getCssRule(globalCss, '.hljs'), /overflow-x:\s*auto/);
  assert.match(getCssRule(globalCss, '.code-line'), /white-space:\s*pre;/);
  assert.doesNotMatch(getCssRule(globalCss, '.code-line'), /overflow-wrap:\s*break-word/);
});

test('code block wrapper uses compact vertical margin', () => {
  const globalCss = fs.readFileSync(path.join(process.cwd(), 'app', 'globals.css'), 'utf8');

  assert.match(getCssRule(globalCss, '.code-block-wrapper'), /margin:\s*1rem 0;/);
});

test('code block toolbar and code area use compact internal spacing', () => {
  const globalCss = fs.readFileSync(path.join(process.cwd(), 'app', 'globals.css'), 'utf8');

  assert.match(getCssRule(globalCss, '.code-block-toolbar'), /min-height:\s*2rem/);
  assert.match(getCssRule(globalCss, '.code-block-toolbar'), /padding:\s*0\.375rem 0\.625rem/);
  assert.match(getCssRule(globalCss, '.hljs'), /padding:\s*0(?:rem)? 1rem/);
});

test('typography prose reset does not strip block code padding', () => {
  const globalCss = fs.readFileSync(path.join(process.cwd(), 'app', 'globals.css'), 'utf8');

  assert.doesNotMatch(getCssRule(globalCss, '.prose pre > code'), /padding:\s*0/);
});

test('toolbar code blocks use one outer surface instead of nested boxes', () => {
  const globalCss = fs.readFileSync(path.join(process.cwd(), 'app', 'globals.css'), 'utf8');
  const wrapperRule = getCssRule(globalCss, '.code-block-wrapper.has-code-block-toolbar');
  const toolbarRule = getCssRule(globalCss, '.code-block-toolbar');
  const preRule = getCssRule(globalCss, '.code-block-wrapper.has-code-block-toolbar pre');
  const codeRule = getCssRule(globalCss, '.hljs');

  assert.match(wrapperRule, /background:\s*var\(--code-block-bg\)/);
  assert.match(wrapperRule, /border:\s*1px solid var\(--code-block-border\)/);
  assert.match(wrapperRule, /overflow:\s*hidden/);
  assert.doesNotMatch(toolbarRule, /border:\s*1px solid var\(--code-block-border\)/);
  assert.match(toolbarRule, /border-bottom:\s*1px solid var\(--code-block-border\)/);
  assert.match(preRule, /background:\s*transparent/);
  assert.match(preRule, /border:\s*0/);
  assert.match(preRule, /border-radius:\s*0/);
  assert.match(preRule, /box-shadow:\s*none/);
  assert.match(preRule, /padding:\s*0/);
  assert.match(codeRule, /border-radius:\s*0/);
});
