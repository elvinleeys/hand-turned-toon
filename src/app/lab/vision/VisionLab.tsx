'use client';

// 개발용 테스트 페이지. 좌표를 직접 그리므로 components/가 아닌 app/lab 아래에 둔다 (CLAUDE.md 규칙 1).
import { useEffect, useRef, useState } from 'react';
import { DrawingUtils, GestureRecognizer } from '@mediapipe/tasks-vision';
import { classifyCameraError, startCamera, stopCamera } from '@/lib/camera/camera';
import { createRecognizer } from '@/lib/vision/recognizer';
import { startFrameLoop } from '@/lib/vision/frameLoop';
import { toFrameSample } from '@/lib/vision/toFrameSample';
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
  const [status, setStatus] = useState('카메라 준비 중…');
  const [info, setInfo] = useState<Info>(EMPTY);

  useEffect(() => {
    const video = videoRef.current!;
    const canvas = canvasRef.current!;
    let cancelled = false;
    let stream: MediaStream | undefined;
    let recognizer: GestureRecognizer | undefined;
    let stopLoop = () => {};

    (async () => {
      try {
        const s = await startCamera(video);
        if (cancelled) return stopCamera(s);
        stream = s;
      } catch (e) {
        if (!cancelled) setStatus(`카메라 오류: ${classifyCameraError(e)}`);
        return;
      }

      setStatus('모델 로딩 중…');
      try {
        const r = await createRecognizer();
        if (cancelled) return r.close();
        recognizer = r;
      } catch (e) {
        if (!cancelled) setStatus(`모델 로딩 실패: ${String(e)}`);
        return;
      }

      setStatus('인식 중');
      const ctx = canvas.getContext('2d')!;
      const drawing = new DrawingUtils(ctx);
      let frames = 0;
      let fpsStart = performance.now();
      let fps = 0;

      stopLoop = startFrameLoop(video, recognizer, (result, now) => {
        if (canvas.width !== video.videoWidth) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const landmarks of result.landmarks) {
          drawing.drawConnectors(landmarks, GestureRecognizer.HAND_CONNECTIONS, { color: '#22d3ee', lineWidth: 3 });
          drawing.drawLandmarks(landmarks, { color: '#f472b6', radius: 4 });
        }

        frames++;
        if (now - fpsStart >= 1000) {
          fps = (frames * 1000) / (now - fpsStart);
          frames = 0;
          fpsStart = now;
        }
        const sample = toFrameSample(result, now);
        const hasHand = sample.world.length === 21;
        setInfo({
          gesture: sample.canned ?? '-',
          score: sample.cannedScore,
          hands: result.landmarks.length,
          fps,
          geometric: geometricShape(sample.world, sample.landmarks) ?? '-',
          final: handShape(sample) ?? '-',
          ratios: hasHand ? fingerRatios(sample.world).map((r) => r.toFixed(2)).join(' / ') : '-',
          thumb: hasHand ? thumbExtension(sample.world).toFixed(2) : '-',
        });
      });
    })();

    return () => {
      cancelled = true;
      stopLoop();
      recognizer?.close();
      stopCamera(stream);
    };
  }, []);

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-4 p-4">
      <h1 className="text-xl font-bold">Lab · 손 랜드마크 확인</h1>
      <p aria-live="polite">상태: {status}</p>

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
