import { describe, expect, it } from 'vitest';
import { INITIAL_SWIPE_STATE, detectSwipe, type SwipeState } from './swipe';
import type { FrameSample } from './types';
import { OPEN, frame } from './__fixtures__/hands';

const STEP = 33; // 30fps

/** 손목 x 위치 목록(33ms 간격)으로 프레임을 만든다 (카메라 원본 좌표) */
function wristTrack(xs: number[], start = 0): FrameSample[] {
  return xs.map((x, i) => {
    const f = frame(start + i * STEP, OPEN);
    const dx = x - f.landmarks[0].x;
    return { ...f, landmarks: f.landmarks.map((p) => ({ ...p, x: p.x + dx })) };
  });
}

/** 여러 구간을 이어 붙인 손목 움직임 */
const moves = (...parts: number[][]) => wristTrack(parts.flat());

function run(frames: FrameSample[]) {
  let state: SwipeState = INITIAL_SWIPE_STATE;
  const events: string[] = [];
  const history: FrameSample[] = [];
  for (const f of frames) {
    history.push(f);
    while (history[0].t < f.t - 1000) history.shift(); // 실제 앱과 같은 1초 기록
    const r = detectSwipe(history, f.t, state);
    state = r.state;
    if (r.event) events.push(r.event.type);
  }
  return events;
}

const ramp = (from: number, to: number, n = 8) => Array.from({ length: n }, (_, i) => from + ((to - from) * i) / (n - 1));
const hold = (x: number, ms: number) => Array(Math.round(ms / STEP)).fill(x);

describe('detectSwipe', () => {
  it('원본 x가 빠르게 커지면 (거울 화면에서 왼쪽으로) SWIPE_LEFT', () => {
    expect(run(moves(ramp(0.3, 0.7)))).toEqual(['SWIPE_LEFT']);
  });

  it('원본 x가 빠르게 작아지면 SWIPE_RIGHT', () => {
    expect(run(moves(ramp(0.7, 0.3)))).toEqual(['SWIPE_RIGHT']);
  });

  it('휘두른 뒤 곧바로 손을 되돌리는 동작은 무시', () => {
    expect(run(moves(ramp(0.3, 0.7), ramp(0.7, 0.3)))).toEqual(['SWIPE_LEFT']);
  });

  it('끝에서 0.6초쯤 멈췄다 되돌려도 무시 (쿨다운이 지나도)', () => {
    expect(run(moves(ramp(0.3, 0.7), hold(0.7, 600), ramp(0.7, 0.3)))).toEqual(['SWIPE_LEFT']);
  });

  it('왼쪽 넘기기를 되돌리며 반복하면 왼쪽만 여러 번', () => {
    const cycle = [...ramp(0.3, 0.7), ...hold(0.7, 300), ...ramp(0.7, 0.3), ...hold(0.3, 300)];
    expect(run(moves(cycle, cycle, cycle))).toEqual(['SWIPE_LEFT', 'SWIPE_LEFT', 'SWIPE_LEFT']);
  });

  it('손을 1초 멈췄다가 반대로 휘두르면 인정 (이전 컷으로 돌아가기)', () => {
    expect(run(moves(ramp(0.3, 0.7), hold(0.7, 1000), ramp(0.7, 0.3)))).toEqual(['SWIPE_LEFT', 'SWIPE_RIGHT']);
  });

  it('마지막 휘두르기 후 2초가 지나면 멈춤 없이도 반대 방향 인정', () => {
    const later = wristTrack(ramp(0.7, 0.3), 2500); // 그 사이 손이 화면 밖
    expect(run([...moves(ramp(0.3, 0.7)), ...later])).toEqual(['SWIPE_LEFT', 'SWIPE_RIGHT']);
  });

  it('천천히 움직이면(1초에 0.4) SWIPE 아님', () => {
    expect(run(moves(ramp(0.3, 0.7, 31)))).toEqual([]);
  });

  it('작게 흔들면 SWIPE 아님', () => {
    expect(run(moves([0.5, 0.55, 0.45, 0.55, 0.45, 0.55, 0.5]))).toEqual([]);
  });
});
