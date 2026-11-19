import { describe, expect, it } from 'vitest';
import type { GestureEvent, InputSource } from '@/lib/events';
import { episode1 } from './data/episode1';
import { currentCut, initialState, sceneReducer, type Action, type MachineState } from './sceneMachine';
import { RESULT } from './types';

const reduce = sceneReducer(episode1);
const g = (type: 'PALM_SHOW' | 'PUNCH' | 'SWIPE_LEFT' | 'SWIPE_RIGHT' | 'THUMB_UP', source: InputSource = 'keyboard'): GestureEvent => ({ type, source });

/** 액션을 차례로 적용. 시각은 1초씩 증가 */
function play(actions: (GestureEvent | 'ADVANCE' | 'SKIP')[], from = initialState(episode1, 0)): MachineState {
  return actions.reduce<MachineState>((s, a, i) => {
    const at = (i + 1) * 1000;
    const action: Action = a === 'ADVANCE' || a === 'SKIP' ? { type: a, at } : { type: 'GESTURE', event: a, at };
    return reduce(s, action);
  }, from);
}

// 키보드만으로 처음부터 끝까지 (H, Space×3, ←×3, ←, Enter)
const FULL_RUN = [
  g('PALM_SHOW'), 'ADVANCE',
  g('PUNCH'), g('PUNCH'), g('PUNCH'), 'ADVANCE',
  g('SWIPE_LEFT'), g('SWIPE_LEFT'), g('SWIPE_LEFT'),
  g('SWIPE_LEFT'),
  g('THUMB_UP'), 'ADVANCE',
] as const;

describe('sceneMachine', () => {
  it('키보드 입력만으로 결과 화면까지 간다', () => {
    const end = play([...FULL_RUN]);
    expect(end.sceneId).toBe(RESULT);
    expect(end.stats.punches).toBe(3);
    expect(end.stats.sources).toEqual(['keyboard']);
    expect(end.stats.finishedAt).toBe(FULL_RUN.length * 1000);
  });

  it('요구하지 않은 제스처는 무시한다', () => {
    const s = play([g('PUNCH'), g('SWIPE_LEFT'), g('THUMB_UP')]);
    expect(s.sceneId).toBe('S0');
    expect(s.phase).toBe('playing');
  });

  it('S1: 주먹 횟수마다 문 그림이 바뀌고, 3번째에 완료 연출 후 S2', () => {
    const atS1 = play([g('PALM_SHOW'), 'ADVANCE']);
    expect(currentCut(episode1, atS1)?.src).toBe('/cuts/02-door-locked.webp');
    const two = play([g('PUNCH'), g('PUNCH')], atS1);
    expect(currentCut(episode1, two)?.src).toBe('/cuts/04-door-crack2.webp');
    const three = play([g('PUNCH')], two);
    expect(three.phase).toBe('done');
    expect(currentCut(episode1, three)?.src).toBe('/cuts/05-door-broken.webp');
    expect(play(['ADVANCE'], three).sceneId).toBe('S2');
  });

  it('완료 연출 중의 PUNCH는 진행에 영향 없이 횟수만 센다', () => {
    const done = play([g('PALM_SHOW'), 'ADVANCE', g('PUNCH'), g('PUNCH'), g('PUNCH'), g('PUNCH')]);
    expect(done.sceneId).toBe('S1');
    expect(done.stats.punches).toBe(4);
  });

  it('S2: 오른쪽은 이전 컷, 첫 컷에서는 무시', () => {
    const atS2 = play([g('PALM_SHOW'), 'ADVANCE', g('PUNCH'), g('PUNCH'), g('PUNCH'), 'ADVANCE']);
    expect(play([g('SWIPE_RIGHT')], atS2).step).toBe(0);
    expect(play([g('SWIPE_LEFT'), g('SWIPE_LEFT'), g('SWIPE_RIGHT')], atS2).step).toBe(1);
  });

  it('건너뛰기는 다음 장면으로 가고 횟수를 센다', () => {
    const s = play(['SKIP', 'SKIP']);
    expect(s.sceneId).toBe('S2');
    expect(s.stats.skipped).toBe(2);
  });

  it('카메라와 키보드를 섞어 쓰면 둘 다 기록한다', () => {
    const s = play([g('PALM_SHOW', 'camera'), 'ADVANCE', g('PUNCH', 'keyboard')]);
    expect(s.stats.sources).toEqual(['camera', 'keyboard']);
  });

  it('결과 화면에서는 어떤 입력도 상태를 바꾸지 않는다', () => {
    const end = play([...FULL_RUN]);
    expect(play([g('PUNCH'), 'SKIP', 'ADVANCE'], end)).toBe(end);
  });
});
