import type { MachineState } from './sceneMachine';
import type { Episode } from './types';

export type SoundName = 'hit' | 'crash' | 'whoosh' | 'ding' | 'clue' | 'beep' | 'wrong' | 'unlock';

/** 상태가 prev → next로 바뀔 때 낼 효과음. 화면이 이 결과대로 소리를 낸다 */
export function soundsFor(episode: Episode, prev: MachineState, next: MachineState): SoundName[] {
  if (prev === next) return [];
  if (prev.sceneId !== next.sceneId) return ['whoosh']; // 장면 전환
  const scene = episode.scenes[next.sceneId];
  if (!scene) return [];

  switch (scene.kind) {
    case 'single':
      return prev.phase === 'playing' && next.phase === 'done' ? ['ding'] : [];
    case 'counter':
      if (next.step <= prev.step) return [];
      return next.step >= scene.count ? ['crash'] : ['hit'];
    case 'cuts':
      return next.step !== prev.step ? ['whoosh'] : [];
    case 'flashlight':
      return next.found.length > prev.found.length ? ['clue'] : [];
    case 'code':
      if (prev.phase === 'playing' && next.phase === 'done') return ['unlock'];
      if (next.wrong > prev.wrong) return ['wrong'];
      return next.entered.length > prev.entered.length ? ['beep'] : [];
  }
}
