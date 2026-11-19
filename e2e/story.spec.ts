import { expect, test, type Page } from '@playwright/test';

/** 화면 안내가 바뀔 때까지 기다리며 키를 누른다 (장면 전환 연출 시간 포함) */
async function press(page: Page, key: string, times = 1) {
  for (let i = 0; i < times; i++) {
    await page.keyboard.press(key);
    await page.waitForTimeout(250);
  }
}

/** 검사 없이 키보드·마우스로 결과 화면까지 빠르게 간다 */
async function readToEndQuickly(page: Page) {
  await expect(page.getByText('손바닥을 보여주세요')).toBeVisible();
  await press(page, 'h');
  await expect(page.getByText('문을 세게 쳐보세요 (0/3)')).toBeVisible();
  await press(page, ' ', 3);
  await expect(page.getByText('도윤 사원증…? 여길 지나갔구나.')).toBeVisible();
  await press(page, 'ArrowLeft', 3);
  const box = (await page.locator('.cursor-crosshair').boundingBox())!;
  for (const [x, y] of [[0.2, 0.25], [0.55, 0.55], [0.8, 0.8]] as const) {
    await page.mouse.move(box.x + box.width * x, box.y + box.height * y);
    await page.waitForTimeout(800);
  }
  await press(page, 'ArrowLeft');
  await press(page, '3');
  await press(page, '5');
  await press(page, '2');
  await expect(page.getByText('다 읽었으면 손을 왼쪽으로 휘두르세요')).toBeVisible();
  await press(page, 'ArrowLeft');
  await press(page, 'Enter');
  await page.waitForURL(/\/result\?/);
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
  await press(page, 'ArrowLeft', 2); // 07 → 08 → S3

  // S3 손전등: 마우스로 단서 3곳을 차례로 비춘다 (멈춰 있어도 0.5초 머무름이 인정되는지)
  await expect(page.getByText('단서 0 / 3')).toBeVisible();
  const cut = page.locator('.cursor-crosshair');
  const box = (await cut.boundingBox())!;
  for (const [x, y, n] of [[0.2, 0.25, 1], [0.55, 0.55, 2], [0.8, 0.8, 3]] as const) {
    await page.mouse.move(box.x + box.width * x, box.y + box.height * y);
    if (n < 3) await expect(page.getByText(`단서 ${n} / 3`)).toBeVisible();
  }
  await expect(page.getByText('셋, 다섯, 둘. 비밀번호야.')).toBeVisible();
  await press(page, 'ArrowLeft');

  // S4 금고: 한 번 틀린 뒤 숫자키로 3-5-2
  await press(page, '1', 3);
  await expect(page.getByText('틀렸어요 (1번)')).toBeVisible();
  await press(page, '3');
  await press(page, '5');
  await press(page, '2');
  await expect(page.getByText('열렸다!')).toBeVisible();

  await expect(page.getByText('다 읽었으면 손을 왼쪽으로 휘두르세요')).toBeVisible();
  await press(page, 'ArrowLeft');
  await expect(page.getByText('엄지를 올려 대답하세요')).toBeVisible();
  await press(page, 'Enter');

  await page.waitForURL(/\/result\?/);
  await expect(page.getByText('키보드·클릭', { exact: true })).toBeVisible();
  await expect(page.getByText('3번', { exact: true })).toBeVisible();
  await expect(page.getByText('3 / 3', { exact: true })).toBeVisible();

  // 다 읽은 뒤 다시 읽기: Next가 끝난 뷰어를 숨겨 보존하므로, 링크로 들어오면 처음부터 시작해야 한다
  await page.getByRole('link', { name: '다시 보기' }).click();
  await expect(page.getByText('1 / 7')).toBeVisible();
  await press(page, 'h');
  await expect(page.getByText('준비 완료!')).toBeVisible();
  await expect(page).toHaveURL(/\/story\?mode=keyboard/);
});

test('결과 화면에서 처음으로 돌아가 다른 방식으로 다시 읽는다', async ({ page }) => {
  // 카메라는 없는 것으로 (손으로 읽기를 고르면 안내 후 키보드 모드로 전환)
  await page.addInitScript(() => {
    navigator.mediaDevices.getUserMedia = () => Promise.reject(new DOMException('test', 'NotFoundError'));
  });
  await page.goto('/story?mode=keyboard');
  await readToEndQuickly(page);

  await page.getByRole('link', { name: '처음으로' }).click();
  await page.getByRole('link', { name: /손으로 읽기/ }).click();
  await expect(page).toHaveURL(/\/story\?mode=camera/);
  await expect(page.getByText('1 / 7')).toBeVisible();
  await expect(page.getByText('키보드·클릭 모드로 바꿨어요')).toBeVisible();

  await page.goto('/');
  await page.getByRole('link', { name: /키보드로 읽기/ }).click();
  await expect(page.getByText('1 / 7')).toBeVisible();
});

test('키보드만으로 손전등을 쓴다 (H를 누른 채 방향키)', async ({ page }) => {
  await page.goto('/story?mode=keyboard');
  await expect(page.getByText('손바닥을 보여주세요')).toBeVisible();
  await press(page, 'h');
  await page.waitForTimeout(900);
  await press(page, ' ', 3);
  await page.waitForTimeout(1200);
  await press(page, 'ArrowLeft', 3);
  await expect(page.getByText('단서 0 / 3')).toBeVisible();

  // 가운데(0.5, 0.5)에서 0.04씩: 왼쪽 8번·위 6번 → 단서 A(0.2, 0.25) 근처
  await page.keyboard.down('h');
  for (let i = 0; i < 8; i++) await page.keyboard.press('ArrowLeft');
  for (let i = 0; i < 6; i++) await page.keyboard.press('ArrowUp');
  // 키를 누르고 있을 때의 반복 입력 대신, 같은 자리에서 위·아래를 번갈아 눌러 0.5초 이상 머문다
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press(i % 2 ? 'ArrowUp' : 'ArrowDown');
    await page.waitForTimeout(100);
  }
  await page.keyboard.up('h');
  await expect(page.getByText('단서 1 / 3')).toBeVisible();
});

test('효과음이 오류 없이 나고, 음소거는 새로고침 후에도 유지된다', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/story?mode=keyboard');
  await expect(page.getByText('손바닥을 보여주세요')).toBeVisible();
  await press(page, 'h'); // 띵
  await expect(page.getByText('문을 세게 쳐보세요 (0/3)')).toBeVisible();
  await press(page, ' ', 3); // 쾅 쾅 와장창

  await page.getByRole('button', { name: '소리 끄기' }).click();
  await expect(page.getByRole('button', { name: '소리 켜기' })).toHaveAttribute('aria-pressed', 'true');
  await page.reload();
  await expect(page.getByRole('button', { name: '소리 켜기' })).toBeVisible();
  expect(errors).toEqual([]);
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
