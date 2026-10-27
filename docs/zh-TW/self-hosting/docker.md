# 使用 Docker / Podman 部署

在正式環境中自行架設 BentoPDF 最簡單的方式。

> [!IMPORTANT]
> **Office 檔案轉換所需的標頭**
>
> 以 LibreOffice 為基礎的工具（Word、Excel、PowerPoint 轉換）需要以下 HTTP 標頭才能支援 `SharedArrayBuffer`：
>
> - `Cross-Origin-Opener-Policy: same-origin`
> - `Cross-Origin-Embedder-Policy: require-corp`
>
> 頁面也必須在安全環境（secure context）中提供。`http://localhost` 可用於本機測試，但 `http://192.168.x.x` 或其他區域網路 IP 通常不符合條件，因此即使標頭存在，透過一般 HTTP 進行 Office 轉換仍會失敗。
>
> 官方容器映像已包含這些標頭。若使用反向代理（Traefik、Caddy 等），請確保保留或加入這些標頭，並在非迴路位址存取時使用 HTTPS。

> [!TIP]
> **Podman 使用者：** 只要將 `docker` 換成 `podman`、將 `docker-compose` 換成 `podman-compose`，所有 `docker` 指令都可在 Podman 上使用。

## 快速開始

> [!TIP]
> BentoPDF 提供兩種版本：
>
> - **自行架設版**：`ghcr.io/alam00000/bentopdf-simple:latest`。包含所有 PDF 工具，但**不含**行銷介面（沒有主視覺、常見問題、使用者推薦、頁尾）。適用於內部、團隊或組織部署。它**不是**功能縮減的「精簡」版本。
> - **商業版**：`ghcr.io/alam00000/bentopdf:latest`。完整的行銷網站，由 bentopdf.com 本身以及執行對外公開部署的商業授權持有者使用。
>
> 如果不確定，請拉取自行架設版。

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

建立 `docker-compose.yml`：

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

執行：

```bash
# Docker Compose
docker compose up -d

# Podman Compose
podman-compose up -d
```

## 建置自己的映像

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

建置並執行：

```bash
docker build -t bentopdf:custom .
docker run -d -p 3000:8080 bentopdf:custom
```

## 環境變數

| 變數                                 | 說明                                                                                                                                   | 預設值                                                         |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `SIMPLE_MODE`                        | 建置自行架設版（隱藏 bentopdf.com 行銷介面：主視覺、常見問題、使用者推薦、頁尾）。所有 PDF 工具都會保留。                              | `false`                                                        |
| `BASE_URL`                           | 部署到子目錄                                                                                                                           | `/`                                                            |
| `VITE_WASM_PYMUPDF_URL`              | PyMuPDF WASM 模組 URL                                                                                                                  | `https://cdn.jsdelivr.net/npm/@bentopdf/pymupdf-wasm@0.11.16/` |
| `VITE_WASM_GS_URL`                   | Ghostscript WASM 模組 URL                                                                                                              | `https://cdn.jsdelivr.net/npm/@bentopdf/gs-wasm@0.1.1/assets/` |
| `VITE_WASM_CPDF_URL`                 | CoherentPDF WASM 模組 URL                                                                                                              | `https://cdn.jsdelivr.net/npm/coherentpdf@2.5.5/dist/`         |
| `VITE_TESSERACT_WORKER_URL`          | OCR worker 指令碼 URL                                                                                                                  | _（空白；使用 Tesseract.js 預設 CDN）_                         |
| `VITE_TESSERACT_CORE_URL`            | OCR 核心執行環境目錄                                                                                                                   | _（空白；使用 Tesseract.js 預設 CDN）_                         |
| `VITE_TESSERACT_LANG_URL`            | OCR traineddata 目錄                                                                                                                   | _（空白；使用 Tesseract.js 預設 CDN）_                         |
| `VITE_TESSERACT_AVAILABLE_LANGUAGES` | 在介面中顯示的 OCR 語言，以逗號分隔                                                                                                    | _（空白；顯示完整清單）_                                       |
| `VITE_OCR_FONT_BASE_URL`             | OCR 文字層字型目錄                                                                                                                     | _（空白；使用遠端 Noto 字型 URL）_                             |
| `VITE_DEFAULT_LANGUAGE`              | 預設介面語言                                                                                                                           | `en`                                                           |
| `VITE_BRAND_NAME`                    | 自訂品牌名稱                                                                                                                           | `BentoPDF`                                                     |
| `VITE_BRAND_LOGO`                    | 相對於 `public/` 的標誌路徑                                                                                                            | `images/favicon-no-bg.svg`                                     |
| `VITE_FOOTER_TEXT`                   | 自訂頁尾/版權文字                                                                                                                      | `© 2026 BentoPDF. All rights reserved.`                        |
| `DISABLE_TOOLS`                      | 要隱藏的工具 ID，以逗號分隔                                                                                                            | _（空白；啟用所有工具）_                                       |
| `DISABLE_GITHUB_STARS`               | 頁面載入時略過擷取 GitHub 星星數，並從 CSP 移除 `api.github.com`。Simple Mode 建置一律略過。                                           | `false`                                                        |
| `SITE_URL`                           | 寫入 canonical、hreflang 與 sitemap 連結的公開 URL。除非您希望搜尋引擎將您的部署視為獨立網站，否則請保留預設值。                       | `https://www.bentopdf.com`                                     |
| `ALLOW_INDEXING`                     | 使用自訂 `SITE_URL` 時，每個頁面都會標記為 `noindex`，避免您的副本在搜尋結果中與 bentopdf.com 競爭。設為 `true` 可讓搜尋引擎建立索引。 | `false`                                                        |

WASM 模組 URL 已預先設定為 CDN 預設值，所有進階功能開箱即用。離線隔離或自行架設的部署可覆寫這些值。

### 搜尋引擎

預設情況下，每個頁面都會向搜尋引擎指出 bentopdf.com 為原始來源，因此您的部署不會被視為重複內容。私人或內部執行個體不需要做任何變更。

- **讓您的執行個體完全不出現在搜尋結果中：** 以 `-e ROBOTS_NOINDEX=true` 執行容器。只需要重新啟動，不需要重新建置。
- **讓您的執行個體在搜尋結果中成為獨立網站：** 以 `--build-arg SITE_URL=https://your-domain.example --build-arg ALLOW_INDEXING=true` 建置。若沒有 `ALLOW_INDEXING=true`，自訂 `SITE_URL` 會將每個頁面標記為 `noindex`。

### Content-Security-Policy

nginx 映像附帶強制執行的 `Content-Security-Policy` 標頭。CSP 的 `script-src`、`connect-src` 與 `font-src` 指令會在**建置時**根據上方的 `VITE_*` URL 變數**產生**：您透過 `--build-arg` 傳入的任何主機都會自動加入政策。

因此：

- 若您在建置時覆寫 `VITE_CORS_PROXY_URL` 或 `VITE_WASM_*_URL`，CSP 會自動允許這些來源，無需額外設定。
- 對於 `cdn.jsdelivr.net` 上的 URL，`script-src` 只允許確切版本的套件資料夾，例如 `https://cdn.jsdelivr.net/npm/@bentopdf/pymupdf-wasm@0.11.16/`，而不是整個 CDN。jsDelivr 提供任何公開的 npm 套件或 GitHub 儲存庫，若允許整個主機，任何套件都能在您的執行個體上執行。其他主機上的 URL 則依來源允許。
- 若您在*執行時*透過應用程式內的進階設定頁面設定自訂 WASM URL，這些來源**不在** CSP 中，瀏覽器會封鎖對它們的擷取。這也適用於 `cdn.jsdelivr.net` 上同一套件的不同版本，因為只允許建置時設定的版本。執行時設定僅供實驗用途；若要永久使用自訂 URL，請設定對應的 `VITE_*` 建置參數。
- 覆寫全部三個 `VITE_WASM_*_URL` 值的離線隔離部署，也會從 CSP 移除這些 `cdn.jsdelivr.net` 套件資料夾（每個預設值都是被取代，而不是附加）。`cdn.jsdelivr.net` 上的 Tesseract OCR 預設值會留在政策中，直到您也設定三個 `VITE_TESSERACT_*` 值。同樣地，設定 `VITE_CORS_PROXY_URL` 會取代公開的 `bentopdf-cors-proxy.bentopdf.workers.dev` 預設值。

CSP 在 `script-src` 中包含 `'unsafe-eval'`，因為 LibreOffice WASM 執行環境（用於 Word/Excel/PowerPoint 轉換工具）與 wasm-vips 影像函式庫（用於 PDF 轉 TIFF）會透過 `new Function()` 編譯內部分派程式碼。移除它會使這些工具無法運作。如果您以 `SIMPLE_MODE`（不含 LibreOffice）建置且不需要 PDF 轉 TIFF，可以手動編輯產生的 `security-headers.conf` 移除 `'unsafe-eval'`，以取得更嚴格的政策。

OCR 方面，將 `VITE_TESSERACT_*` 變數留空即使用預設的線上資源，或三個一起設定以使用自行架設/離線 OCR。部分覆寫 OCR 設定會被拒絕，因為 worker、核心執行環境與 traineddata 目錄必須相符。若要完全離線產生可搜尋的 PDF，也請設定 `VITE_OCR_FONT_BASE_URL`，讓 OCR 文字層字型從您的內部伺服器載入，而不是公開的 Noto 字型 URL。

`VITE_DEFAULT_LANGUAGE` 設定首次造訪者的介面語言。支援的值：`en`、`ar`、`be`、`fr`、`de`、`es`、`zh`、`zh-TW`、`vi`、`tr`、`id`、`it`、`pt`、`nl`、`da`。使用者仍可切換語言，此設定只會變更預設值。

範例：

```bash
# Build with French as the default language
docker build --build-arg VITE_DEFAULT_LANGUAGE=fr -t bentopdf .
docker run -d -p 3000:8080 bentopdf
```

### 自訂品牌

將預設的 BentoPDF 標誌、名稱與頁尾文字換成您自己的。將標誌檔案放在 `public/` 資料夾（或使用現有圖片），然後在建置時傳入品牌變數：

```bash
docker build \
  --build-arg VITE_BRAND_NAME="AcmePDF" \
  --build-arg VITE_BRAND_LOGO="images/acme-logo.svg" \
  --build-arg VITE_FOOTER_TEXT="© 2026 Acme Corp. Internal use only." \
  -t acmepdf .
```

品牌設定在完整模式與 Simple Mode 中皆可使用，並可與所有其他建置時選項搭配。

### 停用特定工具

基於法規遵循或安全需求，可從介面隱藏工具。停用的工具會從首頁、搜尋結果、鍵盤快速鍵與工作流程建構器中移除。直接以 URL 存取會顯示「工具無法使用」頁面。

工具 ID 是不含 `.html` 的頁面 URL。例如工具位於 `bentopdf.com/edit-pdf.html` 時，ID 為 `edit-pdf`。

#### 查詢工具 ID

最簡單的方法：在 BentoPDF 中開啟任一工具並查看 URL。路徑的最後一段（不含 `.html`）就是工具 ID。

<details>
<summary>完整工具 ID 清單</summary>

**編輯與註解：** `edit-pdf`, `bookmark`, `table-of-contents`, `page-numbers`, `add-page-labels`, `bates-numbering`, `add-watermark`, `header-footer`, `invert-colors`, `scanner-effect`, `adjust-colors`, `background-color`, `text-color`, `sign-pdf`, `add-stamps`, `remove-annotations`, `crop-pdf`, `form-filler`, `form-creator`, `remove-blank-pages`

**轉換為 PDF：** `image-to-pdf`, `jpg-to-pdf`, `png-to-pdf`, `webp-to-pdf`, `svg-to-pdf`, `bmp-to-pdf`, `heic-to-pdf`, `tiff-to-pdf`, `txt-to-pdf`, `markdown-to-pdf`, `json-to-pdf`, `csv-to-pdf`, `rtf-to-pdf`, `odt-to-pdf`, `word-to-pdf`, `excel-to-pdf`, `powerpoint-to-pdf`, `xps-to-pdf`, `mobi-to-pdf`, `epub-to-pdf`, `fb2-to-pdf`, `cbz-to-pdf`, `wpd-to-pdf`, `wps-to-pdf`, `xml-to-pdf`, `pages-to-pdf`, `odg-to-pdf`, `ods-to-pdf`, `odp-to-pdf`, `pub-to-pdf`, `vsd-to-pdf`, `psd-to-pdf`, `email-to-pdf`

**從 PDF 轉換：** `pdf-to-jpg`, `pdf-to-png`, `pdf-to-webp`, `pdf-to-bmp`, `pdf-to-tiff`, `pdf-to-cbz`, `pdf-to-svg`, `pdf-to-csv`, `pdf-to-excel`, `pdf-to-greyscale`, `pdf-to-json`, `pdf-to-docx`, `extract-images`, `pdf-to-markdown`, `prepare-pdf-for-ai`, `pdf-to-text`

**整理與管理：** `ocr-pdf`, `merge-pdf`, `alternate-merge`, `organize-pdf`, `add-attachments`, `extract-attachments`, `edit-attachments`, `pdf-multi-tool`, `pdf-layers`, `extract-tables`, `split-pdf`, `divide-pages`, `extract-pages`, `delete-pages`, `add-blank-page`, `reverse-pages`, `rotate-pdf`, `rotate-custom`, `n-up-pdf`, `pdf-booklet`, `combine-single-page`, `view-metadata`, `edit-metadata`, `pdf-to-zip`, `compare-pdfs`, `posterize-pdf`, `page-dimensions`

**最佳化與修復：** `compress-pdf`, `pdf-to-pdfa`, `fix-page-size`, `linearize-pdf`, `remove-restrictions`, `repair-pdf`, `rasterize-pdf`, `deskew-pdf`, `font-to-outline`

**安全性：** `encrypt-pdf`, `sanitize-pdf`, `decrypt-pdf`, `flatten-pdf`, `remove-metadata`, `change-permissions`, `digital-sign-pdf`, `validate-signature-pdf`, `timestamp-pdf`

</details>

#### 選項 1：建置時（Docker 建置參數）

```bash
docker build \
  --build-arg DISABLE_TOOLS="edit-pdf,sign-pdf,encrypt-pdf" \
  -t bentopdf .
```

這會將停用清單寫入 JavaScript bundle。變更時需要重新建置。

#### 選項 2：執行時（config.json）

將 `config.json` 檔案掛載到提供服務的目錄，無需重新建置：

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

或使用 Docker Compose：

```yaml
services:
  bentopdf:
    image: ghcr.io/alam00000/bentopdf-simple:latest
    ports:
      - '3000:8080'
    volumes:
      - ./config.json:/usr/share/nginx/html/config.json:ro
```

兩種方法可以合併使用，清單會合併。只要工具出現在其中任一清單，就會被停用。

#### 停用編輯器功能

您也可以停用 PDF 編輯器中的特定功能（例如塗黑遮蔽、註解、表單），而不停用整個編輯器工具。在您的 `config.json` 中加入 `editorDisabledCategories`：

```json
{
  "editorDisabledCategories": ["redaction", "annotation-stamp"]
}
```

<details>
<summary>完整編輯器類別清單</summary>

**縮放：** `zoom`, `zoom-in`, `zoom-out`, `zoom-fit-page`, `zoom-fit-width`, `zoom-marquee`, `zoom-level`

**註解：** `annotation`, `annotation-markup`, `annotation-highlight`, `annotation-underline`, `annotation-strikeout`, `annotation-squiggly`, `annotation-ink`, `annotation-text`, `annotation-stamp`

**形狀：** `annotation-shape`, `annotation-rectangle`, `annotation-circle`, `annotation-line`, `annotation-arrow`, `annotation-polygon`, `annotation-polyline`

**表單：** `form`, `form-textfield`, `form-checkbox`, `form-radio`, `form-select`, `form-listbox`, `form-fill-mode`

**塗黑遮蔽：** `redaction`, `redaction-area`, `redaction-text`, `redaction-apply`, `redaction-clear`

**文件：** `document`, `document-open`, `document-close`, `document-print`, `document-capture`, `document-export`, `document-fullscreen`, `document-protect`

**頁面：** `page`, `spread`, `rotate`, `scroll`, `navigation`

**面板：** `panel`, `panel-sidebar`, `panel-search`, `panel-comment`

**工具：** `tools`, `pan`, `pointer`, `capture`

**選取：** `selection`, `selection-copy`

**歷程記錄：** `history`, `history-undo`, `history-redo`

</details>

類別具有階層關係：停用上層類別（例如 `annotation`）會停用其所有子類別。

### 停用 GitHub 星星計數器

導覽列會顯示即時的 GitHub 星星數，於頁面載入時從 `api.github.com` 擷取。這是唯一一個並非用於 PDF 功能的外部請求。在建置時停用它，即可從 bundle 移除擷取程式碼，並從 Content-Security-Policy 移除 `api.github.com`：

```bash
docker build --build-arg DISABLE_GITHUB_STARS=true -t bentopdf .
```

Simple Mode 建置（`bentopdf-simple`）一律略過星星計數器，此旗標只在商業版或自訂完整建置時需要。

### 自訂 WASM URL（離線隔離 / 自行架設）

> [!IMPORTANT]
> WASM URL 會在**建置時**寫入 JavaScript。WASM 檔案在執行時由**使用者的瀏覽器**下載，Docker 不會在建置期間下載它們。在離線隔離網路中，您必須將 WASM 檔案架設在瀏覽器可連線的內部伺服器上。

**完整離線隔離工作流程：**

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

`--ocr-languages` 請使用 `bash scripts/prepare-airgap.sh --list-ocr-languages` 列出的代碼，或以 `bash scripts/prepare-airgap.sh --search-ocr-language <term>` 依名稱搜尋。以受限的 OCR 子集建置時，請將相同代碼傳給 `VITE_TESSERACT_AVAILABLE_LANGUAGES`，讓應用程式只顯示已打包的語言。若要完全離線輸出 OCR，也請架設內附的 `ocr-fonts/` 目錄，並將 `VITE_OCR_FONT_BASE_URL` 指向它。

將變數設為空字串即可停用該模組（使用者必須透過進階設定手動設定）。

## 自訂連接埠

預設情況下，BentoPDF 在容器內監聽 `8080` 連接埠。若要變更，請在執行時設定 `PORT` 環境變數：

```bash
docker run -p 3000:9090 -e PORT=9090 ghcr.io/alam00000/bentopdf-simple:latest
```

| 變數   | 說明                      | 預設值 |
| ------ | ------------------------- | ------ |
| `PORT` | 容器內的 Nginx 監聽連接埠 | `8080` |

這在標準與 nonroot Dockerfile 中皆可使用。

## 自訂使用者 ID（PUID/PGID）

對於需要以特定非 root 使用者執行的環境（NAS 裝置、具有安全性內容的 Kubernetes、組織政策），BentoPDF 提供另一個支援 LSIO 風格 PUID/PGID 的 Dockerfile。

### 建置並執行

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

### 環境變數

| 變數           | 說明                  | 預設值  |
| -------------- | --------------------- | ------- |
| `PUID`         | 執行時使用的使用者 ID | `1000`  |
| `PGID`         | 執行時使用的群組 ID   | `1000`  |
| `PORT`         | Nginx 監聽連接埠      | `8080`  |
| `DISABLE_IPV6` | 停用 IPv6 監聽        | `false` |

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

### 運作方式

容器以 root 啟動，建立具有指定 PUID/PGID 的使用者，調整所有可寫入目錄的擁有權，然後使用 `su-exec` 降低權限。nginx 程序完全以您指定的使用者執行。

> [!NOTE]
> 標準 `Dockerfile` 使用 `nginx-unprivileged`（UID 101），建議大多數部署使用。只有在需要特定 UID/GID 時才使用 `Dockerfile.nonroot`。

> [!WARNING]
> PUID/PGID 不可為 `0`（root）。entrypoint 會驗證輸入，遇到無效值時會以錯誤結束。

## 搭配 Traefik（反向代理）

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

## 搭配 Caddy（反向代理）

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

Caddyfile 設定：

```
pdf.example.com {
    reverse_proxy bentopdf:8080
    header Cross-Origin-Opener-Policy "same-origin"
    header Cross-Origin-Embedder-Policy "require-corp"
}
```

## 資源限制

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

## Podman Quadlet（Systemd 整合）

[Quadlet](https://docs.podman.io/en/latest/markdown/podman-systemd.unit.5.html) 可讓您將 Podman 容器作為 systemd 服務執行。非常適合在 Linux 系統上進行正式環境部署。

### 基本 Quadlet 設定

在 `~/.config/containers/systemd/bentopdf.container`（使用者）或 `/etc/containers/systemd/bentopdf.container`（系統）建立容器單元檔案：

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

### 啟用並啟動

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
> 若為全系統部署，請使用不帶 `--user` 旗標的 `systemctl`，並將檔案放在 `/etc/containers/systemd/`。

### 搭配健康檢查的 Quadlet

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

### 使用 Quadlet 自動更新

有新映像可用時，Podman 可以自動更新容器：

```bash
# Enable auto-update timer
systemctl --user enable --now podman-auto-update.timer

# Check for updates manually
podman auto-update

# Dry run (check without updating)
podman auto-update --dry-run
```

### Quadlet 網路設定

若需自訂網路設定，請建立網路檔案 `bentopdf.network`：

```ini
[Network]
Subnet=10.89.0.0/24
Gateway=10.89.0.1
```

然後在容器檔案中參照它：

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
