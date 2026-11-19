import { SHAPE } from './config';
import type { FrameSample, Point } from './types';

export type HandShape = 'fist' | 'open' | 'thumb_up';

// 랜드마크 번호: 0 손목, 4 엄지 끝, 5/9/13/17 손가락 뿌리, 6/10/14/18 둘째 마디, 8/12/16/20 손끝
const FINGERS = [
  [6, 8],
  [10, 12],
  [14, 16],
  [18, 20],
] as const;

const dist = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);

/** 검지~새끼 손가락별 (손목~손끝 / 손목~둘째 마디). 손바닥·손등 방향과 무관하다. */
export function fingerRatios(world: Point[]): number[] {
  return FINGERS.map(([pip, tip]) => dist(world[0], world[tip]) / dist(world[0], world[pip]));
}

/** 엄지 끝~검지 뿌리 거리를 손바닥 길이로 나눈 값 */
export function thumbExtension(world: Point[]): number {
  return dist(world[4], world[5]) / dist(world[0], world[9]);
}

/** 21개 좌표만으로 손 모양을 판정한다. 애매하면 null. */
export function geometricShape(world: Point[], image: Point[]): HandShape | null {
  if (world.length < 21 || image.length < 21) return null;
  const ratios = fingerRatios(world);
  if (ratios.every((r) => r > SHAPE.EXTENDED_RATIO)) return 'open';
  if (!ratios.every((r) => r < SHAPE.CURLED_RATIO)) return null;

  const thumbOut = thumbExtension(world) > SHAPE.THUMB_OUT_RATIO;
  // 이미지 y는 아래로 갈수록 커진다. 엄지 끝이 모든 점보다 위에 있어야 '엄지 위로'
  const thumbHighest = image.every((p, i) => i === 4 || p.y > image[4].y);
  return thumbOut && thumbHighest ? 'thumb_up' : 'fist';
}

const CANNED: Record<string, HandShape> = {
  Closed_Fist: 'fist',
  Open_Palm: 'open',
  Thumb_Up: 'thumb_up',
};

/** 기본 분류가 알아보면 그 결과를, 못 알아보면(None 등) 좌표 판정 결과를 쓴다. */
export function handShape(sample: FrameSample): HandShape | null {
  const canned = sample.canned ? CANNED[sample.canned] : undefined;
  return canned ?? geometricShape(sample.world, sample.landmarks);
}
