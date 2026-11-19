import Image from 'next/image';
import { emit } from '@/lib/events';
import type { MachineState } from '@/scenes/sceneMachine';
import type { Scene } from '@/scenes/types';

type Code = Extract<Scene, { kind: 'code' }>;
const DIGITS = [1, 2, 3, 4, 5] as const;

/** 금고 입력 칸 + 숫자 버튼(클릭 대체 조작) + 오답 힌트 */
export default function CodePad({ scene, state }: { scene: Code; state: MachineState }) {
  const showHint = state.wrong >= scene.hintAfter;
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
      <div className="flex gap-2">
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
      </div>
      {showHint && (
        <figure className="pop-in flex items-center gap-3 rounded-lg bg-white/10 p-2 text-sm">
          <Image src={scene.hintCut.src} alt={scene.hintCut.alt} width={48} height={72} className="rounded" />
          <figcaption>수첩을 다시 봐요. 손가락 그림 순서가 비밀번호예요.</figcaption>
        </figure>
      )}
    </div>
  );
}
