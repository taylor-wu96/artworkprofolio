// light-field — 既有 Hero3D（R3F 點雲）收編進 Works Runtime。
//
// 關鍵示範（PM roadmap 軸 1）：React 被包在「一個實作 SketchModule 契約的模組」之內，
// 與原生 shader 的 drift-light 平起平坐——React/R3F 只是眾引擎之一，不是底座。
// 而且 React 在此是**按需動態載入**：只有當 R3F 作品真正掛載時才下載 react/react-dom，
// 進一步證明 React 不是基底，是可抽換的引擎。Hero3D 元件本身一字不改（視覺零回歸）。

import type { SketchModule, SketchContext, SketchInstance } from './types';

// dev：R3F 經 Astro 島機制「之外」動態載入時，需手動補上 @vitejs/plugin-react 的
// Fast-Refresh preamble 旗標，否則 JSX 模組頂部的 preamble 檢查會丟錯。
// 必須在動態 import Hero3D（含該檢查）之前設好。production 不注入此檢查，無此需求。
function ensureReactPreamble() {
  if (!import.meta.env.DEV) return;
  const w = window as any;
  if (w.__vite_plugin_react_preamble_installed__) return;
  w.$RefreshReg$ = () => {};
  w.$RefreshSig$ = () => (type: any) => type;
  w.__vite_plugin_react_preamble_installed__ = true;
}

export const sketch: SketchModule = {
  mount(host: HTMLElement, _ctx: SketchContext): SketchInstance {
    let root: import('react-dom/client').Root | null = null;
    let destroyed = false;

    ensureReactPreamble();
    // 按需載入 React / R3F / Hero3D（旗標已就緒，preamble 檢查通過）。
    (async () => {
      const [{ createRoot }, { createElement }, mod] = await Promise.all([
        import('react-dom/client'),
        import('react'),
        import('../components/Hero3D.jsx'),
      ]);
      if (destroyed || !document.body.contains(host)) return;
      root = createRoot(host);
      root.render(createElement((mod as any).default));
    })();

    return {
      // R3F 自管 frameloop；hero 恆為背景、輕量，捲動樂章需持續運轉，故不離屏暫停。
      pause() {},
      resume() {},
      // 卸載 React 根＝R3F 清理 Canvas／WebGL context／useEffect 監聽，杜絕導覽洩漏。
      destroy() {
        destroyed = true;
        if (root) root.unmount();
      },
    };
  },
};

export default sketch;
