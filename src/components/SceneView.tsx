import Image from 'next/image';
import { emit } from '@/lib/events';
import type { GestureType, Scene } from '@/scenes/types';
import type { MachineState } from '@/scenes/sceneMachine';
import CodePad from './CodePad';
import DoorScene from './DoorScene';
import FlashlightScene from './FlashlightScene';

// 화면 안내: 제스처마다 아이콘 + 키보드 키 (PRD F-05: 안내를 눌러도 같은 이벤트)
type SimpleGesture = 'PALM_SHOW' | 'PUNCH' | 'SWIPE_LEFT' | 'SWIPE_RIGHT' | 'THUMB_UP';
const GUIDE: Record<SimpleGesture, { icon: string; key: string }> = {
  PALM_SHOW: { icon: '✋', key: 'H' },
  PUNCH: { icon: '👊', key: 'Space' },
  SWIPE_LEFT: { icon: '👈', key: '←' },
  SWIPE_RIGHT: { icon: '👉', key: '→' },
  THUMB_UP: { icon: '👍', key: 'Enter' },
};

function GuideButton({ gesture, label }: { gesture: GestureType; label: string }) {
  if (!(gesture in GUIDE)) return null;
  const type = gesture as SimpleGesture;
  const g = GUIDE[type];
  return (
    <button
      type="button"
      // 클릭은 카메라가 아닌 입력이므로 keyboard로 보낸다
      onClick={() => emit({ type, source: 'keyboard' })}
      className="flex items-center gap-3 rounded-full bg-white/10 px-4 py-2 text-left hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-amber-400"
    >
      <span className="text-2xl" aria-hidden>{g.icon}</span>
      <span>{label}</span>
      <kbd className="rounded border border-white/30 px-1.5 text-xs">{g.key}</kbd>
    </button>
  );
}

function guide(scene: Scene, state: MachineState) {
  switch (scene.kind) {
    case 'cuts':
      return (
        <>
          {scene.back && state.step > 0 && <GuideButton gesture={scene.back} label="이전 컷" />}
          <GuideButton gesture={scene.forward} label={scene.hint} />
        </>
      );
    case 'flashlight':
      return state.step === 1 ? (
        <GuideButton gesture={scene.forward} label="다음으로 넘기세요" />
      ) : (
        <p className="flex items-center gap-3 rounded-full bg-white/10 px-4 py-2">
          <span className="text-2xl" aria-hidden>✋</span>
          <span>{scene.hint}</span>
          <span className="text-xs text-white/70">
            <kbd className="rounded border border-white/30 px-1.5">H</kbd> 누른 채 방향키 · 마우스·터치
          </span>
        </p>
      );
    case 'code':
      return <CodePad scene={scene} state={state} />;
    case 'counter':
      return <GuideButton gesture={scene.gesture} label={`${scene.hint} (${state.step}/${scene.count})`} />;
    case 'single':
      return <GuideButton gesture={scene.gesture} label={scene.hint} />;
  }
}

export default function SceneView({ scene, state }: { scene: Scene; state: MachineState }) {
  const done = state.phase === 'done';
  const index = scene.kind === 'single' ? 0 : Math.min(state.step, scene.cuts.length - 1);
  const cut = scene.cuts[index];

  // 장면의 모든 컷을 미리 깔아 두고 현재 컷만 보이게 한다 (이미지 교체 시 깜빡임 방지).
  // cuts 장면은 휘두른 방향으로 옆으로 밀리고, 나머지는 제자리에서 바뀐다 (문 3단계는 같은 구도).
  const slide = scene.kind === 'cuts';
  const stack = (
    <div className="relative h-full w-full">
      {scene.cuts.map((c, i) => (
        <Image
          key={c.src}
          src={c.src}
          alt={i === index ? c.alt : ''}
          aria-hidden={i !== index}
          width={800}
          height={1200}
          priority
          style={slide ? { transform: `translateX(${(i - index) * 100}%)` } : undefined}
          className={`absolute inset-0 h-full w-full object-cover motion-reduce:transition-none ${
            slide
              ? 'transition-transform duration-300 ease-out'
              : `transition-opacity duration-150 ${i === index ? 'opacity-100' : 'opacity-0'}`
          }`}
        />
      ))}
    </div>
  );

  return (
    <div className="flex w-full flex-col items-center gap-4">
      {/* 세로 2:3 컷. 화면 높이에 맞춰 줄어든다 (금고는 아래 입력판 자리만큼 더 작게) */}
      <div
        className={`relative aspect-[2/3] overflow-hidden rounded-md shadow-2xl ${
          scene.kind === 'code' ? 'w-[min(92vw,calc((100dvh-21rem)*2/3))]' : 'w-[min(92vw,calc((100dvh-11rem)*2/3))]'
        }`}
      >
        {scene.kind === 'counter' ? (
          <DoorScene hits={state.step} broken={done}>{stack}</DoorScene>
        ) : scene.kind === 'flashlight' ? (
          <FlashlightScene scene={scene} state={state}>{stack}</FlashlightScene>
        ) : (
          stack
        )}

        {/* 대사는 그림 위쪽 빈 자리에 HTML로 */}
        {cut.lines && (
          <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-col gap-2 p-4" aria-live="polite">
            {cut.lines.map((line, i) => (
              <p key={`${cut.src}-${i}`} className="pop-in max-w-[90%] rounded-2xl bg-white/95 px-4 py-2 text-sm leading-relaxed text-neutral-900 shadow sm:text-base">
                <span className="mr-2 text-xs font-bold text-neutral-500">{line.who}</span>
                {line.text}
              </p>
            ))}
          </div>
        )}

        {done && scene.doneText && (
          <div className="pop-in absolute inset-0 flex items-center justify-center bg-black/40" role="status">
            <p className="rounded-xl bg-amber-400 px-6 py-3 text-2xl font-bold text-black">{scene.doneText}</p>
          </div>
        )}
      </div>

      {/* 제스처 안내 */}
      {!done && <div className="flex flex-wrap items-center justify-center gap-2 text-white">{guide(scene, state)}</div>}
    </div>
  );
}
