import { FilesetResolver, GestureRecognizer } from '@mediapipe/tasks-vision';

// public/mediapipe/에 버전을 고정해 둔 파일 (CDN @latest 사용 안 함)
const WASM_PATH = '/mediapipe/wasm';
const MODEL_PATH = '/mediapipe/gesture_recognizer.task';

let infoMuted = false;

// MediaPipe가 "INFO: ..." 안내를 console.error로 찍어 Next 개발 화면에 에러 창이 뜬다. 그 문구만 거른다.
function muteMediapipeInfo() {
  if (infoMuted) return;
  infoMuted = true;
  const original = console.error;
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === 'string' && args[0].startsWith('INFO:')) return;
    original(...args);
  };
}

/** GPU로 먼저 만들고, 실패하면 CPU로 다시 만든다. */
export async function createRecognizer(): Promise<GestureRecognizer> {
  muteMediapipeInfo();
  const fileset = await FilesetResolver.forVisionTasks(WASM_PATH);
  const create = (delegate: 'GPU' | 'CPU') =>
    GestureRecognizer.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: MODEL_PATH, delegate },
      runningMode: 'VIDEO',
      numHands: 1,
    });
  try {
    return await create('GPU');
  } catch {
    return create('CPU');
  }
}
