# 部署到 Netlify

[Netlify](https://netlify.com) 提供優秀的靜態網站託管服務，並有慷慨的免費方案。

## 一鍵部署

[![部署到 Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/alam00000/bentopdf)

## 手動部署

### 步驟 1：連結儲存庫

1. 登入 [Netlify](https://app.netlify.com)
2. 點選「Add new site」→「Import an existing project」
3. 連結您的 GitHub 帳號
4. 選擇您的 BentoPDF 分支

### 步驟 2：設定建置選項

| 設定項目  | 值              |
| --------- | --------------- |
| 建置指令  | `npm run build` |
| 發佈目錄  | `dist`          |
| Node 版本 | 18+             |

### 步驟 3：部署

點選「Deploy site」並等待建置完成。

## 設定檔

在專案根目錄建立 `netlify.toml`：

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

# Required security headers for SharedArrayBuffer (used by LibreOffice WASM)
[[headers]]
  for = "/*"
  [headers.values]
    Cross-Origin-Embedder-Policy = "require-corp"
    Cross-Origin-Opener-Policy = "same-origin"
    Cross-Origin-Resource-Policy = "cross-origin"

# Pre-compressed LibreOffice WASM binary - must be served with Content-Encoding
[[headers]]
  for = "/libreoffice-wasm/soffice.wasm.gz"
  [headers.values]
    Content-Type = "application/wasm"
    Content-Encoding = "gzip"
    Cache-Control = "public, max-age=31536000, immutable"

# Pre-compressed LibreOffice WASM data - must be served with Content-Encoding
[[headers]]
  for = "/libreoffice-wasm/soffice.data.gz"
  [headers.values]
    Content-Type = "application/octet-stream"
    Content-Encoding = "gzip"
    Cache-Control = "public, max-age=31536000, immutable"

# Cache other WASM files
[[headers]]
  for = "*.wasm"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
    Content-Type = "application/wasm"

# SPA routing
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

::: warning 重要
Word/ODT/Excel/PowerPoint 轉 PDF 需要 `Cross-Origin-Embedder-Policy` 與 `Cross-Origin-Opener-Policy` 標頭。沒有它們，`SharedArrayBuffer` 將無法使用，LibreOffice WASM 引擎也會初始化失敗。

`.wasm.gz` 與 `.data.gz` 檔案上的 `Content-Encoding: gzip` 標頭會告訴瀏覽器自動解壓縮。少了這些標頭，瀏覽器會收到原始 gzip 位元組，導致 WASM 編譯失敗。
:::

## 環境變數

在 Site settings → Environment variables 中設定：

| 變數                    | 說明                                                     |
| ----------------------- | -------------------------------------------------------- |
| `SIMPLE_MODE`           | 設為 `true` 以使用精簡建置                               |
| `VITE_BRAND_NAME`       | 自訂品牌名稱（取代「BentoPDF」）                         |
| `VITE_BRAND_LOGO`       | 相對於 `public/` 的標誌路徑（例如 `images/my-logo.svg`） |
| `VITE_FOOTER_TEXT`      | 自訂頁尾或版權文字                                       |
| `VITE_DEFAULT_LANGUAGE` | 預設介面語言（例如 `fr`、`de`、`es`）                    |

## 自訂網域

1. 前往 Site settings → Domain management
2. 點選「Add custom domain」
3. 依照 DNS 設定說明操作

## 大型媒體

對於大型 WASM 檔案，可考慮啟用 [Netlify Large Media](https://docs.netlify.com/large-media/overview/)：

```bash
netlify lm:setup
git lfs track "*.wasm"
```

## 疑難排解

### Word/ODT/Excel 轉 PDF 卡在 55%

如果文件轉換卡在 55%，請開啟開發者工具主控台並檢查：

```js
console.log(window.crossOriginIsolated); // should be true
console.log(typeof SharedArrayBuffer); // should be "function"
```

如果 `crossOriginIsolated` 為 `false`，表示 `netlify.toml` 中的 COEP/COOP 標頭沒有套用。請確認檔案位於專案根目錄，然後重新部署。

如果您在主控台看到 `expected magic word 00 61 73 6d, found 1f 8b 08 08`，表示 `.wasm.gz` 檔案缺少 `Content-Encoding: gzip` 標頭。請確認 `netlify.toml` 中有 `soffice.wasm.gz` 與 `soffice.data.gz` 的 `[[headers]]` 區塊。

### 建置失敗

檢查 Node 版本相容性：

```toml
[build.environment]
  NODE_VERSION = "20"
```

### 初次載入緩慢

在 Site settings → Build & deploy → Asset optimization 中啟用資源最佳化。
