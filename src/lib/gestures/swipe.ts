import type { GestureEvent } from '@/lib/events';
import { SWIPE } from './config';
import type { FrameSample } from './types';

export type SwipeState = { lastFiredAt: number };
export const INITIAL_SWIPE_STATE: SwipeState = { lastFiredAt: -Infinity };

/**
 * 손목(0번 점)이 짧은 시간에 크게 옆으로 움직이면 SWIPE.
 * 방향은 사용자가 보는 거울 반전 화면 기준: 카메라 원본 x가 커지면(화면에서 왼쪽으로) SWIPE_LEFT.
 */
export function detectSwipe(
  history: FrameSample[],
  now: number,
  state: SwipeState,
): { event: GestureEvent | null; state: SwipeState } {
  const none = { event: null, state };
  if (now - state.lastFiredAt < SWIPE.COOLDOWN_MS) return none;

  const xs = history
    .filter((s) => s.t > now - SWIPE.WINDOW_MS && s.t <= now && s.landmarks.length === 21)
    .map((s) => s.landmarks[0].x);
  if (xs.length < SWIPE.MIN_SAMPLES) return none;

  const latest = xs[xs.length - 1];
  const fired = (type: 'SWIPE_LEFT' | 'SWIPE_RIGHT') => ({
    event: { type, source: 'camera' as const },
    state: { lastFiredAt: now },
  });
  if (latest - Math.min(...xs) >= SWIPE.DISTANCE) return fired('SWIPE_LEFT');
  if (Math.max(...xs) - latest >= SWIPE.DISTANCE) return fired('SWIPE_RIGHT');
  return none;
}
