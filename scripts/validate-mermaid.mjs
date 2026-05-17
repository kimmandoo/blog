#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const KNOWN_STARTERS = new Set([
  'flowchart',
  'graph',
  'sequenceDiagram',
  'classDiagram',
  'stateDiagram',
  'stateDiagram-v2',
  'erDiagram',
  'journey',
  'gantt',
  'pie',
  'mindmap',
  'timeline',
  'quadrantChart',
  'requirementDiagram',
  'gitGraph',
  'C4Context',
  'C4Container',
  'C4Component',
  'C4Dynamic',
  'C4Deployment',
  'sankey-beta',
  'xychart-beta',
  'block-beta',
  'packet-beta',
]);

const EXCLUDED_DIRS = new Set([
  '.git',
  '.next',
  '.next-build',
  '.next-dev',
  '.omx',
  '.pnp',
  '.yarn',
  'build',
  'coverage',
  'node_modules',
  'out',
  'skills',
]);

const SEVERITY_RANK = { ERROR: 0, WARN: 1, INFO: 2 };

function parseArgs(argv) {
  const options = {
    autoFix: false,
    jsonOut: null,
    root: '.',
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--root' || arg === '-r') {
      i += 1;
      if (i >= argv.length) throw new Error('Missing value for --root');
      options.root = argv[i];
      continue;
    }

    if (arg === '--auto-fix') {
      options.autoFix = true;
      continue;
    }

    if (arg === '--json-out') {
      i += 1;
      if (i >= argv.length) throw new Error('Missing value for --json-out');
      options.jsonOut = argv[i];
      continue;
    }

    if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function printHelp() {
  console.log('Usage: node scripts/validate-mermaid.mjs [--root <path>] [--auto-fix] [--json-out <path>]');
}

function collectMarkdownFiles(rootDir) {
  const files = [];

  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const entryPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        if (!EXCLUDED_DIRS.has(entry.name)) {
          walk(entryPath);
        }
        continue;
      }

      if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
        files.push(entryPath);
      }
    }
  }

  walk(rootDir);
  return files;
}

function openingFence(line) {
  const match = line.match(/^\s*(`{3,}|~{3,})\s*([^`~\s]+)?[^\r\n]*$/);

  if (!match || (match[2] ?? '').toLowerCase() !== 'mermaid') {
    return null;
  }

  return {
    char: match[1][0],
    length: match[1].length,
  };
}

function isClosingFence(line, fence) {
  const escapedChar = fence.char === '`' ? '`' : '~';
  const pattern = new RegExp(`^\\s*${escapedChar}{${fence.length},}\\s*$`);
  return pattern.test(line);
}

function bracketImbalance(text, openChar, closeChar) {
  let balance = 0;

  for (const char of text) {
    if (char === openChar) balance += 1;
    if (char === closeChar) balance -= 1;
  }

  return balance;
}

function formatPath(filePath, rootPath) {
  return path.relative(rootPath, filePath).replace(/\\/g, '/') || path.basename(filePath);
}

function formatParseError(error) {
  const rawMessage = error instanceof Error ? error.message : String(error);
  return rawMessage
    .split('\n')
    .map((line) => line.trim())
    .find(Boolean)
    ?.replace(/\s+/g, ' ')
    ?? 'Mermaid parser rejected the diagram.';
}

function isMermaidNodeEnvironmentError(error) {
  // Mermaid's browser sanitizer is unavailable in plain Node without adding a DOM dependency.
  return /DOMPurify\.(addHook|sanitize) is not a function/.test(formatParseError(error));
}

async function createMermaidParser() {
  const { default: mermaid } = await import('mermaid');
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'strict',
    suppressErrorRendering: true,
  });

  return async (source) => {
    await mermaid.parse(source);
  };
}

async function validateBlock({ blockLines, blockStart, filePath, issues, options, parseMermaid, rootPath }) {
  let changed = false;
  const fixed = [];
  const displayPath = formatPath(filePath, rootPath);

  const addIssue = (severity, rule, line, message) => {
    issues.push({ severity, rule, path: displayPath, blockStart, line, message });
  };

  for (let i = 0; i < blockLines.length; i += 1) {
    const original = blockLines[i];
    let next = original;

    if (next.includes('\t')) {
      addIssue('WARN', 'mermaid.tab', blockStart + i + 1, 'Tab character found in Mermaid block.');
      if (options.autoFix) {
        next = next.replace(/\t/g, '  ');
      }
    }

    const trimmed = next.replace(/[ \t]+$/g, '');
    if (trimmed.length !== next.length) {
      if (options.autoFix) {
        next = trimmed;
      } else {
        addIssue('INFO', 'mermaid.trailing-space', blockStart + i + 1, 'Trailing whitespace found.');
      }
    }

    if (next !== original) changed = true;
    fixed.push(next);
  }

  const firstNonEmpty = fixed.findIndex((line) => line.trim().length > 0);
  if (firstNonEmpty < 0) {
    addIssue('ERROR', 'mermaid.empty', blockStart, 'Empty Mermaid block.');
    return { changed, lines: fixed };
  }

  const starter = fixed[firstNonEmpty].trim().split(/\s+/)[0];
  if (!KNOWN_STARTERS.has(starter)) {
    addIssue('ERROR', 'mermaid.starter', blockStart + firstNonEmpty + 1, `Unknown Mermaid starter token '${starter}'.`);
  }

  const fullText = fixed.join('\n');
  if (bracketImbalance(fullText, '(', ')') !== 0) {
    addIssue('WARN', 'mermaid.bracket-round', blockStart, 'Possible imbalance in round brackets.');
  }
  if (bracketImbalance(fullText, '[', ']') !== 0) {
    addIssue('WARN', 'mermaid.bracket-square', blockStart, 'Possible imbalance in square brackets.');
  }
  if (bracketImbalance(fullText, '{', '}') !== 0) {
    addIssue('WARN', 'mermaid.bracket-curly', blockStart, 'Possible imbalance in curly braces.');
  }

  const quoteCount = (fullText.match(/(?<!\\)"/g) ?? []).length;
  if (quoteCount % 2 !== 0) {
    addIssue('WARN', 'mermaid.quote', blockStart, 'Odd count of unescaped double quotes.');
  }

  if (starter === 'flowchart' || starter === 'graph') {
    const subgraphCount = (fullText.match(/^\s*subgraph\b/gm) ?? []).length;
    const endCount = (fullText.match(/^\s*end\s*$/gm) ?? []).length;
    if (subgraphCount !== endCount) {
      addIssue('WARN', 'mermaid.subgraph-balance', blockStart, `subgraph count (${subgraphCount}) does not match end count (${endCount}).`);
    }
  }

  try {
    await parseMermaid(fullText);
  } catch (error) {
    if (!isMermaidNodeEnvironmentError(error)) {
      addIssue('ERROR', 'mermaid.parse', blockStart + firstNonEmpty + 1, formatParseError(error));
    }
  }

  return { changed, lines: fixed };
}

async function run() {
  const options = parseArgs(process.argv.slice(2));
  const rootPath = path.resolve(options.root);
  const files = collectMarkdownFiles(rootPath);
  const issues = [];
  const parseMermaid = await createMermaidParser();

  for (const filePath of files) {
    const original = fs.readFileSync(filePath, 'utf8');
    const lineEnding = original.includes('\r\n') ? '\r\n' : '\n';
    const lines = original.split(/\r?\n/);
    const outputLines = [];

    let activeFence = null;
    let blockStart = 0;
    let blockLines = [];
    let changedFile = false;

    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      const lineNumber = i + 1;

      if (!activeFence) {
        const fence = openingFence(line);

        if (fence) {
          activeFence = fence;
          blockStart = lineNumber;
          blockLines = [];
        }

        outputLines.push(line);
        continue;
      }

      if (isClosingFence(line, activeFence)) {
        const checked = await validateBlock({
          blockLines,
          blockStart,
          filePath,
          issues,
          options,
          parseMermaid,
          rootPath,
        });

        outputLines.push(...checked.lines);
        outputLines.push(line);
        changedFile = changedFile || checked.changed;
        activeFence = null;
        continue;
      }

      blockLines.push(line);
    }

    if (activeFence) {
      issues.push({
        severity: 'ERROR',
        rule: 'mermaid.fence-unclosed',
        path: formatPath(filePath, rootPath),
        blockStart,
        line: blockStart,
        message: 'Mermaid fence is not closed.',
      });
      outputLines.push(...blockLines);
    }

    if (options.autoFix && changedFile) {
      fs.writeFileSync(filePath, outputLines.join(lineEnding), 'utf8');
    }
  }

  issues.sort((a, b) => {
    const rankDiff = SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity];
    if (rankDiff !== 0) return rankDiff;
    if (a.path !== b.path) return a.path.localeCompare(b.path);
    if (a.blockStart !== b.blockStart) return a.blockStart - b.blockStart;
    return a.line - b.line;
  });

  for (const issue of issues) {
    console.log(`[${issue.severity}] ${issue.rule} ${issue.path}:${issue.blockStart}:${issue.line} - ${issue.message}`);
  }

  const errorCount = issues.filter((issue) => issue.severity === 'ERROR').length;
  const warnCount = issues.filter((issue) => issue.severity === 'WARN').length;
  const infoCount = issues.filter((issue) => issue.severity === 'INFO').length;

  console.log(`Summary: ERROR=${errorCount}, WARN=${warnCount}, INFO=${infoCount}`);

  if (options.jsonOut) {
    const jsonPath = path.resolve(rootPath, options.jsonOut);
    fs.writeFileSync(jsonPath, `${JSON.stringify(issues, null, 2)}\n`, 'utf8');
    console.log(`JSON report: ${jsonPath}`);
  }

  if (errorCount > 0) process.exit(2);
  if (issues.length > 0) process.exit(1);

  console.log('No Mermaid issues found.');
  process.exit(0);
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(2);
});
