# 部署到 Vercel

[Vercel](https://vercel.com) 為靜態網站提供最簡單的部署體驗。

## 一鍵部署

[![使用 Vercel 部署](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/alam00000/bentopdf)

## 手動部署

### 步驟 1：Fork 儲存庫

將 [bentopdf/bentopdf](https://github.com/alam00000/bentopdf) Fork 到您的 GitHub 帳號。

### 步驟 2：匯入至 Vercel

1. 前往 [vercel.com/new](https://vercel.com/new)
2. 選擇您 Fork 的儲存庫
3. 設定專案：

| 設定項目         | 值              |
| ---------------- | --------------- |
| Framework Preset | Vite            |
| Build Command    | `npm run build` |
| Output Directory | `dist`          |
| Install Command  | `npm install`   |

### 步驟 3：環境變數（選用）

視需要加入以下變數：

| 變數                    | 說明                                                     |
| ----------------------- | -------------------------------------------------------- |
| `SIMPLE_MODE`           | 設為 `true` 以使用精簡介面                               |
| `VITE_BRAND_NAME`       | 自訂品牌名稱（取代「BentoPDF」）                         |
| `VITE_BRAND_LOGO`       | 相對於 `public/` 的標誌路徑（例如 `images/my-logo.svg`） |
| `VITE_FOOTER_TEXT`      | 自訂頁尾或版權文字                                       |
| `VITE_DEFAULT_LANGUAGE` | 預設介面語言（例如 `fr`、`de`、`es`）                    |

### 步驟 4：部署

點選「Deploy」並等待建置完成。

## 自訂網域

1. 前往專案設定
2. 進入「Domains」
3. 加入您的自訂網域
4. 依照指示設定 DNS

## 限制

::: warning 大型檔案
Vercel 的無伺服器函式有 50MB 的限制。由於 BentoPDF 是靜態網站，這應該不會影響您，但 WASM 模組很大（總計約 100MB）。請確保它們從 `/public` 資料夾提供。
:::

## 疑難排解

### 建置逾時

如果建置逾時，請嘗試：

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

### 重新整理時出現 404

加入 `vercel.json` 以支援 SPA 路由：

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Word/ODT/Excel 轉 PDF 無法運作

LibreOffice WASM 轉換需要 `SharedArrayBuffer`，而這需要所有頁面都帶有以下回應標頭：

- `Cross-Origin-Embedder-Policy: require-corp`
- `Cross-Origin-Opener-Policy: same-origin`

預先壓縮的 `.wasm.gz` 與 `.data.gz` 檔案也需要 `Content-Encoding: gzip`，瀏覽器才會將其解壓縮。

將以下內容加入 `vercel.json`：

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Cross-Origin-Embedder-Policy", "value": "require-corp" },
        { "key": "Cross-Origin-Opener-Policy", "value": "same-origin" },
        { "key": "Cross-Origin-Resource-Policy", "value": "cross-origin" }
      ]
    },
    {
      "source": "/libreoffice-wasm/soffice.wasm.gz",
      "headers": [
        { "key": "Content-Type", "value": "application/wasm" },
        { "key": "Content-Encoding", "value": "gzip" }
      ]
    },
    {
      "source": "/libreoffice-wasm/soffice.data.gz",
      "headers": [
        { "key": "Content-Type", "value": "application/octet-stream" },
        { "key": "Content-Encoding", "value": "gzip" }
      ]
    }
  ]
}
```

若要驗證，請開啟開發者工具主控台並執行 `console.log(window.crossOriginIsolated)`，應該會回傳 `true`。
