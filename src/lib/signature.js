// 觀看的機器：每件作品的決定性「檔案座標／簽名」——由 slug 種子生成。
// 不是真 EXIF，而是 Ikeda 式「資料即美學」：穩定、可重現的識別碼，
// 讓每件作品在圖錄裡有一組屬於自己的、像座標一樣的編碼。

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

/**
 * 由種子（建議用 slug）產生一組決定性的檔案簽名。
 * @returns {{coord: string, code: string, channel: string}}
 */
export function archiveSignature(seed = '') {
  const r = rng(hashSeed(String(seed)));
  const lat = r() * 180 - 90;
  const lon = r() * 360 - 180;
  const hex = Array.from({ length: 6 }, () => HEX[Math.floor(r() * 16)]).join('');
  const channel = String(Math.floor(r() * 9999)).padStart(4, '0');
  const fmt = (n, d) => `${n >= 0 ? '+' : '−'}${Math.abs(n).toFixed(d)}`;
  return {
    coord: `${fmt(lat, 4)}° ${fmt(lon, 4)}°`,
    code: `0x${hex}`,
    channel,
  };
}
