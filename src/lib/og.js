// 分享立面（Open Graph）：把美術館的牆延伸到別人的 timeline。
// 取捨（H1.2）：影像高於標題（DESIGN §4.3）——分享出去就是「那張照片本身」，
// 不疊文字 chrome。故 OG ＝封面的 1200×630 暗房裁切，而非文字說明卡。
// （satori 文字立面屬可選 polish，刻意不引入 CJK 字體＋光柵化子系統，見 ROADMAP H1.2。）
import { urlFor } from './sanity.js';

const OG_W = 1200;
const OG_H = 630;

/**
 * 由 Sanity 影像產生 1200×630 的 OG 圖網址（社群大圖卡標準比例）。
 * @param {object} image Sanity image（需含 asset）
 * @returns {string|null} 絕對網址或 null（無影像時呼叫端略過 og:image）
 */
export function ogImageUrl(image) {
  if (!image?.asset) return null;
  // fit:crop ＋ hotspot：尊重攝影師焦點裁出分享比例（索引縮圖例外，DESIGN §5）。
  return urlFor(image).width(OG_W).height(OG_H).fit('crop').url();
}

export const OG_SIZE = { width: OG_W, height: OG_H };
