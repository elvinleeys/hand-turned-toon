import { describe, expect, it } from 'vitest';
import { parseResultQuery, toResultQuery } from './resultQuery';

describe('결과 쿼리', () => {
  it('뷰어 통계 → 쿼리 → 결과 값으로 왕복된다', () => {
    const q = toResultQuery({ startedAt: 1000, finishedAt: 96_400, punches: 4, sources: ['camera', 'keyboard'], skipped: 1 });
    expect(parseResultQuery(Object.fromEntries(new URLSearchParams(q)))).toEqual({
      seconds: 95,
      punches: 4,
      sources: ['camera', 'keyboard'],
      skipped: 1,
    });
  });

  it('잘못되거나 조작된 값은 안전한 값으로 바꾼다', () => {
    expect(parseResultQuery({ t: '-5', p: 'abc', s: '<script>,camera', k: '1e9' })).toEqual({
      seconds: 0,
      punches: 0,
      sources: ['camera'],
      skipped: 99,
    });
    expect(parseResultQuery({})).toEqual({ seconds: 0, punches: 0, sources: [], skipped: 0 });
  });
});
