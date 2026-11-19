// GestureEvent 타입과 이벤트 버스. 카메라·키보드 입력이 모두 여기로 모이고, 장면은 여기서만 받는다.

export type InputSource = 'camera' | 'keyboard';

export type GestureEvent =
  | { type: 'PALM_SHOW' | 'PUNCH' | 'SWIPE_LEFT' | 'SWIPE_RIGHT' | 'THUMB_UP'; source: InputSource }
  | { type: 'PALM_HOLD'; x: number; y: number; source: InputSource } // 0~1, 화면(거울 반전 후) 기준
  | { type: 'FINGER_COUNT'; count: 1 | 2 | 3 | 4 | 5; source: InputSource };

type Listener = (event: GestureEvent) => void;

const listeners = new Set<Listener>();

export function emit(event: GestureEvent): void {
  listeners.forEach((listener) => listener(event));
}

/** 구독하고, 해제 함수를 돌려준다 (useEffect cleanup에서 호출). */
export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
