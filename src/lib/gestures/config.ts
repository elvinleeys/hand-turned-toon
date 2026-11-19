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

/** 손 모양 유지 (hold.ts) */
export const HOLD = {
  /** 이 시간 이하로 모양이 끊기면 유지 중으로 본다 (분류 깜빡임 허용) */
  GAP_MS: 150,
  PALM_SHOW_MS: 500,
  THUMB_UP_MS: 500,
} as const;

/** 손 휘두르기 (swipe.ts) */
export const SWIPE = {
  WINDOW_MS: 300,
  /** 창 안에서 손목 x가 화면 폭의 이 비율 이상 이동 */
  DISTANCE: 0.25,
  MIN_SAMPLES: 3,
  /** 한 번 휘두른 뒤 이 시간 동안은 모든 방향 무시 (손을 되돌리는 동작 무시) */
  COOLDOWN_MS: 800,
  /** 직전과 반대 방향은 휘두르기 직전에 손이 이 시간 동안 멈춰 있어야 인정 (되돌리는 손 무시) */
  STILL_MS: 600,
  /** 멈춤으로 보는 손목 x 흔들림 범위 (화면 폭 비율) */
  STILL_RANGE: 0.05,
  /** 마지막 휘두르기 후 이 시간이 지나면 반대 방향 제한을 푼다 */
  DIRECTION_MEMORY_MS: 2000,
} as const;

/** 주먹 내지르기 (punch.ts) */
export const PUNCH = {
  /** 이 시간 안의 프레임만 본다 */
  WINDOW_MS: 250,
  /** 창 안 최소 크기 대비 현재 크기가 이 배율 이상이면 내지름 */
  GROWTH: 1.3,
  /** 창 안 프레임 중 주먹 비율이 이보다 커야 한다 (빠른 동작 중 분류 흔들림 허용) */
  FIST_MAJORITY: 0.5,
  /** 창 안에 손이 잡힌 프레임이 이 개수 이상이어야 판정 */
  MIN_SAMPLES: 2,
  /** 마지막 프레임의 손등 폭(정규화)이 이 값 이상. 멀리 있거나 옆으로 선 작은 손의 비율 튐 방지 */
  MIN_END_SIZE: 0.12,
  /** 손 전체 사각형도 이 배율 이상 커져야 한다. 손을 돌려서 손등 폭만 커지는 경우 방지 */
  BBOX_GROWTH: 1.2,
  /** 실측: 연속 내지르기 간격이 약 0.6초라 600은 놓치고, 400 이하는 한 번을 두 번으로 센다 */
  COOLDOWN_MS: 500,
} as const;
