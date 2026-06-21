import rss from '@astrojs/rss';
import { safeFetch } from '../lib/sanity.js';
import { POSTS_LIST } from '../lib/queries.js';

export async function GET(context) {
  const posts = await safeFetch(POSTS_LIST);
  return rss({
    title: '光・門檻・衰敗 — 攝影 zine',
    description: '關於光、門檻與邊界、衰敗與生機並存的攝影作品集。',
    site: context.site,
    items: posts
      .filter((p) => p.slug)
      .map((p) => ({
        title: p.title,
        link: `/post/${p.slug}`,
        pubDate: p.publishedAt ? new Date(p.publishedAt) : undefined,
      })),
  });
}
