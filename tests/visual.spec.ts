import { test, expect } from '@playwright/test';
import { settle } from './_helpers';

/**
 * 頁型矩陣：每種頁型一張全頁快照。涵蓋暗房（作品/影像/系列/主題）與亮房（散文/關於）。
 * 真實 slug 取自種子資料集（2026-06-27）；內容變動時更新此表並重生 baseline。
 */
const ROUTES: { path: string; name: string; room: 'dark' | 'light' }[] = [
  { path: '/', name: 'home', room: 'dark' },
  { path: '/gallery', name: 'gallery-index', room: 'dark' },
  { path: '/series', name: 'series-index', room: 'dark' },
  { path: '/themes', name: 'themes-index', room: 'dark' },
  { path: '/writings', name: 'writings-index', room: 'light' },
  { path: '/about', name: 'about', room: 'light' },
  { path: '/post/doorway-light', name: 'post-artwork', room: 'dark' },
  { path: '/post/Shueinandong', name: 'post-gallery', room: 'dark' },
  { path: '/post/empty-museum', name: 'post-essay', room: 'light' },
  { path: '/themes/light', name: 'theme-detail', room: 'dark' },
  { path: '/404', name: 'not-found', room: 'light' },
];

for (const r of ROUTES) {
  test(`頁型快照：${r.name}（${r.room}房）`, async ({ page }) => {
    await page.goto(r.path);
    // 房間屬性正確——一體性的第一道防線。
    await expect(page.locator('html')).toHaveAttribute('data-room', r.room);
    await settle(page);
    await expect(page).toHaveScreenshot(`${r.name}.png`, {
      fullPage: true,
      mask: [page.locator('canvas')],
    });
  });
}
