import type { GestureEvent } from '@/lib/events';

export type GestureType = GestureEvent['type'];

export type Line = { who: string; text: string };

export type Cut = {
  src: string;
  alt: string;
  /** 그림 위에 HTML로 올리는 대사·메모 (그림에는 글자가 없다) */
  lines?: Line[];
};

/** 손전등 장면의 숨은 단서. 좌표는 컷 기준 0~1 (거울 반전 후 화면 기준) */
export type Clue = { id: string; x: number; y: number; label: string };

type SceneBase = {
  /** 화면 하단 제스처 안내 문구 */
  hint: string;
  cuts: Cut[];
  next: string;
  /** 장면 완료 후 다음 장면까지 기다리는 시간(ms). 없으면 바로 넘어간다 */
  doneDelayMs?: number;
  /** 완료 연출 중 띄우는 문구 (예: "준비 완료!") */
  doneText?: string;
};

export type Scene =
  /** 제스처 1번이면 완료. cuts[0]만 쓴다 */
  | (SceneBase & { kind: 'single'; gesture: GestureType })
  /** 같은 제스처를 count번. cuts[i]는 i번 성공한 뒤의 그림 (count+1장) */
  | (SceneBase & { kind: 'counter'; gesture: GestureType; count: number })
  /** 컷을 앞뒤로 넘긴다. 마지막 컷에서 앞으로 넘기면 완료 */
  | (SceneBase & { kind: 'cuts'; forward: GestureType; back?: GestureType })
  /**
   * 손전등으로 단서 찾기. cuts[0] = 탐색(밝은 원본, 화면에서 어둡게 덮음), cuts[1] = 단서 정리.
   * 빛이 단서 반경 안에 dwellMs 머물면 발견. 다 찾으면 cuts[1]을 보여주고 forward로 완료
   */
  | (SceneBase & {
      kind: 'flashlight';
      clues: Clue[];
      /** 발견 반경 (컷 가로 폭 비율) */
      radius: number;
      dwellMs: number;
      /** 수첩 컷에서 넘기는 제스처들 (이전 컷이 없으니 양방향 휘두르기 모두 허용) */
      forward: GestureType[];
    })
  /** FINGER_COUNT로 비밀번호 입력. cuts[0] = 잠김, cuts[1] = 열림. 오답 hintAfter번이면 hintCut 표시 */
  | (SceneBase & { kind: 'code'; answer: number[]; hintAfter: number; hintCut: Cut });

export type Episode = { start: string; scenes: Record<string, Scene> };

export const RESULT = 'RESULT';
