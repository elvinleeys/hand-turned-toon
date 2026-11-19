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
};

export type MachineState = {
  /** 장면 id 또는 RESULT */
  sceneId: string;
  /** counter: 성공 횟수, cuts: 현재 컷 번호 */
  step: number;
  /** done: 완료 연출 중. ADVANCE를 기다린다 */
  phase: 'playing' | 'done';
  enteredAt: number;
  stats: Stats;
};

export type Action =
  | { type: 'GESTURE'; event: GestureEvent; at: number }
  /** 완료 연출(doneDelayMs)이 끝났을 때 화면이 보낸다 */
  | { type: 'ADVANCE'; at: number }
  /** 건너뛰기 버튼 */
  | { type: 'SKIP'; at: number };

export function initialState(episode: Episode, at: number): MachineState {
  return {
    sceneId: episode.start,
    step: 0,
    phase: 'playing',
    enteredAt: at,
    stats: { startedAt: at, punches: 0, sources: [], skipped: 0 },
  };
}

function enter(state: MachineState, sceneId: string, at: number): MachineState {
  const stats = sceneId === RESULT ? { ...state.stats, finishedAt: at } : state.stats;
  return { sceneId, step: 0, phase: 'playing', enteredAt: at, stats };
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
