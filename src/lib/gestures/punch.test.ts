import { describe, expect, it } from 'vitest';
import { INITIAL_PUNCH_STATE, SIZE_METHODS, detectPunch, handSize, type PunchState } from './punch';
import type { FrameSample } from './types';
import { FIST, OPEN, frame } from './__fixtures__/hands';

/** 33ms(30fps) 간격 프레임을 하나씩 넣으며 PUNCH가 몇 번 나오는지 센다 */
function run(frames: FrameSample[], method = SIZE_METHODS[0]) {
  let state: PunchState = INITIAL_PUNCH_STATE;
  let count = 0;
  frames.forEach((f, i) => {
    const r = detectPunch(frames.slice(0, i + 1), f.t, state, method);
    state = r.state;
    if (r.event) count++;
  });
  return count;
}

const seq = (world = FIST, scales: number[], start = 0) => scales.map((s, i) => frame(start + i * 33, world, s));
// 200ms 동안 1.0 → 1.5배로 커지는 주먹
const PUNCH_SCALES = [1, 1, 1.1, 1.2, 1.3, 1.4, 1.5];

describe('detectPunch', () => {
  it.each(SIZE_METHODS)('빠르게 커지는 주먹 1번 → PUNCH 1번 (%s)', (method) => {
    expect(run(seq(FIST, PUNCH_SCALES), method)).toBe(1);
  });

  it('쿨다운(600ms) 안의 두 번째 내지르기는 무시, 이후는 인정', () => {
    const back = [1.4, 1.2, 1, 1]; // 손을 빠르게 거둠
    const tooSoon = seq(FIST, [...PUNCH_SCALES, ...back, ...PUNCH_SCALES]);
    expect(run(tooSoon)).toBe(1);
    const later = [...seq(FIST, PUNCH_SCALES), ...seq(FIST, PUNCH_SCALES, 1000)];
    expect(run(later)).toBe(2);
  });

  it('펼친 손이 커지면 PUNCH 아님', () => {
    expect(run(seq(OPEN, PUNCH_SCALES))).toBe(0);
  });

  it('천천히 다가오는 주먹(1초에 1.5배)은 PUNCH 아님', () => {
    const slow = Array.from({ length: 31 }, (_, i) => 1 + (0.5 * i) / 30);
    expect(run(seq(FIST, slow))).toBe(0);
  });

  it('주먹을 가까이 대고 가만히 있으면 PUNCH 아님', () => {
    expect(run(seq(FIST, Array(20).fill(1.5)))).toBe(0);
  });
});

describe('handSize', () => {
  it('화면에서 2배 크면 모든 방식에서 2배', () => {
    for (const m of SIZE_METHODS) {
      const a = handSize(frame(0, FIST, 1).landmarks, m);
      const b = handSize(frame(0, FIST, 2).landmarks, m);
      expect(b / a).toBeCloseTo(2);
    }
  });
});
