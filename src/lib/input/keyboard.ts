import { emit, type GestureEvent } from '@/lib/events';

/** 키보드·클릭으로 낼 수 있는 모든 제스처 (CLAUDE.md "GestureEvent 목록") */
export const KEYBOARD_GESTURES: GestureEvent['type'][] = [
  'PALM_SHOW', // H
  'PUNCH', // Space
  'SWIPE_LEFT', // ←
  'SWIPE_RIGHT', // →
  'THUMB_UP', // Enter
  'FINGER_COUNT', // 1~5
  'PALM_HOLD', // H를 누른 채 방향키, 또는 마우스·터치 (손전등 장면)
];

/** 한 번 누르면 바로 나오는 이벤트 */
export function keyToEvent(key: string): GestureEvent | null {
  switch (key) {
    case 'h':
    case 'H':
      return { type: 'PALM_SHOW', source: 'keyboard' };
    case ' ':
      return { type: 'PUNCH', source: 'keyboard' };
    case 'ArrowLeft':
      return { type: 'SWIPE_LEFT', source: 'keyboard' };
    case 'ArrowRight':
      return { type: 'SWIPE_RIGHT', source: 'keyboard' };
    case 'Enter':
      return { type: 'THUMB_UP', source: 'keyboard' };
    case '1':
    case '2':
    case '3':
    case '4':
    case '5':
      return { type: 'FINGER_COUNT', count: Number(key) as 1 | 2 | 3 | 4 | 5, source: 'keyboard' };
    default:
      return null;
  }
}

const LIGHT_STEP = 0.04;
const ARROWS: Record<string, [number, number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
};
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** H를 누른 채 방향키를 누르면 손전등 위치를 옮긴다 (화면 기준 0~1) */
export function nudgeLight(pos: { x: number; y: number }, key: string): { x: number; y: number } | null {
  const d = ARROWS[key];
  return d ? { x: clamp01(pos.x + d[0] * LIGHT_STEP), y: clamp01(pos.y + d[1] * LIGHT_STEP) } : null;
}

const INTERACTIVE = 'button, a, input, textarea, select, [contenteditable="true"]';
const isH = (key: string) => key === 'h' || key === 'H';

/** window에 키보드 입력을 연결하고 해제 함수를 돌려준다. */
export function attachKeyboard(): () => void {
  let holdingH = false;
  let light = { x: 0.5, y: 0.5 };
  const emitLight = () => emit({ type: 'PALM_HOLD', ...light, source: 'keyboard' });

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    // 버튼에 포커스가 있을 때 Space·Enter는 버튼 클릭으로 둔다 (이벤트 중복 방지)
    if (e.target instanceof Element && e.target.closest(INTERACTIVE)) return;

    // H를 누르고 있는 동안: 반복 입력마다 손전등 위치를 보내고, 방향키는 빛 이동
    if (isH(e.key)) {
      e.preventDefault();
      if (!e.repeat) {
        holdingH = true;
        emit({ type: 'PALM_SHOW', source: 'keyboard' });
      }
      emitLight();
      return;
    }
    const moved = holdingH ? nudgeLight(light, e.key) : null;
    if (moved) {
      e.preventDefault();
      light = moved;
      emitLight();
      return;
    }

    if (e.repeat) return;
    const event = keyToEvent(e.key);
    if (!event) return;
    e.preventDefault(); // Space 스크롤 등 기본 동작 막기
    emit(event);
  };
  const onKeyUp = (e: KeyboardEvent) => {
    if (isH(e.key)) holdingH = false;
  };
  const onBlur = () => {
    holdingH = false;
  };

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('blur', onBlur);
  return () => {
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
    window.removeEventListener('blur', onBlur);
  };
}
