import { defineConfig } from 'vitest/config';

// tsconfig의 "@/*" 경로 별칭을 테스트에서도 쓴다
export default defineConfig({ resolve: { tsconfigPaths: true } });
