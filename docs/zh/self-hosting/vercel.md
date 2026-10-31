# 部署到 Vercel

[Vercel](https://vercel.com) 为静态站点提供最简单的部署体验。

## 一键部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/alam00000/bentopdf)

## 手动部署

### 步骤 1：Fork 仓库

将 [bentopdf/bentopdf](https://github.com/alam00000/bentopdf) Fork 到您的 GitHub 账户。

### 步骤 2：导入到 Vercel

1. 前往 [vercel.com/new](https://vercel.com/new)
2. 选择您 Fork 的仓库
3. 配置项目：

| 设置             | 值              |
| ---------------- | --------------- |
| Framework Preset | Vite            |
| Build Command    | `npm run build` |
| Output Directory | `dist`          |
| Install Command  | `npm install`   |

### 步骤 3：环境变量（可选）

如有需要，添加以下变量：

| 变量                    | 说明                                                     |
| ----------------------- | -------------------------------------------------------- |
| `SIMPLE_MODE`           | 设为 `true` 以使用精简界面                               |
| `VITE_BRAND_NAME`       | 自定义品牌名称（替换 "BentoPDF"）                        |
| `VITE_BRAND_LOGO`       | 相对于 `public/` 的标志路径（例如 `images/my-logo.svg`） |
| `VITE_FOOTER_TEXT`      | 自定义页脚/版权文字                                      |
| `VITE_DEFAULT_LANGUAGE` | 默认界面语言（例如 `fr`、`de`、`es`）                    |

### 步骤 4：部署

点击 "Deploy" 并等待构建完成。

## 自定义域名

1. 前往项目设置
2. 进入 "Domains"
3. 添加您的自定义域名
4. 按说明配置 DNS

## 限制

::: warning 大文件
Vercel 的 serverless 函数有 50MB 的限制。由于 BentoPDF 是静态站点，这通常不会影响您，但 WASM 模块很大（总计约 100MB）。请确保它们从 `/public` 文件夹提供。
:::

## 故障排除

### 构建超时

如果构建超时，请尝试：

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

### 刷新后出现 404

添加 `vercel.json` 以支持 SPA 路由：

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Word/ODT/Excel 转 PDF 无法使用

LibreOffice WASM 转换需要 `SharedArrayBuffer`，这要求所有页面都带有以下响应标头：

- `Cross-Origin-Embedder-Policy: require-corp`
- `Cross-Origin-Opener-Policy: same-origin`

预压缩的 `.wasm.gz` 和 `.data.gz` 文件还需要 `Content-Encoding: gzip`，浏览器才会对其解压。

将以下内容添加到您的 `vercel.json`：

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

要验证，请打开开发者工具控制台并运行 `console.log(window.crossOriginIsolated)`，它应返回 `true`。
