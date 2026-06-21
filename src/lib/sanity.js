import { createClient } from '@sanity/client';
import { createImageUrlBuilder } from '@sanity/image-url';

// 讀環境變數；本機放 .env，Cloudflare Pages 放專案 Environment variables。
// 哨兵值需符合 Sanity 規則（只能 a-z、0-9、dash），否則 createClient 會直接拋錯。
const PLACEHOLDER = 'placeholder';
const projectId = import.meta.env.SANITY_PROJECT_ID || PLACEHOLDER;
const dataset = import.meta.env.SANITY_DATASET || 'production';
const apiVersion = import.meta.env.SANITY_API_VERSION || '2024-01-01';

// 在尚未填入真正 Project ID 前，前台仍能成功 build（fetch 會回空陣列）。
export const isSanityConfigured = projectId !== PLACEHOLDER;

export const sanity = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true, // 走 CDN 省 API 額度
});

const builder = createImageUrlBuilder(sanity);
export const urlFor = (source) => builder.image(source);

/**
 * 安全查詢：Sanity 尚未設定或查詢失敗時回退預設值，
 * 讓骨架階段（還沒接後台）也能正常建置 / 預覽。
 */
export async function safeFetch(query, params = {}, fallback = []) {
  if (!isSanityConfigured) return fallback;
  try {
    return await sanity.fetch(query, params);
  } catch (err) {
    console.warn('[sanity] fetch 失敗，回退預設值：', err?.message ?? err);
    return fallback;
  }
}
