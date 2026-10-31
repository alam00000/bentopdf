# 自托管指南

BentoPDF 可以部署在您自己的基础设施上。本指南介绍多种部署方式。

## 使用 Docker / Podman 快速开始

自托管 BentoPDF 最快的方式：

> [!TIP]
> BentoPDF 提供两种构建版本：
>
> - **自托管版本**：`ghcr.io/alam00000/bentopdf-simple:latest`。包含所有 PDF 工具，但**不含**营销页面元素（没有首页横幅、FAQ、用户评价和页脚）。适用于内部、团队或组织部署。它**不是**功能精简的“轻量”版本。
> - **商业版本**：`ghcr.io/alam00000/bentopdf:latest`。完整的营销网站，bentopdf.com 本身以及运行面向公众部署的商业许可持有者使用该版本。
>
> 如果拿不准，请拉取自托管版本。

> [!IMPORTANT]
> Office 文件转换需要 `SharedArrayBuffer`，这意味着应用必须同时满足跨源隔离，并通过安全上下文提供服务。官方镜像已经发送所需的 COOP/COEP 标头，但浏览器仍会在 `http://192.168.x.x` 这类普通 HTTP 局域网来源上禁用 `SharedArrayBuffer`。
>
> `http://localhost` 仅用于同一设备上的测试。如果用户通过局域网 IP 或主机名访问 BentoPDF，请使用 HTTPS 终止连接。

```bash
# Docker
docker run -d -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest

# Podman
podman run -d -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest
```

或者使用 Docker Compose / Podman Compose：

```yaml
# docker-compose.yml
services:
  bentopdf:
    image: ghcr.io/alam00000/bentopdf-simple:latest
    ports:
      - '3000:8080'
    restart: unless-stopped
```

```bash
# Docker Compose
docker compose up -d

# Podman Compose
podman-compose up -d
```

## Podman Quadlet（Linux Systemd）

将 BentoPDF 作为 systemd 服务运行。创建 `~/.config/containers/systemd/bentopdf.container`：

```ini
[Container]
Image=ghcr.io/alam00000/bentopdf-simple:latest
ContainerName=bentopdf
PublishPort=3000:8080
AutoUpdate=registry

[Service]
Restart=always

[Install]
WantedBy=default.target
```

```bash
systemctl --user daemon-reload
systemctl --user enable --now bentopdf
```

完整的 Quadlet 文档请参阅 [Docker 部署指南](/zh/self-hosting/docker)。

## 从源码构建

```bash
# Clone and build
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf
npm install
npm run build

# The built files are in the `dist` folder
```

## 配置选项

### 自托管版本（Simple Mode）

自托管版本（`bentopdf-simple` 镜像，也称为 Simple Mode）与商业版本**功能完全相同**，所有 PDF 工具都在，行为也一致。它只是隐藏了仅适用于 bentopdf.com 本身或商业面向公众部署的营销页面元素。**它不是功能精简的“轻量”版本。**

**自托管版本隐藏的内容**（仅外观层面，不会移除任何 PDF 功能）：

- 导航栏、首页横幅、功能介绍区、FAQ、用户评价、页脚
- 页面标题更新为“PDF 工具”

**自托管版本保留的内容**（所有真正处理 PDF 的部分）：

- 所有 PDF 工具（合并、拆分、编辑、签名、OCR、Office 转换等）
- 自定义品牌支持，以及所有构建时和运行时配置

商业版本（`ghcr.io/alam00000/bentopdf:latest`）是 bentopdf.com 本身所用的版本，也供运行面向公众部署的商业许可持有者使用。它额外包含首页横幅、FAQ、用户评价和页脚，这些内容在内部工具中没有意义。

如果您为团队、组织自托管 BentoPDF，或将其用作内部工具，请拉取自托管版本：

```bash
# Use the pre-built image (recommended)
docker run -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest

# Or build it yourself
SIMPLE_MODE=true npm run build
```

详情请参阅 [SIMPLE_MODE.md](https://github.com/alam00000/bentopdf/blob/main/SIMPLE_MODE.md)。

### 商业版本（使用自有品牌的面向公众部署）

商业版本（`bentopdf` 镜像，没有 `-simple` 后缀）是 bentopdf.com 本身所用的版本。除所有 PDF 工具外，它还包含完整的营销网站（首页横幅、功能介绍、FAQ、用户评价、页脚）。当您想以自有品牌**将 BentoPDF 部署为面向公众的 PDF 服务**时，请使用此版本，例如：

- 您在自己的域名上为最终用户提供托管的 SaaS 服务
- 您想要完整的落地页体验（营销板块加工具），而不只是单纯的工具界面
- 您是商业许可持有者，将 BentoPDF 嵌入商业产品

**直接运行**（BentoPDF 品牌，适合预览该版本）：

```bash
docker run -p 3000:8080 ghcr.io/alam00000/bentopdf:latest
```

**使用自有品牌构建**（典型的商业工作流）：

```bash
docker build \
  --build-arg VITE_BRAND_NAME="AcmePDF" \
  --build-arg VITE_BRAND_LOGO="images/acme-logo.svg" \
  --build-arg VITE_FOOTER_TEXT="© 2026 Acme Corp. All rights reserved." \
  -t acmepdf .

docker run -p 3000:8080 acmepdf
```

其他所有构建时选项（`BASE_URL`、`VITE_DEFAULT_LANGUAGE`、`DISABLE_TOOLS`、WASM URL 覆盖等）的用法与自托管版本相同。

::: warning 许可
BentoPDF 的两种许可方式都允许运行商业版本：

- **AGPL-3.0**（免费）：如果您的部署以 AGPL 公开完整源代码（包括任何品牌修改和周边业务逻辑），则允许使用。
- **商业许可**（$79 终身）：闭源或专有部署需要此许可，即您不公开品牌分支或业务代码的情况。

完整对比请参阅[许可页面](https://www.bentopdf.com/licensing)。采用 AGPL 许可的 WASM 模块（PyMuPDF、Ghostscript、CoherentPDF）在运行时从 CDN 加载，因此不会进入您的镜像，也不会改变您的许可状况。
:::

### Base URL

部署到子目录：

```bash
BASE_URL=/pdf-tools/ npm run build
```

### 自定义品牌

在构建时将默认的 BentoPDF 标志、名称和页脚文字替换为您自己的：

| 变量               | 说明                        | 默认值                                  |
| ------------------ | --------------------------- | --------------------------------------- |
| `VITE_BRAND_NAME`  | 显示在页眉和页脚的品牌名称  | `BentoPDF`                              |
| `VITE_BRAND_LOGO`  | 相对于 `public/` 的标志路径 | `images/favicon-no-bg.svg`              |
| `VITE_FOOTER_TEXT` | 自定义页脚/版权文字         | `© 2026 BentoPDF. All rights reserved.` |

```bash
# Place your logo in public/, then build
VITE_BRAND_NAME="AcmePDF" \
VITE_BRAND_LOGO="images/acme-logo.svg" \
VITE_FOOTER_TEXT="© 2026 Acme Corp. Internal use only." \
npm run build
```

或通过 Docker：

```bash
docker build \
  --build-arg VITE_BRAND_NAME="AcmePDF" \
  --build-arg VITE_BRAND_LOGO="images/acme-logo.svg" \
  --build-arg VITE_FOOTER_TEXT="© 2026 Acme Corp. Internal use only." \
  -t acmepdf .
```

品牌定制在完整模式和 Simple Mode 下均可使用，并可与所有其他构建时选项（`BASE_URL`、`SIMPLE_MODE`、`VITE_DEFAULT_LANGUAGE`）组合使用。

### 禁用特定工具

出于合规或安全考虑，可以隐藏个别工具。被禁用的工具会从首页、搜索、快捷键、工作流构建器以及直接 URL 访问中移除。

工具 ID 即页面 URL 去掉 `.html` 的部分，打开任意工具并查看 URL 即可（例如 `edit-pdf`、`sign-pdf`、`encrypt-pdf`）。

**构建时**（写入打包产物）：

```bash
DISABLE_TOOLS="edit-pdf,sign-pdf" npm run build
```

**运行时**（无需重新构建，挂载 `config.json`）：

```json
{
  "disabledTools": ["edit-pdf", "sign-pdf"]
}
```

```bash
docker run -d -p 3000:8080 \
  -v ./config.json:/usr/share/nginx/html/config.json:ro \
  ghcr.io/alam00000/bentopdf-simple:latest
```

两种方法可以同时使用，列表会合并。

您还可以在 `config.json` 中添加 `editorDisabledCategories`，在不禁用整个工具的情况下禁用 PDF 编辑器内的特定功能（例如涂黑）。完整的类别列表请参阅 [Docker 指南](/zh/self-hosting/docker#禁用编辑器功能)。

## 部署指南

选择您的平台：

- [Vercel](/zh/self-hosting/vercel)
- [Netlify](/zh/self-hosting/netlify)
- [Cloudflare Pages](/zh/self-hosting/cloudflare)
- [AWS S3 + CloudFront](/zh/self-hosting/aws)
- [Hostinger](/zh/self-hosting/hostinger)
- [Nginx](/zh/self-hosting/nginx)
- [Apache](/zh/self-hosting/apache)
- [Docker](/zh/self-hosting/docker)
- [Kubernetes](/zh/self-hosting/kubernetes)
- [CORS 代理](/zh/self-hosting/cors-proxy)：数字签名所必需

## 常见问题

### Word / ODT / Excel / PowerPoint 转 PDF 卡住（SharedArrayBuffer 不可用）

**现象**：基于 LibreOffice 的文档转换（Word、ODT、Excel、PowerPoint 转 PDF）在约 55% 处卡住或无法启动。浏览器控制台可能显示：

> `ReferenceError: SharedArrayBuffer is not defined`

……或者 `window.crossOriginIsolated` 返回 `false`，或者 WASM 编译报告 `expected magic word 00 61 73 6d, found 1f 8b 08 08`。

**原因**：LibreOffice WASM 需要 `SharedArrayBuffer`，而浏览器只有在页面**跨源隔离**且通过**安全上下文**提供时才会启用它。这意味着必须同时满足两点：

1. 每个响应都包含以下两个标头：
   - `Cross-Origin-Embedder-Policy: require-corp`
   - `Cross-Origin-Opener-Policy: same-origin`
2. 页面通过 `https://...` 或 `http://localhost` 提供。局域网 IP 上的普通 HTTP（例如 `http://192.168.x.x`）不属于安全上下文，浏览器会在那里禁用 `SharedArrayBuffer`。

`00 61 73 6d / 1f 8b 08 08` 不匹配是另一个子症状：预压缩的 `.wasm.gz` / `.data.gz` 文件缺少 `Content-Encoding: gzip` 响应标头，因此浏览器收到的是未解压的原始 gzip 字节，而不是 WASM。

**解决方法**：请参阅对应平台的部署指南以获取确切配置：

- [Nginx →](/zh/self-hosting/nginx#word-odt-excel-转-pdf-无法使用)
- [Apache →](/zh/self-hosting/apache#word-odt-excel-转-pdf-无法使用)
- [AWS S3 + CloudFront →](/zh/self-hosting/aws#第-3b-步-响应头策略-libreoffice-wasm-必需)
- [Cloudflare Pages →](/zh/self-hosting/cloudflare#配置文件)（`_headers` 文件）
- [Netlify →](/zh/self-hosting/netlify#word-odt-excel-转-pdf-卡在-55)（`netlify.toml`）
- [Vercel →](/zh/self-hosting/vercel#word-odt-excel-转-pdf-无法使用)（`vercel.json`）
- [Hostinger →](/zh/self-hosting/hostinger#libreoffice-工具无法使用)（`.htaccess`）
- [Kubernetes →](/zh/self-hosting/kubernetes#确保-sharedarraybuffer-标头仍然有效-ingress-gateway)
- **Docker**：由内置的 nginx 配置自动处理，无需任何操作。

**验证**：在任意 BentoPDF 页面打开开发者工具控制台并运行：

```js
console.log(window.crossOriginIsolated); // should be true
console.log(typeof SharedArrayBuffer); // should be "function"
```

如果页面使用 HTTPS 或 `http://localhost`，并且每个响应都带有 COEP/COOP 标头，两项检查都会通过。如果您使用的是 `http://192.168.x.x` 或其他非回环 HTTP 来源，请使用 HTTPS 终止连接，仅靠标头无法解决。

### `.mjs` 文件以 `application/octet-stream` 提供

**现象**：签署 PDF、Form Filler 或某些其他工具显示空白查看器或无法加载。浏览器控制台报告：

> `Failed to load module script: The server responded with a non-JavaScript MIME type of "application/octet-stream". Strict MIME type checking is enforced for module scripts per HTML spec.`

**原因**：您的 Web 服务器或反向代理没有 `.mjs` 文件的 MIME 类型映射（内置的 PDF 查看器使用该扩展名的 ES 模块）。许多默认服务器配置会将无法识别的扩展名归为 `application/octet-stream`，浏览器拒绝将其作为 ES 模块执行。

**解决方法**：请参阅对应平台的部署指南以获取确切的配置片段：

- [Nginx →](/zh/self-hosting/nginx#签署-pdf-或-form-filler-显示空白查看器-mjs-mime-错误)
- [Apache →](/zh/self-hosting/apache#签名-pdf-或表单填写器显示空白查看器-mjs-mime-错误)
- [AWS S3 + CloudFront →](/zh/self-hosting/aws#第-2-步-构建并上传)（参见 `aws s3 cp ... --include "*.mjs"`）
- [Kubernetes →](/zh/self-hosting/kubernetes#mjs-mime-类型错误-签署-pdf-form-filler-iframe-空白)
- **Docker、Vercel、Netlify、Cloudflare Pages、Hostinger**：自动处理，无需任何操作。

**验证**：打开开发者工具的 Network 标签，找到失败的 `.mjs` 请求，检查 `Content-Type` 响应标头。它应为 `application/javascript`。如果仍是 `application/octet-stream`，可能是外层的反向代理或 CDN 重新判断了类型，请检查服务链路中的每一层。

## WASM 配置（AGPL 组件）

BentoPDF 的源代码**不捆绑**采用 AGPL 许可的处理库，但**预先配置了 CDN URL**，因此所有功能开箱即用，无需手动设置。

::: tip 默认零配置
自 v2.0.0 起，WASM 模块已通过环境变量预先配置为从 jsDelivr CDN 加载。所有高级功能无需任何用户配置即可立即使用。
:::

| 组件            | 许可     | 功能                                       |
| --------------- | -------- | ------------------------------------------ |
| **PyMuPDF**     | AGPL-3.0 | EPUB/MOBI/FB2/XPS 转换、图片提取、表格提取 |
| **Ghostscript** | AGPL-3.0 | PDF/A 转换、压缩、纠偏、光栅化             |
| **CoherentPDF** | AGPL-3.0 | 目录、附件、带书签的 PDF 合并              |

### 默认环境变量

这些变量设置在 `.env.production` 中，并写入构建产物：

```bash
VITE_WASM_PYMUPDF_URL=https://cdn.jsdelivr.net/npm/@bentopdf/pymupdf-wasm@0.11.16/
VITE_WASM_GS_URL=https://cdn.jsdelivr.net/npm/@bentopdf/gs-wasm@0.1.1/assets/
VITE_WASM_CPDF_URL=https://cdn.jsdelivr.net/npm/coherentpdf@2.5.5/dist/
VITE_TESSERACT_WORKER_URL=
VITE_TESSERACT_CORE_URL=
VITE_TESSERACT_LANG_URL=
VITE_TESSERACT_AVAILABLE_LANGUAGES=
VITE_OCR_FONT_BASE_URL=
```

### 覆盖 WASM URL

您可以在构建时为自定义部署覆盖默认值：

```bash
# Via Docker build args
docker build \
  --build-arg VITE_WASM_PYMUPDF_URL=https://your-server.com/pymupdf/ \
  --build-arg VITE_WASM_GS_URL=https://your-server.com/gs/ \
  --build-arg VITE_WASM_CPDF_URL=https://your-server.com/cpdf/ \
  --build-arg VITE_TESSERACT_WORKER_URL=https://your-server.com/ocr/worker.min.js \
  --build-arg VITE_TESSERACT_CORE_URL=https://your-server.com/ocr/core \
  --build-arg VITE_TESSERACT_LANG_URL=https://your-server.com/ocr/lang-data \
  --build-arg VITE_TESSERACT_AVAILABLE_LANGUAGES=eng,deu \
  --build-arg VITE_OCR_FONT_BASE_URL=https://your-server.com/ocr/fonts \
  -t bentopdf .

# Or via .env.production before building from source
VITE_WASM_PYMUPDF_URL=https://your-server.com/pymupdf/ npm run build
```

要完全禁用某个模块（需要用户通过高级设置手动配置），请将其变量设为空字符串。

对于 OCR，要么将所有 `VITE_TESSERACT_*` 变量留空并使用默认的在线资源，要么同时设置 worker、core 和 lang 的 URL，以实现自托管或离线 OCR。如果您只捆绑了特定的 OCR 语言，还请将 `VITE_TESSERACT_AVAILABLE_LANGUAGES` 设为相同的逗号分隔代码，这样界面只会提供已安装的语言，选择不支持的语言时会给出明确的错误信息。若要完全离线生成可搜索的 PDF，还需将 `VITE_OCR_FONT_BASE_URL` 设为提供内置 OCR 字体的内部目录。

用户也可以随时通过界面中的**高级设置**覆盖这些默认值，浏览器中保存的用户覆盖设置优先于环境默认值。

### 离线隔离（Air-Gapped）部署

适用于没有互联网访问的网络（政府、医疗、金融等）。WASM URL 在**构建时**写入 JavaScript，而实际的 WASM 文件由**用户的浏览器**在运行时下载。因此您需要在有网络的机器上准备好所有内容，再传输到隔离网络中。

#### 自动化脚本（推荐）

内置的 `prepare-airgap.sh` 脚本可自动完成整个流程：下载 WASM 包、构建 Docker 镜像，并生成附带安装脚本的独立压缩包。

```bash
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf

# Show supported OCR language codes (for --ocr-languages)
bash scripts/prepare-airgap.sh --list-ocr-languages

# Search OCR language codes by name or abbreviation
bash scripts/prepare-airgap.sh --search-ocr-language german

# Interactive mode — prompts for all options
bash scripts/prepare-airgap.sh

# Or fully automated
bash scripts/prepare-airgap.sh --wasm-base-url https://internal.example.com/wasm
```

这会生成如下的压缩包目录：

```
bentopdf-airgap-bundle/
  bentopdf.tar              # Docker image
  *.tgz                     # WASM packages (PyMuPDF, Ghostscript, CoherentPDF, Tesseract)
  tesseract-langdata/       # OCR traineddata files
  ocr-fonts/                # OCR text-layer font files
  setup.sh                  # Setup script for the air-gapped side
  README.md                 # Instructions
```

通过 USB、内部制品库或其他获批方式将该目录传输到隔离网络中，然后运行附带的安装脚本：

```bash
cd bentopdf-airgap-bundle
bash setup.sh
```

安装脚本会加载 Docker 镜像、解压 WASM 文件，并可选择启动容器。

**脚本选项：**

| 标志                           | 说明                                   | 默认值                     |
| ------------------------------ | -------------------------------------- | -------------------------- |
| `--wasm-base-url <url>`        | WASM 文件在内部托管的位置              | _（必填，缺失时会提示）_   |
| `--image-name <name>`          | Docker 镜像标签                        | `bentopdf`                 |
| `--output-dir <path>`          | 输出压缩包目录                         | `./bentopdf-airgap-bundle` |
| `--simple-mode`                | 启用 Simple Mode                       | 关闭                       |
| `--base-url <path>`            | 子目录基础 URL（例如 `/pdf/`）         | `/`                        |
| `--language <code>`            | 默认界面语言（例如 `fr`、`de`）        | _（无）_                   |
| `--brand-name <name>`          | 自定义品牌名称                         | _（无）_                   |
| `--brand-logo <path>`          | 相对于 `public/` 的标志路径            | _（无）_                   |
| `--footer-text <text>`         | 自定义页脚文字                         | _（无）_                   |
| `--ocr-languages <list>`       | 要捆绑的 OCR 语言，以逗号分隔          | `eng`                      |
| `--list-ocr-languages`         | 打印支持的 OCR 代码和名称后退出        | 关闭                       |
| `--search-ocr-language <term>` | 按名称或缩写搜索 OCR 代码              | 关闭                       |
| `--dockerfile <path>`          | 要使用的 Dockerfile                    | `Dockerfile`               |
| `--skip-docker`                | 跳过 Docker 构建和导出                 | 关闭                       |
| `--skip-wasm`                  | 跳过 WASM 下载（复用现有 `.tgz` 文件） | 关闭                       |

交互式提示也接受 `list` 以打印完整的 Tesseract 支持代码列表，以及 `search <term>` 以查找匹配项，例如 `search german` 或 `search chi`。

::: warning 同源要求
WASM 文件必须与 BentoPDF 应用从**同一来源**提供。Web Worker 使用 `importScripts()`，无法跨源加载脚本。例如，如果 BentoPDF 运行在 `https://internal.example.com`，则 WASM 基础 URL 也应为 `https://internal.example.com/wasm`。
:::

#### 手动步骤

<details>
<summary>如果您不想使用脚本，希望手动操作</summary>

**步骤 1：下载 WASM 和 OCR 包**（在有网络的机器上）

```bash
npm pack @bentopdf/pymupdf-wasm@0.11.14
npm pack @bentopdf/gs-wasm
npm pack coherentpdf
npm pack tesseract.js@7.0.0
npm pack tesseract.js-core@7.0.0
mkdir -p tesseract-langdata
curl -fsSL https://cdn.jsdelivr.net/npm/@tesseract.js-data/eng/4.0.0_best_int/eng.traineddata.gz -o tesseract-langdata/eng.traineddata.gz
mkdir -p ocr-fonts
curl -fsSL https://raw.githack.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSans/NotoSans-Regular.ttf -o ocr-fonts/NotoSans-Regular.ttf
```

**步骤 2：使用内部 URL 构建 Docker 镜像**

```bash
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf

docker build \
  --build-arg VITE_WASM_PYMUPDF_URL=https://internal-server.example.com/wasm/pymupdf/ \
  --build-arg VITE_WASM_GS_URL=https://internal-server.example.com/wasm/gs/ \
  --build-arg VITE_WASM_CPDF_URL=https://internal-server.example.com/wasm/cpdf/ \
  --build-arg VITE_TESSERACT_WORKER_URL=https://internal-server.example.com/wasm/ocr/worker.min.js \
  --build-arg VITE_TESSERACT_CORE_URL=https://internal-server.example.com/wasm/ocr/core \
  --build-arg VITE_TESSERACT_LANG_URL=https://internal-server.example.com/wasm/ocr/lang-data \
  --build-arg VITE_OCR_FONT_BASE_URL=https://internal-server.example.com/wasm/ocr/fonts \
  -t bentopdf .
```

**步骤 3：导出 Docker 镜像**

```bash
docker save bentopdf -o bentopdf.tar
```

**步骤 4：传输到隔离网络中**

通过 USB、内部制品库或其他获批的传输方式复制：

- `bentopdf.tar`：Docker 镜像
- 步骤 1 中的五个 `.tgz` WASM/OCR 包
- 步骤 1 中的 `tesseract-langdata/` 目录
- 步骤 1 中的 `ocr-fonts/` 目录

**步骤 5：在隔离网络内部署**

```bash
# Load the Docker image
docker load -i bentopdf.tar

# Extract WASM packages
mkdir -p ./wasm/pymupdf ./wasm/gs ./wasm/cpdf ./wasm/ocr/core ./wasm/ocr/lang-data ./wasm/ocr/fonts
tar xzf bentopdf-pymupdf-wasm-0.11.14.tgz -C ./wasm/pymupdf --strip-components=1
tar xzf bentopdf-gs-wasm-*.tgz -C ./wasm/gs --strip-components=1
tar xzf coherentpdf-*.tgz -C ./wasm/cpdf --strip-components=1
TEMP_TESS=$(mktemp -d)
tar xzf tesseract.js-7.0.0.tgz -C "$TEMP_TESS"
cp "$TEMP_TESS/package/dist/worker.min.js" ./wasm/ocr/worker.min.js
rm -rf "$TEMP_TESS"
tar xzf tesseract.js-core-7.0.0.tgz -C ./wasm/ocr/core --strip-components=1
cp ./tesseract-langdata/*.traineddata.gz ./wasm/ocr/lang-data/
cp ./ocr-fonts/* ./wasm/ocr/fonts/

# Run BentoPDF
docker run -d -p 3000:8080 --restart unless-stopped bentopdf
```

请确保文件可通过您在步骤 2 中配置的 URL 访问，包括 `.../ocr/worker.min.js`、`.../ocr/core`、`.../ocr/lang-data` 和 `.../ocr/fonts`。

</details>

::: info 从源码而非 Docker 构建？
在运行 `npm run build` 之前，在 `.env.production` 中设置这些变量：

```bash
VITE_WASM_PYMUPDF_URL=https://internal-server.example.com/wasm/pymupdf/
VITE_WASM_GS_URL=https://internal-server.example.com/wasm/gs/
VITE_WASM_CPDF_URL=https://internal-server.example.com/wasm/cpdf/
VITE_TESSERACT_WORKER_URL=https://internal-server.example.com/wasm/ocr/worker.min.js
VITE_TESSERACT_CORE_URL=https://internal-server.example.com/wasm/ocr/core
VITE_TESSERACT_LANG_URL=https://internal-server.example.com/wasm/ocr/lang-data
VITE_OCR_FONT_BASE_URL=https://internal-server.example.com/wasm/ocr/fonts
```

:::

### 托管您自己的 WASM 代理

如果您需要通过正确的 CORS 标头提供 AGPL WASM 文件，可以部署一个简单的代理。示例实现请参阅 [Cloudflare WASM 代理指南](https://github.com/alam00000/bentopdf/blob/main/cloudflare/WASM-PROXY.md)。

::: tip 为什么要分离？
这种分离可以确保：

- 为商业用户提供清晰的法律合规性
- BentoPDF 核心保持其双重许可（AGPL-3.0 / 商业）
- WASM 文件在运行时加载，而不是捆绑在源代码中
  :::

## 系统要求

| 要求 | 最低配置                          |
| ---- | --------------------------------- |
| 存储 | 约 100 MB（不含 AGPL 模块的核心） |
| 内存 | 512 MB                            |
| CPU  | 任意现代处理器                    |

::: tip
BentoPDF 是静态站点，不需要数据库或后端服务器！
:::
