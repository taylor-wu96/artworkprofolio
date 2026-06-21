# 光・門檻・衰敗 — 攝影 zine

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
│  ├─ lib/
│  │  ├─ sanity.js              # Sanity client、urlFor、safeFetch
│  │  └─ queries.js             # GROQ 查詢集中管理
│  ├─ pages/
│  │  ├─ index.astro            # 首頁（hero + 作品列表）
│  │  ├─ post/[slug].astro      # 文章內頁
│  │  ├─ themes/index.astro     # 主題列表
│  │  ├─ themes/[slug].astro    # 單一主題作品
│  │  ├─ rss.xml.js             # RSS
│  │  └─ 404.astro
│  └─ styles/global.css
├─ studio/                      # Sanity Studio 後台（獨立 npm 專案）
│  ├─ sanity.config.ts
│  └─ schemaTypes/{post,theme,index}.ts
├─ astro.config.mjs
└─ .env.example                 # 複製成 .env 填 Sanity 資訊
```

設計上，**Sanity 未設定前前台仍可建置**：`safeFetch` 在沒有 Project ID 或查詢失敗時回退空資料，頁面顯示提示。

---

## 前台開發

```bash
npm run dev       # http://localhost:4321
npm run build     # 產出 dist/
npm run preview   # 預覽 build 結果
```

## 接上 Sanity 後台

```bash
cd studio
npm install
npx sanity login          # 用瀏覽器登入（GitHub/Google/email）
npx sanity init           # 建立 / 連結專案，會寫入 projectId 到 .env
npm run dev               # 本機後台 http://localhost:3333
npm run deploy            # 部署到 *.sanity.studio（免費託管）
```

取得 **Project ID** 後，回到專案根目錄：

```bash
cp .env.example .env
# 編輯 .env 填入 SANITY_PROJECT_ID
```

重新 `npm run dev`，前台就會抓到後台內容。

## 部署到 Cloudflare Pages

1. 推 repo 到 GitHub。
2. Cloudflare → Workers & Pages → Create → Pages → 連 GitHub repo。
3. Build command：`npm run build`，Output：`dist`。
4. **Environment variables** 加上 `SANITY_PROJECT_ID`（與 `SANITY_DATASET`）。
5. 設一個 **Deploy hook**，到 Sanity 專案設 **Webhook** 指向它 → 發文自動重建。
