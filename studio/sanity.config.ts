import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './schemaTypes';

// Studio 會自動載入同目錄 .env 內 SANITY_STUDIO_ 前綴的變數。
// 第一次設定：cd studio && npm install && npx sanity init
// init 會幫你建立專案並寫入 projectId / dataset。
export default defineConfig({
  name: 'default',
  title: '光・門檻・衰敗 — 後台',

  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'your_project_id',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',

  plugins: [structureTool(), visionTool()],

  schema: {
    types: schemaTypes,
  },
});
