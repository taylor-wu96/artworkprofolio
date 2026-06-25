// 每件作品的生成式視覺簽名（Reas・觀看的機器 v3.1）。
// 由 slug 種子決定性產生——同 slug 永遠同一個字符；把 D2 的「資料條」（一串字）
// 升級成每件作品專屬的視覺指紋。線條／節點的機器感（Ikeda/Reas），灰階＋一粒綠
// （唯一活著的節點，呼應全站的綠訊號）。純靜態 SVG，reduced-motion 無虞。

// FNV-1a：字串 → 32-bit 種子（與 signature.js 同族，保持決定性一致）。
function hashSeed(str = '') {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// LCG：由種子產生 0..1 的決定性序列。
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/**
 * 由種子產生一枚決定性的「感測軌跡」字符（SVG 字串）。
 * 線條走 currentColor（隨房間明暗自適應）；一粒節點走 --accent（合法綠＝活訊號）。
 * @param {string} seed 通常是 slug。
 * @param {{size?: number}} [opts]
 * @returns {string} 內聯 SVG
 */
export function signatureGlyph(seed = '', { size = 40 } = {}) {
  const r = rng(hashSeed(String(seed)));
  const n = 5 + Math.floor(r() * 3); // 5–7 個節點
  const pts = [];
  for (let i = 0; i < n; i++) {
    pts.push([14 + r() * 72, 14 + r() * 72]);
  }
  const d = pts
    .map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`)
    .join(' ');
  const liveIdx = Math.floor(r() * n); // 哪一個節點是「活著」的綠點
  const nodes = pts
    .map((p, i) =>
      i === liveIdx
        ? `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="2.6" class="glyph__live" />`
        : `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="1.5" fill="currentColor" />`
    )
    .join('');
  // 邊框＋角落刻度＝Ikeda 式資料框；軌跡線＋節點＝Reas 式生成構成。
  return (
    `<svg class="glyph" viewBox="0 0 100 100" width="${size}" height="${size}" ` +
    `role="img" aria-label="作品生成簽名" fill="none">` +
    `<rect x="2" y="2" width="96" height="96" stroke="currentColor" stroke-width="0.6" opacity="0.22" />` +
    `<path d="${d}" stroke="currentColor" stroke-width="0.8" opacity="0.5" stroke-linejoin="round" stroke-linecap="round" />` +
    nodes +
    `</svg>`
  );
}
