// 全站行為腳本的統一入口（階段 I2：自 Base.astro 的 6 段 inline script 抽出）。
// 每個模組 export 一個 init()，內部負責「初次執行 ＋ 重綁 astro:* 事件」，
// 邏輯與原 inline 版本一致——只是搬家、模組化，便於各自獨立維護與驗證。
// 載入順序刻意對齊原 Base.astro：reveal → develop → read-progress
//   → reticle → room-veil → audio。
import { init as reveal } from './reveal';
import { init as develop } from './develop';
import { init as readProgress } from './read-progress';
import { init as reticle } from './reticle';
import { init as roomVeil } from './room-veil';
import { init as audio } from './audio';
import { init as sketches } from './sketches';

reveal();
develop();
readProgress();
reticle();
roomVeil();
audio();
sketches(); // 互動作品執行時（階段 J）：lazy 掛載/離屏暫停/導覽銷毀

