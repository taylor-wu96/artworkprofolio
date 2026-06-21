# 專案進度追蹤 — 攝影藝術家部落格

> 架構：前台 Astro 6 + R3F｜後台 Sanity｜GitHub 原始碼 + Cloudflare Pages 部署
> 主題：光 / 門檻與邊界 / 衰敗與生機並存
> 此檔用來記錄建置進度，避免中斷後忘記做到哪。每完成一步就勾選並補上備註。

最後更新：2026-06-21（階段一程式完成，待使用者接 GitHub / Cloudflare / Sanity）

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
- [x] 建立 Astro 專案（根目錄）— Astro 6.4.8
- [x] 加入 React 整合（`@astrojs/react` 5）— React 19
- [x] 安裝 Three.js 生態（`three @react-three/fiber@9 @react-three/drei@10`）
- [x] 安裝 Sanity 串接工具（`@sanity/client@7 @sanity/image-url`）
- [x] 本機 `npm run dev` 可開啟（已驗證 HTTP 200）
- [x] `npm run build` 可產出 `dist/`（已驗證，無警告）
- [x] git init 並首次 commit（6ec068a）
- [ ] 推上 GitHub（**需使用者操作**：建立 repo 後 `git remote add` + push）
- [ ] 接 Cloudflare Pages 自動部署（**需使用者操作**）

## 階段二：後台與內容
- [x] 建立 Sanity Studio（`./studio/`，schema + config 已就緒）
- [x] 定義 `theme` / `post` / `index` schema
- [ ] 設定 Project ID / dataset（**需使用者帳號**：`cd studio && npx sanity init`）
- [x] 前台 client 串接（`src/lib/sanity.js` + `queries.js`，含 safeFetch 容錯）
- [x] 文章列表頁 + 文章內頁（`index.astro` / `post/[slug].astro`）
- [x] 主題篩選頁（`themes/index.astro` / `themes/[slug].astro`）
- [ ] 設定 .env 的 SANITY_PROJECT_ID（**需先有 Project ID**）
- [ ] Sanity Webhook → Cloudflare Deploy hook（**需使用者操作**）

## 階段三：視覺亮點
- [x] R3F Hero 場景（`Hero3D.jsx`：掃動光 + 侵蝕感形體，呼應光/門檻/衰敗）
- [ ] 影像集 lightbox（目前為靜態 gallery grid）
- [ ] 頁面轉場（可加 Astro View Transitions）
- [ ] 進階：drei `useTexture` 3D 影像牆

## 階段四：收尾與延伸
- [ ] 自訂網域、OG/SEO、RSS
- [ ] 聯絡表單 / 電子報 / zine 販售連結（視需要）

---

## 待使用者提供 / 操作的項目
1. Sanity 帳號與 **Project ID**（執行 `sanity` 初始化時取得）
2. GitHub 空 repo 網址（推送用）
3. Cloudflare Pages 專案（連 GitHub repo）
4. Sanity Webhook 與 Cloudflare Deploy hook 網址

## 接手指引（下次回來看這裡）
你（編輯）需要做的下一步，依序：
1. **GitHub**：建立空 repo → `git remote add origin <網址>` → `git push -u origin main`
2. **Cloudflare Pages**：連該 repo，Build=`npm run build`、Output=`dist`
3. **Sanity**：`cd studio && npm install && npx sanity login && npx sanity init`
   取得 Project ID 後 → 根目錄 `cp .env.example .env` 填入 → 在 Cloudflare 也加同名環境變數
4. 後台新增 theme/post → 前台重建即顯示內容

## 變更紀錄
- 2026-06-21：建立進度檔，開始階段一。
- 2026-06-21：完成階段一全部程式 + 階段二程式 + 階段三 hero。build/dev 已驗證，首次 commit 6ec068a。剩餘為需使用者帳號操作的接線項目。
