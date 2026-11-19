import { emit } from '@/lib/events';
import type { MachineState } from '@/scenes/sceneMachine';
import type { Scene } from '@/scenes/types';

type Code = Extract<Scene, { kind: 'code' }>;
const DIGITS = [1, 2, 3, 4, 5] as const;

/** 수첩 보기 버튼을 보여줄지: 단서를 다 못 찾았거나(건너뜀 포함) hintAfter번 틀렸을 때 */
export function canOpenNotebook(scene: Code, state: MachineState, cluesTotal: number): boolean {
  return state.stats.clues < cluesTotal || state.wrong >= scene.hintAfter;
}

/** 금고 입력 칸 + 숫자 버튼(클릭 대체 조작) + 수첩 보기 */
export default function CodePad({
  scene,
  state,
  cluesTotal,
  onOpenNotebook,
}: {
  scene: Code;
  state: MachineState;
  cluesTotal: number;
  onOpenNotebook: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 text-white">
      {/* 틀릴 때마다 key가 바뀌어 흔들림이 재생된다 */}
      <div key={state.wrong} className={`flex gap-2 ${state.wrong > 0 ? 'shake' : ''}`} style={{ '--amp': '8px' } as React.CSSProperties}>
        {scene.answer.map((_, i) => (
          <span
            key={i}
            className={`flex size-12 items-center justify-center rounded-md border-2 text-2xl font-bold ${
              state.entered[i] ? 'border-amber-400 bg-amber-400/20' : 'border-white/40'
            }`}
            aria-label={`${i + 1}번째 칸 ${state.entered[i] ?? '비어 있음'}`}
          >
            {state.entered[i] ?? ''}
          </span>
        ))}
      </div>
      <p className="text-sm" aria-live="polite">
        {state.wrong > 0 && <span className="mr-2 text-red-300">틀렸어요 ({state.wrong}번)</span>}
        ✋ {scene.hint} · 같은 숫자를 0.7초 유지
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {DIGITS.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => emit({ type: 'FINGER_COUNT', count: n, source: 'keyboard' })}
            className="flex size-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-amber-400"
            aria-label={`손가락 ${n}개`}
          >
            <kbd>{n}</kbd>
          </button>
        ))}
        {canOpenNotebook(scene, state, cluesTotal) && (
          <button
            type="button"
            onClick={onOpenNotebook}
            className="pop-in rounded-full border border-amber-300/70 px-4 text-sm text-amber-200 hover:bg-amber-300/10 focus-visible:outline-2 focus-visible:outline-amber-400"
          >
            📒 수첩 보기
          </button>
        )}
      </div>
    </div>
  );
}
