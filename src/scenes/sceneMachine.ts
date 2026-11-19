import type { GestureEvent, InputSource } from '@/lib/events';
import { RESULT, type Cut, type Episode, type Scene } from './types';

export type Stats = {
  startedAt: number;
  finishedAt?: number;
  /** 받은 PUNCH 이벤트 수 (장면 진행과 무관하게 모두) */
  punches: number;
  /** 장면을 진행시킨 입력 방식 */
  sources: InputSource[];
  skipped: number;
  /** 손전등 장면에서 찾은 단서 수 */
  clues: number;
};

export type MachineState = {
  /** 장면 id 또는 RESULT */
  sceneId: string;
  /** counter: 성공 횟수, cuts: 현재 컷 번호, flashlight·code: 0 진행 중 / 1 완료 그림 */
  step: number;
  /** done: 완료 연출 중. ADVANCE를 기다린다 */
  phase: 'playing' | 'done';
  enteredAt: number;
  stats: Stats;
  /** flashlight: 찾은 단서 id */
  found: string[];
  /** flashlight: 빛이 머물기 시작한 단서 */
  dwell: { id: string; since: number } | null;
  /** flashlight: 마지막 빛 위치 (화면 표시용) */
  light: { x: number; y: number; at: number } | null;
  /** code: 지금까지 입력한 숫자 */
  entered: number[];
  /** code: 틀린 횟수 */
  wrong: number;
};

export type Action =
  | { type: 'GESTURE'; event: GestureEvent; at: number }
  /** 완료 연출(doneDelayMs)이 끝났을 때 화면이 보낸다 */
  | { type: 'ADVANCE'; at: number }
  /** 건너뛰기 버튼 */
  | { type: 'SKIP'; at: number };

const SCENE_RESET = { step: 0, phase: 'playing', found: [], dwell: null, light: null, entered: [], wrong: 0 } as const;

export function initialState(episode: Episode, at: number): MachineState {
  return {
    ...SCENE_RESET,
    found: [],
    entered: [],
    sceneId: episode.start,
    enteredAt: at,
    stats: { startedAt: at, punches: 0, sources: [], skipped: 0, clues: 0 },
  };
}

function enter(state: MachineState, sceneId: string, at: number): MachineState {
  const stats = sceneId === RESULT ? { ...state.stats, finishedAt: at } : state.stats;
  return { ...SCENE_RESET, found: [], entered: [], sceneId, enteredAt: at, stats };
}

/** 장면 완료: 연출 시간이 있으면 done으로 멈추고, 없으면 바로 다음 장면 */
function complete(state: MachineState, scene: Scene, step: number, at: number): MachineState {
  if (scene.doneDelayMs) return { ...state, step, phase: 'done' };
  return enter(state, scene.next, at);
}

function withSource(stats: Stats, source: InputSource): Stats {
  return stats.sources.includes(source) ? stats : { ...stats, sources: [...stats.sources, source] };
}

function onGesture(state: MachineState, scene: Scene, event: GestureEvent, at: number): MachineState {
  switch (scene.kind) {
    case 'single':
      return event.type === scene.gesture ? complete(state, scene, 0, at) : state;

    case 'counter': {
      if (event.type !== scene.gesture) return state;
      const step = state.step + 1;
      return step >= scene.count ? complete(state, scene, step, at) : { ...state, step };
    }

    case 'cuts':
      if (event.type === scene.forward) {
        const last = scene.cuts.length - 1;
        return state.step < last ? { ...state, step: state.step + 1 } : complete(state, scene, state.step, at);
      }
      if (event.type === scene.back && state.step > 0) return { ...state, step: state.step - 1 };
      return state;

    case 'flashlight': {
      if (state.step === 1) return event.type === scene.forward ? complete(state, scene, 1, at) : state;
      if (event.type !== 'PALM_HOLD') return state;
      const light = { x: event.x, y: event.y, at };
      // 컷은 2:3이라 세로 비율 차이를 보정해 가로 폭 기준 거리로 잰다
      const hit = scene.clues.find(
        (c) => !state.found.includes(c.id) && Math.hypot(c.x - event.x, (c.y - event.y) * 1.5) <= scene.radius,
      );
      if (!hit) return { ...state, light, dwell: null };
      if (state.dwell?.id !== hit.id) return { ...state, light, dwell: { id: hit.id, since: at } };
      if (at - state.dwell.since < scene.dwellMs) return { ...state, light };
      const found = [...state.found, hit.id];
      return {
        ...state,
        light,
        dwell: null,
        found,
        step: found.length === scene.clues.length ? 1 : 0,
        stats: { ...state.stats, clues: state.stats.clues + 1 },
      };
    }

    case 'code': {
      if (event.type !== 'FINGER_COUNT') return state;
      const entered = [...state.entered, event.count];
      if (entered.length < scene.answer.length) return { ...state, entered };
      if (entered.every((n, i) => n === scene.answer[i])) return complete({ ...state, entered }, scene, 1, at);
      return { ...state, entered: [], wrong: state.wrong + 1 };
    }
  }
}

/** 순수 reducer. 장면 순서·조건은 episode 데이터에서 읽는다. */
export function sceneReducer(episode: Episode) {
  return (state: MachineState, action: Action): MachineState => {
    const scene = episode.scenes[state.sceneId];
    if (!scene) return state; // RESULT

    switch (action.type) {
      case 'GESTURE': {
        const counted =
          action.event.type === 'PUNCH' ? { ...state, stats: { ...state.stats, punches: state.stats.punches + 1 } } : state;
        if (state.phase === 'done') return counted;
        const next = onGesture(counted, scene, action.event, action.at);
        // 진행된 경우에만 입력 방식을 기록
        return next === counted ? counted : { ...next, stats: withSource(next.stats, action.event.source) };
      }
      case 'ADVANCE':
        return state.phase === 'done' ? enter(state, scene.next, action.at) : state;
      case 'SKIP':
        return state.phase === 'playing'
          ? enter({ ...state, stats: { ...state.stats, skipped: state.stats.skipped + 1 } }, scene.next, action.at)
          : state;
    }
  };
}

/** 지금 보여줄 컷 */
export function currentCut(episode: Episode, state: MachineState): Cut | null {
  const scene = episode.scenes[state.sceneId];
  if (!scene) return null;
  if (scene.kind === 'single') return scene.cuts[0];
  return scene.cuts[Math.min(state.step, scene.cuts.length - 1)];
}
