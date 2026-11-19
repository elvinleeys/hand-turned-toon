import type { GestureRecognizer, GestureRecognizerResult } from '@mediapipe/tasks-vision';

/**
 * 앱 전체에서 하나만 도는 인식 루프. 새 비디오 프레임일 때만 인식한다.
 * 반환값을 호출하면 루프가 멈춘다.
 */
export function startFrameLoop(
  video: HTMLVideoElement,
  recognizer: GestureRecognizer,
  onResult: (result: GestureRecognizerResult, timestampMs: number) => void,
): () => void {
  let rafId = 0;
  let lastVideoTime = -1;

  const tick = () => {
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && video.currentTime !== lastVideoTime) {
      lastVideoTime = video.currentTime;
      const now = performance.now(); // recognizeForVideo는 단조 증가 타임스탬프가 필요
      onResult(recognizer.recognizeForVideo(video, now), now);
    }
    rafId = requestAnimationFrame(tick);
  };

  rafId = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(rafId);
}
