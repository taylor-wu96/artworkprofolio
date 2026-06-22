# DESIGN — 灰階・生機・門檻（v2）

> 攝影藝術 zine 的視覺設計規格。本檔是重構的單一依據（single source of truth）。
> 主題：**光 / 門檻與邊界 / 衰敗與生機並存**。
> v1 定稿 2026-06-21；**v2 迭代 2026-06-21**（系統化地基 + 兩房落實 + 綠收束 + 閱讀室補齊 + 3D 樂章化）。
>
> **傳承**：本檔是 [`.agents/skills/Design.md`](.agents/skills/Design.md)（Museum Portfolio
> Design System v1）的**具體化落地**，不取代它。母文件定通則（artwork first、嚴格限色、
> 圖像不裁切、動態如呼吸、編輯性長文用克制襯線）；本檔把它中文化、加上灰階＋地衣綠的
> 敘事與「兩個房間」的結構決定。凡母文件未明定處，以母文件為準。

---

## v2 做了什麼（相對 v1 的成熟化）

v1 的**概念**成熟、**系統化與落地一致性**不足。v2 補五件事：

1. **系統化地基**：把散落的 inline `clamp()`／手寫 easing 收成三套 token（間距 / 字級 / 動態）。
2. **兩房真正成立**：圖錄／作品／3D 落實為**暗房**（v1 文件說暗、程式卻全跑亮底）。
3. **綠名實相符**：綠退出內文連結，只保留「狀態／生命跡象」；天然 ≤2–3 處/視口。
4. **閱讀室補到報導者級**：導言、抽言、圖說、旁註、章節記號、閱讀進度。
5. **3D 樂章化**：借暗房連續性，光場不「消失」而是稀釋成圖錄的環境暗。

---

## 0. 一句話定調

> 整站是一座**灰階的、安靜衰敗的空間**；綠是裡面唯一還活著的東西。
> 它稀少、克制，只出現在「有生命跡象」的地方——當前所在、可互動、被觸碰的瞬間、3D 光場裡一粒活光點。
> 綠的「克制用量」不是設計限制，而是敘事本身：用多了，生機就廉價了。

---

## 1. 兩個房間（核心結構決定・v2 落實）

網站是兩種截然不同的房間，共用同一條脊椎（12 欄網格、字體系統、token、綠重點），但表面相反：

| 房間 | 內容 | 表面 | 字體主角 | 氣質 |
|---|---|---|---|---|
| **暗房** | 圖錄 / 作品索引 / 作品內頁 / 3D / hero | 暗場 `--gallery` | 無襯線（圖說／標籤） | 美術館投影牆，影像像發光體 |
| **亮房** | 書寫 / 長文閱讀 / about | 亮底 `--paper` | **宋體內文** | 報導者式長文舒適 |

**v2 關鍵變更**：圖錄與作品內頁從亮底改為**暗房**。整座館共用同一片黑——
影像在暗場上像投影牆上的發光體。**明暗依房間切換，不做全站 toggle、不做漸進過場**；
頁級乾淨切換即可。進入長文＝**走進唯一亮著的房間**，這個「點亮」本身就是敘事。

---

## 2. 色彩系統

純黑白太數位太冷硬；採**中性、肉眼近乎無暖的灰階**，避免臨床感。
暗房需要一條**平行的墨階**（混向 `--gallery`，而非混向亮紙），否則暗底次級文字與髮絲線無處安放。

```css
:root {
  /* 亮房（閱讀） */
  --paper:  #f4f4f2;  /* 近美術館白 */
  --ink:    #0e0e0d;  /* 主文字、深場 */
  /* 墨的濃度＝同色透明度層級，不算新色 */
  --ink-70: color-mix(in oklab, var(--ink) 70%, var(--paper));
  --ink-45: color-mix(in oklab, var(--ink) 45%, var(--paper));
  --ink-15: color-mix(in oklab, var(--ink) 15%, var(--paper));
  --hairline: var(--ink-15);

  /* 暗房（圖錄・作品・3D） */
  --gallery:     #0c0c0b;  /* 暗室 */
  --gallery-ink: #ececea;  /* 暗房主文字 */
  /* 暗房墨階：混向暗場 */
  --g-ink-70: color-mix(in oklab, var(--gallery-ink) 70%, var(--gallery));
  --g-ink-45: color-mix(in oklab, var(--gallery-ink) 45%, var(--gallery));
  --g-ink-20: color-mix(in oklab, var(--gallery-ink) 20%, var(--gallery));
  --hairline-dark: color-mix(in oklab, var(--gallery-ink) 14%, transparent);
  --hero-bg: var(--gallery);

  /* 唯一重點色：地衣／氧化銅綠（低彩、帶灰、沉靜的生機） */
  --life:      #4f5e44;  /* 亮底上（對比足夠當文字） */
  --life-dark: #93a47f;  /* 暗底上（提亮，維持可讀） */
}
```

綠的使用見 §8（白名單）。

---

## 3. 字體系統（編輯雙體）

長文＝宋體的文學溫度；介面＝瑞士無襯線的中性。

```css
--font-read: 'Noto Serif TC', 'Source Han Serif TC', 'Songti TC', Georgia, serif;
--font-ui:   'Helvetica Neue', Helvetica, 'Inter', Arial,
             'PingFang TC', 'Noto Sans TC', system-ui, sans-serif;
```

- 介面預設 `--font-ui`；長文切換 `--font-read`。
- 數字一律 `font-variant-numeric: tabular-nums`（圖錄編號感）。
- 字級一律走 §4 的 type scale token，不再手寫散值。

---

## 4. Token 系統（v2 新增地基）

把散落的 inline 數值收成三套命名 token。`.display / .label / .prose` 等語意層**建立在 token 之上**。

### 4.1 間距（8px 模數・t-shirt 命名）

```css
--space-3xs: 4px;   --space-2xs: 8px;   --space-xs: 12px;
--space-sm: 16px;   --space-md: 24px;   --space-lg: 32px;
--space-xl: 48px;   --space-2xl: 64px;  --space-3xl: 96px;
--space-4xl: 128px; --space-5xl: 160px;
```

外緣與欄距維持流動：
```css
--margin:  clamp(20px, 5vw, 90px);   /* 外緣（行動 20–24） */
--col-gap: clamp(16px, 2.2vw, 30px); /* gutter 24–32 量級 */
```

### 4.2 字級（modular scale・1.25 大三度）

```css
--step--2: 0.72rem;  /* micro label（.label）*/
--step--1: 0.82rem;  /* small UI / caption */
--step-0:  1rem;      /* UI 內文基準（17px root）*/
--step-1:  1.25rem;
--step-2:  1.5625rem;
--step-3:  1.953rem;
/* 流動的大標另立，不塞進等比階 */
--display:    clamp(2.1rem, 6vw, 4.6rem);
--hero-title: clamp(1.9rem, 5vw, 3.4rem);
/* 閱讀內文（亮房長文）自有基準，見 §7 */
--read-size:  1.12rem;  /* ≈19px */
```

### 4.3 動態（duration / easing）

```css
--dur-fast: 0.4s;   /* hover / 狀態 */
--dur:      0.6s;   /* 一般過渡 */
--dur-slow: 1.5s;   /* 入場揭示 */
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
--ease:     ease;
```

| 用途 | duration | easing |
|---|---|---|
| 入場揭示（opacity+translateY）| `--dur-slow` | `--ease-out` |
| hover / focus / 連結 | `--dur-fast`–`--dur` | `--ease` |
| 房間明暗切換 | `--dur` | `--ease` |

### 4.4 字重階梯（取代「全部 500」的平階層）＋ 圓角

v1 幾乎所有字都 `500`，階層是平的、沒有個性。v2 建立刻意的三級字重，
並讓**標題字重依房間混用**——強化「兩個房間」的性格：

```css
--fw-regular: 400;   /* 內文、暗房大標 */
--fw-medium: 500;    /* 介面標籤、導覽、meta */
--fw-semibold: 600;  /* 亮房標題與段落頭 */
--display-weight: var(--fw-semibold);          /* 亮房預設 */
/* html[data-room="dark"] { --display-weight: var(--fw-regular); } */
--radius: 0px;       /* 刻意接近 0：建築／印刷氣質，非網頁 App */
```

| 元素 | 字重 | 說明 |
|---|---|---|
| 暗房大標（`.display` on dark、`.hero__title`、`.entry__title`、作品內頁標題）| `--fw-regular` 400 | 展覽標籤的優雅：靠尺寸＋字距撐存在感 |
| 亮房標題（`.display` on light、essay/writings/about 標題）| `--fw-semibold` 600 | 報導式清晰 |
| 段落頭（`.prose h2/h3`）| `--fw-semibold` 600 | 長文裡可掃描 |
| 內文（`.prose`、宋體）| `--fw-regular` 400 | 透氣 |
| 介面（`.label`、`.nav`、meta、數字）| `--fw-medium` 500 | 中性 |

**圓角**：全站 `--radius: 0`（直角）。這是刻意的——藝術品/3D 光場之外不做圓角，
維持印刷與建築的硬邊；圓角會把氣質往「網頁 App」拉。

---

## 5. 版面與留白

沿用既有良好骨架，數值改用 §4 token：

- 12 欄網格、`--margin`、`--col-gap`、大量留白。
- **無卡片、無陰影、無漸層**（藝術品與 3D 光場除外）。
- **影像永不裁切**：只限寬，保留原始比例。
- max content width **1440px**；間距採 §4.1 模數；斷點 desktop 12 欄 / tablet 8 欄 / mobile 4 欄。
- 圖錄逐頁翻閱式索引（非卡片牆）；meta 在寬螢幕 sticky 於側欄。

---

## 6. 暗房圖錄（v2 新增）

圖錄／作品索引／作品內頁全部跑在 `--gallery` 暗場上。

**表面與文字**
- 背景 `--gallery`；主文字 `--gallery-ink`；次級（編號、meta、圖說）用 `--g-ink-45 / --g-ink-20`。
- 分隔線改 `--hairline-dark`（暗底髮絲，極低 alpha 的亮）。
- 暗底連結 hover：墨白提亮（`--g-ink-70 → --gallery-ink`）＋下緣髮絲；綠僅給 `aria-current`。

**影像（投影牆）**
- 影像不加框、不加陰影；直接落在暗場上，邊緣自然融入黑——像投影。
- 偏白／高調影像可給一道 `--hairline-dark` 細邊，避免白邊與暗底「斷裂」（僅必要時）。
- 揭示維持慢速：`opacity --dur-slow --ease-out`。

**與 3D 的連續性（重點）**
- 暗房圖錄與 hero 光場**共用同一片黑**：光場捲出 hero 時不歸零，稀釋成圖錄背後的環境殘光（見 §9）。
- 整座館因此是「一個會發光的暗空間」，而非「黑 hero ＋ 黑頁面」的拼接。

---

## 7. 亮房閱讀室（v2 補齊・對標報導者／Patreon）

書寫／長文／about 跑在 `--paper` 亮底，宋體內文。`.prose` 從「能讀」升級為「舒服地讀」。

**閱讀舒適度硬指標**
- 內文字級 `--read-size`（≈19px）；中文行高 **1.85**（拉丁 1.7）。
- measure：`--measure: 40rem`（約 38–40 中文字 ≈ 76–80 拉丁字）。
- **版式＝單欄置中、左右對稱留白、文字向左對齊（ragged right）**；
  **不用兩端對齊（justified）**——中英混排時 justified 會撐出不規則字距，破壞節奏。
- **標頭也靠左**：label／標題／meta 與內文同軸，下緣髮絲分隔（報導者式編輯標頭，不置中）。
- 段距：`> * + * { margin-top: 1.6em }`。
- 連結：**墨色、無底線，hover 才顯下緣細線**（綠已退出內文，見 §8）。
- 標題 h2/h3 用無襯線，在宋體內文中製造「呼吸點」。

**編輯工具箱（新增元件）**
1. **文章頭部**：大標 → **導言（lead）**（略大、`--ink` 實色、行高更鬆）→ meta 列（日期 · 閱讀時間 · 分類，tabular-nums）→ `--hairline`。
2. **閱讀進度條**：頂部髮絲，**綠色填充**（合法綠用法＝「你在這／進行中」）。
3. **抽言（pull quote）**：大宋體、最少引號、左右大留白，可略破 measure。
4. **圖說系統**：`figcaption` 帶編號（tabular-nums），與圖錄編號語言一致；含標題／來源欄位。
5. **旁註／註腳**：寬螢幕走側欄 margin note；行動裝置改 inline 展開（報導者式）。
6. **章節記號**：段落群之間用極簡記號（小圓點列／編號）分章，不只靠留白。
7. 不用 drop cap（與克制衝突）；開場重量交給導言段落承擔。

---

## 8. 綠色白名單（v2 明確化）

綠只出現在「狀態／生命跡象」處，內文連結退回墨色。如此天然 ≤2–3 處/視口。

| ✅ 准用 | ❌ 不准 |
|---|---|
| `aria-current` 當前所在 | 內文超連結（改墨色＋hover 細底線）|
| `focus-visible` 聚焦環 | 一般 hover 提示 |
| 閱讀進度條填充 | 任何背景／大色塊／按鈕底色 |
| 檔案索引「最新／進行中」標記 | icon／裝飾線大面積 |
| 3D 光場中極少數活光點 | |

亮底用 `--life`，暗底用 `--life-dark`。

---

## 9. 3D（沉思內核 + 捲動樂章・v2）

維持已調好的密實柔光點雲（Turrell / Anadol 沉思感、阻尼、效能降載全保留），
不走 produx 大膽路線；但給捲動明確的段落感（blockstudio 式 choreography）。

**三個樂章**
1. **Hero（0–100%）**：維持現有沉降（position.y）、後退（position.z）、淡出、微縮。
2. **沉入圖錄**：光場**不歸零**，稀釋成圖錄背後的環境殘光＋一粒綠光續存——承接 §6 的暗房連續性。
3. **指標互動**：維持極輕微聚散、重阻尼、位移極小（呼應「門檻／被觸碰」）。

**一粒綠光**：灰白光海中極少數 `--life-dark` 光點，獨立慢脈動（像還在呼吸的生命），隨滾動同步淡出。

**效能／無障礙**：`prefers-reduced-motion` 降載（停自轉／呼吸／色溫循環／指標位移，保留靜態光場）；行動裝置降點數。

進階（之後迭代，暫緩）：獨立疊一層薄侵蝕曲面承載「衰敗」，保留光雲原貌（見 PROGRESS B5-2）。

---

## 10. 動態

- 入場揭示：`opacity + translateY`，`--dur-slow` `--ease-out`。
- hover／狀態過渡：`--dur-fast`–`--dur` `--ease`。
- 房間明暗切換：`--dur` `--ease`，乾淨頁級切換。
- 一切動態服務「沉思」，不做彈跳、不爭奪注意力。

---

## 11. 對既有程式的影響（v2 重構清單）

1. `src/styles/global.css`
   - 新增三套 token（§4：space / type / motion）與暗房墨階（§2）。
   - 既有 `.display / .label / .prose / .nav …` 改建立在 token 上（去 inline 散值）。
   - 圖錄相關類（`.archive / .entry / .work / .section-head …`）改暗房表面（§6）。
   - 綠收束（§8）：`.prose a` 退回墨色；綠只留 `aria-current / focus / progress / 標記`。
   - 閱讀室新元件（§7）：lead / pull-quote / figcaption / 旁註 / 章節記號 / 進度條。
2. `src/pages/index.astro`、作品索引、作品內頁：套暗房（暗 `.container` 區塊或暗房包裹）。
3. 閱讀頁（`post/[slug].astro`、`about.astro`）：維持亮房，補文章頭部與編輯元件。
4. `src/components/Hero3D.jsx`：第二樂章——光場稀釋為圖錄環境殘光（不歸零）。
5. 字體載入：維持 Noto Serif TC（subset）。

---

## 12. 決策紀錄

**2026-06-21 v1**
- 綠的性格：地衣／氧化銅綠（沉靜、低彩）。
- 明暗：依房間切換。
- 閱讀字體：編輯雙體（宋體內文 + 無襯線介面）。
- 3D：演化沉思內核（滾動 + 指標 + 一粒綠光）。

**2026-06-21 v2（討論定案）**
- 圖錄表面：**真正落實暗房**（圖錄／作品／3D 全暗，閱讀頁亮）。
- 3D 方向：**強化現有點雲 + 捲動編排**（不轉雕塑體；借暗房連續性，光場稀釋不消失）。
- 重點色：**維持地衣綠、收束用法**（內文連結改墨色，綠只給狀態／生命跡象）。
- 系統化：新增 space / type / motion 三套 token 作為地基。
- 閱讀室：補齊導言／抽言／圖說／旁註／章節／進度條，對標報導者／Patreon。

**2026-06-22 v2.1（細緻化討論定案）**
- 字重：**依房間混用**（暗房展覽輕量 400 大標／亮房報導半粗 600 標題與段落頭／內文 400／介面 500），取代 v1「全部 500」。
- 圓角：**維持 0（直角）**，刻意不走網頁 App 的圓潤。
- 閱讀版式：**單欄置中、左右對稱留白、文字向左對齊（非 justified）**；**標頭也靠左**並加下緣髮絲。
