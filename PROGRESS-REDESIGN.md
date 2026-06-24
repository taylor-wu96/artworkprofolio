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

## 變更紀錄
- 2026-06-21：建立重構進度檔，開始階段 A。
- 2026-06-21：階段 A/B 完成。Review 後定 DESIGN v2，完成階段 C（系統化＋兩房＋綠收束＋閱讀室＋3D 樂章）。
- 2026-06-23：PM roadmap 討論定四軸；拍板簽名半真化（路線 A）＋先動資料層。完成階段 E（schema status/featured/capture＋theme cover/order、半真簽名、related/上下篇、wip 綠標、A4-3 解決）。
- 2026-06-24：完成並結案階段 F（光揭示轉場 F1／克制音景 F2，先前已實作未提交）。PM roadmap 軸 3 落地：階段 G（顯影地基 Plate＋放映模式 Projection），參考 Crewdson/Porodina/Davison。
- 2026-06-24：階段 H（series 序列 schema＋頁面＋導覽；真 EXIF/GPS 簽名半真化升級）。schema 部署待使用者執行。
