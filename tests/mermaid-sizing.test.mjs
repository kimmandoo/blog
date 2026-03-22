import test from 'node:test';
import assert from 'node:assert/strict';

import { getMermaidSizing, readSvgGeometry } from '../lib/mermaidSizing.mjs';

test('readSvgGeometry prefers a valid viewBox', () => {
  assert.deepEqual(
    readSvgGeometry({
      viewBox: '0 0 240 960',
      widthAttr: '800',
      heightAttr: '600',
    }),
    { width: 240, height: 960 },
  );
});

test('getMermaidSizing does not upscale portrait diagrams to container width', () => {
  assert.deepEqual(
    getMermaidSizing({
      viewBox: '0 0 240 960',
      widthAttr: '240',
      heightAttr: '960',
      containerWidth: 900,
    }),
    { isPortrait: true, targetWidth: 240 },
  );
});

test('getMermaidSizing still shrinks wide diagrams to fit the container', () => {
  assert.deepEqual(
    getMermaidSizing({
      viewBox: '0 0 1400 500',
      widthAttr: '1400',
      heightAttr: '500',
      containerWidth: 900,
    }),
    { isPortrait: false, targetWidth: 868 },
  );
});

test('getMermaidSizing falls back to available width when geometry is missing', () => {
  assert.deepEqual(
    getMermaidSizing({
      viewBox: null,
      widthAttr: null,
      heightAttr: null,
      containerWidth: 720,
    }),
    { isPortrait: false, targetWidth: 688 },
  );
});

test('getMermaidSizing shrinks portrait diagrams on narrow mobile containers', () => {
  assert.deepEqual(
    getMermaidSizing({
      viewBox: '0 0 480 960',
      widthAttr: '480',
      heightAttr: '960',
      containerWidth: 320,
    }),
    { isPortrait: true, targetWidth: 288 },
  );
});

test('readSvgGeometry ignores non-numeric width and height attributes without a viewBox', () => {
  assert.equal(
    readSvgGeometry({
      viewBox: null,
      widthAttr: '100%',
      heightAttr: '12pt',
    }),
    null,
  );
});
