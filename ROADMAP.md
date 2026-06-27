# ROADMAP — 讓儀器通上電

> **產品迭代藍圖 v1**（2026-06-27）
> 配套：[DESIGN.md](DESIGN.md)（視覺設計）／[PROGRESS-REDESIGN.md](PROGRESS-REDESIGN.md)（工程落地）／[`.agents/skills/Design.md`](.agents/skills/Design.md)（母文件通則）
> 受眾：同時是這座美術館的**策展人**、**視覺設計師**、與**工程師**——這三個身分是同一個人。

---

## 〇、為什麼需要這份文件

[DESIGN.md §8.3](DESIGN.md) 已經誠實地下了結論：

> **「當前真正的風險不是設計系統本身，而是『骨架比肉身豐富』——工程的地基比內容填充走得更快。」**

這份 roadmap 把那句話翻成行動。它的脊椎只有一句：

> **讓作品更被看見、降低上稿的摩擦、深化觀看的儀器。拒絕新增子系統（功能劇場）。**

我們已經造好了一台精密的觀看機器——放映模式、顯影、準星、資料條、兩房系統。**但這台機器目前在空轉**：影像集內容稀、EXIF 抽了不顯、兩個策展軸搶導覽位、分享出去是裸連結。所以本藍圖的順序是刻意的——**先做減法（收斂），再通電（深化），最後才談擴張**。

每一個項目都用三個視角審視，缺一不可：

- **🎨 藝術／設計目標** — 這件事讓觀者**感覺**到什麼？它服務「光・門檻・衰敗」的哪一面？
- **🧭 UIUX 細節** — 觀者的手指與視線實際怎麼移動？哪裡該安靜、哪裡該有訊號？
- **🔧 工程實作** — 動哪些檔、依賴什麼、怎麼驗收。

> **給未來的自己一句提醒**：當你只剩下工程的語言時，回到 §0 重讀一次。你不是在實作 feature，你是在替一座會衰敗的美術館調整燈光。每一個 commit 都該讓某一張照片更被凝視——否則它不該存在。

---

## 一、現況盤點（基準線）

寫 roadmap 前，先把「已經有什麼」記成白紙黑字，避免重造輪子。

### 1.1 資訊架構（IA）

主導覽六項（[Base.astro](src/layouts/Base.astro)）：

```
作品 /          影像 /gallery   系列 /series
散文 /writings  主題 /themes    關於 /about
```

### 1.2 資料模型（Sanity，[studio-artwork-portfolio/schemaTypes](../studio-artwork-portfolio/schemaTypes)）

| 型別 | 角色 | 關鍵欄位 |
|---|---|---|
| `post` | 作品／影像集／散文（三合一） | `category`(artwork/gallery/essay)、`status`、`featured`、`cover`、`capture`、`themes[]→`、`gallery[]{image,caption}`、`body`(PortableText+sidenote) |
| `theme` | 語意標籤（多對多、無序） | title、slug、description、cover、order |
| `series` | 策展序列（有序、zine 動線） | title、slug、description、cover、`works[]→`、order |
| `sketch` | 生成／互動作品 | engine、sketchId、params、aspectRatio |
| `about` | 關於頁 | name、photo、bio、cv[]、contact[] |

### 1.3 已成熟的「觀看儀器」零件

| 零件 | 檔案 | 狀態 |
|---|---|---|
| 顯影板 Plate（lqip→銳利、不裁切、srcset） | [Plate.astro](src/components/Plate.astro) | ✅ |
| 放映模式 Projection（滿版、序列翻閱、顯影、觸控消歧、focus trap） | [Lightbox.astro](src/components/Lightbox.astro) | ✅ |
| 檔案簽名 archiveSignature（半真化：手填＞EXIF＞slug 生成） | [signature.js](src/lib/signature.js) | ✅ |
| 機器視覺準星 reticle（暗房限定） | [reticle.ts](src/scripts/reticle.ts) | ✅ |
| 兩房系統（`data-room` 暗房／亮房） | [Base.astro](src/layouts/Base.astro) | ✅ |
| 互動作品執行時（引擎無關契約） | [sketches/](src/sketches/) | ✅ |

**結論**：儀器齊全。本藍圖不造新儀器，只做三件事——**瘦身、通電、擴音**。

---

## 二、三個地平線（總覽）

```
H0 收斂 ── 讓骨架瘦下來，接通既有零件        （本週・低風險高回報）
   │   0.1 主題降級為 facet      0.2 放映模式加 Grid 總覽      0.3 影像補 EXIF 抽取
   ▼
H1 通電 ── 把「觀看的機器」做到名實相符        （內容載體深化）
   │   1.1 真實 EXIF 讀取面      1.2 OG 分享影像      1.3 圖說／Press Release 面板
   ▼
H2 擴張 ── 只做能放大作品的，逐項驗證 ROI       （謹慎）
       2.1 Series 連續放映      2.2 灰階座標地圖（hold）      2.3 token 收尾
```

---

## H0 ｜收斂 — 讓骨架瘦下來

> **這個地平線一行新功能都不寫「子系統」，全是減法與接線。** 完成後，導覽更誠實、放映更完整、地基不再漏抽。

### H0.1 — 主題（Theme）降級為 facet　✅ 已落地（2026-06-27）

> 落地備註：主導覽六項 → 五項（撤下「主題」，`/themes` 索引與 `/themes/[slug]` 仍生成、留在 sitemap）。作品流／影像集上的主題標籤由 `<span>` 升為 facet 連結（hover 轉地衣綠 #93a47f）。`/themes/[slug]` 標頭改寫為策展語氣（「以此凝視 / Through This Theme」＋ 描述 lead ＋「N 件 · 以此主題收束的作品」）。build 18 頁通過、無 console error。資料模型一行未動——降級可逆。

**問題**：`series`（作者手排的有序動線）與 `theme`（無序語意標籤）概念不重複，但**產品上重複**——各佔一個主導覽位、各一個近空殼的索引頁、各一份策展負擔。六項導覽裡有兩項在比賽誰更空。

#### 🎨 藝術／設計目標
策展是一種**克制的權力**。一座好的美術館不會把「按主題分類」當成入口擺在大廳——那是檔案室管理員的語言，不是藝術家的。**Series 是藝術家的手**（我決定你以什麼順序翻閱這捲底片）；**Theme 是機器的索引**（標籤、可被搜尋）。把後者從大廳撤下，等於宣告：在這裡，**人的編排凌駕於機器的分類**。這本身就是 [DESIGN §三・層 3「凝視與監視」](DESIGN.md) 的延伸——誰在決定觀看順序，是人還是系統。

#### 🧭 UIUX 細節
- **導覽**：六項 → 五項。移除頂層「主題」。視覺呼吸更鬆，aria-current 訊號更不稀釋。
- **Theme 不消失，只是換位置**：作品頁／索引上的主題標籤**仍在**（[index.astro](src/pages/index.astro) 的 `.entry__themes`、作品頁 meta 列），點擊仍落到 `/themes/[slug]`——它從「目的地」變成「橫向跳轉的 facet」。
- `/themes/[slug]` 落地頁保留，但頁面定位改寫：頂部不再是「主題索引的一格」，而是「**以此主題凝視的一組作品**」——標題下加一句描述，像策展短語。
- `/themes`（總索引）：**可保留為隱藏頁**（RSS／sitemap 仍收，但不佔 nav）。等主題數量真的成長到值得逛，再考慮復位。

#### 🔧 工程實作
- [Base.astro](src/layouts/Base.astro)：移除 `/themes` 的 `<a>`，`activeSection` 型別保留 `'themes'`（落地頁仍需高亮對應狀態，或回退到無 active）。
- [themes/[slug].astro](src/pages/themes/[slug].astro)：標頭文案改為策展語氣；確認從作品頁點標籤進來的動線完整。
- 不動 schema、不動資料、不刪頁。**純 IA 與文案調整。**

#### ✅ 驗收
- 導覽五項，視覺與 aria 正確。
- 從任一作品的主題標籤可跳到 `/themes/[slug]` 並看到該主題作品集。
- `npm run build` 無回歸、頁數不減（themes 頁仍生成）。

#### ⚠️ 風險／取捨
低風險。唯一要想清楚的是：**未來主題若成長，要不要復位**——所以「降級」而非「刪除」，資料模型一行不動，隨時可逆。

---

### H0.2 — 放映模式加「Grid 總覽」視圖　✅ 已落地（2026-06-27）

> 落地備註：`序列 ／ 總覽` 切換、印樣台密排（齒孔編號）、當前格綠括弧（暗房）／實墨（亮房）、點格顯影跳入、鍵盤方向鍵移格＋Esc 退回序列、觸控原生捲動、縮圖複用已載入來源（不重打高解析）。已於 8 圖影像集（Shueinandong）桌機＋手機驗證，build 18 頁通過、無 console error。

**問題**：[Lightbox.astro](src/components/Lightbox.astro) 的 Slides（序列翻閱）已比 Tyler Mitchell 參考站更深，但**缺 Grid**——觀者無法一次攤開整組印樣、點任一張跳入。目前要看第 12 張只能 `→` 按 11 次。

#### 🎨 藝術／設計目標
這對應參考站的 `Slides | Grid` 切換，但我們不抄它的中性灰按鈕——我們用**暗房的語言**重述它。

- **Slides＝凝視**：一次一張，被燈打亮，序列推進，是「沉浸」。
- **Grid＝印樣（contact sheet）**：整捲攤在燈箱上，是「審視」。攝影師選片的那個動作——拿著放大鏡逐格掃過底片——就是 Grid 的本質。

所以 Grid 不是「縮圖牆」，它是**膠捲的印樣台**：密排、規整、帶齒孔編號感，呼應 [gallery/index.astro](src/pages/gallery/index.astro) 既有的 `.contact-sheet` 視覺母題。兩個視圖是同一捲底片的兩種看法——**沉浸 vs 選片**。

#### 🧭 UIUX 細節
- **切換器位置**：放映 chrome 頂部置中，`序列 ／ 總覽`（呼應參考站 Slides｜Grid，但用中文＋暗房字距）。當前視圖 `aria-current`、合法綠下緣（[DESIGN §4.1 綠白名單](DESIGN.md)）。
- **進入 Grid**：當前序列（`items[]`）攤成密排網格。沿用 `.contact-sheet` 的 3:2 格、`格 NN` 齒孔編號、`--hairline-dark` 分隔。**目前正在看的那一格**：四角綠括弧框選（複用 reticle lock 視覺），告訴你「你剛剛在這裡」。
- **Grid → Slides**：點任一格 → 顯影轉場回 Slides 並停在該格（`current = index; render()`）。不是硬切，是**顯影**（沿用既有 `develop()`）。
- **鍵盤**：Grid 下方向鍵移動框選、`Enter` 跳入、`Esc` 關閉放映（不是退回 Slides——避免兩層 Esc 心智負擔；或可設計 Grid Esc 退回 Slides、再 Esc 才關，二擇一**實測後定**）。
- **觸控**：Grid 是原生捲動網格，tap 跳入。沿用 [Lightbox §15 觸控契約](src/components/Lightbox.astro) 不衝突（Grid 下停用 swipe 翻頁）。
- **亮房例外**：閱讀（亮房）影像進的是「安靜亮場」放映（`pjx--light`，無綠括弧、無快門）。**Grid 在亮房同樣不上綠括弧、不發快門**——閱讀不被監視（[DESIGN §三・層 3](DESIGN.md)）。
- **無障礙**：Grid 是 `role="grid"` 或一組可聚焦按鈕；focus trap 範圍擴及 Grid；切換視圖時焦點落到合理起點。

#### 🔧 工程實作
- [Lightbox.astro](src/components/Lightbox.astro)：
  - 標記層加切換器 DOM（`.pjx__viewtoggle`）與 Grid 容器（`.pjx__grid`）。
  - 狀態加 `view: 'slides' | 'grid'`；`renderGrid()` 由 `items[]` 生成縮圖（用 `node.currentSrc` 已載入的縮圖，**不重新請求高解析**）。
  - `open()` 時建一次 Grid；`go()`／跳格共用 `current`。
  - CSS：Grid 佈局直接沿用 [components.css](src/styles/layers/components.css) 既有 `.contact-sheet` 規則或抽共用 class，避免重寫。
- 不動 Sanity、不動 query。**純前端，單檔為主。**

#### ✅ 驗收
- 任一 zoomable 影像進放映 → 切「總覽」→ 攤開全序列 → 點第 N 張 → 顯影回 Slides 停在第 N 張。
- 當前格綠括弧正確（暗房）／無括弧（亮房）。
- 鍵盤與觸控動線完整、focus trap 不漏。
- `prefers-reduced-motion` 下切換無動畫但功能完整。

#### ⚠️ 風險／取捨
中等。最大坑是**焦點管理與兩層 Esc 語義**——這要實測手感再定，別在規格階段過度設計。Grid 縮圖務必複用已載入資源，否則開 Grid 一次打 18 個網路請求，違背「省流量」初衷。

---

### H0.3 — 影像補 EXIF／metadata 抽取（修漏抽）　✅ 已落地（2026-06-27，待回填）

> 落地備註：[post.ts](../studio-artwork-portfolio/schemaTypes/post.ts) 的 `gallery[]` 與 `body` 內 image 補 `metadata:['lqip','dimensions','exif','location']`。query 層（IMG 投影）原已撈 exif/location，無需改。**尾巴**：① 需重啟／重部署 Studio（schema deploy 有已知 crash，見記憶 workaround）才對新上傳生效；② 既有影像不回填，需重新上傳。目前資料集影像皆無 EXIF（種子圖），故顯示面以合成資料驗證（見 H1.1）。

**問題**：只有 `post.cover` 設了 `metadata:['lqip','palette','dimensions','exif','location']`。`gallery[]`、`body` 內的圖**沒設**——這些圖上傳時 Sanity 不抽 EXIF/GPS，連 `dimensions`（杜絕 CLS 用）都可能缺。這是 H1「真 EXIF 顯示面」的**前置地基**。

#### 🎨 藝術／設計目標
「觀看的機器」要名實相符，前提是**機器真的讀到了資料**。一張沒被讀取 EXIF 的 gallery 圖，在這個系統裡是「啞」的——它沒有座標、沒有時間、沒有光圈。補上抽取，等於讓每一張底片都能「開口報出自己的拍攝參數」。這是通電前的拉線。

#### 🧭 UIUX 細節
- 觀者此刻**看不到變化**——這是純地基。但它讓所有 gallery／內文圖的 `aspect-ratio` 確實撐版位（杜絕載入跳動），體感上的「穩」會立刻有。
- 顯影底（lqip）對 gallery 圖也會生效，模糊轉銳利的暗房儀式擴及整捲，不只封面。

#### 🔧 工程實作
- [post.ts](../studio-artwork-portfolio/schemaTypes/post.ts)：`gallery[].of[].options` 與 `body` 內 `image.options` 補 `metadata:['lqip','dimensions','exif','location']`（gallery 可不需 palette）。
- [queries.js](src/lib/queries.js)：`gallery[] ${IMG}` 已套 `IMG` 投影（含 exif/location），確認 body 圖若要顯示也走得到 metadata。
- **注意**：schema 部署有已知 crash（見記憶 [schema-deploy-crash-workaround](../../.claude/projects/-Users-taylor-Desktop-profolio/memory/schema-deploy-crash-workaround.md)）——用 manifest extract + `--no-extract-manifest`。
- **既有圖需重抽**：Sanity 只在上傳時抽 metadata，舊圖不會回填。需重新上傳或跑 migration。**roadmap 註記：新內容自動生效，舊內容擇期回填。**

#### ✅ 驗收
- 新上傳的 gallery／body 圖在 GROQ 回傳含 `dimensions` 與（若原檔有）`exif`/`location`。
- gallery 圖顯影底（lqip）生效、版位不跳。

#### ⚠️ 風險／取捨
低風險但有**資料遷移尾巴**（舊圖不回填）。別假設改完 schema 舊圖就有 EXIF。

---

## H1 ｜通電 — 把「觀看的機器」做到名實相符

> 地基拉好後，這個地平線讓機器**真的開始讀**，並讓作品**真的被分享出去**。

### H1.1 — 真實 EXIF「讀取檔案」面　✅ 已落地（2026-06-27）

> 落地備註：新增 [signature.js](src/lib/signature.js) `readExif()`——**只讀真 EXIF、不捏造光圈**（誠實取捨，偏離原案的「回退 signature」：捏造 f-stop 是說謊，與捏造抽象檔案碼性質不同）；手填 `capture.gear/film` 覆寫鏡頭／ISO。[Plate.astro](src/components/Plate.astro) 算好 `data-exif`；[Lightbox.astro](src/components/Lightbox.astro) 放映逐格顯示 `.pjx__exif`（mono、配角）；[post/[slug].astro](src/pages/post/[slug].astro) 作品／影像集標頭加 `<details>` 讀檔揭示（▸→▾ 綠記號、無 JS、鍵盤／觸控皆可）。已驗證：formatter（光圈/快門/ISO/焦段/鏡頭、partial、override、空陣列）、放映逐格＋Grid 跳轉同步、標頭開合視覺。資料集無真 EXIF，故以合成資料驗證渲染路徑——真照片上傳後自動點亮。build 18 頁、無 console error。

**問題**：EXIF 抽了，卻**只拿去當 signature 種子**（半真化座標），從沒以真實可讀形式端給觀者。觀者從不知道這張照片是 f/2.8、1/250、ISO 400、35mm、某顆鏡頭拍的。

#### 🎨 藝術／設計目標
這是整個「觀看的機器」母題的**高潮與兌現**。[DESIGN §三・層 1（Ikeda 資料精度）](DESIGN.md) 問：「資料本身是否可以有美學？」——真實 EXIF 就是答案。

但**克制是關鍵**。我們不做相機 App 那種炫技的 EXIF 卡。我們做的是：**一台機器安靜地把它讀到的底片參數，以等寬字、極小字級，列在影像的暗處**。它不爭奪影像的存在感（[DESIGN §4.3 標題尺度刻意保守，讓影像高於一切](DESIGN.md)）。它是「機器在低聲讀數」，不是「規格表在叫賣」。

半真化哲學延續：**有真 EXIF 就讀真的，沒有就回退 signature 生成**——觀者分不清哪些是真、哪些是機器補的，這個「分不清」本身是作品（[DESIGN §三・層 3](DESIGN.md)）。

#### 🧭 UIUX 細節
- **形態**：作品頁／放映模式底部 chrome 的可揭示資料條。預設收起（只見既有 `data-strip` 座標簽名），**hover／tap 展開**第二行真 EXIF：
  ```
  f/2.8 · 1/250s · ISO 400 · 35mm · Summicron
  ```
- **字體**：`--font-mono`、`--step--2`、tabular-nums、`--text-dim`。中點分隔，沿用 [post 頁 `.work__capture`](src/pages/post/[slug].astro) 既有樣式語彙。
- **缺值優雅**：任一欄缺就略過該欄（不顯「N/A」——機器不會說 N/A，它只是沒讀到）。全缺則整條不出現，回退到既有 signature。
- **放映模式內**：在 `.pjx__sig` 旁／下，每翻一格更新該格 EXIF（gallery 圖此時已有 metadata，靠 H0.3）。
- **動態**：展開用 [DESIGN §4.5](DESIGN.md) 的 0.4–0.6s ease，像資料條「被讀取」般滑出，非彈跳。
- **不放地圖、不放大字** — 這一條永遠是配角，影像永遠是主角。

#### 🔧 工程實作
- [signature.js](src/lib/signature.js)：新增 `readExif(assetMeta, capture)` 回傳格式化欄位陣列（光圈/快門/ISO/焦段/鏡頭），優先序同 archiveSignature（手填 `capture.gear/film` ＞ EXIF ＞ 略過）。`ExposureTime` 需轉 `1/250` 顯示、`FNumber` → `f/2.8`。
- [post/[slug].astro](src/pages/post/[slug].astro)：作品／影像集標頭資料條加可揭示第二行。
- [Lightbox.astro](src/components/Lightbox.astro)：`render()` 時讀當前 `items[current]` 對應的 EXIF（需把 EXIF 帶到 DOM `data-*` 或建索引）。
- 依賴 H0.3（gallery 圖要有 EXIF 才讀得到）。

#### ✅ 驗收
- 有 EXIF 的封面與 gallery 圖，展開顯示正確格式化參數。
- 缺值欄位優雅略過；全缺回退 signature。
- 暗房／亮房字色正確；`prefers-reduced-motion` 下直接顯示無動畫。

#### ⚠️ 風險／取捨
中等。EXIF 欄位格式化（快門分數、光圈、鏡頭名稱髒資料）是細活。**取捨**：別追求顯示所有 EXIF tag——只挑攝影師會在意的五個（光圈/快門/ISO/焦段/鏡頭），多了就是規格表叫賣，違背克制。

---

### H1.2 — OG／分享影像生成

**問題**：[DESIGN §8.2](DESIGN.md) 標記「**SEO / OG 影像：❌ 缺席**」。作品分享到社群是裸連結，零視覺存在感——這直接違背「讓作品更被看見」。

#### 🎨 藝術／設計目標
分享卡是**這座美術館伸到牆外的一隻手**。它必須帶著美術館的氣質出門：暗場、封面影像、標題、那條機器簽名。一張對的 OG 圖，是讓「光・門檻・衰敗」在別人的 timeline 裡也成立——不是 SEO 技術債，是**展覽的延伸立面**。

#### 🧭 UIUX 細節
- **構圖**：暗房底（`--gallery #0c0c0b`）＋ 封面影像（不裁切的安全內縮）＋ 標題（`--font-ui`）＋ 底部機器簽名資料條（座標·編碼·CH）。像一張**展牆說明卡**。
- **散文**：亮房底（`--paper`）＋ 標題＋導言首句——換房間，換立面，延續兩房敘事到社群。
- 規格 1200×630，字級在縮圖下仍可讀（標題夠大、簽名極小但 tabular）。

#### 🔧 工程實作
- Astro 端用 `satori` + `@resvg/resvg-js`（或 `astro-og-canvas`）在 build 時為每篇生成 OG PNG，輸出到 `dist`。
- [Base.astro](src/layouts/Base.astro)：`<meta property="og:image">`／`twitter:card` 指向生成圖；目前 `image` prop 已接 cover，升級為專用 OG。
- 字體需嵌入（Noto Serif TC／無襯線 subset）——注意 CJK subset 體積，build 時間。

#### ✅ 驗收
- 每篇作品／散文有專屬 OG 圖；Twitter/FB/Slack 分享預覽正確。
- 暗房／亮房兩種立面正確對應 category。
- build 時間可接受（CJK 字體 subset 不爆）。

#### ⚠️ 風險／取捨
中等，主要是 build 時間與 CJK 字體。**取捨**：若 build 太慢，先只對 `featured` 作品生成精緻版，其餘回退 cover 直出。

---

### H1.3 — 圖說／Press Release 文字面板

**問題**：參考站放映模式有「Press Release」文字面板。我們的 gallery 圖說（`caption`）只是單行小字，body 與單張圖之間沒有「展覽論述」的綁定。

#### 🎨 藝術／設計目標
攝影展的力量一半在影像，一半在**那張貼在入口的策展論述**。給放映模式一個可呼出的文字面板，等於讓觀者在凝視影像時，能召喚出作者的聲音——但**只在他想要時**。沉默是預設，文字是邀請。

#### 🧭 UIUX 細節
- 放映 chrome 加「說明 ／ Statement」可呼出面板（呼應參考站 Press Release）。預設收起。
- 內容優先序：該格 `caption` ＞ 作品 `body` 導言 ＞ 系列 `description`。
- 面板從側／下滑出，暗場不全遮影像（半透明、影像仍在）。亮房用紙底。
- 依賴 H0.2 的 chrome 切換架構（與 Grid 切換共用一套 chrome 邏輯）。

#### 🔧 工程實作
- [Lightbox.astro](src/components/Lightbox.astro)：caption 已從 figure 讀取（`captionOf`），擴充為可讀更長文字；body 導言需在 gallery 頁以 `data-*` 或隱藏節點供放映讀取。

#### ✅ 驗收
- 放映中可呼出／收起文字面板，內容依優先序正確回退。
- 暗房／亮房底色正確；不全遮影像。

#### ⚠️ 風險／取捨
低～中。**取捨**：別讓它變成「每張圖都得寫論述」的上稿負擔——保持「有就顯示、沒有就安靜」，與半真化哲學一致。

---

## H2 ｜擴張 — 只做能放大作品的

> 這個地平線**默認懷疑**。每一項都要先問：它讓某一張照片更被看見，還是只是讓我多一個可炫耀的 feature？

### H2.1 — Series 連續放映（策展主脊兌現）

#### 🎨 藝術／設計目標
把兩個各自最強的零件合流：**series（作者手排的 zine 動線）＋ projection（放映儀器）**。在系列頁按一個鍵，整組作品依作者編排的順序連續放映——這是 zine 的本質在數位載體上的兌現（[series.ts schema 註解](../studio-artwork-portfolio/schemaTypes/series.ts) 早已埋下這個意圖）。翻閱一本攝影集的動作，被忠實地搬進了暗房。

#### 🧭 UIUX 細節
- [series/[slug].astro](src/pages/series/[slug].astro)：標頭加「放映此系列 ／ Project Sequence」入口。
- 進放映時 `items[]` = 系列的 `works[]` 順序（非 DOM 順序）——這是 projection 目前唯一假設（整頁 zoomable）需要鬆綁的地方。
- 序列編號用合法綠（series 頁 `.series-seq__num` 已是綠，延續）。

#### 🔧 工程實作
- [Lightbox.astro](src/components/Lightbox.astro)：`open()` 支援傳入指定序列（而非永遠 `querySelectorAll('img.zoomable')`），或讓 series 頁影像帶序列 `data-seq`。

#### ⚠️ 風險／取捨
中等價值、中等成本。**高 ROI** 因為它純接線兩個既有強功能。先做。

---

### H2.2 — 灰階座標地圖（🔒 HOLD）

#### 🎨 藝術／設計目標
用已抽的 GPS `location` 把作品落在一張極簡灰階地圖上——「光在世界何處落下」。概念上極誘人，呼應 [DESIGN §三・層 1](DESIGN.md) 資料美學。

#### ⚠️ 為什麼 HOLD
這是本藍圖**唯一明確標記功能劇場風險的候選**。理由：

- **空地圖即失敗**。GPS 資料現在幾乎是空的（多數靠 signature 半真化生成，不是真座標）。在沒有真實 GPS 內容前做地圖，等於蓋一座沒有展品的展廳。
- **決策門檻**：**唯有當真實 GPS 座標填滿到值得逛（主觀門檻：≥15 件有真座標），才解除 HOLD。** 否則它違背本藍圖第一原則。

這條留在這裡，是為了**提醒自己抵抗它**，直到內容撐得起它。

---

### H2.3 — Token 一致性收尾

#### 🎨 設計目標
[DESIGN §8.2](DESIGN.md) 列的弱點：散落的 `clamp()` 手寫值未走 `--space-*` token、`.work__meta{font-size:0.78rem}` 等未對齊字級 scale、`.prose` 主長文用 `--text-muted`（70% 墨）而非 [DESIGN §6](DESIGN.md) 建議的 `--text` 實墨（影響閱讀清晰度）。

#### 🔧 工程實作
隨手清，不必獨立衝刺：
- `.prose` 內文色 muted → `--text` 實墨（最有感的一改，直接影響閱讀）。
- 散落 clamp／硬寫字級逐步遷移到 token。

#### ⚠️ 取捨
維護債，低優先。但 `.prose` 改實墨是例外——它**直接影響每一次閱讀**，值得提前到 H1 順手做。

---

## 三、執行原則（給每一次 commit 的檢查清單）

每動手前，問這四個問題。任一個答「否」就停下來：

1. **它讓某一張照片更被看見嗎？**（否 → 大概是功能劇場）
2. **它增加了上稿摩擦，還是減少了？**（增加 → 重新設計）
3. **綠色用對地方了嗎？**（[DESIGN §4.1 白名單](DESIGN.md)——不是裝飾，是稀缺的生命訊號）
4. **影像的存在感仍高於這個新元素嗎？**（[DESIGN §4.3](DESIGN.md)——否 → 它太吵了）

---

## 四、優先序建議（若只能做三件事）

1. **H0.2 放映加 Grid** — 觀看體驗的唯一明確缺口，純前端、不碰資料、最有感。
2. **H0.1 主題降級** — 一個下午的 IA 手術，立刻讓網站更誠實、心智更輕。
3. **H1.1 真 EXIF 讀取面** — 兌現整個「觀看的機器」母題，把空轉的儀器真正通上電。

H0.3 是 H1.1 的隱形前置，三者一條線：**先攤開（Grid）、再瘦身（IA）、最後通電（EXIF）**。

---

## 五、決策紀錄

| 日期 | 版本 | 關鍵決策 |
|---|---|---|
| 2026-06-27 | v1 | 建立藍圖。脊椎＝瘦身／通電／擴音，拒絕子系統。主題降級而非刪除（可逆）；地圖標記 HOLD（抵抗功能劇場）；Grid 用印樣語言而非中性按鈕；EXIF 顯示堅持克制（五欄、配角、可缺）。 |

---

> **這份藍圖的成功標準不是「做完幾個 feature」，而是：一年後回頭，這座美術館的每一張照片都比現在更被凝視。**
> 工程是手段，審美是目的。當你只剩工程的語言時，回到 [§0](#〇為什麼需要這份文件)。
