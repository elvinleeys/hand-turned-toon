'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import type { GestureRecognizer, GestureRecognizerResult } from '@mediapipe/tasks-vision';
import type { FrameSample } from '@/lib/gestures/types';
import { classifyCameraError, startCamera, stopCamera } from '@/lib/camera/camera';
import { createRecognizer } from './recognizer';
import { startFrameLoop } from './frameLoop';
import { toFrameSample } from './toFrameSample';

export type TrackingStatus =
  | { kind: 'starting' }
  | { kind: 'loading-model' }
  | { kind: 'running' }
  | { kind: 'camera-error'; reason: ReturnType<typeof classifyCameraError> }
  | { kind: 'model-error'; message: string };

/** 카메라 시작 → 모델 로딩 → 프레임 루프. 언마운트 시 카메라를 정지한다. */
export function useHandTracking(
  videoRef: RefObject<HTMLVideoElement | null>,
  onFrame: (sample: FrameSample, result: GestureRecognizerResult) => void,
): TrackingStatus {
  const [status, setStatus] = useState<TrackingStatus>({ kind: 'starting' });
  const onFrameRef = useRef(onFrame);
  useEffect(() => {
    onFrameRef.current = onFrame;
  });

  useEffect(() => {
    const video = videoRef.current!;
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
        if (!cancelled) setStatus({ kind: 'camera-error', reason: classifyCameraError(e) });
        return;
      }

      setStatus({ kind: 'loading-model' });
      try {
        const r = await createRecognizer();
        if (cancelled) return r.close();
        recognizer = r;
      } catch (e) {
        if (!cancelled) setStatus({ kind: 'model-error', message: String(e) });
        return;
      }

      setStatus({ kind: 'running' });
      stopLoop = startFrameLoop(video, recognizer, (result, now) =>
        onFrameRef.current(toFrameSample(result, now), result),
      );
    })();

    return () => {
      cancelled = true;
      stopLoop();
      recognizer?.close();
      stopCamera(stream);
    };
  }, [videoRef]);

  return status;
}

export function describeStatus(s: TrackingStatus): string {
  switch (s.kind) {
    case 'starting':
      return '카메라 준비 중…';
    case 'loading-model':
      return '모델 로딩 중…';
    case 'running':
      return '인식 중';
    case 'camera-error':
      return `카메라 오류: ${s.reason}`;
    case 'model-error':
      return `모델 로딩 실패: ${s.message}`;
  }
}
