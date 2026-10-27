# 部署到 Cloudflare Pages

[Cloudflare Pages](https://pages.cloudflare.com) 提供快速的全球静态站点托管，带宽不限量。

## 快速部署

1. 前往 [Cloudflare Pages](https://dash.cloudflare.com/?to=/:account/pages)
2. 点击 "Create a project"
3. 连接您的 GitHub 仓库

## 构建配置

| 设置                   | 值              |
| ---------------------- | --------------- |
| Framework preset       | None            |
| Build command          | `npm run build` |
| Build output directory | `dist`          |
| Root directory         | `/`             |

## 环境变量

在 Settings → Environment variables 中添加以下变量：

| 变量                    | 值                                    |
| ----------------------- | ------------------------------------- |
| `NODE_VERSION`          | `18`                                  |
| `SIMPLE_MODE`           | `false`（可选）                       |
| `VITE_BRAND_NAME`       | 自定义品牌名称（可选）                |
| `VITE_BRAND_LOGO`       | 相对于 `public/` 的 Logo 路径（可选） |
| `VITE_FOOTER_TEXT`      | 自定义页脚/版权文本（可选）           |
| `VITE_DEFAULT_LANGUAGE` | 默认界面语言，例如 `fr`（可选）       |

## 配置文件

在 `public` 文件夹中创建 `_headers`：

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
Word/ODT/Excel/PowerPoint 转 PDF 需要 `Cross-Origin-Embedder-Policy` 和 `Cross-Origin-Opener-Policy` 响应头。没有它们，`SharedArrayBuffer` 将不可用，LibreOffice WASM 引擎将无法初始化。
:::

创建 `_redirects` 以支持 SPA 路由：

```
/*    /index.html   200
```

## 自定义域名

1. 前往您的 Pages 项目
2. 点击 "Custom domains"
3. 添加您的域名
4. 如果域名托管在 Cloudflare，Cloudflare 会自动配置 DNS

## 优势

- **免费且带宽不限量**
- **全球 CDN**，拥有 300+ 个边缘节点
- **自动 HTTPS**
- 为拉取请求提供**预览部署**
- **构建速度快**

## 故障排查

### 大文件上传

Cloudflare Pages 支持最大 25 MB 的文件。WASM 模块通常没有问题，但如果遇到限制，可以考虑：

```bash
# Split large files during build
npm run build
```

### Worker 大小限制

如果使用 Cloudflare Workers 进行高级路由，请注意免费计划有 1 MB 的限制。

## CORS 代理 Worker（用于数字签名）

数字签名工具需要 CORS 代理来获取证书链。请部署随附的 worker：

```bash
cd cloudflare
npx wrangler login
npx wrangler deploy
```

### 安全特性

| 特性             | 说明                                |
| ---------------- | ----------------------------------- |
| **URL 限制**     | 仅允许证书 URL                      |
| **文件大小限制** | 每个请求最大 10MB                   |
| **速率限制**     | 每个 IP 每分钟 60 次请求（需要 KV） |
| **私有 IP 拦截** | 拦截 localhost 和内部 IP            |

### 启用速率限制

```bash
# Create KV namespace
npx wrangler kv namespace create "RATE_LIMIT_KV"

# Add to wrangler.toml with returned ID:
# [[kv_namespaces]]
# binding = "RATE_LIMIT_KV"
# id = "YOUR_ID"

npx wrangler deploy
```

### 使用代理 URL 构建

```bash
VITE_CORS_PROXY_URL=https://your-worker.workers.dev npm run build
```

或者使用 Docker：

```bash
export VITE_CORS_PROXY_URL="https://your-worker.workers.dev"
DOCKER_BUILDKIT=1 docker build \
  --secret id=VITE_CORS_PROXY_URL,env=VITE_CORS_PROXY_URL \
  -t your-bentopdf .
```

> **注意：** HMAC 签名的设置请参阅 [README](https://github.com/alam00000/bentopdf#digital-signature-cors-proxy-required)。
