import { describe, expect, it } from 'vitest';
import { INITIAL_HOLD_STATE, detectHold, type HoldState } from './hold';
import type { HandShape } from './shape';

/** [시각, 모양] 목록을 넣고 발생 시각을 돌려준다 */
function run(frames: [number, HandShape | null][], holdMs = 500): number[] {
  let state: HoldState = INITIAL_HOLD_STATE;
  const fired: number[] = [];
  for (const [t, shape] of frames) {
    const r = detectHold(shape, 'open', t, state, holdMs);
    state = r.state;
    if (r.fired) fired.push(t);
  }
  return fired;
}
const span = (from: number, to: number, shape: HandShape | null, step = 33): [number, HandShape | null][] =>
  Array.from({ length: Math.floor((to - from) / step) + 1 }, (_, i) => [from + i * step, shape]);

describe('detectHold', () => {
  it('0.5초 유지하면 한 번만 발생', () => {
    expect(run(span(0, 2000, 'open'))).toEqual([528]); // 33ms 간격에서 500ms를 처음 넘는 프레임
  });

  it('0.5초보다 짧으면 발생하지 않음', () => {
    expect(run(span(0, 400, 'open'))).toEqual([]);
  });

  it('100ms 정도 분류가 깜빡여도 유지로 본다', () => {
    const frames = [...span(0, 300, 'open'), ...span(330, 400, null), ...span(429, 700, 'open')];
    expect(run(frames)).toHaveLength(1);
  });

  it('손을 바꿨다 다시 펴면 다시 발생', () => {
    const frames = [...span(0, 600, 'open'), ...span(633, 900, 'fist'), ...span(933, 1600, 'open')];
    expect(run(frames)).toHaveLength(2);
  });

  it('진행률은 0에서 1로 오른다', () => {
    const r = detectHold('open', 'open', 250, { start: 0, lastMatch: 220, fired: false }, 500);
    expect(r.progress).toBeCloseTo(0.5);
  });
});
