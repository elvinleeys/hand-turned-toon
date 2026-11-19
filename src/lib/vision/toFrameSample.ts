import type { GestureRecognizerResult } from '@mediapipe/tasks-vision';
import type { FrameSample } from '@/lib/gestures/types';

/** MediaPipe 결과를 앱 자체 타입으로 바꾼다. 이후 계층은 MediaPipe 타입을 모른다. (numHands: 1 기준) */
export function toFrameSample(result: GestureRecognizerResult, t: number): FrameSample {
  const top = result.gestures[0]?.[0];
  return {
    t,
    canned: top?.categoryName ?? null,
    cannedScore: top?.score ?? 0,
    landmarks: result.landmarks[0] ?? [],
    world: result.worldLandmarks[0] ?? [],
  };
}
