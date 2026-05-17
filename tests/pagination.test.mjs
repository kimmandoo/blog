import test from 'node:test';
import assert from 'node:assert/strict';

import { paginateItems, parsePageParam } from '../lib/pagination.ts';

test('paginateItems returns only the items for the requested page', () => {
  const result = paginateItems(['a', 'b', 'c', 'd', 'e', 'f', 'g'], 2, 3);

  assert.deepEqual(result.items, ['d', 'e', 'f']);
  assert.equal(result.currentPage, 2);
  assert.equal(result.totalPages, 3);
  assert.equal(result.totalItems, 7);
  assert.equal(result.hasPrevious, true);
  assert.equal(result.hasNext, true);
});

test('paginateItems clamps invalid requested pages into range', () => {
  assert.deepEqual(paginateItems(['a', 'b', 'c'], 0, 2).items, ['a', 'b']);

  const highPage = paginateItems(['a', 'b', 'c'], 99, 2);
  assert.equal(highPage.currentPage, 2);
  assert.deepEqual(highPage.items, ['c']);
});

test('parsePageParam accepts only positive integer page values', () => {
  assert.equal(parsePageParam('3'), 3);
  assert.equal(parsePageParam(undefined), 1);
  assert.equal(parsePageParam('0'), 1);
  assert.equal(parsePageParam('2.5'), 1);
  assert.equal(parsePageParam('nope'), 1);
  assert.equal(parsePageParam(['4', '5']), 4);
});
