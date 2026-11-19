'use client';

// 모든 카메라 판정을 실제 앱과 같은 경로(createCameraGestures)로 돌려 이벤트를 기록한다.
import { useRef, useState } from 'react';
import type { FrameSample } from '@/lib/gestures/types';
import { handShape } from '@/lib/gestures/shape';
import { countFingers } from '@/lib/gestures/fingers';
import { createCameraGestures } from '@/lib/vision/cameraGestures';
import { describeStatus, useHandTracking } from '@/lib/vision/useHandTracking';

const TYPES = ['PALM_SHOW', 'PUNCH', 'SWIPE_LEFT', 'SWIPE_RIGHT', 'THUMB_UP', 'FINGER_COUNT', 'PALM_HOLD'] as const;

export default function GesturesLab() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const recordRef = useRef<FrameSample[] | null>(null);
  const [detect] = useState(createCameraGestures);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [log, setLog] = useState<string[]>([]);
  const [shape, setShape] = useState('-');
  const [fingers, setFingers] = useState('-');
  const [palm, setPalm] = useState('-');
  const [recording, setRecording] = useState(false);

  const status = useHandTracking(videoRef, (sample) => {
    recordRef.current?.push(sample);
    setShape(handShape(sample) ?? '-');
    setFingers(countFingers(sample.world)?.toString() ?? '-');
    for (const e of detect(sample)) {
      setCounts((c) => ({ ...c, [e.type]: (c[e.type] ?? 0) + 1 }));
      if (e.type === 'PALM_HOLD') {
        setPalm(`${e.x.toFixed(2)}, ${e.y.toFixed(2)}`); // 매 프레임 나오므로 기록 대신 위치만
        continue;
      }
      const detail = e.type === 'FINGER_COUNT' ? ` ${e.count}` : '';
      setLog((l) => [`${(sample.t / 1000).toFixed(1)}s ${e.type}${detail}`, ...l].slice(0, 12));
    }
  });

  const toggleRecord = () => {
    if (!recordRef.current) {
      recordRef.current = [];
      setRecording(true);
      return;
    }
    // 기기 안에서만 파일로 저장한다 (전송 없음)
    const blob = new Blob([JSON.stringify(recordRef.current)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `gestures-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    recordRef.current = null;
    setRecording(false);
  };

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-4 p-4">
      <h1 className="text-xl font-bold">Lab · 전체 제스처</h1>
      <p aria-live="polite">
        상태: {describeStatus(status)} · 현재 모양: <b>{shape}</b> · 손가락 개수: <b>{fingers}</b> · 손전등 위치: <b>{palm}</b>
      </p>
      <p className="text-sm opacity-70">
        화면(거울)에서 손이 왼쪽으로 가면 SWIPE_LEFT, 오른쪽으로 가면 SWIPE_RIGHT. 엄지 척 0.5초 = THUMB_UP.
        같은 손가락 개수 0.7초 = FINGER_COUNT. 손바닥 1초 유지 후 손을 움직이면 손전등 위치(화면 기준 0~1)가 따라 바뀝니다.
      </p>
      <div className="relative mx-auto w-full max-w-md -scale-x-100 overflow-hidden rounded-lg bg-black">
        <video ref={videoRef} className="block w-full" playsInline muted />
      </div>
      <dl className="grid grid-cols-4 gap-2 text-center font-mono text-xs sm:grid-cols-7">
        {TYPES.map((t) => (
          <div key={t} className="rounded border p-2">
            <dt className="opacity-60">{t}</dt>
            <dd className="text-2xl font-bold">{counts[t] ?? 0}</dd>
          </div>
        ))}
      </dl>
      <ol className="font-mono text-sm">
        {log.map((l, i) => <li key={`${l}-${i}`}>{l}</li>)}
      </ol>
      <div className="flex gap-2">
        <button className="rounded border px-3 py-1" onClick={() => { setCounts({}); setLog([]); }}>초기화</button>
        <button className="rounded border px-3 py-1" onClick={toggleRecord}>
          {recording ? '■ 기록 중지 후 JSON 저장' : '● 좌표 기록 시작'}
        </button>
      </div>
    </main>
  );
}
