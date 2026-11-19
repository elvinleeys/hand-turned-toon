import { describe, expect, it } from 'vitest';
import { keyToEvent, nudgeLight } from './keyboard';

describe('nudgeLight (H + 방향키)', () => {
  it('방향키마다 0.04씩 움직이고 0~1을 넘지 않는다', () => {
    expect(nudgeLight({ x: 0.5, y: 0.5 }, 'ArrowUp')).toEqual({ x: 0.5, y: 0.46 });
    expect(nudgeLight({ x: 0.02, y: 0.5 }, 'ArrowLeft')).toEqual({ x: 0, y: 0.5 });
    expect(nudgeLight({ x: 0.5, y: 0.5 }, 'Enter')).toBeNull();
  });
});

describe('keyToEvent', () => {
  it.each([
    ['h', 'PALM_SHOW'],
    ['H', 'PALM_SHOW'],
    [' ', 'PUNCH'],
    ['ArrowLeft', 'SWIPE_LEFT'],
    ['ArrowRight', 'SWIPE_RIGHT'],
    ['Enter', 'THUMB_UP'],
  ])('%j → %s', (key, type) => {
    expect(keyToEvent(key)).toEqual({ type, source: 'keyboard' });
  });

  it('숫자 1~5 → FINGER_COUNT', () => {
    expect(keyToEvent('3')).toEqual({ type: 'FINGER_COUNT', count: 3, source: 'keyboard' });
  });

  it.each(['6', '0', 'a', 'Escape'])('대응 없는 키 %j → null', (key) => {
    expect(keyToEvent(key)).toBeNull();
  });
});
