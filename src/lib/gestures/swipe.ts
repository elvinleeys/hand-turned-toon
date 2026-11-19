import type { GestureEvent } from '@/lib/events';
import { SWIPE } from './config';
import type { FrameSample } from './types';

type Direction = 'SWIPE_LEFT' | 'SWIPE_RIGHT';
export type SwipeState = { lastFiredAt: number; lastDirection: Direction | null };
export const INITIAL_SWIPE_STATE: SwipeState = { lastFiredAt: -Infinity, lastDirection: null };

const wristXs = (history: FrameSample[], from: number, to: number) =>
  history.filter((s) => s.t > from && s.t <= to && s.landmarks.length === 21).map((s) => s.landmarks[0].x);

/** from~to 동안 손이 보였고 거의 움직이지 않았는지 */
function wasStill(history: FrameSample[], from: number, to: number): boolean {
  const xs = wristXs(history, from, to);
  return xs.length >= 2 && Math.max(...xs) - Math.min(...xs) <= SWIPE.STILL_RANGE;
}

/**
 * 손목(0번 점)이 짧은 시간에 크게 옆으로 움직이면 SWIPE.
 * 방향은 사용자가 보는 거울 반전 화면 기준: 카메라 원본 x가 커지면(화면에서 왼쪽으로) SWIPE_LEFT.
 * 직전과 반대 방향은 손을 멈췄다가 휘두른 경우만 인정한다 (휘두른 뒤 손을 되돌리는 동작 무시).
 */
export function detectSwipe(
  history: FrameSample[],
  now: number,
  state: SwipeState,
): { event: GestureEvent | null; state: SwipeState } {
  const none = { event: null, state };
  if (now - state.lastFiredAt < SWIPE.COOLDOWN_MS) return none;

  const xs = wristXs(history, now - SWIPE.WINDOW_MS, now);
  if (xs.length < SWIPE.MIN_SAMPLES) return none;

  const latest = xs[xs.length - 1];
  const direction: Direction | null =
    latest - Math.min(...xs) >= SWIPE.DISTANCE ? 'SWIPE_LEFT'
    : Math.max(...xs) - latest >= SWIPE.DISTANCE ? 'SWIPE_RIGHT'
    : null;
  if (!direction) return none;

  const reversing =
    state.lastDirection !== null &&
    direction !== state.lastDirection &&
    now - state.lastFiredAt < SWIPE.DIRECTION_MEMORY_MS;
  const windowStart = now - SWIPE.WINDOW_MS;
  if (reversing && !wasStill(history, windowStart - SWIPE.STILL_MS, windowStart)) return none;

  return {
    event: { type: direction, source: 'camera' },
    state: { lastFiredAt: now, lastDirection: direction },
  };
}
