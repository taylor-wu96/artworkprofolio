// @ts-check
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
import react from '@astrojs/react';
import sanity from '@sanity/astro';

// astro.config 在 Astro 載入 env 之前就執行，所以 import.meta.env 在這裡拿不到，
// 改用 Vite 的 loadEnv 讀同一組 PUBLIC_ 變數。
const env = loadEnv(process.env.NODE_ENV ?? 'development', process.cwd(), '');
// 本機讀 .env（loadEnv）；CI/Cloudflare 則讀注入的環境變數（process.env）。
const PUBLIC_SANITY_PROJECT_ID =
  env.PUBLIC_SANITY_PROJECT_ID ?? process.env.PUBLIC_SANITY_PROJECT_ID;
const PUBLIC_SANITY_DATASET =
  env.PUBLIC_SANITY_DATASET ?? process.env.PUBLIC_SANITY_DATASET ?? 'production';

if (!PUBLIC_SANITY_PROJECT_ID) {
  throw new Error(
    'Missing PUBLIC_SANITY_PROJECT_ID. 本機請建 .env；Cloudflare 請在專案的 Build/Environment variables 設定 PUBLIC_SANITY_PROJECT_ID 與 PUBLIC_SANITY_DATASET。'
  );
}

// https://astro.build/config
export default defineConfig({
  // 上線前換成你的正式網域，OG / sitemap / RSS 會用到
  site: 'https://example.pages.dev',
  integrations: [
    react(),
    sanity({
      projectId: PUBLIC_SANITY_PROJECT_ID,
      dataset: PUBLIC_SANITY_DATASET,
      useCdn: false, // 靜態建置走 API 直連，拿最新內容
    }),
  ],
});
