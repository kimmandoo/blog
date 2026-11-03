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
    { targetWidth: 240 },
  );
});

test('getMermaidSizing fits diagrams when their labels remain readable', () => {
  assert.deepEqual(
    getMermaidSizing({
      viewBox: '0 0 1000 500',
      widthAttr: '1000',
      heightAttr: '500',
      containerWidth: 900,
    }),
    { targetWidth: 900 },
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
    { targetWidth: 720 },
  );
});

test('getMermaidSizing preserves readable labels on narrow mobile containers', () => {
  assert.deepEqual(
    getMermaidSizing({
      viewBox: '0 0 480 960',
      widthAttr: '480',
      heightAttr: '960',
      containerWidth: 320,
    }),
    { targetWidth: 360 },
  );
});

test('getMermaidSizing keeps wide mobile diagrams scrollable instead of crushing text', () => {
  const { targetWidth } = getMermaidSizing({
    viewBox: '4 4 1128 64',
    containerWidth: 324,
  });
  assert.equal(targetWidth, 846);
  assert.ok(16 * targetWidth / 1128 >= 12);
  assert.ok(targetWidth > 324);
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

test('readSvgGeometry accepts comma-separated viewBox values', () => {
  assert.deepEqual(
    readSvgGeometry({
      viewBox: '0,0,320,180',
      widthAttr: null,
      heightAttr: null,
    }),
    { width: 320, height: 180 },
  );
});

test('readSvgGeometry converts absolute CSS length units to pixels', () => {
  assert.deepEqual(
    readSvgGeometry({
      viewBox: null,
      widthAttr: '72pt',
      heightAttr: '1in',
    }),
    { width: 96, height: 96 },
  );
});
