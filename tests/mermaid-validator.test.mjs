import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const validatorPath = path.join(process.cwd(), 'scripts', 'validate-mermaid.mjs');

function createTempRoot() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'blog-mermaid-'));
}

function runValidator(root, args = []) {
  return spawnSync(process.execPath, [validatorPath, '--root', root, ...args], {
    cwd: process.cwd(),
    encoding: 'utf8',
  });
}

test('Mermaid validator ignores dependency markdown', () => {
  const root = createTempRoot();
  fs.mkdirSync(path.join(root, 'docs'), { recursive: true });
  fs.mkdirSync(path.join(root, 'node_modules', 'mermaid'), { recursive: true });
  fs.writeFileSync(
    path.join(root, 'docs', 'good.md'),
    ['```mermaid', 'flowchart TD', '  A --> B', '```', ''].join('\n'),
    'utf8',
  );
  fs.writeFileSync(
    path.join(root, 'node_modules', 'mermaid', 'README.md'),
    ['```mermaid', 'flowchart TD', '  A --> B[', '```', ''].join('\n'),
    'utf8',
  );

  const result = runValidator(root);

  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /No Mermaid issues found/);
});

test('Mermaid validator reports parser failures', () => {
  const root = createTempRoot();
  fs.writeFileSync(
    path.join(root, 'bad.md'),
    ['```mermaid', 'flowchart TD', '  A --> B[', '```', ''].join('\n'),
    'utf8',
  );

  const result = runValidator(root);

  assert.equal(result.status, 2);
  assert.match(result.stdout, /\[ERROR\] mermaid\.parse bad\.md:1:2/);
});

test('Mermaid validator auto-fixes safe whitespace issues', () => {
  const root = createTempRoot();
  const filePath = path.join(root, 'spacing.md');
  fs.writeFileSync(
    filePath,
    ['```mermaid', 'flowchart TD  ', '\tA --> B  ', '```', ''].join('\n'),
    'utf8',
  );

  const fixedResult = runValidator(root, ['--auto-fix']);
  assert.equal(fixedResult.status, 1);

  const cleanResult = runValidator(root);
  assert.equal(cleanResult.status, 0, cleanResult.stdout + cleanResult.stderr);
  assert.equal(
    fs.readFileSync(filePath, 'utf8'),
    ['```mermaid', 'flowchart TD', '  A --> B', '```', ''].join('\n'),
  );
});
