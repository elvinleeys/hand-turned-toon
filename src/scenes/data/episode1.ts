import { RESULT, type Episode } from '../types';

// 「잠긴 연구실」 S0 → S1 → S2 → S3 → S4 → S5 → S5_UP → 결과. 콘티: webtoon.md, 그림: public/cuts/
// 단서 좌표는 webtoon-cuts/cuts.json의 09번 clues와 같아야 한다.

const NOTEBOOK = {
  src: '/cuts/10-lab-clues.webp',
  alt: '하린의 수첩. 손가락 세 개, 다섯 개, 두 개를 편 손 그림이 순서대로 그려져 있다.',
  lines: [{ who: '하린', text: '셋, 다섯, 둘. 비밀번호야.' }],
};

export const episode1 = {
  start: 'S0',
  scenes: {
    S0: {
      kind: 'single',
      gesture: 'PALM_SHOW',
      hint: '손바닥을 보여주세요',
      doneDelayMs: 800,
      doneText: '준비 완료!',
      next: 'S1',
      cuts: [
        {
          src: '/cuts/01-intro.webp',
          alt: '지하 연구실 철문 앞에 선 하린. 휴대폰에 도윤의 메시지 "문은 손으로 열어"가 떠 있다.',
          lines: [
            { who: '도윤(메시지)', text: '문은 손으로 열어.' },
            { who: '하린', text: '…무슨 뜻이야, 도윤.' },
          ],
        },
      ],
    },
    S1: {
      kind: 'counter',
      gesture: 'PUNCH',
      count: 3,
      hint: '문을 세게 쳐보세요',
      doneDelayMs: 1000,
      next: 'S2',
      cuts: [
        {
          src: '/cuts/02-door-locked.webp',
          alt: '붉은 잠금등이 켜진 두꺼운 철문. 굳게 잠겨 있다.',
          lines: [{ who: '하린', text: '잠겼어. …정말 손으로 열라는 거야?' }],
        },
        { src: '/cuts/03-door-crack1.webp', alt: '철문 가운데에 금이 갔다.', lines: [{ who: '효과음', text: '쾅!' }] },
        { src: '/cuts/04-door-crack2.webp', alt: '금이 문 전체로 퍼지고 잠금장치가 깨졌다.', lines: [{ who: '효과음', text: '콰앙!!' }] },
        { src: '/cuts/05-door-broken.webp', alt: '철문이 부서져 열리고, 녹색 비상등이 켜진 복도가 보인다.' },
      ],
    },
    S2: {
      kind: 'cuts',
      forward: 'SWIPE_LEFT',
      back: 'SWIPE_RIGHT',
      hint: '손을 왼쪽으로 휘둘러 넘기세요',
      next: 'S3',
      cuts: [
        {
          src: '/cuts/06-hall-start.webp',
          alt: '녹색 비상등이 비추는 긴 복도. 바닥에 도윤의 사원증이 떨어져 있다.',
          lines: [{ who: '하린', text: '도윤 사원증…? 여길 지나갔구나.' }],
        },
        {
          src: '/cuts/07-hall-arrows.webp',
          alt: '벽에 손바닥 그림과 왼쪽을 가리키는 화살표가 분필로 그려져 있다.',
          lines: [{ who: '하린', text: '손으로… 넘기라고?' }],
        },
        {
          src: '/cuts/08-hall-door.webp',
          alt: '복도 끝, 반쯤 열린 실험실 문. 안은 깜깜하다.',
          lines: [{ who: '하린', text: '불이 다 꺼졌어.' }],
        },
      ],
    },
    S3: {
      kind: 'flashlight',
      hint: '손바닥을 펴서 1초 들고, 손을 움직여 비춰보세요',
      // 손전등으로 비추던 손이 어느 쪽으로 휘둘러져도 넘어가게 (실측: 왼쪽만 받으면 멈췄다 휘둘러야 했음)
      forward: ['SWIPE_LEFT', 'SWIPE_RIGHT'],
      radius: 0.12,
      dwellMs: 500,
      next: 'S4',
      clues: [
        { id: 'A', x: 0.2, y: 0.25, label: '첫째' },
        { id: 'B', x: 0.55, y: 0.55, label: '둘째' },
        { id: 'C', x: 0.8, y: 0.8, label: '셋째' },
      ],
      cuts: [
        {
          src: '/cuts/09-lab-lit.webp',
          alt: '불 꺼진 실험실. 화이트보드, 실험대 위 비커, 벽의 달력에 손가락 그림 단서가 숨어 있다.',
          lines: [{ who: '하린', text: '손을 펴서 비춰보자.' }],
        },
        NOTEBOOK,
      ],
    },
    S4: {
      kind: 'code',
      hint: '손가락 개수로 비밀번호를 입력하세요',
      answer: [3, 5, 2],
      hintAfter: 2,
      hintCut: NOTEBOOK,
      doneDelayMs: 1000,
      doneText: '열렸다!',
      next: 'S5',
      cuts: [
        {
          src: '/cuts/11-safe-locked.webp',
          alt: '손바닥 모양 입력 패드와 빈칸 세 개가 있는 금고. 붉은 잠금등이 켜져 있다.',
          lines: [{ who: '금고', text: '손가락으로 입력하세요' }],
        },
        { src: '/cuts/12-safe-open.webp', alt: '금고가 열리고 안에 접힌 메모 한 장이 놓여 있다.' },
      ],
    },
    S5: {
      kind: 'cuts',
      forward: 'SWIPE_LEFT',
      hint: '다 읽었으면 손을 왼쪽으로 휘두르세요',
      next: 'S5_UP',
      cuts: [
        {
          src: '/cuts/13-memo.webp',
          alt: '도윤의 손글씨 메모. 손짓만으로 여기까지 왔다면 실험은 성공이라고 적혀 있다.',
          lines: [
            {
              who: '도윤(메모)',
              text: '하린아, 여기까지 네 손으로 왔다면 실험은 성공이야. 문도, 복도도, 금고도 전부 손짓으로만 열리게 만들었거든. 성공했으면 엄지 한 번 들어줘. 보고 있을게.',
            },
          ],
        },
      ],
    },
    S5_UP: {
      kind: 'single',
      gesture: 'THUMB_UP',
      hint: '엄지를 올려 대답하세요',
      doneDelayMs: 1000,
      next: RESULT,
      cuts: [
        {
          src: '/cuts/14-thumbs-up.webp',
          alt: '천장의 카메라 렌즈에 초록불이 켜지고, 하린이 웃으며 올려다본다.',
          lines: [{ who: '도윤(스피커)', text: '…잘 왔어.' }],
        },
      ],
    },
  },
} satisfies Episode;

export const resultCut = {
  src: '/cuts/15-result.webp',
  alt: '연구실 밖 계단에서 하린과 도윤이 나란히 엄지를 들고 있다.',
};
