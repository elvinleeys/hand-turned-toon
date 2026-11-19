# 잠긴 연구실 — 웹툰 컷 에셋 (15장)

MediaPipe 제스처 웹툰 프로젝트용 그림 에셋입니다. Claude Code에 이 폴더를 넘기면 바로 연결할 수 있게 정리했습니다.

## 폴더 구조

```
webtoon-cuts/
├─ public/cuts/          ← 앱에서 바로 쓰는 WebP (800×1200). 프로젝트의 public/cuts/ 에 그대로 복사
├─ assets/png/           ← 원본 PNG 보관용 (800×1200)
├─ assets/svg/           ← 벡터 원본 (수정용, 크기 무관하게 선명)
├─ cuts.json             ← 컷 메타데이터 원본 (앱은 이 파일을 읽지 않음. 아래 "적용 방법" 참고)
├─ tools/generator/      ← SVG를 다시 만드는 Python 스크립트 (선택)
└─ README.md
```

## 적용 방법

앱의 장면·컷 데이터는 **`src/scenes/data/episode1.ts` 한 곳**에서 관리한다 (CLAUDE.md 규칙 4). `cuts.json`은 디자인 쪽 원본 기록이다.

1. `webtoon-cuts/public/cuts/*.webp` 를 프로젝트 `public/cuts/` 로 복사한다 (같은 파일명이면 코드 수정 없이 그림만 교체됨).
2. 컷의 `alt` 문구나 09번 `clues` 좌표가 바뀌었다면 `cuts.json`과 함께 `src/scenes/data/episode1.ts`의 해당 값도 고친다.
3. `npm test`를 실행하면 `episode1.ts`의 이미지 경로가 `public/cuts/`에 실제로 있는지, `alt`가 비어 있지 않은지 확인한다.

## 반드시 지킬 규칙

| 항목 | 내용 |
| --- | --- |
| 크기 | 전 컷 800×1200 (2:3). CSS는 `aspect-ratio: 2 / 3` 로 맞추면 반응형에서도 비율 유지 |
| 같은 구도 | 02~05(문), 11~12(금고)는 픽셀 단위로 같은 구도 → `img.src` 만 교체하면 화면이 튀지 않음 |
| 텍스트 | 대사·말풍선·효과음은 그림에 없음. HTML 레이어(`position:absolute`)로 올릴 것. 말풍선 자리는 주로 화면 위쪽에 비워 둠 |
| 09 단서 | 0~1 비율 좌표 A(0.2,0.25)=3손가락, B(0.55,0.55)=5손가락, C(0.8,0.8)=2손가락. MediaPipe 랜드마크(0~1)와 바로 비교 가능. 셀카 미러링 시 x → `1 - x` |
| 09 밝기 | 09는 "밝은 버전"이다. Canvas로 전체를 어둡게 덮고 손 위치만 원형으로 뚫는 방식 |
| 14 하단 | 화면 아래 약 200px 은 👍 안내 아이콘 자리 |
| 15 상단 | 위쪽 절반(하늘)은 결과 지표 영역 |

## 파일 목록

| # | 파일 | 장면 | 제스처 / 키보드 |
| --- | --- | --- | --- |
| 01 | `01-intro.webp` | S0 | PALM_SHOW (0.5s) / H |
| 02 | `02-door-locked.webp` | S1 | PUNCH / Space |
| 03 | `03-door-crack1.webp` | S1 | PUNCH / Space |
| 04 | `04-door-crack2.webp` | S1 | PUNCH / Space |
| 05 | `05-door-broken.webp` | S1 | - (1s 후 S2) / - |
| 06 | `06-hall-start.webp` | S2 | SWIPE_LEFT (RIGHT 무시) / ←/→ |
| 07 | `07-hall-arrows.webp` | S2 | SWIPE_LEFT / SWIPE_RIGHT / ←/→ |
| 08 | `08-hall-door.webp` | S2 | SWIPE_LEFT → S3 / ← |
| 09 | `09-lab-lit.webp` | S3 | PALM_HOLD (1s) + 손 좌표 / H 길게 + 마우스 |
| 10 | `10-lab-clues.webp` | S3 | SWIPE_LEFT → S4 / ← |
| 11 | `11-safe-locked.webp` | S4 | FINGER_COUNT ×3 (각 0.7s) / 1~5 |
| 12 | `12-safe-open.webp` | S4 | - (1s 후 S5) / - |
| 13 | `13-memo.webp` | S5 | - / - |
| 14 | `14-thumbs-up.webp` | S5 | THUMB_UP (0.5s) / Enter |
| 15 | `15-result.webp` | RESULT | 클릭 / 클릭 |

## 참고

- SVG의 09·10번은 손글씨 폰트(Nanum Pen Script, Google Fonts)를 씁니다. PNG/WebP에는 이미 그려져 있어 폰트가 필요 없습니다.
- `tools/generator/generate_cuts.py` 는 `.dc.html`(디자인 캔버스용 파일)을 만듭니다. `OUT_DIR=./out python3 tools/generator/generate_cuts.py` 로 실행. 앱에서는 쓰지 않아도 됩니다.
- 그림은 코드로 그린 벡터 기반 콘티 수준의 완성도입니다. 최종 작화는 같은 구도·좌표를 유지한 채 교체하면 코드 수정 없이 반영됩니다.
