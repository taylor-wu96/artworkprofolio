# 視覺回歸護欄（ROADMAP-v2 · E1）

這套測試的存在理由只有一句：**讓「改 A 壞 B」與 VT 塌陷在合併前就變紅，而不是上線後用肉眼發現。**

## 跑法

```bash
npm run test:visual          # 對照 baseline 驗證（PR 前必跑）
npm run test:visual:update   # 內容/版面「刻意」變動後，重生 baseline
```

測試跑在 **production build（`astro preview`）** 上，不是 dev——靜態輸出無 HMR、無 dev 動態 import 延遲，決定性遠高於 dev，且正是出貨的樣子。webServer 由 [playwright.config.ts](../playwright.config.ts) 自動 `build && preview`。

## 矩陣

- [visual.spec.ts](visual.spec.ts)：每種頁型一張全頁快照 × 桌機(1440) + 手機(390)，並斷言 `data-room` 正確（一體性第一防線）。
- [navigation.spec.ts](navigation.spec.ts)：**VT 護欄**——不 `goto` 目的地，而是從首頁「點導覽過去」，ClientRouter 換頁完成後才快照。VT 塌陷只在導覽後現形（DoD 第 7 條的自動化）。

## 穩定性對策（見 [_helpers.ts](_helpers.ts)）

- `reducedMotion: 'reduce'`（config）→ 停所有 CSS 動畫；3D 光場改 `frameloop='demand'` 凍結一幀（同時兌現 DESIGN §4.5）。
- 3D canvas 以 `mask` 遮蓋（WebGL 點雲隨機、非回歸目標）。
- `settle()`：等 `load` →強制載入宋體兩字重（消 fallback 競態）→預捲觸發 lazy 影像→等 `<img>` 解碼，每步都有逾時護欄。

## 什麼時候會紅、該怎麼辦

- **改了樣式／版面 → 紅**：看 `test-results/**/*-diff.png`。若是預期內的視覺變更，跑 `test:visual:update` 重生 baseline 並 review 那張 diff 再提交。
- **換了種子內容（slug 變動）→ 紅**：更新 [visual.spec.ts](visual.spec.ts) 的 `ROUTES`／[navigation.spec.ts](navigation.spec.ts) 的 slug，再 `update`。
- **baseline 入庫**：`tests/__screenshots__/` 進版控；`-actual.png`/`-diff.png` 與 `test-results/` 不進（見 .gitignore）。
