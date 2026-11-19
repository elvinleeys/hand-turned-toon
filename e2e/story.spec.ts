import { expect, test, type Page } from '@playwright/test';

/** 화면 안내가 바뀔 때까지 기다리며 키를 누른다 (장면 전환 연출 시간 포함) */
async function press(page: Page, key: string, times = 1) {
  for (let i = 0; i < times; i++) {
    await page.keyboard.press(key);
    await page.waitForTimeout(250);
  }
}

test('키보드만으로 처음부터 결과 화면까지 읽는다', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /키보드로 읽기/ }).click();

  await expect(page.getByText('손바닥을 보여주세요')).toBeVisible();
  await expect(page.getByRole('img', { name: /철문 앞에 선 하린/ })).toBeVisible();
  await press(page, 'h');
  await expect(page.getByText('준비 완료!')).toBeVisible();

  await expect(page.getByText('문을 세게 쳐보세요 (0/3)')).toBeVisible();
  await press(page, ' ', 3);
  await expect(page.getByText(/녹색 비상등이 비추는 긴 복도|손을 왼쪽으로 휘둘러/).first()).toBeVisible();

  await press(page, 'ArrowLeft', 2); // 06 → 07 → 08
  await expect(page.getByText('불이 다 꺼졌어.')).toBeVisible();
  await press(page, 'ArrowRight'); // 이전 컷 07
  await expect(page.getByText('손으로… 넘기라고?')).toBeVisible();
  await press(page, 'ArrowLeft', 2); // 07 → 08 → S5 메모
  await expect(page.getByText('다 읽었으면 손을 왼쪽으로 휘두르세요')).toBeVisible();
  await press(page, 'ArrowLeft');
  await expect(page.getByText('엄지를 올려 대답하세요')).toBeVisible();
  await press(page, 'Enter');

  await page.waitForURL(/\/result\?/);
  await expect(page.getByText('키보드·클릭', { exact: true })).toBeVisible();
  await expect(page.getByText('3번', { exact: true })).toBeVisible();
});

test('안내 버튼을 클릭해도 같은 동작을 한다', async ({ page }) => {
  await page.goto('/story?mode=keyboard');
  await page.getByRole('button', { name: /손바닥을 보여주세요/ }).click();
  await expect(page.getByText('준비 완료!')).toBeVisible();
});

for (const [name, error] of [
  ['카메라 권한 거부', 'NotAllowedError'],
  ['카메라 없음', 'NotFoundError'],
] as const) {
  test(`${name} 시 키보드 모드로 바뀌고 계속 읽을 수 있다`, async ({ page }) => {
    await page.addInitScript((e) => {
      navigator.mediaDevices.getUserMedia = () => Promise.reject(new DOMException('test', e));
    }, error);
    await page.goto('/story?mode=camera');
    await expect(page.getByText('키보드·클릭 모드로 바꿨어요')).toBeVisible();
    await expect(page.getByText('키보드·클릭으로 읽는 중')).toBeVisible();
    await press(page, 'h');
    await expect(page.getByText('준비 완료!')).toBeVisible();
  });
}
