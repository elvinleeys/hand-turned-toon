import type { GestureEvent } from '@/lib/events';

export type GestureType = GestureEvent['type'];

export type Line = { who: string; text: string };

export type Cut = {
  src: string;
  alt: string;
  /** 그림 위에 HTML로 올리는 대사·메모 (그림에는 글자가 없다) */
  lines?: Line[];
};

type SceneBase = {
  /** 화면 하단 제스처 안내 문구 */
  hint: string;
  cuts: Cut[];
  next: string;
  /** 장면 완료 후 다음 장면까지 기다리는 시간(ms). 없으면 바로 넘어간다 */
  doneDelayMs?: number;
};

export type Scene =
  /** 제스처 1번이면 완료. cuts[0]만 쓴다 */
  | (SceneBase & { kind: 'single'; gesture: GestureType })
  /** 같은 제스처를 count번. cuts[i]는 i번 성공한 뒤의 그림 (count+1장) */
  | (SceneBase & { kind: 'counter'; gesture: GestureType; count: number })
  /** 컷을 앞뒤로 넘긴다. 마지막 컷에서 앞으로 넘기면 완료 */
  | (SceneBase & { kind: 'cuts'; forward: GestureType; back?: GestureType });

export type Episode = { start: string; scenes: Record<string, Scene> };

export const RESULT = 'RESULT';
