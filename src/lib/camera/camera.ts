export type CameraError = 'insecure' | 'denied' | 'not-found' | 'in-use' | 'unknown';

/** 전면 카메라를 640×480으로 열어 video에 연결한다. 실패 시 원래 에러를 던진다 (classifyCameraError로 분류). */
export async function startCamera(video: HTMLVideoElement): Promise<MediaStream> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new DOMException('getUserMedia unavailable (HTTPS 필요)', 'InsecureContextError');
  }
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: 640, height: 480, facingMode: 'user' },
    audio: false,
  });
  try {
    video.srcObject = stream;
    await video.play();
  } catch (e) {
    stopCamera(stream);
    throw e;
  }
  return stream;
}

/** 카메라 표시등이 꺼지도록 모든 트랙을 정지한다. */
export function stopCamera(stream: MediaStream | null | undefined): void {
  stream?.getTracks().forEach((track) => track.stop());
}

export function classifyCameraError(e: unknown): CameraError {
  const name = e instanceof DOMException ? e.name : '';
  switch (name) {
    case 'InsecureContextError':
      return 'insecure';
    case 'NotAllowedError':
    case 'SecurityError':
      return 'denied';
    case 'NotFoundError':
    case 'OverconstrainedError':
      return 'not-found';
    case 'NotReadableError':
    case 'AbortError':
      return 'in-use';
    default:
      return 'unknown';
  }
}
