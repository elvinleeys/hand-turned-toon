import { describe, expect, it } from 'vitest';
import type { GestureEvent } from '@/lib/events';
import { episode1 } from './data/episode1';
import { initialState, sceneReducer, type Action, type MachineState } from './sceneMachine';
import { soundsFor, type SoundName } from './sounds';

const reduce = sceneReducer(episode1);
const k = (e: Omit<GestureEvent, 'source'>) => ({ ...e, source: 'keyboard' }) as GestureEvent;

/** 액션을 차례로 적용하며 각 단계에서 나는 소리를 모은다 */
function soundsOf(steps: (GestureEvent | 'ADVANCE')[]): SoundName[][] {
  let s: MachineState = initialState(episode1, 0);
  return steps.map((a, i) => {
    const action: Action = a === 'ADVANCE' ? { type: 'ADVANCE', at: (i + 1) * 1000 } : { type: 'GESTURE', event: a, at: (i + 1) * 1000 };
    const next = reduce(s, action);
    const out = soundsFor(episode1, s, next);
    s = next;
    return out;
  });
}

describe('soundsFor', () => {
  it('준비 완료 → 띵, 문 두 번 → 쾅 쾅, 세 번째 → 와장창, 장면 전환 → 휙', () => {
    expect(
      soundsOf([k({ type: 'PALM_SHOW' }), 'ADVANCE', k({ type: 'PUNCH' }), k({ type: 'PUNCH' }), k({ type: 'PUNCH' }), 'ADVANCE']),
    ).toEqual([['ding'], ['whoosh'], ['hit'], ['hit'], ['crash'], ['whoosh']]);
  });

  it('요구하지 않은 입력에는 소리가 없다', () => {
    expect(soundsOf([k({ type: 'PUNCH' }), k({ type: 'SWIPE_LEFT' })])).toEqual([[], []]);
  });

  it('컷을 넘길 때 휙', () => {
    const toS2 = [k({ type: 'PALM_SHOW' }), 'ADVANCE', k({ type: 'PUNCH' }), k({ type: 'PUNCH' }), k({ type: 'PUNCH' }), 'ADVANCE'] as const;
    expect(soundsOf([...toS2, k({ type: 'SWIPE_LEFT' })]).at(-1)).toEqual(['whoosh']);
  });
});

describe('soundsFor: 손전등·금고', () => {
  const base = initialState(episode1, 0);
  const s3: MachineState = { ...base, sceneId: 'S3' };
  const s4: MachineState = { ...base, sceneId: 'S4' };

  it('단서를 찾으면 반짝, 빛만 움직이면 조용', () => {
    expect(soundsFor(episode1, s3, { ...s3, found: ['A'] })).toEqual(['clue']);
    expect(soundsFor(episode1, s3, { ...s3, light: { x: 0.5, y: 0.5, at: 1 } })).toEqual([]);
  });

  it('숫자 입력 → 삑, 오답 → 부저, 열림 → 철컥', () => {
    expect(soundsFor(episode1, s4, { ...s4, entered: [3] })).toEqual(['beep']);
    expect(soundsFor(episode1, { ...s4, entered: [1, 2] }, { ...s4, entered: [], wrong: 1 })).toEqual(['wrong']);
    expect(soundsFor(episode1, { ...s4, entered: [3, 5] }, { ...s4, entered: [3, 5, 2], phase: 'done', step: 1 })).toEqual(['unlock']);
  });
});
