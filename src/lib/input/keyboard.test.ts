import { describe, expect, it } from 'vitest';
import { keyToEvent } from './keyboard';

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
