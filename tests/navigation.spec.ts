import { test, expect } from '@playwright/test';
import { settle } from './_helpers';

/**
 * VT 護欄（ROADMAP-v2 E1 / E6 的核心理由）。
 * VT 塌陷（scoped 樣式 view-transition 後失效、中文圖說直排塌成一字寬）**只在 ClientRouter
 * 換頁後現形，reload 看不到**。故這支測試不 goto 目的地，而是從首頁「點導覽過去」，
 * 換頁完成後才快照——正是 DoD 第 7 條（導覽過去再看，不只 reload）的自動化。
 */
// 導覽進每種會出現 grid 軌道的頁型（最易塌的目標）。
const HOPS: { from: string; linkText: string; expectPath: RegExp; name: string; room: 'dark' | 'light' }[] = [
  { from: '/', linkText: '影像', expectPath: /\/gallery$/, name: 'nav-to-gallery', room: 'dark' },
  { from: '/gallery', linkText: '作品', expectPath: /\/$/, name: 'nav-to-home', room: 'dark' },
  { from: '/', linkText: '散文', expectPath: /\/writings$/, name: 'nav-to-writings', room: 'light' },
  { from: '/', linkText: '關於', expectPath: /\/about$/, name: 'nav-to-about', room: 'light' },
];

for (const hop of HOPS) {
  test(`導覽護欄：${hop.name}`, async ({ page }) => {
    await page.goto(hop.from);
    await settle(page);
    await page.getByRole('navigation', { name: '主導覽' }).getByRole('link', { name: hop.linkText }).click();
    await page.waitForURL(hop.expectPath);
    await expect(page.locator('html')).toHaveAttribute('data-room', hop.room);
    await settle(page);
    await expect(page).toHaveScreenshot(`${hop.name}.png`, {
      fullPage: true,
      mask: [page.locator('canvas')],
    });
  });
}

/** 進一篇影像集後導覽離開再回來——VT 重綁與背景連續（G2 連續的暗）的回歸點。 */
test('導覽護欄：影像集往返不塌、暗房不閃白', async ({ page }) => {
  await page.goto('/post/Shueinandong');
  await settle(page);
  await expect(page.locator('html')).toHaveAttribute('data-room', 'dark');
  await page.getByRole('navigation', { name: '主導覽' }).getByRole('link', { name: '作品' }).click();
  await page.waitForURL(/\/$/);
  await settle(page);
  await expect(page.locator('html')).toHaveAttribute('data-room', 'dark');
  await expect(page).toHaveScreenshot('nav-gallery-return-home.png', {
    fullPage: true,
    mask: [page.locator('canvas')],
  });
});
