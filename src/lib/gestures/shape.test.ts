import { describe, expect, it } from 'vitest';
import { geometricShape, handShape } from './shape';
import type { FrameSample } from './types';
import { FIST, OPEN, SIDEWAYS, UP, hand, p, toImage } from './__fixtures__/hands';

describe('geometricShape', () => {
  it.each([
    ['펼친 손', OPEN, 'open'],
    ['엄지를 감싼 주먹', FIST, 'fist'],
    ['엄지 위로', hand('curled', UP), 'thumb_up'],
    ['엄지를 옆으로 뺀 주먹은 엄지 위로가 아님', hand('curled', SIDEWAYS), 'fist'],
  ] as const)('%s → %s', (_, world, expected) => {
    expect(geometricShape(world, toImage(world))).toBe(expected);
  });

  it('손가락 일부만 펴면 null', () => {
    const world = [...FIST];
    world.splice(5, 4, p(-0.03, -0.09), p(-0.03, -0.13), p(-0.03, -0.165), p(-0.03, -0.2)); // 검지만 폄
    expect(geometricShape(world, toImage(world))).toBeNull();
  });

  it('좌표가 없으면 null', () => {
    expect(geometricShape([], [])).toBeNull();
  });
});

describe('handShape', () => {
  const sample = (canned: string | null, world = FIST): FrameSample => ({
    t: 0, canned, cannedScore: 0.9, world, landmarks: toImage(world),
  });

  it('기본 분류가 알아보면 그대로 쓴다', () => {
    expect(handShape(sample('Open_Palm'))).toBe('open');
  });
  it.each(['None', 'Thumb_Down'])('기본 분류가 %s이면 좌표 판정으로 보완한다 (뻗은 주먹·손등)', (canned) => {
    expect(handShape(sample(canned))).toBe('fist');
  });
  it('손이 없으면 null', () => {
    expect(handShape(sample(null, []))).toBeNull();
  });
});
