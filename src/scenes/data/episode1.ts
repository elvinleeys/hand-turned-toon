import { RESULT, type Episode } from '../types';

// 「잠긴 연구실」 MVP (S0 → S1 → S2 → S5). 콘티: webtoon.md, 그림: public/cuts/
// S3(손전등)·S4(금고)는 M4에서 추가하고 S2의 next를 'S3'로 바꾼다.

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
      next: 'S5',
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
              // MVP 버전: 금고(S4) 문장 제외
              text: '하린아, 여기까지 네 손으로 왔다면 실험은 성공이야. 문도, 복도도 전부 손짓으로만 열리게 만들었거든. 성공했으면 엄지 한 번 들어줘. 보고 있을게.',
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
