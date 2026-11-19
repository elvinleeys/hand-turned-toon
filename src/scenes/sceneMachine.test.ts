import { describe, expect, it } from 'vitest';
import type { GestureEvent, InputSource } from '@/lib/events';
import { episode1 } from './data/episode1';
import { currentCut, initialState, sceneReducer, type Action, type MachineState } from './sceneMachine';
import { RESULT } from './types';

const reduce = sceneReducer(episode1);
const g = (type: 'PALM_SHOW' | 'PUNCH' | 'SWIPE_LEFT' | 'SWIPE_RIGHT' | 'THUMB_UP', source: InputSource = 'keyboard'): GestureEvent => ({ type, source });
const light = (x: number, y: number): GestureEvent => ({ type: 'PALM_HOLD', x, y, source: 'keyboard' });
const digit = (count: 1 | 2 | 3 | 4 | 5): GestureEvent => ({ type: 'FINGER_COUNT', count, source: 'keyboard' });

type Step = GestureEvent | 'ADVANCE' | 'SKIP';

/** 액션을 차례로 적용. 시각은 1초씩 증가 (손전등 0.5초 머무름은 같은 위치 2번으로 충족) */
function play(actions: Step[], from = initialState(episode1, 0)): MachineState {
  return actions.reduce<MachineState>((s, a, i) => {
    const at = from.enteredAt + (i + 1) * 1000;
    const action: Action = a === 'ADVANCE' || a === 'SKIP' ? { type: a, at } : { type: 'GESTURE', event: a, at };
    return reduce(s, action);
  }, from);
}

const TO_S3: Step[] = [g('PALM_SHOW'), 'ADVANCE', g('PUNCH'), g('PUNCH'), g('PUNCH'), 'ADVANCE', g('SWIPE_LEFT'), g('SWIPE_LEFT'), g('SWIPE_LEFT')];
const FIND_ALL: Step[] = [light(0.2, 0.25), light(0.2, 0.25), light(0.55, 0.55), light(0.55, 0.55), light(0.8, 0.8), light(0.8, 0.8)];
const TO_S4: Step[] = [...TO_S3, ...FIND_ALL, g('SWIPE_LEFT')];
const FULL_RUN: Step[] = [...TO_S4, digit(3), digit(5), digit(2), 'ADVANCE', g('SWIPE_LEFT'), g('THUMB_UP'), 'ADVANCE'];

describe('sceneMachine', () => {
  it('키보드 입력만으로 결과 화면까지 간다', () => {
    const end = play(FULL_RUN);
    expect(end.sceneId).toBe(RESULT);
    expect(end.stats.punches).toBe(3);
    expect(end.stats.clues).toBe(3);
    expect(end.stats.sources).toEqual(['keyboard']);
    expect(end.stats.finishedAt).toBe(FULL_RUN.length * 1000);
  });

  it('요구하지 않은 제스처는 무시한다', () => {
    const s = play([g('PUNCH'), g('SWIPE_LEFT'), g('THUMB_UP'), digit(3)]);
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
    const end = play(FULL_RUN);
    expect(play([g('PUNCH'), 'SKIP', 'ADVANCE'], end)).toBe(end);
  });
});

describe('S3 손전등', () => {
  const atS3 = play(TO_S3);

  it('S2 다음은 S3', () => {
    expect(atS3.sceneId).toBe('S3');
  });

  it('단서 위에 0.5초 머물러야 발견, 스쳐 지나가면 아님', () => {
    const passing = play([light(0.2, 0.25), light(0.5, 0.5), light(0.2, 0.25)], atS3);
    expect(passing.found).toEqual([]);
    const staying = play([light(0.2, 0.25), light(0.21, 0.26)], atS3);
    expect(staying.found).toEqual(['A']);
    expect(staying.light).toMatchObject({ x: 0.21, y: 0.26 });
  });

  it('단서를 다 찾으면 수첩 컷, 왼쪽으로 넘기면 S4', () => {
    const all = play(FIND_ALL, atS3);
    expect(all.step).toBe(1);
    expect(currentCut(episode1, all)?.src).toBe('/cuts/10-lab-clues.webp');
    expect(play([g('SWIPE_LEFT')], all).sceneId).toBe('S4');
  });

  it('수첩 컷에서는 오른쪽으로 휘둘러도 넘어간다', () => {
    expect(play([g('SWIPE_RIGHT')], play(FIND_ALL, atS3)).sceneId).toBe('S4');
  });

  it('다 찾기 전에는 휘둘러도 넘어가지 않는다', () => {
    expect(play([g('SWIPE_LEFT')], atS3).sceneId).toBe('S3');
  });

  it('건너뛰면 찾은 단서 수만 결과에 남는다', () => {
    const s = play([light(0.2, 0.25), light(0.2, 0.25), 'SKIP'], atS3);
    expect(s.sceneId).toBe('S4');
    expect(s.stats.clues).toBe(1);
  });
});

describe('S4 금고', () => {
  const atS4 = play(TO_S4);

  it('3-5-2를 넣으면 열리고 완료 연출 후 S5', () => {
    const open = play([digit(3), digit(5), digit(2)], atS4);
    expect(open.phase).toBe('done');
    expect(currentCut(episode1, open)?.src).toBe('/cuts/12-safe-open.webp');
    expect(play(['ADVANCE'], open).sceneId).toBe('S5');
  });

  it('틀리면 입력을 비우고 틀린 횟수를 센다', () => {
    const once = play([digit(1), digit(2), digit(3)], atS4);
    expect(once.entered).toEqual([]);
    expect(once.wrong).toBe(1);
    expect(once.phase).toBe('playing');
    const partial = play([digit(3), digit(5)], once);
    expect(partial.entered).toEqual([3, 5]);
  });
});
