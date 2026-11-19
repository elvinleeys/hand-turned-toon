import type { FrameSample, Point } from '../types';

// 합성 손 좌표 (미터, y가 작을수록 위). 손목 원점, 손가락 뿌리 y=-0.09
export const p = (x: number, y: number, z = 0): Point => ({ x, y, z });
const FINGER_X = [-0.03, -0.01, 0.01, 0.03];

export function hand(fingers: 'extended' | 'curled', thumbTip: Point): Point[] {
  const pts: Point[] = [p(0, 0), p(-0.03, -0.02), p(-0.05, -0.04), p(-0.06, -0.06), thumbTip];
  for (const x of FINGER_X) {
    pts.push(p(x, -0.09));
    if (fingers === 'extended') pts.push(p(x, -0.13), p(x, -0.165), p(x, -0.2));
    else pts.push(p(x, -0.12), p(x, -0.1, -0.03), p(x, -0.07, -0.02));
  }
  return pts;
}

/** 같은 모양을 화면 가운데에 scale배로 놓은 이미지 좌표 */
export const toImage = (w: Point[], scale = 1) => w.map((q) => p(q.x * scale + 0.5, q.y * scale + 0.5, q.z));

export const TUCKED = p(-0.01, -0.08, -0.03);
export const UP = p(-0.06, -0.16);
export const SIDEWAYS = p(-0.12, -0.05);

/** 엄지 상태와 손가락별(검지~새끼) 펴짐을 골라 만든 손 */
export function handWith(thumbTip: Point, extended: [boolean, boolean, boolean, boolean]): Point[] {
  const open = hand('extended', thumbTip);
  const fist = hand('curled', thumbTip);
  return open.map((pt, i) => (i >= 5 && !extended[Math.floor((i - 5) / 4)] ? fist[i] : pt));
}

export const FIST = hand('curled', TUCKED);
export const OPEN = hand('extended', SIDEWAYS);

/** 기본 분류가 None인 프레임 (좌표 판정에 맡김) */
export function frame(t: number, world: Point[], scale = 1): FrameSample {
  return { t, canned: 'None', cannedScore: 0.6, world, landmarks: toImage(world, scale) };
}
