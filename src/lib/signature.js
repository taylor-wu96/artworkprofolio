// 觀看的機器：每件作品的「檔案座標／簽名」。
// 誠實化（ROADMAP-v5 S1・推翻原半真化路線 A）：座標只在有真拍攝資料（手填 capture
// 或封面 EXIF/GPS）時顯示，缺則沉默——機器不捏造一件作品的觀看痕跡。一件作品的右下角
// 空著，比貼一串假座標更有尊嚴；參差的沉默正是目的（治 AI 味的「無差別套用」）。
// 回傳 `real` 旗標供呼叫端決定整條資料條是否渲染。
// （內部抽象編碼 code＝0x 編目指紋，性質如館方流水號，非感測數據；僅在資料條已亮起
//  時陪同顯示。）

// FNV-1a 雜湊：字串 → 32-bit 種子
function hashSeed(str = '') {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// 由種子產生 0..1 的決定性序列（LCG）
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const HEX = '0123456789ABCDEF';

// EXIF DateTimeOriginal（如 "2023:05:14 18:30:00"）→ 年份字串。
function exifYear(meta) {
  const dto = meta?.exif?.DateTimeOriginal;
  if (!dto) return null;
  const m = String(dto).match(/(\d{4})/);
  return m ? m[1] : null;
}

/**
 * 機器的「讀檔」：把封面／影像的真實 EXIF 讀成攝影師在意的五個參數。
 * 與半真化簽名（archiveSignature）刻意分流——簽名允許生成佔位（座標/編碼是
 * 顯然的抽象），但**技術參數只讀真的**：機器不捏造光圈。沒有 EXIF 就回傳空陣列，
 * 呼叫端據此整條不顯（DESIGN §三・層 1：資料的誠實）。
 * 優先序：手填器材／底片（capture）覆寫對應欄；其餘讀 EXIF。
 * @param {{exif?: object}} [assetMeta] 影像 asset.metadata（含 exif）
 * @param {{gear?: string, film?: string}} [capture] 手填覆寫
 * @returns {string[]} 已格式化的參數（如 ['f/2.8','1/250s','ISO 400','35mm','Summicron']）
 */
export function readExif(assetMeta = null, capture = null) {
  const e = assetMeta?.exif;
  if (!e && !capture?.gear && !capture?.film) return [];
  const out = [];

  // 光圈：FNumber 2.8 → f/2.8（整數不補小數）。
  if (typeof e?.FNumber === 'number' && e.FNumber > 0) {
    out.push(`f/${Number(e.FNumber.toFixed(1))}`);
  }
  // 快門：ExposureTime 為秒（小數）。< 1 → 1/N s；≥ 1 → Ns。
  if (typeof e?.ExposureTime === 'number' && e.ExposureTime > 0) {
    out.push(
      e.ExposureTime < 1
        ? `1/${Math.round(1 / e.ExposureTime)}s`
        : `${Number(e.ExposureTime.toFixed(1))}s`,
    );
  }
  // 感光：手填底片覆寫 ISO；否則讀 EXIF ISO。
  if (capture?.film) out.push(String(capture.film));
  else if (typeof e?.ISO === 'number' && e.ISO > 0) out.push(`ISO ${Math.round(e.ISO)}`);
  // 焦段：FocalLength（mm）。
  if (typeof e?.FocalLength === 'number' && e.FocalLength > 0) {
    out.push(`${Number(e.FocalLength.toFixed(0))}mm`);
  }
  // 器材：手填 gear 覆寫鏡頭名；否則讀 EXIF LensModel。
  const lens = capture?.gear || e?.LensModel;
  if (lens) out.push(String(lens).trim());

  return out;
}

/**
 * 由種子（slug）＋ 選填的真實拍攝資料產生一組檔案簽名。
 * 優先序（半真化・階段 H）：手填 capture ＞ 封面 EXIF/GPS ＞ slug 生成。
 * @param {string} seed 通常是 slug。
 * @param {{coordinates?: {lat?: number, lng?: number}, year?: string}} [capture]
 * @param {{location?: {lat?: number, lng?: number}, exif?: object}} [assetMeta] 封面 asset.metadata
 * @returns {{coord: string, code: string, channel: string, coordReal: boolean, year: ?string}}
 */
export function archiveSignature(seed = '', capture = null, assetMeta = null) {
  const r = rng(hashSeed(String(seed)));
  const genLat = r() * 180 - 90;
  const genLon = r() * 360 - 180;
  const hex = Array.from({ length: 6 }, () => HEX[Math.floor(r() * 16)]).join('');
  const genChannel = String(Math.floor(r() * 9999)).padStart(4, '0');
  const fmt = (n, d) => `${n >= 0 ? '+' : '−'}${Math.abs(n).toFixed(d)}`;

  // 座標：手填 ＞ 封面 GPS（EXIF）＞ 生成。
  const gps = assetMeta?.location;
  const lat =
    typeof capture?.coordinates?.lat === 'number' ? capture.coordinates.lat
    : typeof gps?.lat === 'number' ? gps.lat
    : undefined;
  const lon =
    typeof capture?.coordinates?.lng === 'number' ? capture.coordinates.lng
    : typeof gps?.lng === 'number' ? gps.lng
    : undefined;
  const coordReal = typeof lat === 'number' && typeof lon === 'number';

  // 年份：手填 ＞ EXIF 拍攝日 ＞ 無（頻道純生成）。
  const year = capture?.year || exifYear(assetMeta) || null;

  // 頻道：有真年份時由年份＋slug 決定（等寬抽象頻道，但與真資料綁定）；
  // 缺則維持純生成。code（0x 編碼）為機器內部抽象編碼，恆為生成。
  const channel = year
    ? String(hashSeed(`${year}:${seed}`) % 10000).padStart(4, '0')
    : genChannel;

  // 誠實化（S1）：有真資料（座標或年份）才視為「機器真的讀過這件」。否則整條沉默。
  const real = coordReal || !!year;

  return {
    // 座標只給真的；無真座標＝null（不再用 genLat/genLon 捏造）。
    coord: coordReal ? `${fmt(lat, 4)}° ${fmt(lon, 4)}°` : null,
    code: `0x${hex}`,
    channel,
    coordReal,
    year,
    real,
  };
}
