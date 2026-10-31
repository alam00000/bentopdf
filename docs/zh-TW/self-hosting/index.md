# 自行架設指南

BentoPDF 可以架設在您自己的基礎設施上。本指南介紹多種部署方式。

## 使用 Docker / Podman 快速開始

自行架設 BentoPDF 最快的方式：

> [!TIP]
> BentoPDF 提供兩種建置版本：
>
> - **自行架設版**：`ghcr.io/alam00000/bentopdf-simple:latest`。包含所有 PDF 工具，但**不含**行銷介面（沒有主視覺、常見問題、使用者推薦與頁尾）。適合內部、團隊或組織部署。它**不是**功能縮減的「精簡」版本。
> - **商業版**：`ghcr.io/alam00000/bentopdf:latest`。完整的行銷網站，bentopdf.com 本身以及執行公開部署的商業授權持有者都使用此版本。
>
> 如果不確定：請使用自行架設版。

> [!IMPORTANT]
> Office 檔案轉換需要 `SharedArrayBuffer`，這表示應用程式必須同時具備跨來源隔離，並從安全環境提供服務。官方映像檔已會傳送所需的 COOP/COEP 標頭，但瀏覽器仍會在純 HTTP 的區域網路來源（例如 `http://192.168.x.x`）上停用 `SharedArrayBuffer`。
>
> `http://localhost` 僅適用於同一裝置上的測試。如果使用者透過區域網路 IP 或主機名稱存取 BentoPDF，請以 HTTPS 終止連線。

```bash
# Docker
docker run -d -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest

# Podman
podman run -d -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest
```

或使用 Docker Compose / Podman Compose：

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

將 BentoPDF 作為 systemd 服務執行。建立 `~/.config/containers/systemd/bentopdf.container`：

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

完整的 Quadlet 說明請參閱 [Docker 部署指南](/zh-TW/self-hosting/docker)。

## 從原始碼建置

```bash
# Clone and build
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf
npm install
npm run build

# The built files are in the `dist` folder
```

## 設定選項

### 自行架設版（Simple Mode）

自行架設版（`bentopdf-simple` 映像檔，也稱為 Simple Mode）在**功能上與商業版完全相同**：所有 PDF 工具都在，且行為一致。它只是隱藏了僅在 bentopdf.com 本身或商業公開部署上才有意義的行銷介面。**它不是功能縮減的「精簡」版本。**

**自行架設版隱藏的內容**（僅限外觀，未移除任何 PDF 功能）：

- 導覽列、主視覺區塊、功能區塊、常見問題、使用者推薦、頁尾
- 將頁面標題改為「PDF 工具」

**自行架設版保留的內容**（所有實際處理 PDF 的部分）：

- 所有 PDF 工具（合併、分割、編輯、簽署、OCR、Office 轉換等）
- 自訂品牌支援，以及所有建置時與執行時設定

商業版（`ghcr.io/alam00000/bentopdf:latest`）是 bentopdf.com 本身所使用的版本，也供執行公開部署的商業授權持有者使用。它額外加入了主視覺、常見問題、使用者推薦與頁尾，這些在內部工具上並不合適。

如果您是為團隊、組織或作為內部工具自行架設 BentoPDF，請使用自行架設版：

```bash
# Use the pre-built image (recommended)
docker run -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest

# Or build it yourself
SIMPLE_MODE=true npm run build
```

完整詳情請參閱 [SIMPLE_MODE.md](https://github.com/alam00000/bentopdf/blob/main/SIMPLE_MODE.md)。

### 商業版（以您自己的品牌進行公開部署）

商業版（`bentopdf` 映像檔，沒有 `-simple` 後綴）是 bentopdf.com 本身所使用的版本。它在所有 PDF 工具之外，還包含完整的行銷網站（主視覺、功能、常見問題、使用者推薦、頁尾）。當您想要**以自己的品牌將 BentoPDF 部署為公開的 PDF 服務**時，請使用此版本，例如：

- 您在自己的網域上將 BentoPDF 作為託管 SaaS 提供給終端使用者
- 您想要完整的登陸頁體驗（行銷區塊加上工具），而不只是單純的工具介面
- 您是將 BentoPDF 嵌入商業產品的商業授權持有者

**直接執行**（使用 BentoPDF 品牌，方便預覽此版本）：

```bash
docker run -p 3000:8080 ghcr.io/alam00000/bentopdf:latest
```

**以您自己的品牌建置**（典型的商業工作流程）：

```bash
docker build \
  --build-arg VITE_BRAND_NAME="AcmePDF" \
  --build-arg VITE_BRAND_LOGO="images/acme-logo.svg" \
  --build-arg VITE_FOOTER_TEXT="© 2026 Acme Corp. All rights reserved." \
  -t acmepdf .

docker run -p 3000:8080 acmepdf
```

其他所有建置時選項（`BASE_URL`、`VITE_DEFAULT_LANGUAGE`、`DISABLE_TOOLS`、WASM URL 覆寫等）的運作方式都與自行架設版相同。

::: warning 授權
在 BentoPDF 的兩種授權選項下，都可以執行商業版：

- **AGPL-3.0**（免費）：前提是您的部署以 AGPL 公開完整原始碼，包括任何品牌修改與周邊商業邏輯。
- **商業授權**（終身 $79）：適用於不公開品牌分支或商業程式碼的閉源或專有部署。

完整比較請參閱[授權頁面](https://www.bentopdf.com/licensing)。採用 AGPL 授權的 WASM 模組（PyMuPDF、Ghostscript、CoherentPDF）會在執行時從 CDN 載入，因此不會進入您的映像檔，也不會改變您的授權狀態。
:::

### Base URL

部署到子目錄：

```bash
BASE_URL=/pdf-tools/ npm run build
```

### 自訂品牌

在建置時將預設的 BentoPDF 標誌、名稱與頁尾文字替換為您自己的：

| 變數               | 說明                        | 預設值                                  |
| ------------------ | --------------------------- | --------------------------------------- |
| `VITE_BRAND_NAME`  | 顯示於頁首與頁尾的品牌名稱  | `BentoPDF`                              |
| `VITE_BRAND_LOGO`  | 相對於 `public/` 的標誌路徑 | `images/favicon-no-bg.svg`              |
| `VITE_FOOTER_TEXT` | 自訂頁尾或版權文字          | `© 2026 BentoPDF. All rights reserved.` |

```bash
# Place your logo in public/, then build
VITE_BRAND_NAME="AcmePDF" \
VITE_BRAND_LOGO="images/acme-logo.svg" \
VITE_FOOTER_TEXT="© 2026 Acme Corp. Internal use only." \
npm run build
```

或透過 Docker：

```bash
docker build \
  --build-arg VITE_BRAND_NAME="AcmePDF" \
  --build-arg VITE_BRAND_LOGO="images/acme-logo.svg" \
  --build-arg VITE_FOOTER_TEXT="© 2026 Acme Corp. Internal use only." \
  -t acmepdf .
```

品牌設定在完整模式與 Simple Mode 下皆可使用，並可與其他所有建置時選項（`BASE_URL`、`SIMPLE_MODE`、`VITE_DEFAULT_LANGUAGE`）搭配使用。

### 停用特定工具

基於合規或安全考量隱藏個別工具。停用的工具會從首頁、搜尋、快捷鍵、工作流程建構器以及直接 URL 存取中移除。

工具 ID 是去掉 `.html` 的頁面 URL：開啟任一工具並查看 URL（例如 `edit-pdf`、`sign-pdf`、`encrypt-pdf`）。

**建置時**（寫入套件中）：

```bash
DISABLE_TOOLS="edit-pdf,sign-pdf" npm run build
```

**執行時**（無需重新建置，掛載 `config.json` 即可）：

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

兩種方式可以同時使用，清單會合併。

您也可以在 `config.json` 中加入 `editorDisabledCategories`，停用 PDF 編輯器中的特定功能（例如塗黑），而不必停用整個工具。完整類別清單請參閱 [Docker 指南](/zh-TW/self-hosting/docker#停用編輯器功能)。

## 部署指南

選擇您的平台：

- [Vercel](/zh-TW/self-hosting/vercel)
- [Netlify](/zh-TW/self-hosting/netlify)
- [Cloudflare Pages](/zh-TW/self-hosting/cloudflare)
- [AWS S3 + CloudFront](/zh-TW/self-hosting/aws)
- [Hostinger](/zh-TW/self-hosting/hostinger)
- [Nginx](/zh-TW/self-hosting/nginx)
- [Apache](/zh-TW/self-hosting/apache)
- [Docker](/zh-TW/self-hosting/docker)
- [Kubernetes](/zh-TW/self-hosting/kubernetes)
- [CORS 代理](/zh-TW/self-hosting/cors-proxy) - 數位簽章所需

## 常見問題

### Word / ODT / Excel / PowerPoint 轉 PDF 卡住（SharedArrayBuffer 無法使用）

**症狀**：以 LibreOffice 為基礎的文件轉換（Word、ODT、Excel、PowerPoint 轉 PDF）卡在約 55% 或無法開始。瀏覽器主控台可能顯示：

> `ReferenceError: SharedArrayBuffer is not defined`

…或 `window.crossOriginIsolated` 回報 `false`，或 WASM 編譯回報 `expected magic word 00 61 73 6d, found 1f 8b 08 08`。

**原因**：LibreOffice WASM 需要 `SharedArrayBuffer`，而瀏覽器只有在頁面**跨來源隔離**且從**安全環境**提供時才會啟用它。這表示必須同時滿足兩個條件：

1. 每個回應都包含以下兩個標頭：
   - `Cross-Origin-Embedder-Policy: require-corp`
   - `Cross-Origin-Opener-Policy: same-origin`
2. 頁面從 `https://...` 或 `http://localhost` 提供。區域網路 IP 上的純 HTTP（例如 `http://192.168.x.x`）不算安全環境，瀏覽器會在那裡停用 `SharedArrayBuffer`。

`00 61 73 6d / 1f 8b 08 08` 不符是另一個子症狀：預先壓縮的 `.wasm.gz` / `.data.gz` 檔案缺少 `Content-Encoding: gzip` 回應標頭，因此瀏覽器收到的是原始 gzip 位元組，而非解壓縮後的 WASM。

**修正**：請參閱您平台的部署指南以取得確切設定：

- [Nginx →](/zh-TW/self-hosting/nginx#word-odt-excel-轉-pdf-無法運作)
- [Apache →](/zh-TW/self-hosting/apache#word-odt-excel-轉-pdf-無法運作)
- [AWS S3 + CloudFront →](/zh-TW/self-hosting/aws#步驟-3b-回應標頭政策-libreoffice-wasm-必需)
- [Cloudflare Pages →](/zh-TW/self-hosting/cloudflare#設定檔)（`_headers` 檔案）
- [Netlify →](/zh-TW/self-hosting/netlify#word-odt-excel-轉-pdf-卡在-55)（`netlify.toml`）
- [Vercel →](/zh-TW/self-hosting/vercel#word-odt-excel-轉-pdf-無法運作)（`vercel.json`）
- [Hostinger →](/zh-TW/self-hosting/hostinger#libreoffice-工具無法運作)（`.htaccess`）
- [Kubernetes →](/zh-TW/self-hosting/kubernetes#確保-sharedarraybuffer-標頭仍然有效-ingress-gateway)
- **Docker**：由內建的 nginx 設定自動處理，無需任何操作。

**驗證**：在任一 BentoPDF 頁面開啟開發者工具主控台並執行：

```js
console.log(window.crossOriginIsolated); // should be true
console.log(typeof SharedArrayBuffer); // should be "function"
```

如果頁面使用 HTTPS 或 `http://localhost`，且每個回應都帶有 COEP/COOP 兩個標頭，兩項檢查都會通過。如果您使用的是 `http://192.168.x.x` 或其他非迴路的 HTTP 來源，請以 HTTPS 終止連線，沒有僅靠標頭就能解決的方法。

### `.mjs` 檔案以 `application/octet-stream` 提供

**症狀**：簽署 PDF / 表單填寫器 / 某些其他工具顯示空白檢視器或無法載入。瀏覽器主控台回報：

> `Failed to load module script: The server responded with a non-JavaScript MIME type of "application/octet-stream". Strict MIME type checking is enforced for module scripts per HTML spec.`

**原因**：您的網頁伺服器或反向代理沒有 `.mjs` 檔案的 MIME 類型對應（內建的 PDF 檢視器以此副檔名提供 ES 模組）。許多預設伺服器設定會將無法辨識的副檔名設為 `application/octet-stream`，而瀏覽器會拒絕將其作為 ES 模組執行。

**修正**：請參閱您平台的部署指南以取得確切設定片段：

- [Nginx →](/zh-TW/self-hosting/nginx#簽署-pdf-或表單填寫器顯示空白檢視器-mjs-mime-錯誤)
- [Apache →](/zh-TW/self-hosting/apache#簽署-pdf-或表單填寫工具顯示空白檢視器-mjs-mime-錯誤)
- [AWS S3 + CloudFront →](/zh-TW/self-hosting/aws#步驟-2-建置並上傳)（請參閱 `aws s3 cp ... --include "*.mjs"`）
- [Kubernetes →](/zh-TW/self-hosting/kubernetes#mjs-mime-類型錯誤-簽署-pdf-表單填寫器-iframe-空白)
- **Docker、Vercel、Netlify、Cloudflare Pages、Hostinger**：自動處理，無需任何操作。

**驗證**：開啟開發者工具 → 網路分頁，找到失敗的 `.mjs` 請求，檢查 `Content-Type` 回應標頭。它應該是 `application/javascript`。如果仍是 `application/octet-stream`，可能是外層的反向代理或 CDN 重新判斷了類型，請檢查服務鏈中的每一層。

## WASM 設定（AGPL 元件）

BentoPDF 的原始碼**不內含** AGPL 授權的處理函式庫，但已**預先設定 CDN URL**，讓所有功能開箱即用，無需手動設定。

::: tip 預設零設定
自 v2.0.0 起，WASM 模組已透過環境變數預先設定為從 jsDelivr CDN 載入。所有進階功能皆可立即使用，使用者無需任何設定。
:::

| 元件            | 授權     | 功能                                       |
| --------------- | -------- | ------------------------------------------ |
| **PyMuPDF**     | AGPL-3.0 | EPUB/MOBI/FB2/XPS 轉換、圖片擷取、表格擷取 |
| **Ghostscript** | AGPL-3.0 | PDF/A 轉換、壓縮、歪斜校正、點陣化         |
| **CoherentPDF** | AGPL-3.0 | 目錄、附件、保留書籤的 PDF 合併            |

### 預設環境變數

這些設定位於 `.env.production`，並在建置時寫入：

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

### 覆寫 WASM URL

您可以在建置時為自訂部署覆寫預設值：

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

若要完全停用某個模組（要求使用者透過進階設定手動設定），請將其變數設為空字串。

對於 OCR，您可以將所有 `VITE_TESSERACT_*` 變數留空並使用預設的線上資源，或同時設定 worker/core/lang URL 以自行架設或離線使用 OCR。如果只內含特定 OCR 語言，也請將 `VITE_TESSERACT_AVAILABLE_LANGUAGES` 設為相同的逗號分隔代碼，讓介面只提供已安裝的語言，不支援的選擇則會以說明性錯誤失敗。若要完全離線產生可搜尋的 PDF，也請將 `VITE_OCR_FONT_BASE_URL` 設為提供內建 OCR 字型的內部目錄。

使用者也可以隨時透過介面中的**進階設定**覆寫這些預設值：儲存在瀏覽器中的使用者覆寫優先於環境預設值。

### 實體隔離 / 離線部署

適用於無法連上網際網路的網路（政府、醫療、金融等）。WASM URL 在**建置時**寫入 JavaScript，實際的 WASM 檔案則在執行時由**使用者的瀏覽器**下載。因此您需要在可連網的機器上準備好一切，再將其傳入隔離網路。

#### 自動化腳本（建議）

內附的 `prepare-airgap.sh` 腳本可自動完成整個流程：下載 WASM 套件、建置 Docker 映像檔，並產生附有設定腳本的獨立套件。

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

這會產生一個套件目錄：

```
bentopdf-airgap-bundle/
  bentopdf.tar              # Docker image
  *.tgz                     # WASM packages (PyMuPDF, Ghostscript, CoherentPDF, Tesseract)
  tesseract-langdata/       # OCR traineddata files
  ocr-fonts/                # OCR text-layer font files
  setup.sh                  # Setup script for the air-gapped side
  README.md                 # Instructions
```

透過 USB、內部成品儲存庫或核准的方式將套件傳入實體隔離網路。然後執行內附的設定腳本：

```bash
cd bentopdf-airgap-bundle
bash setup.sh
```

設定腳本會載入 Docker 映像檔、解壓縮 WASM 檔案，並可選擇啟動容器。

**腳本選項：**

| 旗標                           | 說明                                         | 預設值                     |
| ------------------------------ | -------------------------------------------- | -------------------------- |
| `--wasm-base-url <url>`        | WASM 在內部的託管位置                        | _（必填，缺少時會提示）_   |
| `--image-name <name>`          | Docker 映像檔標籤                            | `bentopdf`                 |
| `--output-dir <path>`          | 輸出套件目錄                                 | `./bentopdf-airgap-bundle` |
| `--simple-mode`                | 啟用 Simple Mode                             | 關閉                       |
| `--base-url <path>`            | 子目錄 Base URL（例如 `/pdf/`）              | `/`                        |
| `--language <code>`            | 預設介面語言（例如 `fr`、`de`）              | _（無）_                   |
| `--brand-name <name>`          | 自訂品牌名稱                                 | _（無）_                   |
| `--brand-logo <path>`          | 相對於 `public/` 的標誌路徑                  | _（無）_                   |
| `--footer-text <text>`         | 自訂頁尾文字                                 | _（無）_                   |
| `--ocr-languages <list>`       | 要內含的 OCR 語言（逗號分隔）                | `eng`                      |
| `--list-ocr-languages`         | 列出支援的 OCR 代碼與名稱後結束              | 關閉                       |
| `--search-ocr-language <term>` | 依名稱或縮寫搜尋 OCR 代碼                    | 關閉                       |
| `--dockerfile <path>`          | 要使用的 Dockerfile                          | `Dockerfile`               |
| `--skip-docker`                | 略過 Docker 建置與匯出                       | 關閉                       |
| `--skip-wasm`                  | 略過 WASM 下載（重複使用現有的 `.tgz` 檔案） | 關閉                       |

互動式提示也接受 `list` 以列出完整的 Tesseract 支援代碼清單，以及 `search <term>` 以尋找符合項目，例如 `search german` 或 `search chi`。

::: warning 同源要求
WASM 檔案必須與 BentoPDF 應用程式從**相同來源**提供。Web Worker 使用的 `importScripts()` 無法跨來源載入腳本。例如，若 BentoPDF 執行於 `https://internal.example.com`，WASM Base URL 也應為 `https://internal.example.com/wasm`。
:::

#### 手動步驟

<details>
<summary>如果您偏好不使用腳本，手動完成</summary>

**步驟 1：下載 WASM 與 OCR 套件**（在可連網的機器上）

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

**步驟 2：以內部 URL 建置 Docker 映像檔**

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

**步驟 3：匯出 Docker 映像檔**

```bash
docker save bentopdf -o bentopdf.tar
```

**步驟 4：傳入實體隔離網路**

透過 USB、內部成品儲存庫或核准的傳輸方式複製：

- `bentopdf.tar`：Docker 映像檔
- 步驟 1 的五個 `.tgz` WASM/OCR 套件
- 步驟 1 的 `tesseract-langdata/` 目錄
- 步驟 1 的 `ocr-fonts/` 目錄

**步驟 5：在實體隔離網路內設定**

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

請確認這些檔案可透過您在步驟 2 設定的 URL 存取，包括 `.../ocr/worker.min.js`、`.../ocr/core`、`.../ocr/lang-data` 與 `.../ocr/fonts`。

</details>

::: info 從原始碼建置而非使用 Docker？
在執行 `npm run build` 之前，於 `.env.production` 中設定這些變數：

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

### 架設您自己的 WASM 代理

如果您需要以正確的 CORS 標頭提供 AGPL WASM 檔案，可以部署一個簡單的代理。範例實作請參閱 [Cloudflare WASM 代理指南](https://github.com/alam00000/bentopdf/blob/main/cloudflare/WASM-PROXY.md)。

::: tip 為何要分開？
這種分離可確保：

- 商業使用者有明確的法律合規性
- BentoPDF 核心維持其雙重授權（AGPL-3.0 / 商業授權）
- WASM 檔案在執行時載入，而非內含於原始碼中
  :::

## 系統需求

| 需求     | 最低規格                          |
| -------- | --------------------------------- |
| 儲存空間 | 約 100 MB（不含 AGPL 模組的核心） |
| RAM      | 512 MB                            |
| CPU      | 任何現代處理器                    |

::: tip
BentoPDF 是靜態網站，不需要資料庫或後端伺服器！
:::
