import { defineConfig } from 'vitest/config';

export default defineConfig({
  // tsconfig의 "@/*" 경로 별칭을 테스트에서도 쓴다
  resolve: { tsconfigPaths: true },
  // e2e/는 Playwright가 실행한다
  test: { include: ['src/**/*.test.ts'] },
});
