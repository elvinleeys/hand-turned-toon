import { defineConfig } from '@playwright/test';

// 이 PC에 설치된 Edge로 실행한다 (브라우저 추가 다운로드 없음). 다른 브라우저는 PW_CHANNEL=chrome 등으로.
// 배포 사이트 검사: PW_BASE_URL=https://... npm run e2e (로컬 서버를 띄우지 않음)
const remote = process.env.PW_BASE_URL;

export default defineConfig({
  testDir: 'e2e',
  timeout: 60_000,
  use: {
    baseURL: remote ?? 'http://localhost:3123',
    channel: process.env.PW_CHANNEL ?? 'msedge',
    viewport: { width: 1280, height: 860 },
  },
  webServer: remote
    ? undefined
    : {
        command: 'npx next dev -p 3123',
        url: 'http://localhost:3123',
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
