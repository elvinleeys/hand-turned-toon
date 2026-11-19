'use client';

// 카메라 입력의 시작점. 인식 결과를 GestureEvent로 바꿔 이벤트 버스로 보내고, 손가락 점을 그린다.
// components/ 중 유일하게 좌표를 아는 파일 (CLAUDE.md 규칙 1 예외).
import { useEffect, useRef, useState } from 'react';
import { DrawingUtils, GestureRecognizer } from '@mediapipe/tasks-vision';
import { emit } from '@/lib/events';
import { describeStatus, useHandTracking } from '@/lib/vision/useHandTracking';
import { createCameraGestures } from '@/lib/vision/cameraGestures';

const MODEL_TIMEOUT_MS = 10_000;
/** 손이 이 시간 넘게 안 보이면 조명·대체 조작 안내 (PRD 9장) */
const LOST_HINT_MS = 5_000;

export default function CamPreview({ onFailure }: { onFailure: (message: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [detect] = useState(createCameraGestures);
  const [hasHand, setHasHand] = useState(false);
  const [lostLong, setLostLong] = useState(false);
  const lastHandAt = useRef<number | null>(null);

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
      drawing.drawConnectors(landmarks, GestureRecognizer.HAND_CONNECTIONS, { color: '#fbbf24', lineWidth: 4 });
      drawing.drawLandmarks(landmarks, { color: '#ffffff', radius: 4 });
    }
    const seen = sample.landmarks.length > 0;
    if (seen || lastHandAt.current === null) lastHandAt.current = sample.t;
    setHasHand(seen);
    setLostLong(sample.t - lastHandAt.current > LOST_HINT_MS);
    for (const event of detect(sample)) emit(event);
  });

  const failed = status.kind === 'camera-error' || status.kind === 'model-error';
  useEffect(() => {
    if (failed) onFailure(describeStatus(status));
  }, [failed, status, onFailure]);

  // 모델 로딩이 10초를 넘으면 키보드 모드로 (권한 팝업 대기 시간은 제외)
  useEffect(() => {
    if (status.kind !== 'loading-model') return;
    const id = setTimeout(() => onFailure('모델 로딩이 너무 오래 걸려요'), MODEL_TIMEOUT_MS);
    return () => clearTimeout(id);
  }, [status.kind, onFailure]);

  return (
    <figure
      className={`fixed right-3 bottom-3 z-20 w-36 overflow-hidden rounded-lg border-4 bg-black transition-colors sm:w-48 ${
        hasHand ? 'border-amber-400' : 'border-neutral-600'
      }`}
    >
      <div className="relative -scale-x-100">
        <video ref={videoRef} className="block w-full" playsInline muted />
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      </div>
      <figcaption className="bg-black/80 px-2 py-1 text-xs text-white" aria-live="polite">
        {status.kind !== 'running'
          ? describeStatus(status)
          : hasHand
            ? '손 인식 중'
            : lostLong
              ? '손이 안 보여요. 밝은 곳에서 해보거나 아래 버튼·키보드를 써보세요'
              : '손을 화면 안으로'}
      </figcaption>
    </figure>
  );
}
