import { defineConfig, devices } from '@playwright/test';

/**
 * E1 視覺回歸護欄（ROADMAP-v2）。
 * 目的不是像素完美，而是攔截「改 A 壞 B」與 VT 塌陷這類**只在跨頁導覽後現形**的回歸。
 * 故矩陣涵蓋每種頁型 × 兩房 × 桌機/手機，且 nav.spec 走一條 ClientRouter 導覽路徑。
 *
 * 穩定性對策：
 *  - reducedMotion: 'reduce' 停掉所有 CSS 動畫（wip 脈動、入場揭示）。
 *  - 3D canvas（light-field）以 mask 遮蓋（WebGL 每幀不確定，非回歸目標）。
 *  - maxDiffPixelRatio 容忍字體網路載入造成的次像素抖動。
 */
export default defineConfig({
  testDir: './tests',
  snapshotDir: './tests/__screenshots__',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4321',
    reducedMotion: 'reduce',
  },
  // 重頁（含 3D 光場的首頁）fullPage 截圖需要較寬的穩定窗。
  timeout: 60_000,
  expect: {
    timeout: 15_000,
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.02,
      animations: 'disabled',
    },
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { ...devices['Pixel 5'], viewport: { width: 390, height: 844 } } },
  ],
  // 跑在 production build（astro preview）而非 dev：靜態輸出、無 HMR websocket、
  // 無 dev 動態 import 延遲 → 決定性遠高於 dev，正是視覺回歸該測的對象（出貨的樣子）。
  webServer: {
    command: 'npm run build && npm run preview -- --port 4321',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
