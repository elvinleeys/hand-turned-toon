import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // CLAUDE.md 규칙 1: 장면·표현 계층은 좌표를 모른다. GestureEvent(@/lib/events)만 받는다.
  {
    files: ["src/components/**", "src/scenes/**"],
    ignores: ["src/components/CamPreview.tsx"], // 손가락 점을 그리는 미리보기만 예외
    rules: {
      "no-restricted-imports": ["error", {
        patterns: [{
          group: ["@mediapipe/*", "**/lib/camera", "**/lib/camera/*", "**/lib/vision", "**/lib/vision/*", "**/lib/gestures", "**/lib/gestures/*"],
          message: "장면·컴포넌트는 좌표를 몰라야 합니다. @/lib/events의 GestureEvent만 쓰세요 (CLAUDE.md 규칙 1).",
        }],
      }],
    },
  },
  // CLAUDE.md 규칙 3: 판정 로직은 MediaPipe 없이 테스트 가능한 순수 함수
  {
    files: ["src/lib/gestures/**"],
    rules: {
      "no-restricted-imports": ["error", {
        patterns: [{ group: ["@mediapipe/*"], message: "lib/gestures는 FrameSample만 씁니다. 변환은 lib/vision/toFrameSample.ts에서." }],
      }],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // MediaPipe에서 복사한 빌드 산출물
    "public/mediapipe/**",
  ]),
]);

export default eslintConfig;
