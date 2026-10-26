import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';


function getMarkdownFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    return entry.isDirectory()
      ? getMarkdownFiles(fullPath)
      : entry.name.endsWith('.md')
        ? [fullPath]
        : [];
  });
}


test('visible post categories use canonical labels', () => {
  const markdown = getMarkdownFiles(path.join(process.cwd(), 'posts'))
    .map((file) => fs.readFileSync(file, 'utf8'))
    .join('\n');

  assert.doesNotMatch(markdown, /^category:\s*Andriod$/m);
  assert.doesNotMatch(markdown, /^category:\s*ios$/m);
  assert.doesNotMatch(markdown, /^category:\s*kotlin$/m);
  assert.doesNotMatch(markdown, /^category:\s*Tip$/m);
});
