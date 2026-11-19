import { describe, expect, it } from 'vitest';
import { INITIAL_STABLE_STATE, countFingers, detectStable, palmPosition, type StableState } from './fingers';
import { FIST, OPEN, SIDEWAYS, TUCKED, handWith, p, toImage } from './__fixtures__/hands';

describe('countFingers', () => {
  it.each([
    ['검지만', handWith(TUCKED, [true, false, false, false]), 1],
    ['검지·중지 (브이)', handWith(TUCKED, [true, true, false, false]), 2],
    ['검지·중지·약지', handWith(TUCKED, [true, true, true, false]), 3],
    ['엄지 빼고 넷', handWith(TUCKED, [true, true, true, true]), 4],
    ['다섯 손가락', OPEN, 5],
    ['엄지·검지·중지', handWith(SIDEWAYS, [true, true, false, false]), 3],
  ] as const)('%s → %i', (_, world, n) => {
    expect(countFingers(world)).toBe(n);
  });

  it('주먹(0개)은 null', () => {
    expect(countFingers(FIST)).toBeNull();
  });

  it('반쯤 굽힌 손가락이 있으면 애매하므로 null', () => {
    const world = handWith(TUCKED, [true, true, false, false]);
    world[12] = p(-0.01, -0.135); // 중지 끝을 둘째 마디 근처로 (비율 약 1.1)
    expect(countFingers(world)).toBeNull();
  });
});

function run(values: (number | null)[], holdMs = 700, step = 33) {
  let state: StableState = INITIAL_STABLE_STATE;
  const fired: number[] = [];
  values.forEach((v, i) => {
    const r = detectStable(v, i * step, state, holdMs);
    state = r.state;
    if (r.fired !== null) fired.push(r.fired);
  });
  return fired;
}
const repeat = (v: number | null, ms: number) => Array(Math.round(ms / 33)).fill(v);

describe('detectStable', () => {
  it('같은 값을 0.7초 유지하면 한 번', () => {
    expect(run(repeat(3, 2000))).toEqual([3]);
  });

  it('값을 바꾸면 새로 0.7초를 센다', () => {
    expect(run([...repeat(3, 800), ...repeat(5, 800), ...repeat(2, 800)])).toEqual([3, 5, 2]);
  });

  it('0.7초 전에 바뀌면 발생하지 않음', () => {
    expect(run([...repeat(3, 500), ...repeat(4, 500)])).toEqual([]);
  });

  it('같은 숫자를 다시 넣으려면 손을 잠깐 내렸다 보여준다', () => {
    expect(run([...repeat(2, 800), ...repeat(null, 300), ...repeat(2, 800)])).toEqual([2, 2]);
  });
});

describe('palmPosition', () => {
  it('카메라 원본에서 손이 오른쪽에 있으면 거울 화면에서는 왼쪽', () => {
    const lm = toImage(OPEN).map((q) => ({ ...q, x: q.x + 0.2 }));
    expect(palmPosition(lm).x).toBeLessThan(0.5);
  });

  it('화면 밖으로 넓혀져도 0~1로 자른다', () => {
    const lm = toImage(OPEN).map((q) => ({ ...q, x: q.x - 0.6, y: q.y + 0.6 }));
    const pos = palmPosition(lm);
    expect(pos.x).toBe(1);
    expect(pos.y).toBe(1);
  });
});
