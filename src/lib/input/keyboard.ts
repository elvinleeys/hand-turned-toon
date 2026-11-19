import { emit, type GestureEvent } from '@/lib/events';

/** CLAUDE.md "GestureEvent 목록"의 키보드 대응. PALM_HOLD(H 길게 + 마우스)는 S3(M4)에서 추가한다. */
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

const INTERACTIVE = 'button, a, input, textarea, select, [contenteditable="true"]';

/** window에 키보드 입력을 연결하고 해제 함수를 돌려준다. */
export function attachKeyboard(): () => void {
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
    // 버튼에 포커스가 있을 때 Space·Enter는 버튼 클릭으로 둔다 (이벤트 중복 방지)
    if (e.target instanceof Element && e.target.closest(INTERACTIVE)) return;
    const event = keyToEvent(e.key);
    if (!event) return;
    e.preventDefault(); // Space 스크롤 등 기본 동작 막기
    emit(event);
  };
  window.addEventListener('keydown', onKeyDown);
  return () => window.removeEventListener('keydown', onKeyDown);
}
