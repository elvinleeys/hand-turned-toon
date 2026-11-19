export type Point = { x: number; y: number; z: number };

/** 한 프레임의 인식 결과. lib/vision이 MediaPipe 결과를 이 형태로 바꿔 넘긴다. */
export type FrameSample = {
  /** performance.now() 기준 ms */
  t: number;
  /** 기본 분류 이름(Closed_Fist 등). 손이 없으면 null */
  canned: string | null;
  cannedScore: number;
  /** 정규화 이미지 좌표(0~1, 거울 반전 전). 손이 없으면 [] */
  landmarks: Point[];
  /** 손 중심 기준 3D 좌표(미터). 화면 방향·종횡비 영향을 덜 받는다 */
  world: Point[];
  /** 화면에 보이는 손 개수. 판정은 첫 번째 손으로만 한다 (예전 기록에는 없음) */
  hands?: number;
};
