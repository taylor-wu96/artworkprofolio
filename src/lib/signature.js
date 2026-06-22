// 觀看的機器：每件作品的「檔案座標／簽名」。
// 半真化（DESIGN §13 路線 A）：有真拍攝資料就用真的、缺則由 slug 種子生成
// 決定性的 fallback。真假共用同一等寬視覺語言——機器要真的在觀看，
// 但允許尚未回填的作品以生成值佔位。

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
 * 由種子（slug）＋ 選填的真實拍攝資料產生一組檔案簽名。
 * @param {string} seed 通常是 slug。
 * @param {{coordinates?: {lat?: number, lng?: number}, year?: string}} [capture]
 * @returns {{coord: string, code: string, channel: string, coordReal: boolean}}
 */
export function archiveSignature(seed = '', capture = null) {
  const r = rng(hashSeed(String(seed)));
  const genLat = r() * 180 - 90;
  const genLon = r() * 360 - 180;
  const hex = Array.from({ length: 6 }, () => HEX[Math.floor(r() * 16)]).join('');
  const genChannel = String(Math.floor(r() * 9999)).padStart(4, '0');
  const fmt = (n, d) => `${n >= 0 ? '+' : '−'}${Math.abs(n).toFixed(d)}`;

  // 半真：有真座標就用真的，否則用生成的。
  const lat = capture?.coordinates?.lat;
  const lon = capture?.coordinates?.lng;
  const coordReal = typeof lat === 'number' && typeof lon === 'number';

  // 頻道：有真年份時由年份＋slug 決定（仍是等寬的抽象頻道，但與真資料綁定）；
  // 缺則維持純生成。code（0x 編碼）為機器內部抽象編碼，恆為生成。
  const channel = capture?.year
    ? String(hashSeed(`${capture.year}:${seed}`) % 10000).padStart(4, '0')
    : genChannel;

  return {
    coord: coordReal ? `${fmt(lat, 4)}° ${fmt(lon, 4)}°` : `${fmt(genLat, 4)}° ${fmt(genLon, 4)}°`,
    code: `0x${hex}`,
    channel,
    coordReal,
  };
}
