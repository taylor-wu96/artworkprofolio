import { sanityClient } from 'sanity:client';
import { createImageUrlBuilder } from '@sanity/image-url';

// @sanity/astro 提供的虛擬模組 sanity:client，設定來自 astro.config.mjs。
export const sanity = sanityClient;

const builder = createImageUrlBuilder(sanityClient);
export const urlFor = (source) => builder.image(source);

/**
 * 容錯查詢：查詢失敗時回退預設值，讓內容還空著時前台也能正常建置 / 預覽。
 */
export async function safeFetch(query, params = {}, fallback = []) {
  try {
    return await sanityClient.fetch(query, params);
  } catch (err) {
    console.warn('[sanity] fetch 失敗，回退預設值：', err?.message ?? err);
    return fallback;
  }
}
