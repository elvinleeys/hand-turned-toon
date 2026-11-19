import { defineConfig } from '@playwright/test';

// 이 PC에 설치된 Edge로 실행한다 (브라우저 추가 다운로드 없음). 다른 브라우저는 PW_CHANNEL=chrome 등으로.
export default defineConfig({
  testDir: 'e2e',
  timeout: 60_000,
  use: {
    baseURL: 'http://localhost:3123',
    channel: process.env.PW_CHANNEL ?? 'msedge',
    viewport: { width: 1280, height: 860 },
  },
  webServer: {
    command: 'npx next dev -p 3123',
    url: 'http://localhost:3123',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
