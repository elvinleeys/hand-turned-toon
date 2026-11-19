import { FilesetResolver, GestureRecognizer } from '@mediapipe/tasks-vision';

// public/mediapipe/에 버전을 고정해 둔 파일 (CDN @latest 사용 안 함)
const WASM_PATH = '/mediapipe/wasm';
const MODEL_PATH = '/mediapipe/gesture_recognizer.task';

/** GPU로 먼저 만들고, 실패하면 CPU로 다시 만든다. */
export async function createRecognizer(): Promise<GestureRecognizer> {
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
