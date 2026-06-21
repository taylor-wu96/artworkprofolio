// @ts-check
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
import react from '@astrojs/react';
import sanity from '@sanity/astro';

// astro.config 在 Astro 載入 env 之前就執行，所以 import.meta.env 在這裡拿不到，
// 改用 Vite 的 loadEnv 讀同一組 PUBLIC_ 變數。
// projectId / dataset 是公開（非機密）值，本來就會打包進前端。
// 預設用正式專案值，讓任何環境（本機 / Cloudflare）零設定即可建置；
// 要切換專案時用環境變數覆蓋即可（本機 .env 或 CI 的 build variables）。
const env = loadEnv(process.env.NODE_ENV ?? 'development', process.cwd(), '');
const PUBLIC_SANITY_PROJECT_ID =
  env.PUBLIC_SANITY_PROJECT_ID ?? process.env.PUBLIC_SANITY_PROJECT_ID ?? 'z4fuhbhm';
const PUBLIC_SANITY_DATASET =
  env.PUBLIC_SANITY_DATASET ?? process.env.PUBLIC_SANITY_DATASET ?? 'production';

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
