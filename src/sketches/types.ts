// 互動作品執行時（Works Runtime・階段 J）——引擎無關的掛載契約。
//
// 設計意圖（回應 PM roadmap 軸 1）：讓「React/R3F」只是眾引擎之一，而非底座。
// 每個生成式作品（shader / R3F / 未來的 p5 …）都實作同一份契約；載入器只認契約、
// 不認引擎。新增一件作品＝寫一個實作此契約的模組 ＋ 在 registry 加一行。
//
// 一台「觀看光的精密儀器」理應能展示活的、生成的影像作品——這層 runtime 就是那能力的地基。

/** 載入器交給作品的環境脈絡：作品據此自我降載/尊重偏好，不必各自重查。 */
export interface SketchContext {
  /** prefers-reduced-motion：true 時作品應呈現靜態或極簡狀態，不做持續演化。 */
  reducedMotion: boolean;
  /** 視窗 < 768：行動裝置，作品應降載（降解析度/降點數/降分段）。 */
  mobile: boolean;
  /** 建議繪製像素比（行動已 cap，避免 retina 過繪）。 */
  dpr: number;
  /** 由 Sanity `params`（kv 陣列）解析而來的作品參數。 */
  params: Record<string, unknown>;
  /**
   * 全站滾動進度的唯讀 ref（0..1，hero 視窗內）。承接既有 Hero3D 的捲動樂章語彙，
   * 讓 shader 作品也能隨捲動消融（衰敗母題）。由載入器持續更新。
   */
  scroll: { current: number };
}

/** 作品實例：載入器以此控制生命週期（離屏暫停、導覽銷毀）。 */
export interface SketchInstance {
  /** 離開視口：停止 rAF / 凍結演算，省電省效能。 */
  pause(): void;
  /** 回到視口：恢復演算。 */
  resume(): void;
  /** 卸載（導覽離開 / 元素移除）：釋放 WebGL context、移除 canvas、解綁監聽——杜絕洩漏。 */
  destroy(): void;
}

/** 一件生成式作品＝一個 mount 函式。host 是 `<Sketch>` 渲染出的容器。 */
export interface SketchModule {
  mount(host: HTMLElement, ctx: SketchContext): SketchInstance;
}
