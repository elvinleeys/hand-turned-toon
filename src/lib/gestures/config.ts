// 판정 임계값은 모두 여기에 둔다. 값을 바꾸면 docs/PLAN.md "오인식 개선 기록"에 전후를 남긴다.

/** 좌표 기반 손 모양 판정 (shape.ts) */
export const SHAPE = {
  /** 손목~손끝 / 손목~둘째 마디 비율이 이보다 크면 펴진 손가락 */
  EXTENDED_RATIO: 1.3,
  /** 위 비율이 이보다 작으면 접힌 손가락 */
  CURLED_RATIO: 1.0,
  /** 엄지 끝~검지 뿌리 거리 / 손바닥 길이(손목~중지 뿌리)가 이보다 크면 엄지가 펴진 것 */
  THUMB_OUT_RATIO: 0.6,
} as const;
