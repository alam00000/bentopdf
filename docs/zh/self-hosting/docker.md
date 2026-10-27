# 使用 Docker / Podman 部署

在生产环境中自托管 BentoPDF 的最简单方式。

> [!IMPORTANT]
> **Office 文件转换所需的响应头**
>
> 基于 LibreOffice 的工具（Word、Excel、PowerPoint 转换）需要以下 HTTP 响应头来支持 `SharedArrayBuffer`：
>
> - `Cross-Origin-Opener-Policy: same-origin`
> - `Cross-Origin-Embedder-Policy: require-corp`
>
> 页面还必须通过安全上下文提供。`http://localhost` 可用于本地测试，但 `http://192.168.x.x` 等局域网 IP 通常不符合要求，因此即使响应头存在，通过纯 HTTP 进行 Office 转换也会失败。
>
> 官方容器镜像已包含这些响应头。如果使用反向代理（Traefik、Caddy 等），请确保保留或添加这些响应头，并对非环回访问使用 HTTPS。

> [!TIP]
> **Podman 用户：** 将 `docker` 替换为 `podman`、将 `docker-compose` 替换为 `podman-compose`，所有 `docker` 命令都同样适用于 Podman。

## 快速开始

> [!TIP]
> BentoPDF 提供两种构建版本：
>
> - **自托管版本**：`ghcr.io/alam00000/bentopdf-simple:latest`。包含所有 PDF 工具，但**不含**营销页面元素（没有首页横幅、FAQ、用户评价和页脚）。适用于内部/团队/组织部署。它**不是**功能精简的 "lite" 版本。
> - **商业版本**：`ghcr.io/alam00000/bentopdf:latest`。完整的营销站点，由 bentopdf.com 自身使用，也供持有商业许可、运行面向公众部署的用户使用。
>
> 如果拿不准，请拉取自托管版本。

```bash
# Docker
docker run -d \
  --name bentopdf \
  -p 3000:8080 \
  --restart unless-stopped \
  ghcr.io/alam00000/bentopdf-simple:latest

# Podman
podman run -d \
  --name bentopdf \
  -p 3000:8080 \
  ghcr.io/alam00000/bentopdf-simple:latest
```

## Docker Compose / Podman Compose

创建 `docker-compose.yml`：

```yaml
services:
  bentopdf:
    image: ghcr.io/alam00000/bentopdf-simple:latest
    container_name: bentopdf
    ports:
      - '3000:8080'
    restart: unless-stopped
    healthcheck:
      test: ['CMD', 'wget', '--spider', '-q', 'http://localhost:8080']
      interval: 30s
      timeout: 10s
      retries: 3
```

运行：

```bash
# Docker Compose
docker compose up -d

# Podman Compose
podman-compose up -d
```

## 构建您自己的镜像

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
```

构建并运行：

```bash
docker build -t bentopdf:custom .
docker run -d -p 3000:8080 bentopdf:custom
```

## 环境变量

| 变量                                 | 说明                                                                                                                                     | 默认值                                                         |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `SIMPLE_MODE`                        | 构建自托管变体（隐藏 bentopdf.com 的营销页面元素：首页横幅、FAQ、用户评价、页脚）。所有 PDF 工具均保留。                                 | `false`                                                        |
| `BASE_URL`                           | 部署到子目录                                                                                                                             | `/`                                                            |
| `VITE_WASM_PYMUPDF_URL`              | PyMuPDF WASM 模块 URL                                                                                                                    | `https://cdn.jsdelivr.net/npm/@bentopdf/pymupdf-wasm@0.11.16/` |
| `VITE_WASM_GS_URL`                   | Ghostscript WASM 模块 URL                                                                                                                | `https://cdn.jsdelivr.net/npm/@bentopdf/gs-wasm@0.1.1/assets/` |
| `VITE_WASM_CPDF_URL`                 | CoherentPDF WASM 模块 URL                                                                                                                | `https://cdn.jsdelivr.net/npm/coherentpdf@2.5.5/dist/`         |
| `VITE_TESSERACT_WORKER_URL`          | OCR worker 脚本 URL                                                                                                                      | _（空；使用 Tesseract.js 默认 CDN）_                           |
| `VITE_TESSERACT_CORE_URL`            | OCR 核心运行时目录                                                                                                                       | _（空；使用 Tesseract.js 默认 CDN）_                           |
| `VITE_TESSERACT_LANG_URL`            | OCR traineddata 目录                                                                                                                     | _（空；使用 Tesseract.js 默认 CDN）_                           |
| `VITE_TESSERACT_AVAILABLE_LANGUAGES` | 在界面中提供的 OCR 语言，以逗号分隔                                                                                                      | _（空；显示完整列表）_                                         |
| `VITE_OCR_FONT_BASE_URL`             | OCR 文本层字体目录                                                                                                                       | _（空；使用远程 Noto 字体 URL）_                               |
| `VITE_DEFAULT_LANGUAGE`              | 默认界面语言                                                                                                                             | `en`                                                           |
| `VITE_BRAND_NAME`                    | 自定义品牌名称                                                                                                                           | `BentoPDF`                                                     |
| `VITE_BRAND_LOGO`                    | 相对于 `public/` 的 Logo 路径                                                                                                            | `images/favicon-no-bg.svg`                                     |
| `VITE_FOOTER_TEXT`                   | 自定义页脚/版权文本                                                                                                                      | `© 2026 BentoPDF. All rights reserved.`                        |
| `DISABLE_TOOLS`                      | 要隐藏的工具 ID，以逗号分隔                                                                                                              | _（空；启用所有工具）_                                         |
| `DISABLE_GITHUB_STARS`               | 页面加载时跳过获取 GitHub star 数量，并从 CSP 中移除 `api.github.com`。Simple Mode 构建始终会跳过。                                      | `false`                                                        |
| `SITE_URL`                           | 写入 canonical、hreflang 和站点地图链接的公开 URL。除非您希望搜索引擎将您的部署视为独立站点，否则请保持默认值。                          | `https://www.bentopdf.com`                                     |
| `ALLOW_INDEXING`                     | 使用自定义 `SITE_URL` 时，每个页面都会被标记为 `noindex`，以免您的副本在搜索结果中与 bentopdf.com 竞争。设为 `true` 可允许搜索引擎索引。 | `false`                                                        |

WASM 模块 URL 已预先配置了 CDN 默认值，所有高级功能开箱即用。对于离线隔离或自托管部署，请覆盖这些值。

### 搜索引擎

默认情况下，每个页面都会让搜索引擎将 bentopdf.com 视为原始来源，因此您的部署不会作为重复内容出现。对于私有或内部实例，您无需做任何更改。

- **让您的实例完全不出现在搜索结果中：** 使用 `-e ROBOTS_NOINDEX=true` 运行容器。这只需要重启，无需重新构建。
- **让您的实例在搜索结果中成为独立站点：** 使用 `--build-arg SITE_URL=https://your-domain.example --build-arg ALLOW_INDEXING=true` 构建。如果没有 `ALLOW_INDEXING=true`，自定义的 `SITE_URL` 会将每个页面标记为 `noindex`。

### Content-Security-Policy

nginx 镜像自带强制执行的 `Content-Security-Policy` 响应头。CSP 的 `script-src`、`connect-src` 和 `font-src` 指令会在**构建时**根据上述 `VITE_*` URL 变量生成，您通过 `--build-arg` 传入的任何主机都会自动加入策略。

因此：

- 如果在构建时覆盖 `VITE_CORS_PROXY_URL` 或 `VITE_WASM_*_URL`，CSP 会自动允许这些来源，无需额外配置。
- 对于 `cdn.jsdelivr.net` 上的 URL，`script-src` 只允许精确到版本的包文件夹，例如 `https://cdn.jsdelivr.net/npm/@bentopdf/pymupdf-wasm@0.11.16/`，而不是整个 CDN。jsDelivr 提供任何公开的 npm 包或 GitHub 仓库，允许整个主机会让其中任何内容都能在您的实例上运行。其他主机上的 URL 则按来源允许。
- 如果您在*运行时*通过应用内的高级设置页面配置自定义 WASM URL，这些来源**不在** CSP 中，浏览器会阻止对它们的请求。对于 `cdn.jsdelivr.net` 上同一个包的不同版本也是如此，因为只允许构建时设置的版本。运行时配置仅用于试验；要永久使用自定义 URL，请设置对应的 `VITE_*` 构建参数。
- 覆盖全部三个 `VITE_WASM_*_URL` 值的离线隔离部署，也会从 CSP 中移除这些 `cdn.jsdelivr.net` 包文件夹（每个默认值都会被替换，而不是追加）。`cdn.jsdelivr.net` 上的 Tesseract OCR 默认值会保留在策略中，直到您同时设置三个 `VITE_TESSERACT_*` 值。同样，设置 `VITE_CORS_PROXY_URL` 会替换公共的 `bentopdf-cors-proxy.bentopdf.workers.dev` 默认值。

CSP 的 `script-src` 中包含 `'unsafe-eval'`，因为 LibreOffice WASM 运行时（用于 Word/Excel/PowerPoint 转换工具）和 wasm-vips 图像库（用于 PDF 转 TIFF）会在内部动态编译调度代码（通过 `new Function()`）。移除它会导致这些工具无法使用。如果您以 `SIMPLE_MODE`（不含 LibreOffice）构建，且不需要 PDF 转 TIFF，可以手动编辑生成的 `security-headers.conf` 去掉 `'unsafe-eval'`，以获得更严格的策略。

对于 OCR，将 `VITE_TESSERACT_*` 变量留空即可使用默认的在线资源，或者三个一起设置以用于自托管/离线 OCR。部分覆盖会被拒绝，因为 worker、核心运行时和 traineddata 目录必须相互匹配。要完全离线输出可搜索 PDF，还需设置 `VITE_OCR_FONT_BASE_URL`，让 OCR 文本层字体从您的内部服务器加载，而不是公共的 Noto 字体 URL。

`VITE_DEFAULT_LANGUAGE` 设置首次访问者的界面语言。支持的值：`en`、`ar`、`be`、`fr`、`de`、`es`、`zh`、`zh-TW`、`vi`、`tr`、`id`、`it`、`pt`、`nl`、`da`。用户仍可切换语言，这只会更改默认值。

示例：

```bash
# Build with French as the default language
docker build --build-arg VITE_DEFAULT_LANGUAGE=fr -t bentopdf .
docker run -d -p 3000:8080 bentopdf
```

### 自定义品牌

将默认的 BentoPDF 标志、名称和页脚文本替换为您自己的。将您的 Logo 文件放入 `public/` 文件夹（或使用现有图片），然后在构建时传入品牌变量：

```bash
docker build \
  --build-arg VITE_BRAND_NAME="AcmePDF" \
  --build-arg VITE_BRAND_LOGO="images/acme-logo.svg" \
  --build-arg VITE_FOOTER_TEXT="© 2026 Acme Corp. Internal use only." \
  -t acmepdf .
```

品牌定制在完整模式和 Simple Mode 下都可使用，并且可以与所有其他构建时选项组合。

### 禁用特定工具

出于合规或安全要求，可以在界面中隐藏工具。被禁用的工具会从主页、搜索结果、键盘快捷键和工作流构建器中移除。直接通过 URL 访问会显示"工具不可用"页面。

工具 ID 是去掉 `.html` 的页面 URL。例如，如果工具位于 `bentopdf.com/edit-pdf.html`，则 ID 为 `edit-pdf`。

#### 查找工具 ID

最简单的方法：在 BentoPDF 中打开任意工具并查看 URL。路径的最后一部分（去掉 `.html`）就是工具 ID。

<details>
<summary>完整的工具 ID 列表</summary>

**编辑与批注：** `edit-pdf`, `bookmark`, `table-of-contents`, `page-numbers`, `add-page-labels`, `bates-numbering`, `add-watermark`, `header-footer`, `invert-colors`, `scanner-effect`, `adjust-colors`, `background-color`, `text-color`, `sign-pdf`, `add-stamps`, `remove-annotations`, `crop-pdf`, `form-filler`, `form-creator`, `remove-blank-pages`

**转换为 PDF：** `image-to-pdf`, `jpg-to-pdf`, `png-to-pdf`, `webp-to-pdf`, `svg-to-pdf`, `bmp-to-pdf`, `heic-to-pdf`, `tiff-to-pdf`, `txt-to-pdf`, `markdown-to-pdf`, `json-to-pdf`, `csv-to-pdf`, `rtf-to-pdf`, `odt-to-pdf`, `word-to-pdf`, `excel-to-pdf`, `powerpoint-to-pdf`, `xps-to-pdf`, `mobi-to-pdf`, `epub-to-pdf`, `fb2-to-pdf`, `cbz-to-pdf`, `wpd-to-pdf`, `wps-to-pdf`, `xml-to-pdf`, `pages-to-pdf`, `odg-to-pdf`, `ods-to-pdf`, `odp-to-pdf`, `pub-to-pdf`, `vsd-to-pdf`, `psd-to-pdf`, `email-to-pdf`

**从 PDF 转换：** `pdf-to-jpg`, `pdf-to-png`, `pdf-to-webp`, `pdf-to-bmp`, `pdf-to-tiff`, `pdf-to-cbz`, `pdf-to-svg`, `pdf-to-csv`, `pdf-to-excel`, `pdf-to-greyscale`, `pdf-to-json`, `pdf-to-docx`, `extract-images`, `pdf-to-markdown`, `prepare-pdf-for-ai`, `pdf-to-text`

**整理与管理：** `ocr-pdf`, `merge-pdf`, `alternate-merge`, `organize-pdf`, `add-attachments`, `extract-attachments`, `edit-attachments`, `pdf-multi-tool`, `pdf-layers`, `extract-tables`, `split-pdf`, `divide-pages`, `extract-pages`, `delete-pages`, `add-blank-page`, `reverse-pages`, `rotate-pdf`, `rotate-custom`, `n-up-pdf`, `pdf-booklet`, `combine-single-page`, `view-metadata`, `edit-metadata`, `pdf-to-zip`, `compare-pdfs`, `posterize-pdf`, `page-dimensions`

**优化与修复：** `compress-pdf`, `pdf-to-pdfa`, `fix-page-size`, `linearize-pdf`, `remove-restrictions`, `repair-pdf`, `rasterize-pdf`, `deskew-pdf`, `font-to-outline`

**安全：** `encrypt-pdf`, `sanitize-pdf`, `decrypt-pdf`, `flatten-pdf`, `remove-metadata`, `change-permissions`, `digital-sign-pdf`, `validate-signature-pdf`, `timestamp-pdf`

</details>

#### 方式 1：构建时（Docker 构建参数）

```bash
docker build \
  --build-arg DISABLE_TOOLS="edit-pdf,sign-pdf,encrypt-pdf" \
  -t bentopdf .
```

这会将禁用列表写入 JavaScript 包中。更改时需要重新构建。

#### 方式 2：运行时（config.json）

将 `config.json` 文件挂载到提供服务的目录中，无需重新构建：

```json
{
  "disabledTools": ["edit-pdf", "sign-pdf", "encrypt-pdf"]
}
```

```bash
docker run -d \
  -p 3000:8080 \
  -v ./config.json:/usr/share/nginx/html/config.json:ro \
  ghcr.io/alam00000/bentopdf-simple:latest
```

或者使用 Docker Compose：

```yaml
services:
  bentopdf:
    image: ghcr.io/alam00000/bentopdf-simple:latest
    ports:
      - '3000:8080'
    volumes:
      - ./config.json:/usr/share/nginx/html/config.json:ro
```

两种方式可以同时使用，列表会被合并。只要工具出现在任一列表中，就会被禁用。

#### 禁用编辑器功能

您还可以禁用 PDF 编辑器中的特定功能（例如涂黑、批注、表单），而无需禁用整个编辑器工具。在 `config.json` 中添加 `editorDisabledCategories`：

```json
{
  "editorDisabledCategories": ["redaction", "annotation-stamp"]
}
```

<details>
<summary>完整的编辑器类别列表</summary>

**缩放：** `zoom`, `zoom-in`, `zoom-out`, `zoom-fit-page`, `zoom-fit-width`, `zoom-marquee`, `zoom-level`

**批注：** `annotation`, `annotation-markup`, `annotation-highlight`, `annotation-underline`, `annotation-strikeout`, `annotation-squiggly`, `annotation-ink`, `annotation-text`, `annotation-stamp`

**形状：** `annotation-shape`, `annotation-rectangle`, `annotation-circle`, `annotation-line`, `annotation-arrow`, `annotation-polygon`, `annotation-polyline`

**表单：** `form`, `form-textfield`, `form-checkbox`, `form-radio`, `form-select`, `form-listbox`, `form-fill-mode`

**涂黑：** `redaction`, `redaction-area`, `redaction-text`, `redaction-apply`, `redaction-clear`

**文档：** `document`, `document-open`, `document-close`, `document-print`, `document-capture`, `document-export`, `document-fullscreen`, `document-protect`

**页面：** `page`, `spread`, `rotate`, `scroll`, `navigation`

**面板：** `panel`, `panel-sidebar`, `panel-search`, `panel-comment`

**工具：** `tools`, `pan`, `pointer`, `capture`

**选择：** `selection`, `selection-copy`

**历史记录：** `history`, `history-undo`, `history-redo`

</details>

类别是分层级的：禁用父级（例如 `annotation`）会同时禁用它的所有子级。

### 禁用 GitHub Star 计数器

导航栏会显示实时的 GitHub star 数量，页面加载时从 `api.github.com` 获取。这是唯一一个不用于 PDF 功能的外部请求。可以在构建时禁用它，从包中移除获取代码，并从 Content-Security-Policy 中移除 `api.github.com`：

```bash
docker build --build-arg DISABLE_GITHUB_STARS=true -t bentopdf .
```

Simple Mode 构建（`bentopdf-simple`）始终会跳过 star 计数器，此参数只在商业版本或自定义的完整构建中需要。

### 自定义 WASM URL（离线隔离 / 自托管）

> [!IMPORTANT]
> WASM URL 会在**构建时**写入 JavaScript。WASM 文件由**用户的浏览器**在运行时下载，Docker 在构建期间不会下载它们。对于离线隔离网络，您必须将 WASM 文件托管在浏览器可以访问的内部服务器上。

**完整的离线隔离工作流程：**

```bash
# 1. On a machine WITH internet — download WASM packages
bash scripts/prepare-airgap.sh --list-ocr-languages
bash scripts/prepare-airgap.sh --search-ocr-language german

# 2. Download WASM/OCR packages
npm pack @bentopdf/pymupdf-wasm@0.11.14
npm pack @bentopdf/gs-wasm
npm pack coherentpdf
npm pack tesseract.js@7.0.0
npm pack tesseract.js-core@7.0.0
mkdir -p tesseract-langdata
curl -fsSL https://cdn.jsdelivr.net/npm/@tesseract.js-data/eng/4.0.0_best_int/eng.traineddata.gz -o tesseract-langdata/eng.traineddata.gz
mkdir -p ocr-fonts
curl -fsSL https://raw.githack.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSans/NotoSans-Regular.ttf -o ocr-fonts/NotoSans-Regular.ttf

# 3. Build the image with your internal server URLs
docker build \
  --build-arg VITE_WASM_PYMUPDF_URL=https://internal-server.example.com/wasm/pymupdf/ \
  --build-arg VITE_WASM_GS_URL=https://internal-server.example.com/wasm/gs/ \
  --build-arg VITE_WASM_CPDF_URL=https://internal-server.example.com/wasm/cpdf/ \
  --build-arg VITE_TESSERACT_WORKER_URL=https://internal-server.example.com/wasm/ocr/worker.min.js \
  --build-arg VITE_TESSERACT_CORE_URL=https://internal-server.example.com/wasm/ocr/core \
  --build-arg VITE_TESSERACT_LANG_URL=https://internal-server.example.com/wasm/ocr/lang-data \
  --build-arg VITE_TESSERACT_AVAILABLE_LANGUAGES=eng,deu \
  --build-arg VITE_OCR_FONT_BASE_URL=https://internal-server.example.com/wasm/ocr/fonts \
  -t bentopdf .

# 4. Export the image
docker save bentopdf -o bentopdf.tar

# 5. Transfer bentopdf.tar + the .tgz packages + tesseract-langdata/ + ocr-fonts/ into the air-gapped network

# 6. Inside the air-gapped network — load and run
docker load -i bentopdf.tar

# Extract WASM packages to your internal web server
mkdir -p /var/www/wasm/pymupdf /var/www/wasm/gs /var/www/wasm/cpdf /var/www/wasm/ocr/core /var/www/wasm/ocr/lang-data /var/www/wasm/ocr/fonts
tar xzf bentopdf-pymupdf-wasm-0.11.14.tgz -C /var/www/wasm/pymupdf --strip-components=1
tar xzf bentopdf-gs-wasm-*.tgz -C /var/www/wasm/gs --strip-components=1
tar xzf coherentpdf-*.tgz -C /var/www/wasm/cpdf --strip-components=1
TEMP_TESS=$(mktemp -d)
tar xzf tesseract.js-7.0.0.tgz -C "$TEMP_TESS"
cp "$TEMP_TESS/package/dist/worker.min.js" /var/www/wasm/ocr/worker.min.js
rm -rf "$TEMP_TESS"
tar xzf tesseract.js-core-7.0.0.tgz -C /var/www/wasm/ocr/core --strip-components=1
cp ./tesseract-langdata/*.traineddata.gz /var/www/wasm/ocr/lang-data/
cp ./ocr-fonts/* /var/www/wasm/ocr/fonts/

# Run BentoPDF
docker run -d -p 3000:8080 --restart unless-stopped bentopdf
```

对于 `--ocr-languages`，请使用 `bash scripts/prepare-airgap.sh --list-ocr-languages` 打印出的代码，或使用 `bash scripts/prepare-airgap.sh --search-ocr-language <term>` 按名称搜索。当您使用受限的 OCR 子集构建时，请将相同的代码传给 `VITE_TESSERACT_AVAILABLE_LANGUAGES`，这样应用只会显示已打包的语言。要获得完整的离线 OCR 输出，还需托管随附的 `ocr-fonts/` 目录，并将 `VITE_OCR_FONT_BASE_URL` 指向它。

将变量设为空字符串即可禁用对应模块（用户必须通过高级设置手动配置）。

## 自定义端口

默认情况下，BentoPDF 在容器内监听 `8080` 端口。要更改此设置，请在运行时设置 `PORT` 环境变量：

```bash
docker run -p 3000:9090 -e PORT=9090 ghcr.io/alam00000/bentopdf-simple:latest
```

| 变量   | 说明                  | 默认值 |
| ------ | --------------------- | ------ |
| `PORT` | 容器内 Nginx 监听端口 | `8080` |

标准 Dockerfile 和 nonroot Dockerfile 都支持此设置。

## 自定义用户 ID（PUID/PGID）

对于需要以特定非 root 用户运行的环境（NAS 设备、带安全上下文的 Kubernetes、组织策略），BentoPDF 提供了一个单独的 Dockerfile，支持 LSIO 风格的 PUID/PGID。

### 构建并运行

```bash
# Build the non-root image
docker build -f Dockerfile.nonroot -t bentopdf-nonroot .

# Run with custom UID/GID
docker run -d \
  --name bentopdf \
  -p 3000:8080 \
  -e PUID=1000 \
  -e PGID=1000 \
  --restart unless-stopped \
  bentopdf-nonroot
```

### 环境变量

| 变量           | 说明                | 默认值  |
| -------------- | ------------------- | ------- |
| `PUID`         | 运行时使用的用户 ID | `1000`  |
| `PGID`         | 运行时使用的组 ID   | `1000`  |
| `PORT`         | Nginx 监听端口      | `8080`  |
| `DISABLE_IPV6` | 禁用 IPv6 监听      | `false` |

### Docker Compose

```yaml
services:
  bentopdf:
    build:
      context: .
      dockerfile: Dockerfile.nonroot
    container_name: bentopdf
    ports:
      - '3000:8080'
    environment:
      - PUID=1000
      - PGID=1000
    restart: unless-stopped
```

### 工作原理

容器以 root 身份启动，使用指定的 PUID/PGID 创建用户，调整所有可写目录的所有权，然后通过 `su-exec` 降低权限。nginx 进程完全以您指定的用户身份运行。

> [!NOTE]
> 标准 `Dockerfile` 使用 `nginx-unprivileged`（UID 101），推荐用于大多数部署。仅在需要特定 UID/GID 时才使用 `Dockerfile.nonroot`。

> [!WARNING]
> PUID/PGID 不能为 `0`（root）。入口脚本会验证输入，遇到无效值时会报错退出。

## 配合 Traefik（反向代理）

```yaml
services:
  traefik:
    image: traefik:v2.10
    command:
      - '--providers.docker=true'
      - '--entrypoints.web.address=:80'
      - '--entrypoints.websecure.address=:443'
      - '--certificatesresolvers.letsencrypt.acme.email=you@example.com'
      - '--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json'
      - '--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web'
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./letsencrypt:/letsencrypt

  bentopdf:
    image: ghcr.io/alam00000/bentopdf-simple:latest
    labels:
      - 'traefik.enable=true'
      - 'traefik.http.routers.bentopdf.rule=Host(`pdf.example.com`)'
      - 'traefik.http.routers.bentopdf.entrypoints=websecure'
      - 'traefik.http.routers.bentopdf.tls.certresolver=letsencrypt'
      - 'traefik.http.services.bentopdf.loadbalancer.server.port=8080'
      # Required headers for SharedArrayBuffer (LibreOffice WASM)
      - 'traefik.http.routers.bentopdf.middlewares=bentopdf-headers'
      - 'traefik.http.middlewares.bentopdf-headers.headers.customresponseheaders.Cross-Origin-Opener-Policy=same-origin'
      - 'traefik.http.middlewares.bentopdf-headers.headers.customresponseheaders.Cross-Origin-Embedder-Policy=require-corp'
    restart: unless-stopped
```

## 配合 Caddy（反向代理）

```yaml
services:
  caddy:
    image: caddy:2
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data

  bentopdf:
    image: ghcr.io/alam00000/bentopdf-simple:latest
    restart: unless-stopped

volumes:
  caddy_data:
```

Caddyfile：

```
pdf.example.com {
    reverse_proxy bentopdf:8080
    header Cross-Origin-Opener-Policy "same-origin"
    header Cross-Origin-Embedder-Policy "require-corp"
}
```

## 资源限制

```yaml
services:
  bentopdf:
    image: ghcr.io/alam00000/bentopdf-simple:latest
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 128M
```

## Podman Quadlet（Systemd 集成）

[Quadlet](https://docs.podman.io/en/latest/markdown/podman-systemd.unit.5.html) 允许您将 Podman 容器作为 systemd 服务运行。这非常适合 Linux 系统上的生产部署。

### 基本 Quadlet 设置

在 `~/.config/containers/systemd/bentopdf.container`（用户级）或 `/etc/containers/systemd/bentopdf.container`（系统级）创建容器单元文件：

```ini
[Unit]
Description=BentoPDF - Privacy-first PDF toolkit
After=network-online.target
Wants=network-online.target

[Container]
Image=ghcr.io/alam00000/bentopdf-simple:latest
ContainerName=bentopdf
PublishPort=3000:8080
AutoUpdate=registry

[Service]
Restart=always
TimeoutStartSec=300

[Install]
WantedBy=default.target
```

### 启用并启动

```bash
# Reload systemd to detect new unit
systemctl --user daemon-reload

# Start the service
systemctl --user start bentopdf

# Enable on boot
systemctl --user enable bentopdf

# Check status
systemctl --user status bentopdf

# View logs
journalctl --user -u bentopdf -f
```

> [!TIP]
> 对于系统级部署，请使用不带 `--user` 参数的 `systemctl`，并将文件放在 `/etc/containers/systemd/` 中。

### 带健康检查的 Quadlet

```ini
[Unit]
Description=BentoPDF with health monitoring
After=network-online.target
Wants=network-online.target

[Container]
Image=ghcr.io/alam00000/bentopdf-simple:latest
ContainerName=bentopdf
PublishPort=3000:8080
AutoUpdate=registry
HealthCmd=wget --spider -q http://localhost:8080 || exit 1
HealthInterval=30s
HealthTimeout=10s
HealthRetries=3

[Service]
Restart=always
TimeoutStartSec=300

[Install]
WantedBy=default.target
```

### 使用 Quadlet 自动更新

Podman 可以在有新镜像时自动更新容器：

```bash
# Enable auto-update timer
systemctl --user enable --now podman-auto-update.timer

# Check for updates manually
podman auto-update

# Dry run (check without updating)
podman auto-update --dry-run
```

### Quadlet 网络配置

如需自定义网络配置，请创建网络文件 `bentopdf.network`：

```ini
[Network]
Subnet=10.89.0.0/24
Gateway=10.89.0.1
```

然后在您的容器文件中引用它：

```ini
[Container]
Image=ghcr.io/alam00000/bentopdf-simple:latest
ContainerName=bentopdf
PublishPort=3000:8080
Network=bentopdf.network
```

## 更新

```bash
# Pull latest image
docker compose pull

# Recreate container
docker compose up -d
```
