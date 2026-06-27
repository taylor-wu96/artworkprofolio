// 行為腳本的統一生命週期契約（ROADMAP-v2 · E3）。
//
// 問題：七支腳本各自手寫「首次執行 ＋ astro:* 重綁」，而且事件還不一致——
// reveal 用 astro:after-swap、develop/read-progress/reticle/audio 用 astro:page-load。
// 不一致＝「改了沒套用到」的溫床（換頁後某段行為忘了重醒）。
//
// 契約：凡是「每頁要重新查 DOM／重綁」的工作，一律包進 onPage()——
//   ① 初次：DOM 就緒就立即跑（否則等 DOMContentLoaded）。
//   ② 後續：每次 ClientRouter 換頁後（astro:after-swap，新 DOM 已就位）重跑。
// 刻意用 after-swap 而非 page-load：after-swap **不在初次載入觸發**，故與①的直接呼叫
// 不會在首頁雙跑；page-load 兩者皆觸發會重複。被包的函式仍應自身冪等（重入安全）。
//
// 不適用 onPage 的兩個特例（各有理由，不是漏網）：
//   • room-veil：是「轉場編排器」，需要 before-swap 讀目標房間色，非每頁重綁。
//   • sketches：懶掛載／離屏暫停／導覽銷毀有自己的生命週期，見該檔。

type PageFn = () => void;

export function onPage(fn: PageFn): void {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn, { once: true });
  } else {
    fn();
  }
  document.addEventListener('astro:after-swap', fn);
}
