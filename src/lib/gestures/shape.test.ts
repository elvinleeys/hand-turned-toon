import { describe, expect, it } from 'vitest';
import { geometricShape, handShape } from './shape';
import type { FrameSample, Point } from './types';

// 합성 손 좌표 (미터, y가 작을수록 위). 손목 원점, 손가락 뿌리 y=-0.09
const p = (x: number, y: number, z = 0): Point => ({ x, y, z });
const FINGER_X = [-0.03, -0.01, 0.01, 0.03];

function hand(fingers: 'extended' | 'curled', thumbTip: Point): Point[] {
  const pts: Point[] = [p(0, 0), p(-0.03, -0.02), p(-0.05, -0.04), p(-0.06, -0.06), thumbTip];
  for (const x of FINGER_X) {
    pts.push(p(x, -0.09));
    if (fingers === 'extended') pts.push(p(x, -0.13), p(x, -0.165), p(x, -0.2));
    else pts.push(p(x, -0.12), p(x, -0.1, -0.03), p(x, -0.07, -0.02));
  }
  return pts;
}
// 이미지 좌표는 같은 모양을 화면 가운데로 옮긴 것으로 충분하다
const toImage = (w: Point[]) => w.map((q) => p(q.x + 0.5, q.y + 0.5, q.z));

const TUCKED = p(-0.01, -0.08, -0.03);
const UP = p(-0.06, -0.16);
const SIDEWAYS = p(-0.12, -0.05);

describe('geometricShape', () => {
  it.each([
    ['펼친 손', hand('extended', SIDEWAYS), 'open'],
    ['엄지를 감싼 주먹', hand('curled', TUCKED), 'fist'],
    ['엄지 위로', hand('curled', UP), 'thumb_up'],
    ['엄지를 옆으로 뺀 주먹은 엄지 위로가 아님', hand('curled', SIDEWAYS), 'fist'],
  ] as const)('%s → %s', (_, world, expected) => {
    expect(geometricShape(world, toImage(world))).toBe(expected);
  });

  it('손가락 일부만 펴면 null', () => {
    const world = hand('curled', TUCKED);
    world.splice(5, 4, p(-0.03, -0.09), p(-0.03, -0.13), p(-0.03, -0.165), p(-0.03, -0.2)); // 검지만 폄
    expect(geometricShape(world, toImage(world))).toBeNull();
  });

  it('좌표가 없으면 null', () => {
    expect(geometricShape([], [])).toBeNull();
  });
});

describe('handShape', () => {
  const fist = hand('curled', TUCKED);
  const sample = (canned: string | null, world = fist): FrameSample => ({
    t: 0, canned, cannedScore: 0.9, world, landmarks: toImage(world),
  });

  it('기본 분류가 알아보면 그대로 쓴다', () => {
    expect(handShape(sample('Open_Palm'))).toBe('open');
  });
  it('기본 분류가 None이면 좌표 판정으로 보완한다 (손등·옆모습)', () => {
    expect(handShape(sample('None'))).toBe('fist');
  });
  it('손이 없으면 null', () => {
    expect(handShape(sample(null, []))).toBeNull();
  });
});
