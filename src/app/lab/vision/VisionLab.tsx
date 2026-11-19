'use client';

// 개발용 테스트 페이지. 좌표를 직접 그리므로 components/가 아닌 app/lab 아래에 둔다 (CLAUDE.md 규칙 1).
import { useRef, useState } from 'react';
import { DrawingUtils, GestureRecognizer } from '@mediapipe/tasks-vision';
import { describeStatus, useHandTracking } from '@/lib/vision/useHandTracking';
import { fingerRatios, geometricShape, handShape, thumbExtension } from '@/lib/gestures/shape';

type Info = {
  gesture: string;
  score: number;
  hands: number;
  fps: number;
  geometric: string;
  final: string;
  ratios: string;
  thumb: string;
};
const EMPTY: Info = { gesture: '-', score: 0, hands: 0, fps: 0, geometric: '-', final: '-', ratios: '-', thumb: '-' };

export default function VisionLab() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fpsRef = useRef({ frames: 0, start: 0, fps: 0 });
  const [info, setInfo] = useState<Info>(EMPTY);

  const status = useHandTracking(videoRef, (sample, result) => {
    const video = videoRef.current!;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    if (canvas.width !== video.videoWidth) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const drawing = new DrawingUtils(ctx);
    for (const landmarks of result.landmarks) {
      drawing.drawConnectors(landmarks, GestureRecognizer.HAND_CONNECTIONS, { color: '#22d3ee', lineWidth: 3 });
      drawing.drawLandmarks(landmarks, { color: '#f472b6', radius: 4 });
    }

    const f = fpsRef.current;
    f.frames++;
    if (sample.t - f.start >= 1000) {
      f.fps = (f.frames * 1000) / (sample.t - f.start);
      f.frames = 0;
      f.start = sample.t;
    }
    const hasHand = sample.world.length === 21;
    setInfo({
      gesture: sample.canned ?? '-',
      score: sample.cannedScore,
      hands: result.landmarks.length,
      fps: f.fps,
      geometric: geometricShape(sample.world, sample.landmarks) ?? '-',
      final: handShape(sample) ?? '-',
      ratios: hasHand ? fingerRatios(sample.world).map((r) => r.toFixed(2)).join(' / ') : '-',
      thumb: hasHand ? thumbExtension(sample.world).toFixed(2) : '-',
    });
  });

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-4 p-4">
      <h1 className="text-xl font-bold">Lab · 손 랜드마크 확인</h1>
      <p aria-live="polite">상태: {describeStatus(status)}</p>

      {/* 사용자 시점과 같도록 좌우 반전 */}
      <div className="relative w-full -scale-x-100 overflow-hidden rounded-lg bg-black">
        <video ref={videoRef} className="block w-full" playsInline muted />
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      </div>

      <dl className="grid grid-cols-2 gap-2 font-mono text-sm sm:grid-cols-4">
        <div><dt className="opacity-60">기본 분류</dt><dd>{info.gesture}</dd></div>
        <div><dt className="opacity-60">점수</dt><dd>{info.score.toFixed(2)}</dd></div>
        <div><dt className="opacity-60">손 개수</dt><dd>{info.hands}</dd></div>
        <div><dt className="opacity-60">인식 FPS</dt><dd>{info.fps.toFixed(1)}</dd></div>
        <div><dt className="opacity-60">좌표 판정</dt><dd>{info.geometric}</dd></div>
        <div><dt className="opacity-60 font-bold">최종 모양</dt><dd className="font-bold">{info.final}</dd></div>
        <div className="col-span-2"><dt className="opacity-60">손가락 비율 (검지/중지/약지/새끼)</dt><dd>{info.ratios}</dd></div>
        <div><dt className="opacity-60">엄지 펴짐</dt><dd>{info.thumb}</dd></div>
      </dl>
      <p className="text-sm opacity-60">
        손가락 비율: 1.3 초과 = 펴짐, 1.0 미만 = 접힘. 엄지 펴짐: 0.6 초과 = 펴짐. (lib/gestures/config.ts)
      </p>
      <p className="text-sm opacity-60">영상과 좌표는 이 브라우저 밖으로 전송되지 않습니다.</p>
    </main>
  );
}
