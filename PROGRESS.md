# 專案進度追蹤 — 攝影藝術家部落格

> 架構：前台 Astro 6 + R3F｜後台 Sanity｜GitHub 原始碼 + Cloudflare Pages 部署
> 主題：光 / 門檻與邊界 / 衰敗與生機並存
> 此檔用來記錄建置進度，避免中斷後忘記做到哪。每完成一步就勾選並補上備註。

最後更新：2026-06-21

---

## 環境
- Node：v22.22.2（LTS）
- npm：10.9.7
- git：2.39.5
- 工作目錄：`/Users/taylor/Desktop/profolio`
- 結構規劃：
  - `./`（根）＝ Astro 前台
  - `./studio/` ＝ Sanity Studio 後台

---

## 階段一：骨架可上線
- [ ] 建立 Astro 專案（根目錄）
- [ ] 加入 React 整合（`@astrojs/react`）
- [ ] 安裝 Three.js 生態（`three @react-three/fiber @react-three/drei`）
- [ ] 安裝 Sanity 串接工具（`@sanity/client @sanity/image-url @sanity/astro`）
- [ ] 本機 `npm run dev` 可開啟
- [ ] `npm run build` 可產出 `dist/`
- [ ] git init 並首次 commit
- [ ] 推上 GitHub（**需使用者操作**：建立 repo）
- [ ] 接 Cloudflare Pages 自動部署（**需使用者操作**）

## 階段二：後台與內容
- [ ] 建立 Sanity Studio（`./studio/`）
- [ ] 定義 `theme` / `post` / `index` schema
- [ ] 設定 Project ID / dataset（**需使用者帳號**）
- [ ] 前台 client 串接（`src/lib/sanity.js`）
- [ ] 文章列表頁 + 文章內頁
- [ ] 主題篩選頁
- [ ] Sanity Webhook → Cloudflare Deploy hook（**需使用者操作**）

## 階段三：視覺亮點
- [ ] R3F Hero 場景（光影 / 影像牆）
- [ ] 影像集 lightbox
- [ ] 頁面轉場

## 階段四：收尾與延伸
- [ ] 自訂網域、OG/SEO、RSS
- [ ] 聯絡表單 / 電子報 / zine 販售連結（視需要）

---

## 待使用者提供 / 操作的項目
1. Sanity 帳號與 **Project ID**（執行 `sanity` 初始化時取得）
2. GitHub 空 repo 網址（推送用）
3. Cloudflare Pages 專案（連 GitHub repo）
4. Sanity Webhook 與 Cloudflare Deploy hook 網址

## 變更紀錄
- 2026-06-21：建立進度檔，開始階段一。
