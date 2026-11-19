# CLAUDE.md — 손으로 넘기는 웹툰 (Hand-Turned Toon)

웹캠 손동작(MediaPipe)으로 독자가 이야기에 개입하는 인터랙티브 웹툰 뷰어.
전체 기획은 `docs/PLAN.md`를 기준으로 하며, 작업 전 해당 마일스톤 섹션을 먼저 읽는다.

## 기술 스택

- Next.js (App Router) + TypeScript
- 손 인식: `@mediapipe/tasks-vision` (Gesture Recognizer)
  - 예전 패키지(`@mediapipe/hands`, `@mediapipe/camera_utils` 등)는 사용하지 않는다.
  - API 사용법은 공식 문서 기준으로 확인한다: https://ai.google.dev/edge/mediapipe/solutions/vision/gesture_recognizer/web_js
- 장면 표현: CSS 애니메이션 + Canvas 2D (Three.js는 쓰지 않는다)
- 상태 관리: React `useReducer` (필요해질 때만 Zustand 검토)
- 배포: Vercel (카메라 사용에 HTTPS 필요)

## 아키텍처 규칙 (가장 중요)

데이터는 아래 방향으로만 흐른다.

```
카메라(lib/camera) → 인식(lib/vision) → 해석(lib/gestures) ┐
                                   키보드·클릭(lib/input) ┴→ 이벤트 버스(lib/events.ts)
→ 장면 상태 머신(scenes/sceneMachine.ts) → 표현(components/)
```

1. **장면 컴포넌트는 좌표를 모른다.** `components/`와 `scenes/`에서 MediaPipe 타입이나 랜드마크 좌표를 import하지 않는다. 오직 `GestureEvent`만 받는다. 예외는 손가락 점을 그리는 `components/CamPreview.tsx` 하나뿐이며, ESLint(`eslint.config.mjs`)가 이 규칙을 강제한다.
2. **카메라 입력과 키보드 입력은 같은 `GestureEvent`를 만든다.** 새 제스처를 추가하면 `lib/input`의 키보드 대응도 반드시 함께 추가한다.
3. **판정 로직은 순수 함수로 작성한다.** `lib/gestures/*.ts`는 "최근 프레임 기록 → `GestureEvent | null`"을 반환하고, DOM·전역 상태를 건드리지 않는다. 단위 테스트를 함께 작성한다.
4. **장면은 데이터로 정의한다.** 장면 순서, 요구 제스처, 필요 횟수, 다음 장면은 `scenes/data/episode1.ts`에 둔다. 장면 추가를 위해 상태 머신 코드를 고치지 않는다.
5. **프레임 루프는 하나만 돈다.** `requestAnimationFrame` 루프에서 인식을 한 번 실행하고 결과를 이벤트 버스로 보낸다. 컴포넌트마다 별도 루프를 만들지 않는다.
6. **브라우저 전용 코드 분리.** MediaPipe·카메라를 쓰는 컴포넌트는 `"use client"`로 두고, 필요하면 `next/dynamic`(`ssr: false`)으로 불러온다.

## 폴더 구조

```
src/
  app/
    page.tsx            # 인트로 (손으로 읽기 / 키보드로 읽기)
    story/page.tsx      # 뷰어 본체
    result/page.tsx     # 결과 화면
  lib/
    camera/             # 카메라 시작·정지, 권한 실패 처리
    vision/             # MediaPipe 초기화, 프레임 루프
    gestures/           # punch.ts, swipe.ts, palm.ts ... (순수 함수)
    input/              # 키보드·클릭 → GestureEvent
    events.ts           # GestureEvent 타입 + 이벤트 버스
  scenes/
    sceneMachine.ts     # 장면 상태 머신
    data/episode1.ts    # 장면 정의 데이터
  components/
    SceneView.tsx, DoorScene.tsx, CamPreview.tsx
```

## GestureEvent 목록

| 이벤트 | 동작 | 키보드 대응 |
| --- | --- | --- |
| `PALM_SHOW` | 손바닥 보이기 (0.5초 유지) | H |
| `PUNCH` | 주먹 내지르기 | Space |
| `SWIPE_LEFT` / `SWIPE_RIGHT` | 손 휘두르기 | ← / → |
| `PALM_HOLD` | 손바닥 1초 유지 + 손 위치 (확장) | H 길게 + 마우스 위치 |
| `FINGER_COUNT` | 손가락 개수 1~5 (확장) | 숫자키 1~5 |
| `THUMB_UP` | 엄지 올리기 | Enter |

판정 임계값(쿨다운, 이동 비율 등)은 `lib/gestures/config.ts` 한 곳에 상수로 모은다. 초기값은 `docs/PLAN.md` 4장을 따르고, 실제 테스트 결과로 조정한다.

## 반드시 지킬 것

- 카메라 권한 거부·카메라 없음·모델 로딩 실패 시 키보드·클릭 모드로 자동 전환한다. 어떤 경우에도 이야기를 끝까지 볼 수 있어야 한다.
- 영상과 좌표를 서버나 외부로 전송하지 않는다. 페이지를 떠나면 카메라 스트림을 정지한다.
- `prefers-reduced-motion`이 켜져 있으면 흔들림·번쩍임 효과를 약하게 한다.
- 컷 이미지에는 `alt` 텍스트를 넣는다.

## 작업 방식

- 한 번에 하나의 마일스톤 체크 항목만 진행하고, 끝나면 `docs/PLAN.md`의 체크박스를 갱신한다.
- 확인되지 않은 MediaPipe API는 추측하지 말고 공식 문서를 확인하거나 사용자에게 질문한다.
- 판정 임계값을 바꾸면 `docs/PLAN.md`의 "오인식 개선 기록" 표에 변경 전후를 남긴다.
- 커밋 메시지는 한국어로, `[M1] PUNCH 판정 추가`처럼 마일스톤 번호를 앞에 붙인다.
