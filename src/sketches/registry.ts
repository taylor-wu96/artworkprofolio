// 作品登錄表（Works Runtime・階段 J）。
//
// 唯一的「加一件生成式作品」入口：寫一個實作 SketchModule 契約的模組，在此加一行。
// 值是動態 import 工廠（`() => import(...)`），讓載入器**進視口才下載**該作品程式碼——
// 重作品（p5/three）不拖慢首頁。沿用既有「資料層」精神：作品是有名有號的可定址資源。

import type { SketchModule } from './types';

type Loader = () => Promise<{ default: SketchModule } | { sketch: SketchModule }>;

export const registry: Record<string, Loader> = {
  // R3F 點雲（既有 Hero3D 收編進 runtime——證明 React 只是眾引擎之一）。
  'light-field': () => import('./light-field'),
  // 原生 WebGL fragment shader 光場（首發引擎範本）。
  'drift-light': () => import('./drift-light'),
};

export function hasSketch(id: string): boolean {
  return Object.prototype.hasOwnProperty.call(registry, id);
}

// 從動態 import 結果取出 SketchModule（容許 default 或具名 sketch 匯出）。
export function resolveModule(mod: any): SketchModule {
  return (mod?.default ?? mod?.sketch) as SketchModule;
}
