// GestureEvent 타입. 이벤트 버스는 M2에서 이 파일에 추가한다.

export type InputSource = 'camera' | 'keyboard';

export type GestureEvent =
  | { type: 'PALM_SHOW' | 'PUNCH' | 'SWIPE_LEFT' | 'SWIPE_RIGHT' | 'THUMB_UP'; source: InputSource }
  | { type: 'PALM_HOLD'; x: number; y: number; source: InputSource } // 0~1, 화면(거울 반전 후) 기준
  | { type: 'FINGER_COUNT'; count: 1 | 2 | 3 | 4 | 5; source: InputSource };
