# 部署到 Netlify

[Netlify](https://netlify.com) 提供出色的静态站点托管，并有慷慨的免费额度。

## 一键部署

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/alam00000/bentopdf)

## 手动部署

### 步骤 1：连接仓库

1. 登录 [Netlify](https://app.netlify.com)
2. 点击 "Add new site" → "Import an existing project"
3. 连接您的 GitHub 账户
4. 选择您的 BentoPDF 分支

### 步骤 2：配置构建设置

| 设置      | 值              |
| --------- | --------------- |
| 构建命令  | `npm run build` |
| 发布目录  | `dist`          |
| Node 版本 | 18+             |

### 步骤 3：部署

点击 "Deploy site" 并等待构建完成。

## 配置文件

在项目根目录创建 `netlify.toml`：

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
Word/ODT/Excel/PowerPoint 转 PDF 需要 `Cross-Origin-Embedder-Policy` 和 `Cross-Origin-Opener-Policy` 标头。缺少它们时，`SharedArrayBuffer` 不可用，LibreOffice WASM 引擎将无法初始化。

`.wasm.gz` 和 `.data.gz` 文件上的 `Content-Encoding: gzip` 标头会告诉浏览器自动解压。缺少这些标头时，浏览器收到的是原始 gzip 字节，WASM 编译会失败。
:::

## 环境变量

在 Site settings → Environment variables 中设置：

| 变量                    | 说明                                                     |
| ----------------------- | -------------------------------------------------------- |
| `SIMPLE_MODE`           | 设为 `true` 以使用精简构建                               |
| `VITE_BRAND_NAME`       | 自定义品牌名称（替换 "BentoPDF"）                        |
| `VITE_BRAND_LOGO`       | 相对于 `public/` 的标志路径（例如 `images/my-logo.svg`） |
| `VITE_FOOTER_TEXT`      | 自定义页脚/版权文字                                      |
| `VITE_DEFAULT_LANGUAGE` | 默认界面语言（例如 `fr`、`de`、`es`）                    |

## 自定义域名

1. 前往 Site settings → Domain management
2. 点击 "Add custom domain"
3. 按照说明配置 DNS

## 大型媒体文件

对于较大的 WASM 文件，可以考虑启用 [Netlify Large Media](https://docs.netlify.com/large-media/overview/)：

```bash
netlify lm:setup
git lfs track "*.wasm"
```

## 故障排除

### Word/ODT/Excel 转 PDF 卡在 55%

如果文档转换卡在 55%，请打开开发者工具控制台并检查：

```js
console.log(window.crossOriginIsolated); // should be true
console.log(typeof SharedArrayBuffer); // should be "function"
```

如果 `crossOriginIsolated` 为 `false`，说明 `netlify.toml` 中的 COEP/COOP 标头没有生效。请确认该文件位于项目根目录，然后重新部署。

如果您在控制台看到 `expected magic word 00 61 73 6d, found 1f 8b 08 08`，说明 `.wasm.gz` 文件缺少 `Content-Encoding: gzip` 标头。请确保 `netlify.toml` 中包含 `soffice.wasm.gz` 和 `soffice.data.gz` 的 `[[headers]]` 块。

### 构建失败

检查 Node 版本兼容性：

```toml
[build.environment]
  NODE_VERSION = "20"
```

### 首次加载缓慢

在 Site settings → Build & deploy → Asset optimization 中启用资源优化。
