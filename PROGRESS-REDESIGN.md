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
- [x] A4-3 檔案索引「最新／進行中」標記用地衣綠 — **階段 E 解決**（`post.status` 提供語意，wip 綠標落地）

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
- [x] B5-2 替代方案落地（階段 P4・2026-06-25）：不動點雲，於其後**獨立疊一層薄侵蝕曲面**
  ——傾斜 subdivided plane（48×34，行動 28×20）＋ FBM 風頂點噪聲位移、wireframe 細線、
  灰階極淡（`#6b6b66` opacity 0.1）、邊緣沒入場景霧、隨滾動消融。「衰敗」由此元素承載，
  光雲（生機/沉思）原貌完全保留。reduced-motion 只位移一次（靜態侵蝕）；行動降分段。

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

## 階段 E — 內在一致性（資料層半真化）

> 依據：2026-06-23 PM roadmap 討論。拍板：**簽名半真化（路線 A）** ＋ **先動資料層**。
> 目標：讓「觀看的機器」名實相符——有真資料就用真的、缺則 fallback 生成；
> 同時解掉延後的 A4-3（「進行中／最新」綠標需語意資料），並補上下篇／related 動線。
> 不拆 `post`（category 單型維持）；新增欄位皆**選填**，不破壞既有內容。

### E1. Schema 擴充（`../studio-artwork-portfolio/schemaTypes`）
- [x] E1-1 `post.status`：草稿 `draft` / 進行中 `wip` / 完成 `done`（radio，initialValue `done`）— 供 A4-3 綠標
- [x] E1-2 `post.featured`：boolean，首頁／索引置頂用
- [x] E1-3 `post.capture`（object collapsible，選填真實 metadata，餵半真簽名）：
  - `location`、`coordinates`（`geopoint`）、`year`、`gear`、`film`
- [x] E1-4 `theme.cover`（image, hotspot）＋ `theme.order`（number，排序權重）
- [x] E1-5 部署 schema（workaround：`manifest extract` + `schema deploy --no-extract-manifest`，exit 0；`_.schemas.default` 已更新驗證）

### E2. `lib/signature.js` 半真化（DESIGN §13 路線 A）
- [x] E2-1 `archiveSignature(seed, capture)`：有 `coordinates` → 真座標 Ikeda 格式；無 → fallback FNV/LCG
- [x] E2-2 `CH.頻道`：有真 `year` 由 `year:slug` 決定；缺則純生成。`code` 維持機器抽象編碼（恆生成）
- [x] E2-3 回傳 `coordReal` 旗標（內部來源標記，本階段未顯示，留給 Colophon）

### E3. GROQ 查詢補欄位（`lib/queries.js`）
- [x] E3-1 列表共用 `LIST_FIELDS` 加 `status`/`featured`/`capture`；`LIST_ORDER` 精選置頂；列表排除 `draft`
- [x] E3-2 `POST_BY_SLUG` 加 `status`/`capture`/`_id`
- [x] E3-3 related 內嵌進 `POST_BY_SLUG`（同主題、排除自身、`[0...4]`）—— 單次 fetch
- [x] E3-4 上一件／下一件內嵌進 `POST_BY_SLUG`（同分類、publishedAt 相鄰）

### E4. A4-3 綠標落地（DESIGN §8 合法綠，解延後懸案）
- [x] E4-1 首頁／影像集：`status == 'wip'` 顯綠「進行中 / WIP」；「最新」改跟真正最新日期走（精選置頂後 i≠0）
- [x] E4-2 `.entry__wip` 用 `--accent`、tabular-nums、慢呼吸脈動（reduced-motion 停）
- [~] E4-3 wip `__sig` 訊號 —— 暫不做（綠呼吸標記已足夠，避免同視口綠過量）

### E5. related ／ 上下篇（軸 1 補完整度，吃既有美學）
- [x] E5-1 `.post-nav` 上下篇：兩半骨架（grid 1fr 1fr，行動單欄）、量詞依分類、綠色方向箭頭（hover 滑出＋綠線收攏）、無 next 時留空維持對稱
- [x] E5-2 related **依房間分流**：暗房＝縮圖網格（桌機 4／行動 2 欄）；亮房＝編輯式清單（5.5rem 固定 3:2 Sanity 裁切縮圖＋標題＋分類·主題），文字優先、不做照片牆
- [x] E5-3 essay（亮房）走 `.post-nav--essay`：「繼續閱讀 / More」、置中 measure 寬
- 備註：縮圖改 `urlFor().width().height().fit('crop')` 由 Sanity 裁切，保證固定比例＋壓低 payload（修掉原本 CSS object-fit 溢出）。

### E6. 建置與驗證
- [x] E6-1 `npm run build` 通過、15 頁、無新警告
- [x] E6-2 dev 驗證：fallback 生成簽名（−68.97°…）、最新標記、暗房動線（corridor→鏽與苔 related 2 件＋下一件）、亮房動線（uncompletedDreams light room）
- [x] E6-3 無 console error；schema 部署成功

> **階段 E 全數完成並驗證**（2026-06-23）。真實 metadata 待作者回填，回填後簽名自動半真化。
> **待續（後續階段）**：階段 F（光揭示房間轉場＋克制音景＋旁註）、階段 G（series/collection＋Colophon＋Reas per-work 簽名＋侵蝕曲面）。

---

## 階段 F — 感官完成度（光轉場 ＋ 克制音景）

> 依據：DESIGN §13 v3.1 候選（光的揭示轉場）＋ roadmap 軸 4（音效）。
> 原則：聲音＝綠的聽覺對等物——稀少、是「機器還活著」的訊號；暗房有聲、亮房（閱讀）靜默。
> 預設關閉、絕不自動播放、尊重使用者偏好（localStorage）。

### F1. 光揭示房間轉場（Turrell）
- [x] F1-1 `#room-veil` 全屏覆蓋層；`astro:before-swap` 偵測房間切換 → 以目標房間表面色瞬間覆蓋
- [x] F1-2 `astro:after-swap` 揭示：覆蓋層 `--dur` 淡出；亮房目標加徑向 bloom（`#room-veil.is-light` 徑向 gradient）
- [x] F1-3 `prefers-reduced-motion`：跳過覆蓋，維持乾淨瞬切；同房間導覽不觸發

### F2. 克制音景（WebAudio，無音檔・程序生成）
- [x] F2-1 暗房底噪：低頻失諧振盪堆疊（55/55.4/82.5/110.3Hz）＋lowpass＋極慢 LFO 呼吸；極低增益（~0.05）
- [x] F2-2 房間感知：暗房淡入、亮房（閱讀）淡至 0——閱讀靜默
- [x] F2-3 準星鎖定音：reticle lock 時短促對焦 blip（解耦——監聽 `reticle:lock` 事件；放映翻頁亦派發）
- [x] F2-4 聲音開關：暗房 header 專屬按鈕；預設關、`aria-pressed`、綠＝啟用（合法綠）
- [x] F2-5 自動播放政策：預設不播；若曾啟用，於首次使用者手勢 resume；持久化 localStorage

### F3. 旁註 / 側欄註腳（C4 進階）—— 待設計決策
- [~] F3 暫緩：需先決定型式（側欄 margin note vs inline 展開）與 schema 註解型別；F1/F2 後單獨一輪。

### F4. 建置與驗證
- [x] F4-1 `npm run build` 通過、15 頁、無新警告
- [x] F4-2 dev 驗證：暗↔亮轉場光揭示、底噪暗房淡入/亮房靜默、準星音、開關持久化、reduced-motion

> **階段 F（F1/F2/F4）完成並驗證**（2026-06-24）。F3 旁註仍暫緩。

---

## 階段 G — 影像觀覽（顯影地基 ＋ 放映模式）

> 依據：2026-06-24 PM roadmap 軸 3（影像/沈浸）。參考 Gagosian/Crewdson（滿版單格）、
> Porodina（翻頁序列）、Jack Davison（編號）。原則：沈浸來自**滿版黑＋顯影＋序列**，
> 不靠華麗特效——克制即美學。攝影站核心體驗補成熟。

### G1. 顯影地基（P1・修真實效能 ＋ 暗房隱喻）
- [x] G1-1 GROQ 影像投影 `IMG` 片段：`cover` / `gallery[]` 展開 `asset->{_id, metadata{lqip, dimensions}}`
- [x] G1-2 共用 `Plate.astro`：lqip 模糊底 → 載入後 crossfade 顯影；收斂原本 5 處重複的 `<img>` 標記
- [x] G1-3 `width/height`（杜絕 CLS）＋ `srcset/sizes`（響應式、不放大超過原圖）＋ `decoding=async`
- [x] G1-4 `.plate/.plate__img` 顯影 CSS（`--dur-slow` crossfade，reduced-motion 停）；`develop()` 腳本含已快取 `complete` 情況、撐過 view transition
- [x] G1-5 套用：首頁、影像集、作品內頁（work cover / essay cover / gallery 組圖）；移除頁面未用的 `urlFor`
- 驗證：HTML 確認 `--lqip` base64 底、`aspect-ratio`、`width/height`、`srcset`（1024 圖只到 1024w）；預覽顯影正常、零 CLS、無 console error

### G2. 放映模式（P2・觀看儀器）
- [x] G2-1 `Lightbox.astro` 重寫為 `.pjx` 滿版暗場：序列＝整頁 `img.zoomable`（DOM 序）
- [x] G2-2 翻頁：鍵盤 ←/→、左右邊熱區、觸控左右滑；循環不卡死
- [x] G2-3 底部標籤：計數 `NN / TT`（mono tabular）＋ 機器簽名（複製當頁 `.work__data`，綠 code 保留）＋ 逐圖圖說
- [x] G2-4 顯影轉場：先放已快取縮圖（模糊遮蔽切換）→ 背景載入 `data-full` 後轉銳利
- [x] G2-5 四角綠括弧「擷取」動畫：每格落定 snap-in（凝視母題；自成一格、不耦合全站準星，避開 z-index 戰爭）
- [x] G2-6 點圖放大 2×＋游標平移看細節；點暗場/Esc 關閉；body 捲動鎖定；單圖頁 `data-single` 隱藏翻頁與計數
- [x] G2-7 快門音：每格落定派發 `reticle:lock`（音景模組響 blip）
- [x] G2-8 健壯性：開啟判定改綁同步的 `aria-hidden`（非 rAF 後才上的 `data-open`）——開啟即可操作，不受繪製時機影響
- 驗證：`npm run build` 15 頁通過、無新警告；預覽翻頁/鍵盤/縮放/關閉/計數/簽名/圖說/顯影全正常、綠 code rgb(147,164,127)、零 console error

> **階段 G 全數完成並驗證**（2026-06-24）。
> **待續**：階段 H（series/collection 序列 ＋ 真 EXIF/GPS 簽名），把放映的「序列」接上資料層。

---

## 階段 H — 序列與真實 metadata（series ＋ 真 EXIF/GPS）

> 依據：2026-06-24 PM roadmap P3。把放映模式（階段 G）的「序列」接上資料層，
> 並讓「觀看的機器」從半真走向真——有 EXIF/GPS 就用真的。

### H1. 系列 / 組曲 schema（`../studio-artwork-portfolio`）
- [x] H1-1 `series.ts`：title／slug／description／cover／**works[]（拖曳排序的 post 參照）**／order
- [x] H1-2 註冊進 `schemaTypes/index.ts`
- 設計：series＝策展順序（有序、一對多動線），與 theme（語意標籤、無序、多對多）區隔
- [ ] H1-3 部署 schema —— **待使用者執行**（agent 無權限做正式後端部署）。
  manifest 已 extract（exit 0）；待跑 `npx sanity schema deploy --no-extract-manifest`

### H2. 系列查詢與頁面（`lib/queries.js`、`pages/series/`）
- [x] H2-1 `SERIES_LIST`／`SERIES_BY_SLUG`（保留拖曳順序、排除草稿）／`SERIES_SLUGS`
- [x] H2-2 `POST_BY_SLUG` 反查所屬系列＋序列 slug（供「系列 · 第 N / M」）
- [x] H2-3 `/series/index.astro`（暗房索引，Plate 顯影封面）＋ `/series/[slug].astro`（編號序列動線，綠編號）
- [x] H2-4 Base 導覽加「系列」＋ `activeSection: 'series'`；作品內頁標頭顯示所屬系列與位置
- 驗證：build 16 頁通過、無警告；`/series` 空狀態與 nav active 正常；post 頁 seriesInfo 為 null 時不崩

### H3. 真 EXIF/GPS 簽名（`signature.js`、schema、`IMG`）
- [x] H3-1 post `cover` 影像 `options.metadata` 加 `exif`+`location`（保留 lqip）
- [x] H3-2 `IMG` GROQ 片段補 `metadata.location` ＋ `exif{ISO,FNumber,ExposureTime,FocalLength,DateTimeOriginal,LensModel}`
- [x] H3-3 `archiveSignature(seed, capture, assetMeta)` 優先序：**手填 capture ＞ 封面 EXIF/GPS ＞ slug 生成**；回傳解析後 `year`
- [x] H3-4 首頁／影像集／作品內頁傳入 `cover.asset.metadata`
- 驗證：node 三情境確認（生成／EXIF 真座標 2023／手填覆寫）；現有無 EXIF 圖維持生成值、`code` 恆定（向後相容）

> **階段 H 完成（H1-3 schema 部署待使用者）**（2026-06-24）。真 EXIF 圖回填後簽名自動轉真。

---

## 階段 I — 工程地基整固（PM roadmap 軸 2：可維護性 ＋ 手機/平板）

> 依據：2026-06-25 PM roadmap。原則：零視覺變更的物理重組（I1/I2）＋ 修真實響應式缺陷（I3）。
> 唯一安全網＝視覺/行為等價，皆以 preview 工具量測，非肉眼喊「看起來對」。

### I1. `global.css` 1016 行單檔 → CSS `@layer` 模組化
- [x] I1-1 拆成 `src/styles/layers/{tokens,base,layout,components,machine,media}.css`，
  `global.css` 改為 barrel：`@layer` 層序宣告 ＋ 純 `@import`（避開 Vite `@import layer()` 風險）。
- [x] I1-2 層序＝原始碼區塊順序（cascade layer 優先於 specificity，故須對齊）；逐節搬移、
  不改任何 selector/值；全域 reduced-motion `!important` 區塊刻意留在所有層之外（壓過一切）。
- 驗證：`npm run build` 17 頁無警告；打包後 CSS 確認層序宣告＋六層依序＋`@import` 全 inline；
  暗房（首頁 hero/archive/data-strip）與亮房（about 紙底/墨字/綠 active/半粗標題）視覺等價、零 console 錯誤。

### I2. `Base.astro` 6 段 inline script（~370 行）→ `src/scripts/*.ts` 模組
- [x] I2-1 抽成 `reveal/develop/read-progress/reticle/room-veil/audio.ts`，各 export `init()`；
  `scripts/index.ts` 依原順序統一初始化；Base.astro 末尾改單一 `import '../scripts'`（486→121 行）。
- [x] I2-2 邏輯一字不改、只搬家；保留各自「初次執行＋重綁 `astro:*` 事件」的時機。
- 驗證：6 行為皆通過——reveal（元素居中時顯影）、develop（plate 3/3 is-loaded）、
  read-progress（捲到底填滿 100%）、reticle（**跨 view-transition 導覽**建立/移除/重建）、
  room-veil（暗↔亮房間切換）、audio（邏輯相同、sound-toggle 反映狀態）；零 console 錯誤。

### I3. 響應式三斷點驗證（375/768/1440）＋ 修真實缺陷
- [x] I3-1 **修真實手機缺陷**：375 寬下 6 導覽項＋聲音開關擠在單行 flex，每個 2 字標籤被壓成
  上下兩字（作/品，15×41px）。修法（`layout.css`）：`.nav a { white-space: nowrap }` ＋
  窄屏（≤560px）`.site-header__inner` 換兩列（brand 一列、導覽組另起一列靠左、縮 gap）。
- [x] I3-2 驗證：375 nav 標籤恢復單行（28×22px）、brand 單行、無水平溢出；
  768 平板維持單列 header（63px、無溢出）；手機 essay 長文無溢出、內文 19px/行高 35.2px、measure 335px。
- 備註：reticle 在 `pointer: coarse` 不啟用之邏輯未動（headless 預覽不模擬 coarse pointer，沿用既有判斷）。

> **階段 I 完成並驗證**（2026-06-25）。地基可持續擴建，手機導覽缺陷解除。

---

## 階段 J — 互動作品執行時（Works Runtime・PM roadmap 軸 1 核心）

> 拍板：作品 IA **併入現有「作品」流**；**收編 Hero3D 進 runtime ＋首發原生 WebGL Shader**。
> 關鍵後果：runtime 同時支援 vanilla（shader）與 React/R3F 兩種掛載 → React 降格為
> 「眾引擎之一」、且**按需動態載入**，正面回應「React+Astro 只是表面結合」的疑慮。

### J0. 引擎無關的掛載契約 ＋ registry ＋ 載入器
- [x] J0-1 `src/sketches/types.ts`：`SketchModule.mount(host, ctx) → SketchInstance{pause/resume/destroy}`；
  `ctx` 帶 reducedMotion / mobile / dpr / params / 全站 scroll ref。
- [x] J0-2 `src/sketches/registry.ts`：`id → () => import()` 動態匯入表（加作品＝加一行＋一檔）。
- [x] J0-3 `src/scripts/sketches.ts` 載入器：IntersectionObserver 進視口才下載＋掛載；離屏 pause；
  `astro:before-swap` 全銷毀（釋放 WebGL context）；維護全站捲動 ref；`window.__sketchRuntime` 暴露狀態。
- [x] J0-4 `src/components/Sketch.astro`：渲染 `[data-sketch]` 容器＋封面 fallback（無 JS/掛載前）。
- 驗證（**實測非表面**）：drift-light 進視口→running＋canvas、**離屏 pause→`__driftFrames` 停增（rAF 確停）**、
  捲回 resume→frames 恢復、**導覽離開→canvas 歸零＋runtime 清空（destroy 生效、無洩漏）**。

### J1. Schema：`sketch` 文件型別（`../studio-artwork-portfolio`）
- [x] J1-1 `sketch.ts`：title/slug/engine(shader|r3f)/sketchId(對 registry)/params(kv)/cover(metadata)/
  capture/aspectRatio/status/featured/themes/description；註冊進 `index.ts`。
- [ ] J1-2 部署 schema —— **待使用者執行**（agent 無後端部署權限，沿用階段 H 慣例）。
  workaround：`manifest extract` → `npx sanity schema deploy --no-extract-manifest`。

### J2. 查詢合流（`lib/queries.js`）
- [x] J2-1 `WORKS_FEED`：post(artwork)＋sketch union，依精選/日期混排、排除草稿、帶 `_type`。
- [x] J2-2 `SKETCH_BY_SLUG`（含 related：post＋sketch 同主題）、`SKETCH_SLUGS`。
- 驗證：無 sketch 內容時 `WORKS_FEED` 向後相容（首頁仍顯 3 件 artwork、連 /post、零 LIVE 標記）。

### J3. 頁面
- [x] J3-1 `index.astro` 改用 `WORKS_FEED`；sketch 條目 `_type` 分流連 /sketch、data-strip 顯引擎 `▸ENGINE`、
  克制 dim「互動 / LIVE」標記（非綠，綠留給狀態）。
- [x] J3-2 `sketch/[slug].astro`（暗房）：標頭＋簽名 colophon（引擎綠標）＋全幅 `<Sketch>` 舞台＋描述＋related。
- 驗證：以 mock 注入 getStaticPaths 端對端渲染真實模板——標題/▸SHADER 引擎綠標/簽名資料條/媒材/
  shader 舞台 running/暗房皆正常；驗畢移除 mock。

### J4. Hero3D 收編 ＋ 首發 shader 作品
- [x] J4-1 `src/sketches/light-field.tsx`：Hero3D（一字不改）以 createRoot 掛載；React/R3F **按需動態載入**
  （只有 R3F 作品掛載時才下載 react）。首頁 hero 由 `<Hero3D client:only>` 改為 `<Sketch sketchId="light-field" variant="hero">`。
- [x] J4-2 `src/sketches/drift-light.ts`：原生 WebGL FBM 光場＋一粒綠＋（hero 才）隨捲動消融，作者可複製範本。
- 修真實設計問題：drift-light 的 `u_scroll` 消融＝hero 專屬，inline 中段會整片變黑 → 改 `params.dissolve` 控制（預設關）。
- 修真實 dev 問題：R3F 經島機制外動態載入觸發 `@vitejs/plugin-react preamble` 錯 → mount 前補 preamble 旗標 stub（僅 dev）。
- 驗證：hero 點雲視覺等價（截圖）、`light-field` running；shader 桌機/手機渲染、reduced-motion 凍結、零 console 錯誤。

### J5. 簽名整合
- [x] J5-1 sketch 共用 `archiveSignature(slug, capture, cover.metadata)`（核心不改）；data-strip 增 `▸ENGINE`。

> **階段 J 完成（J1-2 schema 部署待使用者）**（2026-06-25）。部署＋建 sketch 文件後，
> 生成式作品自動出現在作品流並有 /sketch/[slug]。作者新增作品＝registry 加一行＋一個模組＋Studio 建一筆。

---

## 階段 K — 感官／閱讀完成度與無障礙

> 依據：PM roadmap 軸 2／DESIGN §7（旁註）／v3.1（Reas per-work 簽名）。

### K1. 旁註／側欄註腳（解 F3 暫緩案）
- [x] K1-1 Schema：`post.body` block 加 `sidenote` annotation（`note` 文字）。
- [x] K1-2 序列化器 `Sidenote.astro`：被標記文字 inline＋自動編號；註解桌機（≥1180px）浮於 measure
  右側頁邊（`.prose` 為定位脈絡、top auto 維持參照行垂直位置）、窄屏 inline 縮排左線。
  注：astro-portabletext 的 mark 註解資料在 `node.markDef.note`（與內建 link 的 `markDef.href` 同）。
- [x] K1-3 註冊進 post（essay/artwork/gallery）與 sketch description 的 PortableText。
- 驗證：mock 注入確認雙模式——桌機浮註（absolute、left 1011 > prose 右緣 980、無溢出）、
  手機 inline（static、左線、無溢出）、編號與綠標號正常；驗畢移除 mock。
- [ ] K1-4 部署 schema annotation —— **待使用者執行**（與 J1-2 同批）。

### K2. 放映模式無障礙（`Lightbox.astro`）
- [x] K2-1 focus trap（Tab 循環鎖在對話框內、自背景拉回）、開啟移焦關閉鈕、Esc 關閉。
- [x] K2-2 關閉還焦觸發元素；無有效來源（點圖開啟、img 不可聚焦）則 blur，使焦點離開 aria-hidden 對話框。
- 驗證：開啟→focus 關閉鈕；焦點逃到背景連結→Tab 拉回對話框；Esc→關閉＋焦點離開隱藏對話框（BODY、不在 dialog 內）。

### K3. per-work 生成式視覺簽名（Reas）
- [x] K3-1 `lib/glyph.js`：FNV-1a＋LCG 由 slug 種子產生決定性「感測軌跡」SVG（線條＋節點，一粒走 `--accent` 綠）。
- [x] K3-2 套用作品內頁標頭 colophon（artwork/gallery/sketch），`.glyph/.glyph__live` 樣式（machine 層）。
- 驗證：node 確認同 slug→同 SVG、不同 slug 相異、綠節點；作品頁渲染綠活節點 rgb(147,164,127)、5 節點、靜態。

> **階段 K 完成（K1-4 schema annotation 部署待使用者）**（2026-06-25）。

---

## 階段 N — 展演分化（PM roadmap 軸 1：每頁體驗對齊資料格式）

> 依據：2026-06-25 PM roadmap。拍板起點＝階段 N（軸 4「遷徙的那一粒綠」留待階段 O）。
> 原則：不加頁，讓既有四頁各自找到「只屬於它資料形狀」的展演語言。
> 同步更新 DESIGN（§14 響應式骨架、§15 影像觸控契約、v4 決策）。

### N1. about → CV 時間軸（資料本質就是時間）
- [x] N1-1 `about.astro`：移除「依類別扁平分組清單」，改攤平成單一時間脊、依年份遞減；
  類別降為每筆微標（`cvTimeline` + `yearOf` 解析開頭四位數年份排序）。
- [x] N1-2 時間軸視覺：年份只在與上一筆不同時顯示一次（錨點）、節點＋髮絲縱脊、
  **最新一筆＝綠活節點＋極慢呼吸**（DESIGN §8 合法綠／生命跡象，呼應 3D 那一粒綠光）；reduced-motion 停脈動。
- 驗證：桌機＋手機（375）——4 筆 2023–2026 遞減、2026 綠節點 `rgb(79,94,68)=--life`、零溢出、無 console 錯誤。

### N2. 影像集 → 印樣（contact sheet）
- [x] N2-1 `gallery/index.astro`：由與首頁共用的 `.entry` 單欄，改為 `.contact-sheet` 統一 3:2 格——
  「影像＝複數的一捲」對比「作品＝單一的一張」的分化。響應式階梯 **1 欄（直幅手機）／2 欄（≥560）／
  3 欄（≥980）**：手機優先清晰、密排是平板/桌機的展演（DESIGN §14.2）。
- [x] N2-2 每格＝Plate 約束成 3:2 cover（覆寫內聯 aspect-ratio，範圍鎖在印樣格內；裁切僅用於索引縮圖，
  同 post-nav 慣例，主呈現不裁切在詳情頁成立）；膠捲編號「格 NN」(mono)、WIP 綠標、Ikeda 簽名條保留。
- 驗證：1280 桌機 3 欄 349px、768 平板 2 欄、手機**單欄 295×197**（修：原 2 欄 139×93 照片太小、簽名擠成 3 行 →
  單欄後簽名收成 2 行）皆零溢出；簽名碼／WIP 綠 `rgb(147,164,127)=--life-dark`；develop 顯影正常、無 console 錯誤。

### N3. 作品 artwork → 單格敬畏（與影像集序列分化）
- [x] N3-1 artwork 封面置中＋四周大留白（`max-width: min(100%, 62rem)`、margin auto、上下加大）＝
  掛在暗牆上的單一印樣（Crewdson 滿版敬畏 × 美術館留白）；用 Astro `:global` 穿透 Plate 的 `.work__cover`。
- [x] N3-2 陳述（`.artwork-statement`）置中於 measure；附圖改 `<section class="artwork-plates">`＋
  髮絲標頭「其他視圖 / Other Views」、降格更小更安靜、**刻意不編號**（編號是影像集序列的語言）。
- 驗證：1280 桌機封面 1054px 置中（cx=640）、陳述 680 置中、暗留白框住；手機 335 填滿、零溢出；
  顯影完成（is-loaded、naturalW 1280）、無 console 錯誤；build 17 頁通過。附圖區塊條件渲染（現有測試內容無 gallery[] 故不顯，邏輯正確）。

### N4. series → 放映原生 —— 待續（吃 H1-3 schema 部署）
- [ ] N4 `/series/[slug]` 序列接上放映模式，成為真正的「序列觀看」動線；目前 series 內容為空（schema 待部署）。

> **階段 N（N1/N2/N3）完成並雙端驗證**（2026-06-25）。N4 待續——需先部署 series schema（H1-3）。

---

## 階段 L — 影像觸控修誤觸（PM roadmap 軸 3）

> 依據：DESIGN §15 影像觸控契約。修真實缺陷：手機放映「點暗場即關／邊緣熱區疊在影像上／
> 點影像即縮放」三重誤觸。原則：coarse pointer 改用明確手勢消歧，fine pointer 行為一字不動。

### L1. 取消觸控「點暗場關閉」＋手勢消歧（`Lightbox.astro`）
- [x] L1-1 click handler 加 `coarse()` 閘：觸控下 zoom／關閉一律不靠 click（避免誤觸）；
  fine pointer 維持「點影像縮放、點暗場關閉、邊緣 nav 翻頁」原狀。
- [x] L1-2 touchstart/move/end 手勢：位移＋時間消歧——單 tap（<10px、<250ms）切底部 chrome 顯隱
  （純淨影像 ↔ 看資料，280ms 延後確認避開雙擊）；double-tap 縮放；水平滑（>40px）翻頁；
  向下拖曳（跟手位移＋暗場漸淡，>90px）關閉、未過閾值彈回。
- [x] L1-3 `.pjx { touch-action: none }` 接管手勢、擋原生捲動／下拉刷新；拖曳殘留 `resetDrag()` 復位。

### L2. 命中區、邊緣熱區、安全區（`media.css`・DESIGN §14.3）
- [x] L2-1 coarse 隱藏左右邊緣 `.pjx__nav`（與影像重疊易誤觸）；改在底部 chrome 顯明確翻頁鈕
  `.pjx__steps`（≥44px、僅 coarse 且非單圖）。
- [x] L2-2 close ≥44px 命中區（透明 padding 擴張、視覺維持小字）＋ close／chrome 加 `env(safe-area-inset-*)`。

### L3. 房間一致（DESIGN §15 point 4）
- [x] L3-1 亮房（about 肖像／essay 封面）影像進 `.pjx--light` 安靜亮場放映：亮底、
  無綠括弧／無機器簽名／無快門音（閱讀不被監視，呼應 §13）；暗房影像走完整機器放映。

### L4. 驗證
- [x] L4-1 `npm run build` 17 頁通過、無警告、無 console 錯誤。
- [x] L4-2 合成 TouchEvent 實測手勢（暗房 /post/light-scales 4 圖）：水平滑 01→02、向下拖 140px 關閉、
  單 tap 切 chrome（再 tap 復原）、double-tap 縮放；fine pointer 回歸測試：點影像 zoom on→off、
  邊緣 next 翻頁、點暗場關閉皆原狀；about 開啟 `pjx--light`（亮底、括弧/簽名隱藏）、close 命中區 44px。
- 註：coarse-only 視覺（底部翻頁鈕顯示／邊緣 nav 隱藏）在 headless 預覽無法模擬 pointer 型別截圖，
  但手勢邏輯（與 pointer 無關、合成事件實測）與 `@media (pointer: coarse)` 閘皆已驗證。

> **階段 L 完成並驗證**（2026-06-25）。手機放映三重誤觸解除；fine pointer 零回歸。

---

## 變更紀錄
- 2026-06-21：建立重構進度檔，開始階段 A。
- 2026-06-21：階段 A/B 完成。Review 後定 DESIGN v2，完成階段 C（系統化＋兩房＋綠收束＋閱讀室＋3D 樂章）。
- 2026-06-23：PM roadmap 討論定四軸；拍板簽名半真化（路線 A）＋先動資料層。完成階段 E（schema status/featured/capture＋theme cover/order、半真簽名、related/上下篇、wip 綠標、A4-3 解決）。
- 2026-06-24：完成並結案階段 F（光揭示轉場 F1／克制音景 F2，先前已實作未提交）。PM roadmap 軸 3 落地：階段 G（顯影地基 Plate＋放映模式 Projection），參考 Crewdson/Porodina/Davison。
- 2026-06-24：階段 H（series 序列 schema＋頁面＋導覽；真 EXIF/GPS 簽名半真化升級）。schema 部署待使用者執行。
- 2026-06-25：PM roadmap 軸 2 落地：階段 I（global.css `@layer` 模組化＋Base.astro script 抽模組＋手機導覽缺陷修復），零視覺回歸、6 行為等價驗證。
- 2026-06-25：PM roadmap 軸 1 核心落地：階段 J（互動作品執行時——引擎無關契約＋registry＋載入器＋Sketch 元件；Hero3D 收編進 runtime、首發原生 shader；WORKS_FEED 合流；sketch schema/頁面）。生命週期以實測驗證。schema 部署待使用者。
- 2026-06-25：階段 K（旁註 sidenote 序列化器＋雙模式；放映 focus trap 無障礙；Reas per-work 生成式 glyph 簽名）。I/J/K 三階段全數實作並驗證；待使用者部署 sketch＋sidenote schema。
- 2026-06-25：PM roadmap 重訂四軸並更新 DESIGN（§14 響應式骨架／§15 影像觸控契約／v4 決策）。軸 1：階段 N（N1 about CV 時間軸＋N2 影像集印樣＋N3 作品單格敬畏），雙端驗證；N2 手機改單欄並修 `<ol>` 預設 padding 右偏。軸 3：階段 L（影像觸控修誤觸——coarse 取消點暗場關閉、tap/雙擊/滑動/拖曳消歧、邊緣熱區改底部翻頁鈕、44px 命中區、亮房安靜放映），合成事件實測手勢、fine pointer 零回歸。N4 series 放映原生待 schema 部署。

---

## 階段 v2 — 一體性 ＋ 可控迭代（依 [ROADMAP-v2.md](ROADMAP-v2.md)）

> 脊椎：對外讓全館連成一個連續的身體（甲線 G）／對內立護欄使迭代可控（乙線 E）。
> **原則：E 系列（護欄）先於 G 系列（一體性），因為一體性工作落在最脆弱的全域過場上。**

### E4. 「完成」的定義（DoD）— 每筆改動收工前必過
觀者面四問（v1 §三）之外，補三條專治「只做一半／改了沒套用」：
- [ ] **兩房都看過了嗎？**（暗房 dark + 亮房 light，token 重映正確）
- [ ] **手機都看過了嗎？**（390 寬，不只桌機 1440）
- [ ] **是「導覽過去」再看的，不只是 reload？**（ClientRouter view-transition 換頁後才看得到的塌陷，reload 看不到）

### E6. VT 脆弱性根治原則（架構法律・踩過三次的坑）
**法律**：任何觸及 **grid 軌道／欄寬**的版面樣式，一律放**全域 `@layer`（components/layout）**；頁級 scoped `<style>` 只放不影響軌道的微調。
- **根因**：Astro ClientRouter view-transition 換頁後，頁級 scoped 樣式會短暫失效；若該樣式定義 grid 軌道，元素退回吃全域 `.grid-12` 的 `repeat(12,1fr)`，在 VT 不確定寬度下塌成一字寬（中文圖說/編號直排）。見記憶 vt-grid-cjk-collapse。
- **加固**：軌道用固定長度 `min`（`minmax(8rem, …)`）而非純 `1fr`——固定 min 不依賴容器寬度，VT 下永遠有寬。gallery 版面（components.css `.gallery-item`）已是範本。
- **既有風險點**：`about.astro` 頁級 `grid-template-columns: 4rem 1fr`（首軌固定 4rem，理論上受保護，但仍違背法律字面）→ 待 E2 lint 掃出後評估下沉。
- **守門**：由 E2 stylelint 規則「頁級 scoped 禁 grid-template」持續攔截。

### E1. 視覺回歸護欄（Playwright）— 已落地
- `@playwright/test` ＋ [playwright.config.ts](playwright.config.ts)：跑在 **production build（astro preview）** 而非 dev（無 HMR／無 dev 動態 import 延遲＝決定性高）。桌機 1440 ＋ 手機 390（Pixel 5），reducedMotion=reduce。
- 矩陣：[tests/visual.spec.ts](tests/visual.spec.ts)（11 頁型 × 2 視口，斷言 data-room）＋ [tests/navigation.spec.ts](tests/navigation.spec.ts)（**VT 護欄**：從首頁「點導覽過去」換頁後才快照，攔截只在 ClientRouter swap 後現形的塌陷）。共 32 快照。
- 穩定性：3D canvas mask；[tests/_helpers.ts](tests/_helpers.ts) settle（等 load→強制載宋體兩字重消 fallback 競態→預捲觸發 lazy 圖→等 img 解碼，皆帶逾時護欄）。
- **連帶修真 bug**：[Hero3D.jsx](src/components/Hero3D.jsx) reduced-motion 下改 `frameloop='demand'`（畫一幀即停）——兌現 DESIGN §4.5「停止所有動畫」，先前只是每幀畫同樣的東西、引擎沒停。
- 指令：`npm run test:visual` / `:update`。baseline 入 `tests/__screenshots__/`；說明見 [tests/README.md](tests/README.md)。兩次連續乾淨執行皆 32 passed（決定性確認）。

### E2. 設計契約 lint — 已落地
- [tools/lint-design.mjs](tools/lint-design.mjs)（`npm run lint:design`）：**ERROR**＝CSS/.astro 出現地衣綠字面值（DESIGN §4.1 唯一不可退讓約束，鎖死「綠經 --accent」）；**WARN**＝tokens.css 外裸色號（§8.2 債）＋頁級 <style> 的 grid 軌道（E6 候選）。3D 綠（Three.js 介質）刻意不掃。
- 現況：0 error、18 warn（綠已乾淨；18 為既有維護債，擇期清）。

### E3. 行為腳本生命週期契約 — 已落地
- [src/scripts/lifecycle.ts](src/scripts/lifecycle.ts) `onPage(fn)`：初次（DOM 就緒即跑）＋ astro:after-swap 重綁；刻意用 after-swap（不在初次觸發）避免與直接呼叫雙跑。
- reveal/develop/read-progress/reticle/audio 五支統一改走 onPage（原本 after-swap 與 page-load 混用）。委派監聽仍一次性綁定。room-veil/sketches 為轉場／懶掛載特例（已於 lifecycle.ts 註明豁免）。
- 順手修 read-progress 換頁累積 window 監聽的洩漏（重綁前移除舊 handler）。

### G1. 三入口釐清（給框架，非收斂）— 已落地
- [RoomNav.astro](src/components/RoomNav.astro)「三道門指路」：作品／影像／系列彼此看得見、標當前、空房門不出現（NAV_COUNTS）。首頁／影像／系列索引各加策展 lede（單張／一捲／排序動線的身分句）＋ wayfinder。`.section-head__lede`/`.section-cross` 在全域 layout 層（E6 合規）。

### G2. 連續的暗 — 已落地
- 結構上 `html{background:var(--surface)}` 隨 data-room 重映、暗房間 --surface 不變＝無白閃（nav 測試證實）。補 `<meta name="theme-color">` 依房間，延伸連續到瀏覽器 chrome。

### G3. 空房尊嚴 ＋ 隱藏空房 — 已落地
- [Base.astro](src/layouts/Base.astro) 依 NAV_COUNTS 條件隱藏 影像／系列／散文（當前房間例外，避免 aria-current 指向不存在門）；現況 series 空 → 系列退出大廳、僅在 /series 自身顯示。
- 空狀態文案全改館的語氣（首頁／影像／系列／散文／主題的「還沒…在那之前…」），棄 App 式「到 Studio 新增」。

### G4. 統一過場「顯影即移動」— 已落地
- [Plate.astro](src/components/Plate.astro) 加 `transitionName` → 外層 .plate 掛 `transition:name`。首頁／影像索引縮圖 ↔ 內頁封面（essay/gallery/artwork 三分支）以 `cover-${slug}` 配對，換頁時瀏覽器 morph。reduced-motion 下退回直切。驗證 build 後 home 與 detail 同名輸出、無 undefined 外洩。

### G5. 綠一致性審計 — 已落地
- 逐項核對白名單（focus 環／aria-current／進度條／reticle／glyph 節點／wip/latest／內文連結／sidenote／新 wayfinder）皆走 var(--accent)。唯一直用 --life-dark 的 reticle（[machine.css](src/styles/layers/machine.css)）改 --accent（暗房限定，值相同，零視覺變化）→ 全站每一處 CSS 綠皆經單一語意 token。E2 lint 持續守住。

> **階段 v2 全數實作並以 E1 護欄驗證**（2026-06-28）。脊椎兌現：對外連續的身體（G4 顯影移動／G2 連續暗／G1 三門指路／G3 空房尊嚴），對內護欄（E1 視覺回歸／E2 綠契約／E3 生命週期／E4 DoD／E6 VT 法律）。
