import { describe, expect, it } from 'vitest';
import { INITIAL_SWIPE_STATE, detectSwipe, type SwipeState } from './swipe';
import type { FrameSample } from './types';
import { OPEN, frame } from './__fixtures__/hands';

/** 손목 x 위치 목록(33ms 간격)으로 프레임을 만든다 (카메라 원본 좌표) */
function wristTrack(xs: number[], start = 0): FrameSample[] {
  return xs.map((x, i) => {
    const f = frame(start + i * 33, OPEN);
    const dx = x - f.landmarks[0].x;
    return { ...f, landmarks: f.landmarks.map((p) => ({ ...p, x: p.x + dx })) };
  });
}

function run(frames: FrameSample[]) {
  let state: SwipeState = INITIAL_SWIPE_STATE;
  const events: string[] = [];
  const history: FrameSample[] = [];
  for (const f of frames) {
    history.push(f);
    const r = detectSwipe(history, f.t, state);
    state = r.state;
    if (r.event) events.push(r.event.type);
  }
  return events;
}

const ramp = (from: number, to: number, n: number) => Array.from({ length: n }, (_, i) => from + ((to - from) * i) / (n - 1));

describe('detectSwipe', () => {
  it('원본 x가 빠르게 커지면 (거울 화면에서 왼쪽으로) SWIPE_LEFT', () => {
    expect(run(wristTrack(ramp(0.3, 0.7, 8)))).toEqual(['SWIPE_LEFT']);
  });

  it('원본 x가 빠르게 작아지면 SWIPE_RIGHT', () => {
    expect(run(wristTrack(ramp(0.7, 0.3, 8)))).toEqual(['SWIPE_RIGHT']);
  });

  it('휘두른 뒤 바로 손을 되돌리는 동작은 무시', () => {
    expect(run(wristTrack([...ramp(0.3, 0.7, 8), ...ramp(0.7, 0.3, 8)]))).toEqual(['SWIPE_LEFT']);
  });

  it('쿨다운(800ms)이 지나면 다시 인정', () => {
    const first = wristTrack(ramp(0.3, 0.7, 8));
    const second = wristTrack(ramp(0.7, 0.3, 8), 1200);
    expect(run([...first, ...second])).toEqual(['SWIPE_LEFT', 'SWIPE_RIGHT']);
  });

  it('천천히 움직이면(1초에 0.4) SWIPE 아님', () => {
    expect(run(wristTrack(ramp(0.3, 0.7, 31)))).toEqual([]);
  });

  it('작게 흔들면 SWIPE 아님', () => {
    expect(run(wristTrack([0.5, 0.55, 0.45, 0.55, 0.45, 0.55, 0.5]))).toEqual([]);
  });
});
