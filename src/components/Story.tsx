'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useCallback, useEffect, useReducer, useState } from 'react';
import { subscribe } from '@/lib/events';
import { attachKeyboard } from '@/lib/input/keyboard';
import { episode1 } from '@/scenes/data/episode1';
import { initialState, sceneReducer } from '@/scenes/sceneMachine';
import { RESULT, type Episode } from '@/scenes/types';
import SceneView from './SceneView';

// MediaPipe·카메라는 브라우저 전용 (CLAUDE.md 규칙 6)
const CamPreview = dynamic(() => import('./CamPreview'), { ssr: false });

const EPISODE: Episode = episode1;
const reduce = sceneReducer(EPISODE);
const SKIP_AFTER_MS = 15_000;

/** 시작 장면부터 next를 따라간 장면 순서 (진행 표시용) */
const ORDER: string[] = [];
for (let id = EPISODE.start; id !== RESULT; id = EPISODE.scenes[id].next) ORDER.push(id);

export type Mode = 'camera' | 'keyboard';

function SkipButton({ onSkip }: { onSkip: () => void }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setVisible(true), SKIP_AFTER_MS);
    return () => clearTimeout(id);
  }, []);
  if (!visible) return null;
  return (
    <button type="button" onClick={onSkip} className="rounded border border-white/40 px-3 py-1 text-sm text-white/80 hover:bg-white/10">
      건너뛰기 ▸
    </button>
  );
}

/** ?mode=camera 이면 카메라, 그 밖에는 키보드 (브라우저 전용 컴포넌트라 window를 쓸 수 있다) */
const modeFromUrl = (): Mode =>
  new URLSearchParams(window.location.search).get('mode') === 'camera' ? 'camera' : 'keyboard';

export default function Story() {
  const [mode, setMode] = useState<Mode>(modeFromUrl);
  const [notice, setNotice] = useState<string | null>(null);
  const [state, dispatch] = useReducer(reduce, undefined, () => initialState(EPISODE, Date.now()));
  const scene = EPISODE.scenes[state.sceneId];

  // 키보드는 카메라 모드에서도 항상 동작한다 (대체 조작)
  useEffect(() => attachKeyboard(), []);
  useEffect(() => subscribe((event) => dispatch({ type: 'GESTURE', event, at: Date.now() })), []);

  // 완료 연출이 끝나면 다음 장면
  useEffect(() => {
    if (state.phase !== 'done' || !scene) return;
    const id = setTimeout(() => dispatch({ type: 'ADVANCE', at: Date.now() }), scene.doneDelayMs ?? 0);
    return () => clearTimeout(id);
  }, [state.phase, scene]);

  const onCameraFailure = useCallback((reason: string) => {
    setNotice(`카메라를 쓸 수 없어 키보드·클릭 모드로 바꿨어요. (${reason})`);
    setMode('keyboard'); // CamPreview가 사라지면서 카메라가 정지된다
  }, []);

  if (!scene) {
    // shortcut: 결과 화면(/result)은 M3에서 만든다. 지금은 완주 확인용 표시만
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-neutral-950 text-white">
        <p className="text-2xl font-bold">끝까지 읽었어요!</p>
        <p className="text-sm opacity-70">PUNCH {state.stats.punches}회 · 입력 {state.stats.sources.join(', ') || '-'}</p>
        <Link href="/" className="underline">처음으로</Link>
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh flex-col items-center gap-3 bg-neutral-950 px-4 py-4 text-white">
      <header className="flex w-full max-w-xl items-center justify-between text-sm text-white/70">
        <span>
          {ORDER.indexOf(state.sceneId) + 1} / {ORDER.length}
        </span>
        <span>{mode === 'camera' ? '손으로 읽는 중' : '키보드·클릭으로 읽는 중'}</span>
        <SkipButton key={state.sceneId} onSkip={() => dispatch({ type: 'SKIP', at: Date.now() })} />
      </header>

      {notice && (
        <div role="alert" className="flex w-full max-w-xl items-center justify-between gap-3 rounded bg-amber-400/20 px-3 py-2 text-sm text-amber-200">
          <span>{notice}</span>
          <button
            type="button"
            className="shrink-0 rounded border border-amber-200/60 px-2 py-1 hover:bg-amber-200/10"
            onClick={() => {
              setNotice(null);
              setMode('camera');
            }}
          >
            카메라 다시 시도
          </button>
        </div>
      )}

      <SceneView scene={scene} state={state} />

      {mode === 'camera' && <CamPreview onFailure={onCameraFailure} />}
    </main>
  );
}
