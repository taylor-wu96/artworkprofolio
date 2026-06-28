# 潮濕的質地 — 攝影 zine

前台 **Astro 6 + React Three Fiber**｜後台 **Sanity**｜部署 **Cloudflare Pages**。
主題：光 / 門檻與邊界 / 衰敗與生機並存。

> 目前進度與待辦見 [`PROGRESS.md`](./PROGRESS.md)。

---

## 結構

```
profolio/
├─ src/
│  ├─ components/Hero3D.jsx     # R3F 光影 hero（client:only）
│  ├─ layouts/Base.astro        # 版型 + SEO/OG/RSS head
│  ├─ components/PortableImage.astro  # Portable Text 內嵌影像序列化器
│  ├─ lib/
│  │  ├─ sanity.js              # sanity:client 包裝、urlFor、safeFetch
│  │  └─ queries.js             # GROQ 查詢集中管理
│  ├─ pages/
│  │  ├─ index.astro            # 首頁（hero + 作品列表）
│  │  ├─ post/[slug].astro      # 文章內頁
│  │  ├─ themes/index.astro     # 主題列表
│  │  ├─ themes/[slug].astro    # 單一主題作品
│  │  ├─ rss.xml.js             # RSS
│  │  └─ 404.astro
│  └─ styles/global.css
├─ astro.config.mjs             # @sanity/astro 整合（loadEnv 讀 PUBLIC_*）
└─ .env / .env.example          # PUBLIC_SANITY_PROJECT_ID / _DATASET
```

後台（Sanity Studio）是**獨立的 sibling 專案**，不在此 repo 內：

```
~/Desktop/studio-artwork-portfolio/   # project z4fuhbhm, dataset production
├─ sanity.config.ts
└─ schemaTypes/{post,theme,index}.ts
```

前台透過 `@sanity/astro` 的 `sanity:client` 虛擬模組連到後台；內容還空著時，頁面顯示友善提示。

---

## 前台開發

```bash
npm run dev       # http://localhost:4321
npm run build     # 產出 dist/
npm run preview   # 預覽 build 結果
```

## Sanity 後台（已接通，project z4fuhbhm）

```bash
cd ~/Desktop/studio-artwork-portfolio
npm run dev               # 本機後台 http://localhost:3333（新增 theme / post）
npx sanity schema deploy --no-extract-manifest  # 改 schema 後重新部署
npx sanity deploy         # 部署 Studio 到 *.sanity.studio（免費託管）
```

前台環境變數（`~/Desktop/profolio/.env`）：

```bash
# 已建立；新環境用 .env.example 複製
PUBLIC_SANITY_PROJECT_ID=z4fuhbhm
PUBLIC_SANITY_DATASET=production
```

## 部署到 Cloudflare Pages

1. 推 repo 到 GitHub（已完成：`artworkprofolio`）。
2. Cloudflare → Workers & Pages → Create → Pages → 連 GitHub repo。
3. Build command：`npm run build`，Output：`dist`。
4. **Environment variables** 加上 `PUBLIC_SANITY_PROJECT_ID=z4fuhbhm` 與 `PUBLIC_SANITY_DATASET=production`。
5. 設一個 **Deploy hook**，到 Sanity 專案設 **Webhook** 指向它 → 發文自動重建。
