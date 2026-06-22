# 重構進度 — 灰階・生機・門檻

> 依據：[DESIGN.md](DESIGN.md)（落地）＋ [.agents/skills/Design.md](.agents/skills/Design.md)（母文件通則）
> 兩階段：**A 色彩＋閱讀版面**（先做、待 Review）→ **B 3D 演化**（Review 後接續）
> 規則：每完成一細項就勾選並補一行備註。建立日：2026-06-21。

---

## 階段 A — 色彩系統 ＋ 閱讀版面（亮房）

### A1. 色彩 token（`src/styles/global.css :root`）
- [x] A1-1 暖色 → 中性灰階：`--paper #f4f4f2`、`--ink #0e0e0d`
- [x] A1-2 墨濃度層級：保留 `--ink-70 / -45 / -15`（不改名，避免多檔回歸）
- [x] A1-3 新增暗房 token：`--gallery #0c0c0b`、`--gallery-ink #ececea`
- [x] A1-4 新增地衣綠：`--life #4f5e44`（亮底）、`--life-dark #93a47f`（暗底）
- [x] A1-5 全域既有 `--hero-bg` 對齊到 `--gallery`

### A2. 字體系統（編輯雙體）
- [x] A2-1 定義 `--font-ui`（瑞士無襯線，沿用現有 stack）
- [x] A2-2 定義 `--font-read`（Noto Serif TC → 思源宋體 → Songti → Georgia fallback）
- [x] A2-3 引入 Noto Serif TC（Google Fonts css2，wght 400;600，CJK 自動 subset）
- [x] A2-4 介面預設 `--font-ui`（html）；驗證 body 仍為無襯線

### A3. 閱讀版面（`.prose` 升級 → 亮房長文規格）
- [x] A3-1 內文改 `--font-read`、字級 1.12rem(≈19px)、行高 1.85（驗證：35.2px）
- [x] A3-2 measure 收窄 `--measure: 40rem`（驗證：680px）
- [x] A3-3 段距加大：`> * + * { margin-top: 1.6em }`
- [x] A3-4 連結：地衣綠、無底線、hover 顯下緣細線
- [x] A3-5 h2/h3 用無襯線製造呼吸點
- [x] A3-6 內文圖片滿欄、blockquote 細左線
- 備註：`[slug].astro` 的 `.prose--essay` 由 Georgia 硬指定改為 `--font-read`

### A4. 全域與選取/狀態
- [x] A4-1 `::selection` 維持墨/紙（足夠克制，未改）
- [x] A4-2 nav `aria-current` 用地衣綠（驗證：rgb(79,94,68)）；hover 維持墨
- [ ] A4-3 檔案索引「最新／進行中」標記用地衣綠 — 延後（待有「最新」語意資料）

### A5. 套頁與驗證
- [x] A5-1 套用閱讀頁：`post/[slug].astro`（essay）、`about.astro`（bio 1.85 + 綠連結）
- [x] A5-2 首頁/themes/newsletter/footer 新 token 下無回歸（截圖確認）
- [x] A5-3 dev 視覺驗證：亮房宋體長文 + 暗房 hero + 綠克制（截圖）
- [x] A5-4 `npm run build` 通過、15 頁、無警告
- [x] A5-5 截圖交付 Review

> **A 完成 → 等使用者 Review → 再開始 B**
> 備註：A4-3 延後（需內容語意支援）。其餘 A 全數完成並驗證。

---

## 階段 B — 3D 演化（沉思內核，Review 後接續）

### B1. 滾動驅動
- [x] B1-1 光場隨捲動沉降(position.y)、後退(position.z)、淡出(opacity×(1-s·0.85))、微縮(scale)
- [x] B1-2 滾動進度用 ref + rAF 節流寫入(`useScrollProgress`)，useFrame 讀取不 re-render
- 驗證：捲動 35% 視窗時光場明顯下沉變暗(截圖)

### B2. 指標互動
- [x] B2-1 光隨游標極輕微聚散：`state.pointer` → 目標旋轉(±0.12/0.16)，重阻尼 lerp(d·1.6)
- 備註：阻尼步長鎖定 `min(delta,0.05)` 避免掉幀爆衝

### B3. 一粒綠光
- [x] B3-1 獨立 green points 層：18 點(行動 10)、size 0.085、color `#93a47f`(--life-dark)
- [x] B3-2 綠光獨立慢脈動(~呼吸)，與主光場色溫循環分離；隨滾動同步淡出

### B4. 效能/無障礙
- [x] B4-1 `prefers-reduced-motion`：停自轉/呼吸/色溫循環/指標位移，僅保留靜態光場
- [x] B4-2 行動裝置降點數(8000→4000；綠 18→10)
- [x] B4-3 本機驗證(無 console error，canvas 1384×1740 WebGL) + 截圖；`npm run build` 15 頁通過

### B5. 衰敗演化（實驗 → 暫緩）
- [~] B5-1 嘗試：主光場改 GPU ShaderMaterial「壽命循環侵蝕」（外漂＋生滅淡出）
  - 結論：**已還原為階段 B 的 pointsMaterial 密實光雲**。
  - 原因：AdditiveBlending 下 `pointsMaterial` 會忽略 opacity、每點全亮相加，堆疊出
    密實亮核；自訂 shader 對每點乘上 env×opacity 後，亮核無法累積，JPEG 壓暗成稀疏星點，
    視覺上是退步。多次調參（drift / 包絡底線 / 對齊 sizeAttenuation / 提高亮度基準）仍
    無法重現已核可的密實沉思感，故回退。
- [ ] B5-2 替代方案（待決定）：不動點雲，於其後**獨立疊一層薄侵蝕曲面**（subdivided plane
  + 頂點噪聲位移，點陣/細線材質），讓「衰敗」由另一元素承載，保留光雲原貌。

---

## 階段 C — v2 成熟化（系統化地基＋兩房落實＋綠收束＋閱讀室＋3D 樂章）

> 依據：DESIGN.md v2。Review 後使用者拍板三方向（暗房圖錄／點雲＋捲動／綠收束），全數實作並驗證。

### C1. 系統化地基（`global.css`）
- [x] C1-1 間距 token（8px 模數 t-shirt：`--space-3xs … --space-5xl`）
- [x] C1-2 字級 token（1.25 大三度：`--step--2 … --step-3` ＋ `--display/--hero-title/--read-size`）
- [x] C1-3 動態 token（`--dur-fast/--dur/--dur-slow`、`--ease-out/--ease`）
- [x] C1-4 暗房平行墨階（`--g-ink-70/45/20`、`--hairline-dark`）
- [x] C1-5 語意表面 token（`--surface/--text/--text-muted/--text-dim/--line/--accent/--header-bg`），亮房為預設

### C2. 兩房落實（語意 token 重映）
- [x] C2-1 `html[data-room="dark"]` 重映語意 token；`Base.astro` 加 `room` prop
- [x] C2-2 元件全面改用語意 token（header/nav/footer/section-head/archive/entry/work/prose/plates/empty/selection/Newsletter）
- [x] C2-3 暗房套頁：首頁、`gallery/index`、`themes/index`、`themes/[slug]`、`post/[slug]`（artwork/gallery）
- [x] C2-4 亮房套頁：`about`、`writings/index`、`post/[slug]`（essay）
- 驗證：首頁/圖錄/作品內頁 `--surface=#0c0c0b`（影像如投影牆發光）；about/essay `=#f4f4f2`（截圖）

### C3. 綠收束（DESIGN §8 白名單）
- [x] C3-1 內文連結退回墨色＋hover 細底線（`.prose a`、essay/contact/theme hover 去綠）
- [x] C3-2 新增 `:focus-visible` 地衣綠聚焦環
- [x] C3-3 閱讀進度條綠填充（亮房長文，`#4f5e44`）
- [x] C3-4 檔案索引「最新 / Latest」標記用綠（首頁最新一件，`#93a47f` 暗底）

### C4. 閱讀室編輯工具箱（essay，對標報導者）
- [x] C4-1 文章頭部加閱讀時間（中文 ~350 字/分估算）
- [x] C4-2 導言（lead）：首段 1.28rem 實墨、行高 1.8（用 `:global` 穿透 PortableText scope）
- [x] C4-3 抽言（pull quote）：`.prose blockquote` 大宋體＋墨色短左線
- [x] C4-4 圖說：`PortableImage` 有 caption 時輸出 `figure/figcaption`；`.prose figcaption` 無襯線小字
- [x] C4-5 章節記號：`.prose hr` 置中短髮絲
- [x] C4-6 閱讀進度條：`Base.astro` 注入 `.read-progress`＋rAF 節流腳本，僅 `[data-read-progress]` 文章啟用
- 驗證：essay 內文 19px/行高 1.85、導言 21.76px、進度條隨捲動填充（截圖）

### C5. 3D 第二樂章（`Hero3D.jsx`）
- [x] C5-1 捲出 hero 時光場下沉/後退加深；白光場較快稀釋（`1 - s·1.15`）
- [x] C5-2 綠光淡得最慢（`1 - s·0.55`），最後消融進圖錄共用的黑——衰敗中的生機延續入暗房
- 備註：採「時間性消融＋暗房共用黑」達成連續性；fixed 背景殘光留待後續（見 B5）。

### C6. 建置與驗證
- [x] C6-1 `npm run build` 通過、15 頁、無警告
- [x] C6-2 dev 視覺驗證：暗房圖錄（首頁/主題/作品內頁）、亮房閱讀（essay）、綠克制、行動裝置（截圖）
- [x] C6-3 無 console error；房間 token 重映、最新綠標、閱讀時間、進度條、導言皆驗證

> **階段 C 全數完成並驗證。** 待續：閱讀室旁註/側欄註腳（C4 進階）、3D fixed 背景殘光（B5）。

---

## 階段 D — v2.2 / v3 藝術融合（觀看的機器）

> 依據：DESIGN.md §8（綠 tier 2）、§13（四層融合）。

### D1. v2.2 收斂與綠調升
- [x] D1-1 標題尺度收斂（display 4.6→3rem、hero 3.4→2.7rem、prose h2 1.4→1.2、essay/entry 標題下修）
- [x] D1-2 綠 tier 2：內文連結綠下緣＋hover 轉綠、nav/meta/圖錄 hover 轉綠、3D 綠光 18→44（行動 10→24）

### D2. 資料精度層（Ikeda・Anadol・Reas）
- [x] D2-1 `lib/signature.js`：FNV-1a+LCG，由 slug 種子產生決定性座標/編碼/頻道
- [x] D2-2 `--font-mono` token、`.data-strip`（綠 `__sig`）
- [x] D2-3 套用：首頁圖錄、影像索引、作品內頁頭部
- 驗證：`−83.6697° −119.5627° 0x3E6B70 CH.0773` 等寬呈現、編碼為綠（截圖）

### D3. 機器視覺準星（Steyerl・Lozano-Hemmer・Paglen ＋ net-art）
- [x] D3-1 `Base.astro` 準星腳本：暗房專屬、游標跟隨（rAF lerp）、hover 作品框選鎖定、隨捲動追蹤
- [x] D3-2 觸控／reduced-motion 不啟用；隨房間切換建立/清理；`.reticle` 綠色四角括弧
- 驗證：lock 展開至 638×687 框住作品、free 26px 跟隨（eval+截圖）

### D4. 綠霧（Turrell・Eliasson・Janssens）
- [x] D4-1 `Hero3D.jsx`：additive 綠霧 plane、極慢呼吸、隨捲動淡出

### D5. 文件與驗證
- [x] D5-1 DESIGN.md §8 tier 2、§13「觀看的機器」四層；PROGRESS 階段 D
- [x] D5-2 `npm run build` 15 頁通過、無 console error

> 待續（v3.1）：掃描線/網格、生成式 per-work 簽名、光的轉場、Rozendaal 式互動著陸。

---

## 變更紀錄
- 2026-06-21：建立重構進度檔，開始階段 A。
- 2026-06-21：階段 A/B 完成。Review 後定 DESIGN v2，完成階段 C（系統化＋兩房＋綠收束＋閱讀室＋3D 樂章）。
