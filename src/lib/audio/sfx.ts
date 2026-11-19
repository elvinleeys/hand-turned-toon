import type { SoundName } from '@/scenes/sounds';

// Web Audio로 효과음을 합성한다 (소리 파일·라이선스 없음). 브라우저 전용.

const MUTE_KEY = 'htt:muted';
let ctx: AudioContext | null = null;
let muted = readMuted();

function readMuted(): boolean {
  try {
    return typeof localStorage !== 'undefined' && localStorage.getItem(MUTE_KEY) === '1';
  } catch {
    return false; // 저장소를 못 쓰는 환경(사생활 보호 모드 등)에서는 기본값
  }
}

export function isMuted(): boolean {
  return muted;
}

export function setMuted(value: boolean): void {
  muted = value;
  try {
    localStorage.setItem(MUTE_KEY, value ? '1' : '0');
  } catch {
    // 저장 실패는 무시 (이번 방문 동안만 적용)
  }
}

/** 첫 소리 때 만든다. 브라우저는 사용자 입력(클릭·키) 이후에만 소리를 허용한다 */
function audio(): AudioContext | null {
  if (typeof window === 'undefined' || !('AudioContext' in window)) return null;
  ctx ??= new AudioContext();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function envelope(ac: AudioContext, start: number, dur: number, peak: number): GainNode {
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(peak, start + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  g.connect(ac.destination);
  return g;
}

function tone(ac: AudioContext, freq: number, dur: number, opts: { type?: OscillatorType; peak?: number; delay?: number; slideTo?: number } = {}) {
  const start = ac.currentTime + (opts.delay ?? 0);
  const osc = ac.createOscillator();
  osc.type = opts.type ?? 'sine';
  osc.frequency.setValueAtTime(freq, start);
  if (opts.slideTo) osc.frequency.exponentialRampToValueAtTime(opts.slideTo, start + dur);
  osc.connect(envelope(ac, start, dur, opts.peak ?? 0.2));
  osc.start(start);
  osc.stop(start + dur + 0.05);
}

function noise(ac: AudioContext, dur: number, opts: { peak?: number; from?: number; to?: number; delay?: number } = {}) {
  const start = ac.currentTime + (opts.delay ?? 0);
  const buffer = ac.createBuffer(1, Math.ceil(ac.sampleRate * dur), ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = ac.createBufferSource();
  src.buffer = buffer;
  const filter = ac.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(opts.from ?? 1000, start);
  if (opts.to) filter.frequency.exponentialRampToValueAtTime(opts.to, start + dur);
  src.connect(filter).connect(envelope(ac, start, dur, opts.peak ?? 0.3));
  src.start(start);
}

const SOUNDS: Record<SoundName, (ac: AudioContext) => void> = {
  // 문 두드림: 낮은 쿵 + 짧은 잡음
  hit: (ac) => {
    tone(ac, 110, 0.25, { peak: 0.6, slideTo: 45 });
    noise(ac, 0.12, { peak: 0.35, from: 900 });
  },
  // 문 파괴: 긴 잡음 + 무너지는 저음
  crash: (ac) => {
    noise(ac, 0.9, { peak: 0.5, from: 2500, to: 300 });
    tone(ac, 80, 0.7, { type: 'sawtooth', peak: 0.25, slideTo: 30 });
    noise(ac, 0.3, { peak: 0.3, from: 5000, delay: 0.15 });
  },
  // 컷 넘김: 위로 쓸려 가는 바람 소리
  whoosh: (ac) => noise(ac, 0.3, { peak: 0.18, from: 400, to: 3000 }),
  // 준비 완료·엄지: 맑은 두 음
  ding: (ac) => {
    tone(ac, 880, 0.35, { type: 'triangle', peak: 0.2 });
    tone(ac, 1320, 0.45, { type: 'triangle', peak: 0.15, delay: 0.09 });
  },
  // 단서 발견: 반짝이는 세 음
  clue: (ac) => [784, 988, 1319].forEach((f, i) => tone(ac, f, 0.3, { type: 'triangle', peak: 0.15, delay: i * 0.07 })),
  // 금고 숫자 입력
  beep: (ac) => tone(ac, 660, 0.09, { type: 'square', peak: 0.08 }),
  // 금고 오답: 낮은 부저 두 번
  wrong: (ac) => {
    tone(ac, 150, 0.18, { type: 'sawtooth', peak: 0.15 });
    tone(ac, 150, 0.22, { type: 'sawtooth', peak: 0.15, delay: 0.22 });
  },
  // 금고 열림: 철컥 + 올라가는 음
  unlock: (ac) => {
    noise(ac, 0.08, { peak: 0.4, from: 3000 });
    [523, 659, 784, 1047].forEach((f, i) => tone(ac, f, 0.25, { type: 'triangle', peak: 0.15, delay: 0.1 + i * 0.08 }));
  },
};

export function playSound(name: SoundName): void {
  if (muted) return;
  const ac = audio();
  if (ac) SOUNDS[name](ac);
}
