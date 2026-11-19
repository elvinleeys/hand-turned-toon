'use client';

// PUNCH 판정 테스트 페이지. 손 크기 측정 방식 3가지를 같은 영상으로 동시에 비교한다.
import { useRef, useState } from 'react';
import type { FrameSample } from '@/lib/gestures/types';
import { PUNCH } from '@/lib/gestures/config';
import { handShape } from '@/lib/gestures/shape';
import {
  INITIAL_PUNCH_STATE,
  SIZE_METHODS,
  detectPunch,
  punchGrowth,
  type PunchState,
  type SizeMethod,
} from '@/lib/gestures/punch';
import { describeStatus, useHandTracking } from '@/lib/vision/useHandTracking';

const HISTORY_MS = 1000;
const LABEL: Record<SizeMethod, string> = {
  knuckle: '손등 폭 (검지~새끼 뿌리)',
  palm: '손목~중지 뿌리',
  bbox: '손 전체 사각형',
};

type PerMethod = Record<SizeMethod, number>;
const zeros = (): PerMethod => ({ knuckle: 0, palm: 0, bbox: 0 });

export default function PunchLab() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const historyRef = useRef<FrameSample[]>([]);
  const statesRef = useRef<Record<SizeMethod, PunchState>>({
    knuckle: INITIAL_PUNCH_STATE,
    palm: INITIAL_PUNCH_STATE,
    bbox: INITIAL_PUNCH_STATE,
  });
  const recordRef = useRef<FrameSample[] | null>(null);

  const [counts, setCounts] = useState<PerMethod>(zeros);
  const [growth, setGrowth] = useState<PerMethod>(zeros);
  const [peak, setPeak] = useState<PerMethod>(zeros);
  const [flash, setFlash] = useState<PerMethod>(zeros); // 마지막 PUNCH 시각
  const [shape, setShape] = useState('-');
  const [lastT, setLastT] = useState(0);
  const [recording, setRecording] = useState(false);

  const status = useHandTracking(videoRef, (sample) => {
    const now = sample.t;
    const history = historyRef.current;
    history.push(sample);
    while (history.length && history[0].t < now - HISTORY_MS) history.shift();
    recordRef.current?.push(sample);

    const g = zeros();
    for (const m of SIZE_METHODS) {
      g[m] = punchGrowth(history, now, m);
      const r = detectPunch(history, now, statesRef.current[m], m);
      statesRef.current[m] = r.state;
      if (r.event) {
        setCounts((c) => ({ ...c, [m]: c[m] + 1 }));
        setFlash((f) => ({ ...f, [m]: now }));
      }
    }
    setGrowth(g);
    setPeak((p) => ({ knuckle: Math.max(p.knuckle, g.knuckle), palm: Math.max(p.palm, g.palm), bbox: Math.max(p.bbox, g.bbox) }));
    setShape(handShape(sample) ?? '-');
    setLastT(now);
  });

  const reset = () => {
    setCounts(zeros());
    setPeak(zeros());
  };

  const toggleRecord = () => {
    if (!recordRef.current) {
      recordRef.current = [];
      setRecording(true);
      return;
    }
    // 기기 안에서만 파일로 저장한다 (전송 없음). 단위 테스트 fixture로 쓴다.
    const blob = new Blob([JSON.stringify(recordRef.current)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `punch-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    recordRef.current = null;
    setRecording(false);
  };

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-4 p-4">
      <h1 className="text-xl font-bold">Lab · PUNCH 판정</h1>
      <p aria-live="polite">상태: {describeStatus(status)} · 현재 모양: <b>{shape}</b></p>
      <p className="text-sm opacity-70">
        카메라 쪽으로 주먹을 빠르게 뻗었다 거두기를 10번 해보세요. 방식별 횟수가 실제 횟수와 같은지 비교합니다.
        기준: {PUNCH.WINDOW_MS}ms 안에 {PUNCH.GROWTH}배 이상 커짐 + 주먹 프레임 과반, 쿨다운 {PUNCH.COOLDOWN_MS}ms
      </p>

      <div className="relative mx-auto w-full max-w-md -scale-x-100 overflow-hidden rounded-lg bg-black">
        <video ref={videoRef} className="block w-full" playsInline muted />
      </div>

      <table className="w-full font-mono text-sm">
        <thead>
          <tr className="text-left opacity-60">
            <th>측정 방식</th><th>현재 배율</th><th>최대 배율</th><th>PUNCH 횟수</th>
          </tr>
        </thead>
        <tbody>
          {SIZE_METHODS.map((m) => (
            <tr key={m} className={lastT - flash[m] < 300 ? 'bg-amber-400 text-black' : ''}>
              <td>{LABEL[m]}</td>
              <td>{growth[m].toFixed(2)}</td>
              <td>{peak[m].toFixed(2)}</td>
              <td className="text-lg font-bold">{counts[m]}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex gap-2">
        <button className="rounded border px-3 py-1" onClick={reset}>횟수·최대 배율 초기화</button>
        <button className="rounded border px-3 py-1" onClick={toggleRecord}>
          {recording ? '■ 기록 중지 후 JSON 저장' : '● 좌표 기록 시작'}
        </button>
      </div>
      <p className="text-sm opacity-60">영상과 좌표는 이 브라우저 밖으로 전송되지 않습니다. 기록 파일도 이 기기에만 저장됩니다.</p>
    </main>
  );
}
