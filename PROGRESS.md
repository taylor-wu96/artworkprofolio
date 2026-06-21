# 專案進度追蹤 — 攝影藝術家部落格

> 架構：前台 Astro 6 + R3F｜後台 Sanity｜GitHub 原始碼 + Cloudflare Pages 部署
> 主題：光 / 門檻與邊界 / 衰敗與生機並存
> 此檔用來記錄建置進度，避免中斷後忘記做到哪。每完成一步就勾選並補上備註。

最後更新：2026-06-21（Sanity 已接通：standalone Studio + schema 已部署 + @sanity/astro 整合完成）

---

## 環境
- Node：v22.22.2（LTS）
- npm：10.9.7
- git：2.39.5
- 工作目錄：`/Users/taylor/Desktop/profolio`
- 結構（standalone，後台與前台並列，非內嵌）：
  - `~/Desktop/profolio/`            ＝ Astro 前台（此 repo）
  - `~/Desktop/studio-artwork-portfolio/` ＝ Sanity Studio 後台（獨立 repo）
- Sanity 專案：**z4fuhbhm**（"artwork portfolio"）、dataset `production`
- 登入帳號：a0716116z@icloud.com（GitHub 登入）

---

## 階段一：骨架可上線
- [x] 建立 Astro 專案（根目錄）— Astro 6.4.8
- [x] 加入 React 整合（`@astrojs/react` 5）— React 19
- [x] 安裝 Three.js 生態（`three @react-three/fiber@9 @react-three/drei@10`）
- [x] 安裝 Sanity 串接工具（`@sanity/client@7 @sanity/image-url`）
- [x] 本機 `npm run dev` 可開啟（已驗證 HTTP 200）
- [x] `npm run build` 可產出 `dist/`（已驗證，無警告）
- [x] git init 並首次 commit（6ec068a）
- [x] 推上 GitHub（`git@github.com:taylor-wu96/artworkprofolio.git`，main 分支，已產生 ed25519 金鑰）
- [ ] 接 Cloudflare Pages 自動部署（**需使用者操作**）

## 階段二：後台與內容
- [x] 建立 standalone Sanity Studio（`~/Desktop/studio-artwork-portfolio`，project z4fuhbhm）
- [x] 定義 `theme` / `post` / `index` schema（依 sanity-best-practices skill）
- [x] **部署 schema 到 Content Lake**（`_.schemas.default` 已存在；用 `--no-extract-manifest` 繞過本機 worker crash）
- [x] 設定 Project ID / dataset（`.env`：`PUBLIC_SANITY_PROJECT_ID=z4fuhbhm`）
- [x] @sanity/astro 整合（`astro.config.mjs` + `sanity:client` 虛擬模組 + `loadEnv`）
- [x] 前台 client 串接改用 `sanity:client`（`src/lib/sanity.js`）
- [x] 文章列表頁 + 文章內頁（內文改用 `astro-portabletext`）
- [x] 主題篩選頁
- [x] build + dev smoke test 通過（3 頁 + RSS，HTTP 200，無 env/bundle 錯誤）
- [x] **種子內容**（CLI `dataset import`：3 themes + 3 posts；前台已渲染 9 頁、RSS 3 項，已驗證）
- [x] Sanity MCP server 已加到 user/global（`~/.claude.json`）— **待你 `/mcp` 完成 OAuth + 重啟 session**
- [ ] 加真實作品 / 上傳影像（後台 `npm run dev` → localhost:3333，或 MCP 授權後由我代勞）
- [ ] 部署 Studio：`npx sanity deploy`（需決定 *.sanity.studio 主機名）
- [ ] Studio repo 推上 GitHub（目前只在本機，2 個 commit）
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
1. **加內容**：`cd ~/Desktop/studio-artwork-portfolio && npm run dev` → 開 localhost:3333
   新增 theme（光/門檻與邊界/衰敗與生機）與 post → Publish
2. **看前台**：`cd ~/Desktop/profolio && npm run dev` → localhost:4321，作品會出現
3. **Cloudflare Pages**：連 `artworkprofolio` repo，Build=`npm run build`、Output=`dist`，
   並加環境變數 `PUBLIC_SANITY_PROJECT_ID=z4fuhbhm`、`PUBLIC_SANITY_DATASET=production`
4. **部署後台**：`cd ~/Desktop/studio-artwork-portfolio && npx sanity deploy`
5. **自動重建**：Cloudflare Deploy hook ↔ Sanity Webhook

## 已知問題 / 備忘
- 本機 `npx sanity schema deploy`（預設）/`schema list`/`manifest extract`(worker) 會 exit 134 abort。
  解法：先 `npx sanity manifest extract`，再 `npx sanity schema deploy --no-extract-manifest`。
- Studio 為獨立 git repo，尚未推到 GitHub（可另開 repo 或放同 monorepo）。

## 變更紀錄
- 2026-06-21：建立進度檔，開始階段一。
- 2026-06-21：完成階段一全部程式 + 階段二程式 + 階段三 hero。首次 commit 6ec068a。
- 2026-06-21：推上 GitHub（artworkprofolio）。
- 2026-06-21：用 sanity-best-practices skill 正式接通 Sanity — 建 standalone Studio（z4fuhbhm）、
  部署 schema、改用 @sanity/astro + sanity:client + astro-portabletext；移除內嵌 studio/ 與 @portabletext/to-html。
