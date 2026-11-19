'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { emit } from '@/lib/events';
import type { MachineState } from '@/scenes/sceneMachine';
import type { Scene } from '@/scenes/types';

type Flashlight = Extract<Scene, { kind: 'flashlight' }>;
type Light = MachineState['light'];

/** 마지막 빛 이벤트 후 이 시간 동안 입력이 없으면 빛을 끈다 (손을 내리면 꺼짐) */
const LIGHT_TIMEOUT_MS = 300;
/** 마우스가 멈춰 있어도 머무름(0.5초)이 이어지도록 위치를 다시 보내는 간격 */
const POINTER_REPEAT_MS = 100;

// key={light.at}로 빛 이벤트마다 다시 마운트되어 타이머가 새로 시작된다
function Darkness({ light }: { light: Light }) {
  const [lit, setLit] = useState(light !== null);
  useEffect(() => {
    if (!light) return;
    const id = setTimeout(() => setLit(false), LIGHT_TIMEOUT_MS);
    return () => clearTimeout(id);
  }, [light]);
  const background =
    lit && light
      ? `radial-gradient(circle at ${light.x * 100}% ${light.y * 100}%, transparent 0, transparent 12cqw, rgba(0,0,0,0.97) 20cqw)`
      : 'rgba(0,0,0,0.97)';
  return <div className="pointer-events-none absolute inset-0" style={{ background }} aria-hidden />;
}

/** 손전등 장면: 그림 위를 어둡게 덮고 빛 위치만 밝힌다. 마우스·터치로도 비출 수 있다. */
export default function FlashlightScene({ scene, state, children }: { scene: Flashlight; state: MachineState; children: ReactNode }) {
  const searching = state.step === 0;
  const last = useRef<{ x: number; y: number } | null>(null);
  const [pointerInside, setPointerInside] = useState(false);

  useEffect(() => {
    if (!pointerInside || !searching) return;
    const id = setInterval(() => {
      if (last.current) emit({ type: 'PALM_HOLD', ...last.current, source: 'keyboard' });
    }, POINTER_REPEAT_MS);
    return () => clearInterval(id);
  }, [pointerInside, searching]);

  const onPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    last.current = { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
    emit({ type: 'PALM_HOLD', ...last.current, source: 'keyboard' });
  };

  return (
    <div className="relative h-full w-full touch-none" style={{ containerType: 'inline-size' }}>
      {children}
      {searching && (
        <>
          <Darkness key={state.light?.at ?? 0} light={state.light} />
          <div
            className="absolute inset-0 cursor-crosshair"
            onPointerEnter={() => setPointerInside(true)}
            onPointerLeave={() => setPointerInside(false)}
            onPointerDown={onPointer}
            onPointerMove={onPointer}
            aria-hidden
          />
          {/* 찾은 단서는 어둠 위에 표시해 둔다 */}
          {scene.clues
            .filter((c) => state.found.includes(c.id))
            .map((c) => (
              <span
                key={c.id}
                className="pop-in pointer-events-none absolute flex size-[18cqw] -translate-x-1/2 -translate-y-1/2 items-end justify-center rounded-full border-4 border-amber-300 shadow-[0_0_24px_rgba(252,211,77,0.8)]"
                style={{ left: `${c.x * 100}%`, top: `${c.y * 100}%` }}
              >
                <span className="translate-y-6 rounded bg-amber-300 px-2 text-xs font-bold text-black">{c.label}</span>
              </span>
            ))}
          <p className="pointer-events-none absolute right-3 bottom-3 rounded bg-black/70 px-3 py-1 text-sm text-amber-200" role="status">
            단서 {state.found.length} / {scene.clues.length}
          </p>
        </>
      )}
    </div>
  );
}
