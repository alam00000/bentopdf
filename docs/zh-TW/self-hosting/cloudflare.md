# 部署到 Cloudflare Pages

[Cloudflare Pages](https://pages.cloudflare.com) 提供快速、全球化且頻寬無上限的靜態網站託管。

## 快速部署

1. 前往 [Cloudflare Pages](https://dash.cloudflare.com/?to=/:account/pages)
2. 點選「Create a project」
3. 連結您的 GitHub 儲存庫

## 建置設定

| 設定項目               | 值              |
| ---------------------- | --------------- |
| Framework preset       | None            |
| Build command          | `npm run build` |
| Build output directory | `dist`          |
| Root directory         | `/`             |

## 環境變數

在 Settings → Environment variables 中加入以下項目：

| 變數                    | 值                                  |
| ----------------------- | ----------------------------------- |
| `NODE_VERSION`          | `18`                                |
| `SIMPLE_MODE`           | `false`（選填）                     |
| `VITE_BRAND_NAME`       | 自訂品牌名稱（選填）                |
| `VITE_BRAND_LOGO`       | 相對於 `public/` 的標誌路徑（選填） |
| `VITE_FOOTER_TEXT`      | 自訂頁尾/版權文字（選填）           |
| `VITE_DEFAULT_LANGUAGE` | 預設介面語言，例如 `fr`（選填）     |

## 設定檔

在您的 `public` 資料夾中建立 `_headers`：

```
# Required security headers for SharedArrayBuffer (used by LibreOffice WASM)
/*
  Cross-Origin-Embedder-Policy: require-corp
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Resource-Policy: cross-origin

# Pre-compressed LibreOffice WASM binary
/libreoffice-wasm/soffice.wasm.gz
  Content-Type: application/wasm
  Content-Encoding: gzip
  Cache-Control: public, max-age=31536000, immutable

# Pre-compressed LibreOffice WASM data
/libreoffice-wasm/soffice.data.gz
  Content-Type: application/octet-stream
  Content-Encoding: gzip
  Cache-Control: public, max-age=31536000, immutable

# Cache WASM files aggressively
/*.wasm
  Cache-Control: public, max-age=31536000, immutable
  Content-Type: application/wasm

# Service worker
/sw.js
  Cache-Control: no-cache
```

::: warning 重要
Word/ODT/Excel/PowerPoint 轉 PDF 需要 `Cross-Origin-Embedder-Policy` 與 `Cross-Origin-Opener-Policy` 標頭。缺少它們時，`SharedArrayBuffer` 將無法使用，LibreOffice WASM 引擎會初始化失敗。
:::

為 SPA 路由建立 `_redirects`：

```
/*    /index.html   200
```

## 自訂網域

1. 前往您的 Pages 專案
2. 點選「Custom domains」
3. 加入您的網域
4. 若網域位於 Cloudflare 上，Cloudflare 會自動設定 DNS

## 優點

- **免費且無上限的頻寬**
- **全球 CDN**，擁有 300 個以上的邊緣節點
- **自動 HTTPS**
- 針對 pull request 的**預覽部署**
- **快速建置**

## 疑難排解

### 大型檔案上傳

Cloudflare Pages 支援最大 25 MB 的檔案。WASM 模組應該沒問題，但若遇到限制，可以考慮：

```bash
# Split large files during build
npm run build
```

### Worker 大小限制

若使用 Cloudflare Workers 進行進階路由，請注意免費方案有 1 MB 的限制。

## CORS 代理 Worker（用於數位簽章）

數位簽章工具需要 CORS 代理來擷取憑證鏈。請部署內附的 worker：

```bash
cd cloudflare
npx wrangler login
npx wrangler deploy
```

### 安全功能

| 功能             | 說明                          |
| ---------------- | ----------------------------- |
| **URL 限制**     | 僅允許憑證 URL                |
| **檔案大小限制** | 每個請求最大 10MB             |
| **速率限制**     | 每 IP 每分鐘 60 次（需要 KV） |
| **私人 IP 封鎖** | 封鎖 localhost 與內部 IP      |

### 啟用速率限制

```bash
# Create KV namespace
npx wrangler kv namespace create "RATE_LIMIT_KV"

# Add to wrangler.toml with returned ID:
# [[kv_namespaces]]
# binding = "RATE_LIMIT_KV"
# id = "YOUR_ID"

npx wrangler deploy
```

### 以代理 URL 建置

```bash
VITE_CORS_PROXY_URL=https://your-worker.workers.dev npm run build
```

或使用 Docker：

```bash
export VITE_CORS_PROXY_URL="https://your-worker.workers.dev"
DOCKER_BUILDKIT=1 docker build \
  --secret id=VITE_CORS_PROXY_URL,env=VITE_CORS_PROXY_URL \
  -t your-bentopdf .
```

> **注意：** HMAC 簽章設定請參閱 [README](https://github.com/alam00000/bentopdf#digital-signature-cors-proxy-required)。
