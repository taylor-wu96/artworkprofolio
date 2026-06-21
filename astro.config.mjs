// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  // 上線前換成你的正式網域，OG / sitemap / RSS 會用到
  site: 'https://example.pages.dev',
  integrations: [react()],
});
