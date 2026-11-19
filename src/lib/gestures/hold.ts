import { HOLD } from './config';
import type { HandShape } from './shape';

export type HoldState = {
  /** 이번 유지가 시작된 시각. 유지 중이 아니면 null */
  start: number | null;
  lastMatch: number;
  /** 이번 유지에서 이미 발생시켰는지 (손을 바꿔야 다시 발생) */
  fired: boolean;
};

export const INITIAL_HOLD_STATE: HoldState = { start: null, lastMatch: -Infinity, fired: false };

/**
 * 같은 손 모양을 holdMs 동안 유지하면 한 번 true.
 * 모양이 GAP_MS 이하로 잠깐 끊기는 건 유지로 본다.
 */
export function detectHold(
  shape: HandShape | null,
  target: HandShape,
  now: number,
  state: HoldState,
  holdMs: number,
): { fired: boolean; progress: number; state: HoldState } {
  if (shape !== target) {
    const released = now - state.lastMatch > HOLD.GAP_MS;
    const next = released ? INITIAL_HOLD_STATE : state;
    return { fired: false, progress: released ? 0 : progressOf(next, now, holdMs), state: next };
  }

  const restarted = state.start === null || now - state.lastMatch > HOLD.GAP_MS;
  const next: HoldState = restarted
    ? { start: now, lastMatch: now, fired: false }
    : { ...state, lastMatch: now };

  if (!next.fired && now - next.start! >= holdMs) {
    return { fired: true, progress: 1, state: { ...next, fired: true } };
  }
  return { fired: false, progress: progressOf(next, now, holdMs), state: next };
}

/** 유지 진행률 0~1 (진행 링 표시용) */
function progressOf(state: HoldState, now: number, holdMs: number): number {
  if (state.start === null || state.fired) return state.fired ? 1 : 0;
  return Math.min(1, (now - state.start) / holdMs);
}
