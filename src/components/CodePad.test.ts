import { describe, expect, it } from 'vitest';
import { episode1 } from '@/scenes/data/episode1';
import { initialState, totalClues } from '@/scenes/sceneMachine';
import { canOpenNotebook } from './CodePad';

const s4 = episode1.scenes.S4;
const base = { ...initialState(episode1, 0), sceneId: 'S4' };
const withClues = (clues: number, wrong = 0) => ({ ...base, wrong, stats: { ...base.stats, clues } });

describe('canOpenNotebook (금고의 수첩 보기 버튼)', () => {
  it('에피소드의 단서는 3개', () => {
    expect(totalClues(episode1)).toBe(3);
  });

  it('손전등을 건너뛰었거나 단서를 다 못 찾았으면 보인다', () => {
    expect(canOpenNotebook(s4, withClues(0), 3)).toBe(true);
    expect(canOpenNotebook(s4, withClues(2), 3)).toBe(true);
  });

  it('단서를 다 찾았으면 숨기고, 2번 틀리면 보인다', () => {
    expect(canOpenNotebook(s4, withClues(3), 3)).toBe(false);
    expect(canOpenNotebook(s4, withClues(3, 1), 3)).toBe(false);
    expect(canOpenNotebook(s4, withClues(3, 2), 3)).toBe(true);
  });
});
