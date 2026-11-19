import type { GestureEvent } from '@/lib/events';
import { PUNCH } from './config';
import { handShape } from './shape';
import type { FrameSample, Point } from './types';

/**
 * 손 크기 측정 방식 (M1에서 비교 후 하나로 정한다)
 * - knuckle: 검지 뿌리~새끼 뿌리 (주먹을 뻗으면 카메라를 향하는 손등 폭)
 * - palm: 손목~중지 뿌리 (주먹을 뻗으면 손목이 가려져 줄어들 수 있음)
 * - bbox: 21개 점을 감싸는 사각형의 √(가로×세로)
 * z좌표는 손목 기준 상대 깊이라 카메라와의 거리를 알 수 없어 쓰지 않는다.
 */
export type SizeMethod = 'knuckle' | 'palm' | 'bbox';
export const SIZE_METHODS: SizeMethod[] = ['knuckle', 'palm', 'bbox'];

const dist2 = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

export function handSize(lm: Point[], method: SizeMethod): number {
  if (method === 'knuckle') return dist2(lm[5], lm[17]);
  if (method === 'palm') return dist2(lm[0], lm[9]);
  const xs = lm.map((p) => p.x);
  const ys = lm.map((p) => p.y);
  return Math.sqrt((Math.max(...xs) - Math.min(...xs)) * (Math.max(...ys) - Math.min(...ys)));
}

/** 최근 창에서 손이 잡힌 프레임 */
function windowSamples(history: FrameSample[], now: number): FrameSample[] {
  return history.filter((s) => s.t > now - PUNCH.WINDOW_MS && s.t <= now && s.landmarks.length === 21);
}

/** 창 안 기준 크기 대비 가장 최근 크기의 배율. 판정 불가면 0 */
export function punchGrowth(history: FrameSample[], now: number, method: SizeMethod): number {
  const win = windowSamples(history, now);
  if (win.length < PUNCH.MIN_SAMPLES) return 0;
  const sizes = win.map((s) => handSize(s.landmarks, method));
  // 한 프레임짜리 인식 오류(크기가 0에 가깝게 튐)를 무시하려고 최솟값 대신 두 번째로 작은 값을 쓴다
  const sorted = [...sizes].sort((a, b) => a - b);
  const base = sorted.length >= 3 ? sorted[1] : sorted[0];
  return base > 0 ? sizes[sizes.length - 1] / base : 0;
}

export type PunchState = { lastFiredAt: number };
export const INITIAL_PUNCH_STATE: PunchState = { lastFiredAt: -Infinity };

/** 주먹 상태로 짧은 시간에 손이 커지면 PUNCH. history는 시간순. */
export function detectPunch(
  history: FrameSample[],
  now: number,
  state: PunchState,
  method: SizeMethod = 'knuckle',
): { event: GestureEvent | null; state: PunchState } {
  const none = { event: null, state };
  if (now - state.lastFiredAt < PUNCH.COOLDOWN_MS) return none;

  const win = windowSamples(history, now);
  if (win.length < PUNCH.MIN_SAMPLES) return none;
  const fistRatio = win.filter((s) => handShape(s) === 'fist').length / win.length;
  if (fistRatio <= PUNCH.FIST_MAJORITY) return none;
  // 끝 모양이 주먹이 아니면 손을 펴며 돌린 것 (손등 폭만 커짐)
  const latest = win[win.length - 1];
  if (handShape(latest) !== 'fist') return none;
  if (handSize(latest.landmarks, method) < PUNCH.MIN_END_SIZE) return none;
  if (punchGrowth(history, now, method) < PUNCH.GROWTH) return none;
  if (method !== 'bbox' && punchGrowth(history, now, 'bbox') < PUNCH.BBOX_GROWTH) return none;

  return { event: { type: 'PUNCH', source: 'camera' }, state: { lastFiredAt: now } };
}
