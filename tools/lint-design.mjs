#!/usr/bin/env node
// 設計契約的可執行化（ROADMAP-v2 · E2）。
// 把 DESIGN.md 從散文升為機器守則。只守三件 DESIGN 真正在乎的事：
//
//   ERROR（會擋）— 綠的稀缺與一致（DESIGN §4.1 唯一最神聖的約束）：
//     CSS／.astro 裡的地衣綠一律走 --accent/--life*，不准出現綠色字面值。
//     綠用多了、各處色號不一，「綠＝稀缺的生命訊號」這句話就死了。
//
//   WARN（不擋，盤點維護債）—
//     ① tokens.css 以外的裸色號（應走語意 token；DESIGN §8.2）。
//     ② 頁級 .astro <style> 內的 grid 軌道宣告（VT 塌陷風險，DESIGN §14／E6）。
//
// 3D（Three.js）的綠（Hero3D 那一粒活光、綠霧）是另一種介質、無法吃 CSS 變數，
// 故綠規則只掃 CSS 與 .astro，刻意不掃 .js/.ts/.tsx。

import { readFileSync } from 'node:fs';
import { globSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();

// 地衣綠色號（亮/暗底兩版 ＋ 3D 用的近似綠）。出現在 CSS/.astro＝違規。
const GREEN_HEX = /#(4f5e44|93a47f|9fb487|6f8a5a|6b8a5a)\b/i;
const ANY_HEX = /#[0-9a-fA-F]{3,8}\b/g;
const GRID_TRACK = /grid-template(-columns|-rows)?\s*:/;

function listFiles(patterns) {
  const out = [];
  for (const p of patterns) {
    try {
      for (const f of globSync(p, { cwd: ROOT })) out.push(f);
    } catch {}
  }
  return out;
}

const cssFiles = listFiles(['src/styles/**/*.css']);
const astroFiles = listFiles(['src/**/*.astro']);

let errors = 0;
let warns = 0;
const log = (lvl, file, line, msg) => {
  const tag = lvl === 'ERROR' ? 'ERROR' : 'warn ';
  console.log(`${tag}  ${file}:${line}  ${msg}`);
};

// ---- CSS layer 檔 ----
for (const file of cssFiles) {
  const isTokens = file.endsWith('tokens.css');
  const lines = readFileSync(join(ROOT, file), 'utf8').split('\n');
  lines.forEach((ln, i) => {
    if (ln.trimStart().startsWith('/*') || ln.trimStart().startsWith('*')) return;
    if (GREEN_HEX.test(ln) && !isTokens) {
      log('ERROR', file, i + 1, `綠色字面值——改走 var(--accent)/--life*（DESIGN §4.1）：${ln.trim()}`);
      errors++;
    }
    if (!isTokens) {
      const hits = ln.match(ANY_HEX);
      if (hits && !GREEN_HEX.test(ln)) {
        log('WARN', file, i + 1, `裸色號 ${hits.join(' ')}——宜走語意 token（DESIGN §8.2）`);
        warns++;
      }
    }
  });
}

// ---- .astro：抓 <style> 區塊內的綠＋grid 軌道 ----
for (const file of astroFiles) {
  const src = readFileSync(join(ROOT, file), 'utf8');
  const lines = src.split('\n');
  let inStyle = false;
  lines.forEach((ln, i) => {
    if (/<style\b/.test(ln)) inStyle = true;
    if (inStyle) {
      if (GREEN_HEX.test(ln)) {
        log('ERROR', file, i + 1, `頁級樣式出現綠色字面值——改走 var(--accent)（DESIGN §4.1）：${ln.trim()}`);
        errors++;
      }
      if (GRID_TRACK.test(ln)) {
        log('WARN', file, i + 1, `頁級 <style> 定義 grid 軌道——VT 換頁恐塌，宜下沉全域層（E6）：${ln.trim()}`);
        warns++;
      }
    }
    if (/<\/style>/.test(ln)) inStyle = false;
  });
}

console.log(`\n設計契約：${errors} error、${warns} warn（${cssFiles.length} CSS ＋ ${astroFiles.length} .astro）`);
if (errors > 0) {
  console.log('✘ 綠的稀缺被破壞——這是 DESIGN 唯一不可退讓的約束。');
  process.exit(1);
}
console.log('✓ 綠仍稀缺而一致。warn 為維護債，擇期清理。');
