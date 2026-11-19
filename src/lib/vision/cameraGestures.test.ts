import { describe, expect, it } from 'vitest';
import type { FrameSample, Point } from '@/lib/gestures/types';
import { FIST, OPEN, frame } from '@/lib/gestures/__fixtures__/hands';
import { createCameraGestures } from './cameraGestures';

const STEP = 33;

/** 손목 x 위치 목록으로 같은 모양의 손을 움직인다 (카메라 원본 좌표) */
function track(world: Point[], xs: number[], start = 0): FrameSample[] {
  return xs.map((x, i) => {
    const f = frame(start + i * STEP, world, 3); // 화면에서 충분히 큰 손
    const dx = x - f.landmarks[0].x;
    return { ...f, landmarks: f.landmarks.map((q) => ({ ...q, x: q.x + dx })) };
  });
}
const hold = (x: number, ms: number) => Array(Math.round(ms / STEP)).fill(x);
const ramp = (a: number, b: number, n = 8) => Array.from({ length: n }, (_, i) => a + ((b - a) * i) / (n - 1));

function swipesOf(world: Point[], xs: number[]): string[] {
  const detect = createCameraGestures();
  return track(world, xs)
    .flatMap((s) => detect(s))
    .filter((e) => e.type === 'SWIPE_LEFT' || e.type === 'SWIPE_RIGHT')
    .map((e) => e.type);
}

// 휘두른 뒤 0.3초만 멈췄다가 반대로 휘두르는 움직임 (멈춤 기준 0.6초 미만)
const MOVES = [...hold(0.5, 1200), ...ramp(0.5, 0.15), ...hold(0.15, 600), ...ramp(0.15, 0.55)];

describe('카메라 판정 묶음: 손전등과 휘두르기', () => {
  it('손바닥을 펴고 비추는 중에 생긴 휘두르기는 방향을 기억하지 않아 다음 휘두르기가 막히지 않는다', () => {
    expect(swipesOf(OPEN, MOVES)).toEqual(['SWIPE_RIGHT', 'SWIPE_LEFT']);
  });

  it('손바닥을 펴고 있지 않으면 되돌리는 손 무시 규칙이 그대로 적용된다', () => {
    expect(swipesOf(FIST, MOVES)).toEqual(['SWIPE_RIGHT']);
  });
});
