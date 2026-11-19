import { FINGERS, FLASHLIGHT, HOLD, SHAPE } from './config';
import { fingerRatios, thumbExtension } from './shape';
import type { Point } from './types';

export type FingerCount = 1 | 2 | 3 | 4 | 5;

/** 펴진 손가락 수. 어느 손가락이든 펴짐·접힘이 애매하면 null (잘못 세는 것보다 기다리는 게 낫다) */
export function countFingers(world: Point[]): FingerCount | null {
  if (world.length < 21) return null;
  const ratios = fingerRatios(world);
  if (ratios.some((r) => r >= SHAPE.CURLED_RATIO && r <= SHAPE.EXTENDED_RATIO)) return null;
  const n = ratios.filter((r) => r > SHAPE.EXTENDED_RATIO).length + (thumbExtension(world) > FINGERS.THUMB_COUNT_RATIO ? 1 : 0);
  return n >= 1 ? (n as FingerCount) : null;
}

export type StableState = { value: number | null; since: number; lastSeen: number; fired: boolean };
export const INITIAL_STABLE_STATE: StableState = { value: null, since: 0, lastSeen: -Infinity, fired: false };

/**
 * 같은 값을 holdMs 동안 유지하면 한 번 발생. 값이 바뀌거나 손이 GAP_MS 넘게 사라져야 다시 발생.
 * (같은 숫자를 연속 입력하려면 손을 잠깐 내렸다 다시 보여준다)
 */
export function detectStable(
  value: number | null,
  now: number,
  state: StableState,
  holdMs: number,
): { fired: number | null; state: StableState } {
  if (value === null) {
    return { fired: null, state: now - state.lastSeen > HOLD.GAP_MS ? INITIAL_STABLE_STATE : state };
  }
  const restart = value !== state.value || now - state.lastSeen > HOLD.GAP_MS;
  const next: StableState = restart
    ? { value, since: now, lastSeen: now, fired: false }
    : { ...state, lastSeen: now };
  if (!next.fired && now - next.since >= holdMs) return { fired: value, state: { ...next, fired: true } };
  return { fired: null, state: next };
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/**
 * 손바닥 중심(손목과 손가락 뿌리 4개의 평균)을 화면 좌표(0~1, 거울 반전 후)로 바꾼다.
 * 가운데 기준으로 GAIN배 넓혀서 카메라 가장자리까지 손을 뻗지 않아도 화면 구석에 닿게 한다.
 */
export function palmPosition(landmarks: Point[]): { x: number; y: number } {
  const ids = [0, 5, 9, 13, 17];
  const cx = ids.reduce((s, i) => s + landmarks[i].x, 0) / ids.length;
  const cy = ids.reduce((s, i) => s + landmarks[i].y, 0) / ids.length;
  return {
    x: clamp01((1 - cx - 0.5) * FLASHLIGHT.GAIN + 0.5),
    y: clamp01((cy - 0.5) * FLASHLIGHT.GAIN + 0.5),
  };
}
