import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { KEYBOARD_GESTURES } from '@/lib/input/keyboard';
import { RESULT, type Scene } from '../types';
import { episode1, resultCut } from './episode1';

const scenes = Object.entries(episode1.scenes) as [string, Scene][];
const keyboardTypes = new Set(KEYBOARD_GESTURES);

/** 장면이 요구하는 제스처 */
function neededGestures(scene: Scene) {
  switch (scene.kind) {
    case 'cuts':
      return [scene.forward, scene.back];
    case 'flashlight':
      return ['PALM_HOLD' as const, scene.forward];
    case 'code':
      return ['FINGER_COUNT' as const];
    default:
      return [scene.gesture];
  }
}

describe('episode1 데이터', () => {
  it('시작 장면과 모든 next가 실제로 있는 장면이거나 RESULT', () => {
    expect(episode1.scenes).toHaveProperty(episode1.start);
    for (const [id, scene] of scenes) {
      expect(scene.next === RESULT || scene.next in episode1.scenes, `${id}.next = ${scene.next}`).toBe(true);
    }
  });

  it('모든 컷 이미지가 public/cuts에 있고 alt가 비어 있지 않다', () => {
    const cuts = [...scenes.flatMap(([, s]) => (s.kind === 'code' ? [...s.cuts, s.hintCut] : s.cuts)), resultCut];
    for (const cut of cuts) {
      expect(existsSync(join(process.cwd(), 'public', cut.src)), cut.src).toBe(true);
      expect(cut.alt.trim(), cut.src).not.toBe('');
    }
  });

  it('장면이 요구하는 모든 제스처에 키보드 대응이 있다', () => {
    for (const [id, scene] of scenes) {
      for (const g of neededGestures(scene)) if (g) expect(keyboardTypes.has(g), `${id}: ${g}`).toBe(true);
    }
  });

  it('counter 장면은 성공 횟수마다 그림이 있다 (count + 1장)', () => {
    for (const [id, scene] of scenes) {
      if (scene.kind === 'counter') expect(scene.cuts.length, id).toBe(scene.count + 1);
    }
  });

  it('손전등 단서 좌표가 그림 에셋(webtoon-cuts/cuts.json)과 같다', async () => {
    const cuts: { id: string; clues?: { id: string; x: number; y: number }[] }[] = (
      await import('../../../webtoon-cuts/cuts.json')
    ).default;
    const assetClues = cuts.find((c) => c.id === '09')!.clues!.map(({ id, x, y }) => ({ id, x, y }));
    const s3 = episode1.scenes.S3;
    expect(s3.clues.map(({ id, x, y }) => ({ id, x, y }))).toEqual(assetClues);
  });

  it('시작부터 RESULT까지 도달할 수 있다 (순환 없음)', () => {
    const seen = new Set<string>();
    let id: string = episode1.start;
    while (id !== RESULT) {
      expect(seen.has(id), `순환: ${id}`).toBe(false);
      seen.add(id);
      id = (episode1.scenes as Record<string, Scene>)[id].next;
    }
  });
});
