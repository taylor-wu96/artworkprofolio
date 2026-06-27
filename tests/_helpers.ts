import type { Page } from '@playwright/test';

/**
 * 等頁面真正「沉澱」才拍。注意：dev server 的 HMR websocket 會讓 `networkidle` 永不觸發，
 * 故用 `load` ＋ 明確等待（字體／lazy 影像），每步都有逾時護欄，杜絕卡死。
 */
export async function settle(page: Page) {
  await page.waitForLoadState('load');

  // ① 強制載入長文宋體（兩字重）——`fonts.ready` 會在 @font-face 還沒被 CSS 註冊前就 resolve，
  //    造成 fallback→serif 競態（mobile 文字頁的主要 flaky 來源）。明確 load 才能消除。
  //    包 race 逾時：字體 CDN 慢/擋時不拖垮整測。
  await page
    .evaluate(async () => {
      const f = (document as any).fonts;
      if (!f) return;
      const guard = new Promise((r) => setTimeout(r, 4000));
      await Promise.race([
        Promise.all([
          f.load("400 16px 'Noto Serif TC'").catch(() => {}),
          f.load("600 16px 'Noto Serif TC'").catch(() => {}),
        ]),
        guard,
      ]);
    })
    .catch(() => {});

  // ② 預捲到底再回頂：觸發所有 lazy 影像——否則 fullPage 截圖會在捲動捕捉過程中才逐一觸發
  //    lazy load，造成跨次不一致。迴圈上限固定，不依賴可能無界的 scrollHeight。
  await page
    .evaluate(async () => {
      const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
      const step = Math.max(1, Math.round(window.innerHeight * 0.8));
      for (let i = 0; i < 30; i++) {
        const before = window.scrollY;
        window.scrollTo(0, before + step);
        await sleep(50);
        if (window.scrollY === before) break; // 到底
      }
      window.scrollTo(0, 0);
      await sleep(50);
    })
    .catch(() => {});

  // ③ 所有 <img> 解碼完成（含逾時護欄）。
  await page
    .evaluate(async () => {
      const withTimeout = (p: Promise<any>, ms: number) =>
        Promise.race([p, new Promise((r) => setTimeout(r, ms))]);
      const imgs = Array.from(document.images);
      await Promise.all(
        imgs.map((img) =>
          withTimeout(
            img.complete && img.naturalWidth > 0
              ? (img as any).decode?.().catch(() => {}) ?? Promise.resolve()
              : new Promise((res) => {
                  img.addEventListener('load', res, { once: true });
                  img.addEventListener('error', res, { once: true });
                }),
            3000
          )
        )
      );
    })
    .catch(() => {});

  await page.waitForTimeout(400);
}
