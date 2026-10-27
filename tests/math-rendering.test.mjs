import test from 'node:test';
import assert from 'node:assert/strict';
import { remark } from 'remark';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';

test('Markdown math renders inline and display equations while preserving code literals', async () => {
  const result = await remark()
    .use(remarkMath)
    .use(remarkRehype)
    .use(rehypeKatex)
    .use(rehypeStringify)
    .process('Inline $x^2$.\n\n$$\n\\frac{1}{2}\n$$\n\n`$literal$`');
  const html = String(result);

  assert.match(html, /<p>Inline <span class="katex">/);
  assert.match(html, /class="katex-display"/);
  assert.match(html, /<mfrac>/);
  assert.match(html, /<code>\$literal\$<\/code>/);
  assert.doesNotMatch(html, /\$x\^2\$/);
});
