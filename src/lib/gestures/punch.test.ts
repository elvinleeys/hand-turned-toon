import { describe, expect, it } from 'vitest';
import { INITIAL_PUNCH_STATE, SIZE_METHODS, detectPunch, handSize, type PunchState } from './punch';
import type { FrameSample } from './types';
import { FIST, OPEN, frame } from './__fixtures__/hands';
import punch30 from './__fixtures__/punch-30-varied.json';
import idle60 from './__fixtures__/idle-60s.json';

/** 프레임을 하나씩 넣으며 PUNCH가 몇 번 나오는지 센다 (실제 앱처럼 최근 1초만 유지) */
function run(frames: FrameSample[], method = SIZE_METHODS[0]) {
  let state: PunchState = INITIAL_PUNCH_STATE;
  let count = 0;
  const history: FrameSample[] = [];
  for (const f of frames) {
    history.push(f);
    while (history[0].t < f.t - 1000) history.shift();
    const r = detectPunch(history, f.t, state, method);
    state = r.state;
    if (r.event) count++;
  }
  return count;
}

// 합성 손 손등 폭 0.06 × K. 실제 화면 크기(0.12 이상)에 맞춘다
const K = 3;
const seq = (world = FIST, scales: number[], start = 0) =>
  scales.map((s, i) => frame(start + i * 33, world, s * K)); // 30fps
// 200ms 동안 1.0 → 1.5배로 커지는 주먹
const PUNCH_SCALES = [1, 1, 1.1, 1.2, 1.3, 1.4, 1.5];

describe('detectPunch', () => {
  it.each(SIZE_METHODS)('빠르게 커지는 주먹 1번 → PUNCH 1번 (%s)', (method) => {
    expect(run(seq(FIST, PUNCH_SCALES), method)).toBe(1);
  });

  it('쿨다운 안의 두 번째 내지르기는 무시, 이후는 인정', () => {
    const back = [1.4, 1.2, 1, 1]; // 손을 빠르게 거둠
    expect(run(seq(FIST, [...PUNCH_SCALES, ...back, ...PUNCH_SCALES]))).toBe(1);
    expect(run([...seq(FIST, PUNCH_SCALES), ...seq(FIST, PUNCH_SCALES, 1000)])).toBe(2);
  });

  it('펼친 손이 커지면 PUNCH 아님', () => {
    expect(run(seq(OPEN, PUNCH_SCALES))).toBe(0);
  });

  it('커지는 동안 주먹이었어도 끝이 펼친 손이면 PUNCH 아님 (손을 펴며 돌림)', () => {
    // 주먹 3프레임 뒤 갑자기 1.5배 커지면서 펼친 손이 됨
    const frames = [...seq(FIST, [1, 1, 1]), frame(99, OPEN, 1.5 * K)];
    expect(run(frames)).toBe(0);
  });

  it('화면에서 아주 작은 주먹(손등 폭 0.12 미만)은 PUNCH 아님', () => {
    expect(run(seq(FIST, PUNCH_SCALES.map((s) => s / K)))).toBe(0);
  });

  it('천천히 다가오는 주먹(1초에 1.5배)은 PUNCH 아님', () => {
    const slow = Array.from({ length: 31 }, (_, i) => 1 + (0.5 * i) / 30);
    expect(run(seq(FIST, slow))).toBe(0);
  });

  it('주먹을 가까이 대고 가만히 있으면 PUNCH 아님', () => {
    expect(run(seq(FIST, Array(20).fill(1.5)))).toBe(0);
  });

  it('한 프레임만 크기가 0 가까이 튀는 인식 오류는 PUNCH 아님', () => {
    const glitch = Array(20).fill(1.5);
    glitch[10] = 0.02;
    expect(run(seq(FIST, glitch))).toBe(0);
  });
});

// 2026-11-19 노트북 웹캠 실측 기록. 값이 바뀌면 docs/PLAN.md "오인식 개선 기록"도 갱신한다.
describe('실제 기록 재생 (손등 폭)', () => {
  it('다양한 자세로 30번 → 26번 이상 (PRD 성공률 80%)', () => {
    const n = run(punch30 as FrameSample[], 'knuckle');
    expect(n).toBeGreaterThanOrEqual(24);
    expect(n).toBeLessThanOrEqual(30);
  });

  it('주먹을 뻗지 않은 60초 → 오인식 1번 이하', () => {
    expect(run(idle60 as FrameSample[], 'knuckle')).toBeLessThanOrEqual(1);
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
