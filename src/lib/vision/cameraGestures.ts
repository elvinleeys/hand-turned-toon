import type { GestureEvent } from '@/lib/events';
import type { FrameSample } from '@/lib/gestures/types';
import { HOLD } from '@/lib/gestures/config';
import { handShape } from '@/lib/gestures/shape';
import { INITIAL_HOLD_STATE, detectHold, type HoldState } from '@/lib/gestures/hold';
import { INITIAL_PUNCH_STATE, detectPunch, type PunchState } from '@/lib/gestures/punch';
import { INITIAL_SWIPE_STATE, detectSwipe, type SwipeState } from '@/lib/gestures/swipe';
import {
  INITIAL_STABLE_STATE,
  countFingers,
  detectStable,
  palmPosition,
  type FingerCount,
  type StableState,
} from '@/lib/gestures/fingers';

// 반대 방향 SWIPE의 멈춤 확인(0.3초 창 + 0.6초 멈춤)까지 담기는 길이
const HISTORY_MS = 1000;

/**
 * 프레임마다 모든 판정 함수를 돌려 GestureEvent 목록을 만든다.
 * 판정 함수들이 주고받는 상태를 여기서 보관한다 (판정 함수 자체는 순수).
 */
export function createCameraGestures() {
  const history: FrameSample[] = [];
  let punch: PunchState = INITIAL_PUNCH_STATE;
  let swipe: SwipeState = INITIAL_SWIPE_STATE;
  let palm: HoldState = INITIAL_HOLD_STATE;
  let palmHold: HoldState = INITIAL_HOLD_STATE;
  let thumb: HoldState = INITIAL_HOLD_STATE;
  let fingers: StableState = INITIAL_STABLE_STATE;

  return (sample: FrameSample): GestureEvent[] => {
    const now = sample.t;
    history.push(sample);
    while (history[0].t < now - HISTORY_MS) history.shift();

    const events: GestureEvent[] = [];
    const shape = handShape(sample);

    const p = detectPunch(history, now, punch, 'knuckle');
    punch = p.state;
    if (p.event) events.push(p.event);

    const s = detectSwipe(history, now, swipe);
    swipe = s.state;
    if (s.event) events.push(s.event);

    const h = detectHold(shape, 'open', now, palm, HOLD.PALM_SHOW_MS);
    palm = h.state;
    if (h.fired) events.push({ type: 'PALM_SHOW', source: 'camera' });

    // 손바닥 1초 유지 후에는 손을 펴고 있는 동안 매 프레임 위치를 보낸다 (손전등)
    palmHold = detectHold(shape, 'open', now, palmHold, HOLD.PALM_HOLD_MS).state;
    if (palmHold.fired && shape === 'open') {
      events.push({ type: 'PALM_HOLD', ...palmPosition(sample.landmarks), source: 'camera' });
    }

    const u = detectHold(shape, 'thumb_up', now, thumb, HOLD.THUMB_UP_MS);
    thumb = u.state;
    if (u.fired) events.push({ type: 'THUMB_UP', source: 'camera' });

    const f = detectStable(countFingers(sample), now, fingers, HOLD.FINGER_COUNT_MS);
    fingers = f.state;
    if (f.fired !== null) events.push({ type: 'FINGER_COUNT', count: f.fired as FingerCount, source: 'camera' });

    return events;
  };
}
