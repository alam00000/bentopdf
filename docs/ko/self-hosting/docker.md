# Docker / Podman으로 배포하기

프로덕션 환경에서 BentoPDF를 직접 호스팅하는 가장 쉬운 방법입니다.

> [!IMPORTANT]
> **Office 파일 변환에 필요한 헤더**
>
> LibreOffice 기반 도구(Word, Excel, PowerPoint 변환)는 `SharedArrayBuffer` 지원을 위해 다음 HTTP 헤더가 필요합니다:
>
> - `Cross-Origin-Opener-Policy: same-origin`
> - `Cross-Origin-Embedder-Policy: require-corp`
>
> 페이지는 보안 컨텍스트에서 제공되어야 합니다. `http://localhost`는 로컬 테스트에서 작동하지만, `http://192.168.x.x` 같은 LAN IP는 대체로 해당되지 않으므로 헤더가 있어도 일반 HTTP로는 Office 변환이 실패합니다.
>
> 공식 컨테이너 이미지에는 이 헤더가 포함되어 있습니다. 리버스 프록시(Traefik, Caddy 등)를 사용한다면 이 헤더가 유지되거나 추가되도록 하고, 루프백이 아닌 접근에는 HTTPS를 사용하세요.

> [!TIP]
> **Podman 사용자:** 모든 `docker` 명령은 `docker`를 `podman`으로, `docker-compose`를 `podman-compose`로 바꾸면 Podman에서도 작동합니다.

## 빠른 시작

> [!TIP]
> BentoPDF는 두 가지 빌드로 제공됩니다:
>
> - **셀프 호스팅 빌드**: `ghcr.io/alam00000/bentopdf-simple:latest`. 마케팅 요소(히어로, FAQ, 후기, 푸터)를 **제외한** 모든 PDF 도구를 제공합니다. 내부/팀/조직 배포에 사용하세요. 기능이 줄어든 "라이트" 버전이 **아닙니다**.
> - **상용 빌드**: `ghcr.io/alam00000/bentopdf:latest`. 전체 마케팅 사이트이며, bentopdf.com 자체와 공개 서비스를 운영하는 상용 라이선스 보유자가 사용합니다.
>
> 잘 모르겠다면 셀프 호스팅 빌드를 받으세요.

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

`docker-compose.yml`을 만드세요:

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

실행:

```bash
# Docker Compose
docker compose up -d

# Podman Compose
podman-compose up -d
```

## 직접 이미지 빌드하기

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

빌드 및 실행:

```bash
docker build -t bentopdf:custom .
docker run -d -p 3000:8080 bentopdf:custom
```

## 환경 변수

| 변수                                 | 설명                                                                                                                                                                                    | 기본값                                                         |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `SIMPLE_MODE`                        | 셀프 호스팅 변형을 빌드합니다 (bentopdf.com 마케팅 요소인 히어로, FAQ, 후기, 푸터를 숨깁니다). 모든 PDF 도구는 유지됩니다.                                                              | `false`                                                        |
| `BASE_URL`                           | 하위 디렉터리에 배포                                                                                                                                                                    | `/`                                                            |
| `VITE_WASM_PYMUPDF_URL`              | PyMuPDF WASM 모듈 URL                                                                                                                                                                   | `https://cdn.jsdelivr.net/npm/@bentopdf/pymupdf-wasm@0.11.16/` |
| `VITE_WASM_GS_URL`                   | Ghostscript WASM 모듈 URL                                                                                                                                                               | `https://cdn.jsdelivr.net/npm/@bentopdf/gs-wasm@0.1.1/assets/` |
| `VITE_WASM_CPDF_URL`                 | CoherentPDF WASM 모듈 URL                                                                                                                                                               | `https://cdn.jsdelivr.net/npm/coherentpdf@2.5.5/dist/`         |
| `VITE_TESSERACT_WORKER_URL`          | OCR 워커 스크립트 URL                                                                                                                                                                   | _(비어 있음, Tesseract.js 기본 CDN 사용)_                      |
| `VITE_TESSERACT_CORE_URL`            | OCR 코어 런타임 디렉터리                                                                                                                                                                | _(비어 있음, Tesseract.js 기본 CDN 사용)_                      |
| `VITE_TESSERACT_LANG_URL`            | OCR traineddata 디렉터리                                                                                                                                                                | _(비어 있음, Tesseract.js 기본 CDN 사용)_                      |
| `VITE_TESSERACT_AVAILABLE_LANGUAGES` | UI에 표시할 OCR 언어 (쉼표로 구분)                                                                                                                                                      | _(비어 있음, 전체 목록 표시)_                                  |
| `VITE_OCR_FONT_BASE_URL`             | OCR 텍스트 레이어 글꼴 디렉터리                                                                                                                                                         | _(비어 있음, 원격 Noto 글꼴 URL 사용)_                         |
| `VITE_DEFAULT_LANGUAGE`              | 기본 UI 언어                                                                                                                                                                            | `en`                                                           |
| `VITE_BRAND_NAME`                    | 사용자 지정 브랜드 이름                                                                                                                                                                 | `BentoPDF`                                                     |
| `VITE_BRAND_LOGO`                    | `public/` 기준 로고 경로                                                                                                                                                                | `images/favicon-no-bg.svg`                                     |
| `VITE_FOOTER_TEXT`                   | 사용자 지정 푸터/저작권 텍스트                                                                                                                                                          | `© 2026 BentoPDF. All rights reserved.`                        |
| `DISABLE_TOOLS`                      | 숨길 도구 ID (쉼표로 구분)                                                                                                                                                              | _(비어 있음, 모든 도구 활성화)_                                |
| `DISABLE_GITHUB_STARS`               | 페이지 로드 시 GitHub 스타 수 가져오기를 건너뛰고 CSP에서 `api.github.com`을 제거합니다. Simple Mode 빌드는 항상 건너뜁니다.                                                            | `false`                                                        |
| `SITE_URL`                           | canonical, hreflang, 사이트맵 링크에 기록되는 공개 URL입니다. 검색 엔진이 사용자의 배포를 독립된 사이트로 취급하길 원하지 않는다면 기본값으로 두세요.                                   | `https://www.bentopdf.com`                                     |
| `ALLOW_INDEXING`                     | 사용자 지정 `SITE_URL`을 사용하면 모든 페이지가 `noindex`로 표시되어 사용자의 사본이 검색 결과에서 bentopdf.com과 경쟁하지 않습니다. 검색 엔진이 색인하도록 하려면 `true`로 설정하세요. | `false`                                                        |

WASM 모듈 URL에는 CDN 기본값이 미리 설정되어 있어 모든 고급 기능이 별도 설정 없이 작동합니다. 폐쇄망이나 직접 호스팅하는 배포에서는 이 값을 덮어쓰세요.

### 검색 엔진

기본적으로 모든 페이지는 검색 엔진이 bentopdf.com을 원본으로 인식하도록 하므로 사용자의 배포가 중복으로 표시되지 않습니다. 비공개 또는 내부 인스턴스라면 아무것도 바꿀 필요가 없습니다.

- **인스턴스를 검색 결과에서 완전히 제외하기:** `-e ROBOTS_NOINDEX=true`로 컨테이너를 실행하세요. 재시작만 하면 되며 다시 빌드할 필요는 없습니다.
- **인스턴스를 검색 결과에서 독립된 사이트로 만들기:** `--build-arg SITE_URL=https://your-domain.example --build-arg ALLOW_INDEXING=true`로 빌드하세요. `ALLOW_INDEXING=true`가 없으면 사용자 지정 `SITE_URL`은 모든 페이지를 `noindex`로 표시합니다.

### Content-Security-Policy

nginx 이미지에는 적용(enforcing) 모드의 `Content-Security-Policy` 헤더가 포함되어 있습니다. CSP의 `script-src`, `connect-src`, `font-src` 지시어는 위의 `VITE_*` URL 변수로부터 **빌드 시점에 생성**됩니다. `--build-arg`로 전달하는 호스트는 자동으로 정책에 추가됩니다.

그 결과:

- 빌드 시 `VITE_CORS_PROXY_URL` 또는 `VITE_WASM_*_URL`을 덮어쓰면 CSP가 해당 origin을 자동으로 허용합니다. 별도 설정이 필요 없습니다.
- `cdn.jsdelivr.net`의 URL에 대해 `script-src`는 전체 CDN이 아니라 버전이 명시된 정확한 패키지 폴더만 허용합니다. 예: `https://cdn.jsdelivr.net/npm/@bentopdf/pymupdf-wasm@0.11.16/`. jsDelivr는 모든 공개 npm 패키지와 GitHub 저장소를 제공하므로 호스트 전체를 허용하면 그 어떤 것도 사용자의 인스턴스에서 실행될 수 있기 때문입니다. 다른 호스트의 URL은 origin 단위로 허용됩니다.
- 앱 내 고급 설정 페이지에서 _런타임에_ 사용자 지정 WASM URL을 설정하면 해당 origin은 CSP에 **포함되지 않으며** 브라우저가 해당 가져오기를 차단합니다. `cdn.jsdelivr.net`의 같은 패키지라도 다른 버전이면 마찬가지인데, 빌드 시 설정한 버전만 허용되기 때문입니다. 런타임 설정은 실험용입니다. 영구적인 사용자 지정 URL은 해당 `VITE_*` 빌드 인수를 설정하세요.
- 세 가지 `VITE_WASM_*_URL` 값을 모두 덮어쓰는 폐쇄망 배포는 해당 `cdn.jsdelivr.net` 패키지 폴더도 CSP에서 제거됩니다 (각 기본값은 추가되는 것이 아니라 대체됩니다). `cdn.jsdelivr.net`의 Tesseract OCR 기본값은 `VITE_TESSERACT_*` 세 값도 설정하기 전까지 정책에 남습니다. 마찬가지로 `VITE_CORS_PROXY_URL`을 설정하면 공개 `bentopdf-cors-proxy.bentopdf.workers.dev` 기본값이 대체됩니다.

CSP의 `script-src`에는 `'unsafe-eval'`이 포함되어 있습니다. LibreOffice WASM 런타임(Word/Excel/PowerPoint 변환 도구에서 사용)과 wasm-vips 이미지 라이브러리(PDF를 TIFF로 도구에서 사용)가 `new Function()`으로 내부 디스패치 코드를 컴파일하기 때문입니다. 이를 제거하면 해당 도구가 작동하지 않습니다. `SIMPLE_MODE`(LibreOffice 없음)로 빌드하고 PDF를 TIFF로 도구가 필요 없다면, 생성된 `security-headers.conf`에서 `'unsafe-eval'`을 직접 제거하여 더 엄격한 정책을 적용할 수 있습니다.

OCR의 경우 `VITE_TESSERACT_*` 변수를 비워 두면 기본 온라인 에셋을 사용하고, 직접 호스팅하거나 오프라인 OCR을 쓰려면 세 가지를 함께 설정하세요. 워커, 코어 런타임, traineddata 디렉터리가 서로 일치해야 하므로 일부만 덮어쓰는 것은 거부됩니다. 완전히 오프라인으로 검색 가능한 PDF를 만들려면 `VITE_OCR_FONT_BASE_URL`도 설정하여 OCR 텍스트 레이어 글꼴을 공개 Noto 글꼴 URL 대신 내부 서버에서 불러오도록 하세요.

`VITE_DEFAULT_LANGUAGE`는 처음 방문하는 사용자의 UI 언어를 설정합니다. 지원되는 값: `en`, `ar`, `be`, `fr`, `de`, `es`, `zh`, `zh-TW`, `vi`, `tr`, `id`, `it`, `pt`, `nl`, `da`. 사용자는 언제든 언어를 바꿀 수 있으며, 이 값은 기본값만 바꿉니다.

예시:

```bash
# Build with French as the default language
docker build --build-arg VITE_DEFAULT_LANGUAGE=fr -t bentopdf .
docker run -d -p 3000:8080 bentopdf
```

### 사용자 지정 브랜딩

기본 BentoPDF 로고, 이름, 푸터 텍스트를 직접 만든 것으로 바꾸세요. 로고 파일을 `public/` 폴더에 두거나(또는 기존 이미지를 사용하고) 빌드 시 브랜딩 변수를 전달하세요:

```bash
docker build \
  --build-arg VITE_BRAND_NAME="AcmePDF" \
  --build-arg VITE_BRAND_LOGO="images/acme-logo.svg" \
  --build-arg VITE_FOOTER_TEXT="© 2026 Acme Corp. Internal use only." \
  -t acmepdf .
```

브랜딩은 전체 모드와 Simple Mode 모두에서 작동하며 다른 모든 빌드 시점 옵션과 함께 사용할 수 있습니다.

### 특정 도구 비활성화

규정 준수나 보안 요구 사항에 따라 UI에서 도구를 숨길 수 있습니다. 비활성화된 도구는 홈페이지, 검색 결과, 키보드 단축키, 워크플로 빌더에서 제거됩니다. URL로 직접 접근하면 "도구를 사용할 수 없음" 페이지가 표시됩니다.

도구 ID는 `.html`을 뺀 페이지 URL입니다. 예를 들어 도구가 `bentopdf.com/edit-pdf.html`에 있다면 ID는 `edit-pdf`입니다.

#### 도구 ID 찾기

가장 쉬운 방법: BentoPDF에서 아무 도구나 열고 URL을 보세요. 경로의 마지막 부분(`.html` 제외)이 도구 ID입니다.

<details>
<summary>전체 도구 ID 목록</summary>

**편집 및 주석:** `edit-pdf`, `bookmark`, `table-of-contents`, `page-numbers`, `add-page-labels`, `bates-numbering`, `add-watermark`, `header-footer`, `invert-colors`, `scanner-effect`, `adjust-colors`, `background-color`, `text-color`, `sign-pdf`, `add-stamps`, `remove-annotations`, `crop-pdf`, `form-filler`, `form-creator`, `remove-blank-pages`

**PDF로 변환:** `image-to-pdf`, `jpg-to-pdf`, `png-to-pdf`, `webp-to-pdf`, `svg-to-pdf`, `bmp-to-pdf`, `heic-to-pdf`, `tiff-to-pdf`, `txt-to-pdf`, `markdown-to-pdf`, `json-to-pdf`, `csv-to-pdf`, `rtf-to-pdf`, `odt-to-pdf`, `word-to-pdf`, `excel-to-pdf`, `powerpoint-to-pdf`, `xps-to-pdf`, `mobi-to-pdf`, `epub-to-pdf`, `fb2-to-pdf`, `cbz-to-pdf`, `wpd-to-pdf`, `wps-to-pdf`, `xml-to-pdf`, `pages-to-pdf`, `odg-to-pdf`, `ods-to-pdf`, `odp-to-pdf`, `pub-to-pdf`, `vsd-to-pdf`, `psd-to-pdf`, `email-to-pdf`

**PDF에서 변환:** `pdf-to-jpg`, `pdf-to-png`, `pdf-to-webp`, `pdf-to-bmp`, `pdf-to-tiff`, `pdf-to-cbz`, `pdf-to-svg`, `pdf-to-csv`, `pdf-to-excel`, `pdf-to-greyscale`, `pdf-to-json`, `pdf-to-docx`, `extract-images`, `pdf-to-markdown`, `prepare-pdf-for-ai`, `pdf-to-text`

**정리 및 관리:** `ocr-pdf`, `merge-pdf`, `alternate-merge`, `organize-pdf`, `add-attachments`, `extract-attachments`, `edit-attachments`, `pdf-multi-tool`, `pdf-layers`, `extract-tables`, `split-pdf`, `divide-pages`, `extract-pages`, `delete-pages`, `add-blank-page`, `reverse-pages`, `rotate-pdf`, `rotate-custom`, `n-up-pdf`, `pdf-booklet`, `combine-single-page`, `view-metadata`, `edit-metadata`, `pdf-to-zip`, `compare-pdfs`, `posterize-pdf`, `page-dimensions`

**최적화 및 복구:** `compress-pdf`, `pdf-to-pdfa`, `fix-page-size`, `linearize-pdf`, `remove-restrictions`, `repair-pdf`, `rasterize-pdf`, `deskew-pdf`, `font-to-outline`

**보안:** `encrypt-pdf`, `sanitize-pdf`, `decrypt-pdf`, `flatten-pdf`, `remove-metadata`, `change-permissions`, `digital-sign-pdf`, `validate-signature-pdf`, `timestamp-pdf`

</details>

#### 옵션 1: 빌드 시점 (Docker 빌드 인수)

```bash
docker build \
  --build-arg DISABLE_TOOLS="edit-pdf,sign-pdf,encrypt-pdf" \
  -t bentopdf .
```

비활성화 목록이 JavaScript 번들에 포함됩니다. 변경하려면 다시 빌드해야 합니다.

#### 옵션 2: 런타임 (config.json)

제공되는 디렉터리에 `config.json` 파일을 마운트하세요. 다시 빌드할 필요가 없습니다:

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

또는 Docker Compose로:

```yaml
services:
  bentopdf:
    image: ghcr.io/alam00000/bentopdf-simple:latest
    ports:
      - '3000:8080'
    volumes:
      - ./config.json:/usr/share/nginx/html/config.json:ro
```

두 방법을 함께 사용할 수 있으며, 목록은 병합됩니다. 둘 중 하나에 있는 도구는 비활성화됩니다.

#### 에디터 기능 비활성화

전체 에디터 도구를 비활성화하지 않고 PDF 에디터 내부의 특정 기능(예: 교정, 주석, 양식)만 비활성화할 수도 있습니다. `config.json`에 `editorDisabledCategories`를 추가하세요:

```json
{
  "editorDisabledCategories": ["redaction", "annotation-stamp"]
}
```

<details>
<summary>전체 에디터 카테고리 목록</summary>

**확대/축소:** `zoom`, `zoom-in`, `zoom-out`, `zoom-fit-page`, `zoom-fit-width`, `zoom-marquee`, `zoom-level`

**주석:** `annotation`, `annotation-markup`, `annotation-highlight`, `annotation-underline`, `annotation-strikeout`, `annotation-squiggly`, `annotation-ink`, `annotation-text`, `annotation-stamp`

**도형:** `annotation-shape`, `annotation-rectangle`, `annotation-circle`, `annotation-line`, `annotation-arrow`, `annotation-polygon`, `annotation-polyline`

**양식:** `form`, `form-textfield`, `form-checkbox`, `form-radio`, `form-select`, `form-listbox`, `form-fill-mode`

**교정(Redaction):** `redaction`, `redaction-area`, `redaction-text`, `redaction-apply`, `redaction-clear`

**문서:** `document`, `document-open`, `document-close`, `document-print`, `document-capture`, `document-export`, `document-fullscreen`, `document-protect`

**페이지:** `page`, `spread`, `rotate`, `scroll`, `navigation`

**패널:** `panel`, `panel-sidebar`, `panel-search`, `panel-comment`

**도구:** `tools`, `pan`, `pointer`, `capture`

**선택:** `selection`, `selection-copy`

**기록:** `history`, `history-undo`, `history-redo`

</details>

카테고리는 계층 구조입니다. 상위 항목(예: `annotation`)을 비활성화하면 모든 하위 항목도 비활성화됩니다.

### GitHub 스타 카운터 비활성화

내비게이션 바에는 페이지 로드 시 `api.github.com`에서 가져오는 실시간 GitHub 스타 수가 표시됩니다. PDF 기능과 무관한 유일한 외부 요청입니다. 빌드 시 비활성화하면 번들에서 가져오기 코드가 제거되고 Content-Security-Policy에서 `api.github.com`이 제거됩니다:

```bash
docker build --build-arg DISABLE_GITHUB_STARS=true -t bentopdf .
```

Simple Mode 빌드(`bentopdf-simple`)는 항상 스타 카운터를 건너뜁니다. 이 플래그는 상용 빌드나 사용자 지정 전체 빌드에서만 필요합니다.

### 사용자 지정 WASM URL (폐쇄망 / 직접 호스팅)

> [!IMPORTANT]
> WASM URL은 **빌드 시점**에 JavaScript에 포함됩니다. WASM 파일은 런타임에 **사용자의 브라우저**가 다운로드하며, 빌드 중에 Docker가 다운로드하지 않습니다. 폐쇄망에서는 브라우저가 접근할 수 있는 내부 서버에 WASM 파일을 호스팅해야 합니다.

**전체 폐쇄망 워크플로:**

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

`--ocr-languages`에는 `bash scripts/prepare-airgap.sh --list-ocr-languages`가 출력하는 코드를 사용하거나, `bash scripts/prepare-airgap.sh --search-ocr-language <term>`으로 이름을 검색하세요. 제한된 OCR 언어 하위 집합으로 빌드할 때는 같은 코드를 `VITE_TESSERACT_AVAILABLE_LANGUAGES`에 전달하여 앱이 번들된 언어만 표시하도록 하세요. 완전한 오프라인 OCR 출력을 위해서는 번들된 `ocr-fonts/` 디렉터리도 호스팅하고 `VITE_OCR_FONT_BASE_URL`이 이를 가리키게 하세요.

변수를 빈 문자열로 설정하면 해당 모듈이 비활성화됩니다 (사용자가 고급 설정에서 직접 구성해야 합니다).

## 사용자 지정 포트

기본적으로 BentoPDF는 컨테이너 내부에서 `8080` 포트로 수신합니다. 변경하려면 런타임에 `PORT` 환경 변수를 설정하세요:

```bash
docker run -p 3000:9090 -e PORT=9090 ghcr.io/alam00000/bentopdf-simple:latest
```

| 변수   | 설명                        | 기본값 |
| ------ | --------------------------- | ------ |
| `PORT` | 컨테이너 내 Nginx 수신 포트 | `8080` |

표준 Dockerfile과 nonroot Dockerfile 모두에서 작동합니다.

## 사용자 지정 사용자 ID (PUID/PGID)

특정 비루트 사용자로 실행해야 하는 환경(NAS 기기, 보안 컨텍스트가 있는 Kubernetes, 조직 정책 등)을 위해 BentoPDF는 LSIO 방식의 PUID/PGID를 지원하는 별도의 Dockerfile을 제공합니다.

### 빌드 및 실행

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

### 환경 변수

| 변수           | 설명                 | 기본값  |
| -------------- | -------------------- | ------- |
| `PUID`         | 실행할 사용자 ID     | `1000`  |
| `PGID`         | 실행할 그룹 ID       | `1000`  |
| `PORT`         | Nginx 수신 포트      | `8080`  |
| `DISABLE_IPV6` | IPv6 리스너 비활성화 | `false` |

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

### 작동 방식

컨테이너는 root로 시작하여 지정된 PUID/PGID로 사용자를 만들고, 쓰기 가능한 모든 디렉터리의 소유권을 조정한 다음 `su-exec`로 권한을 낮춥니다. nginx 프로세스는 전적으로 지정한 사용자로 실행됩니다.

> [!NOTE]
> 표준 `Dockerfile`은 `nginx-unprivileged`(UID 101)를 사용하며 대부분의 배포에 권장됩니다. 특정 UID/GID가 필요할 때만 `Dockerfile.nonroot`를 사용하세요.

> [!WARNING]
> PUID/PGID는 `0`(root)일 수 없습니다. 엔트리포인트가 입력을 검증하고 잘못된 값이면 오류와 함께 종료합니다.

## Traefik과 함께 사용 (리버스 프록시)

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

## Caddy와 함께 사용 (리버스 프록시)

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

Caddyfile:

```
pdf.example.com {
    reverse_proxy bentopdf:8080
    header Cross-Origin-Opener-Policy "same-origin"
    header Cross-Origin-Embedder-Policy "require-corp"
}
```

## 리소스 제한

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

## Podman Quadlet (Systemd 통합)

[Quadlet](https://docs.podman.io/en/latest/markdown/podman-systemd.unit.5.html)을 사용하면 Podman 컨테이너를 systemd 서비스로 실행할 수 있습니다. Linux 시스템의 프로덕션 배포에 이상적입니다.

### 기본 Quadlet 설정

`~/.config/containers/systemd/bentopdf.container`(사용자) 또는 `/etc/containers/systemd/bentopdf.container`(시스템)에 컨테이너 유닛 파일을 만드세요:

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

### 활성화 및 시작

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
> 시스템 전체 배포에는 `--user` 플래그 없이 `systemctl`을 사용하고 파일을 `/etc/containers/systemd/`에 두세요.

### 헬스 체크가 있는 Quadlet

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

### Quadlet 자동 업데이트

Podman은 새 이미지가 있으면 컨테이너를 자동으로 업데이트할 수 있습니다:

```bash
# Enable auto-update timer
systemctl --user enable --now podman-auto-update.timer

# Check for updates manually
podman auto-update

# Dry run (check without updating)
podman auto-update --dry-run
```

### Quadlet 네트워크 설정

사용자 지정 네트워크 설정을 위해 네트워크 파일 `bentopdf.network`를 만드세요:

```ini
[Network]
Subnet=10.89.0.0/24
Gateway=10.89.0.1
```

그런 다음 컨테이너 파일에서 참조하세요:

```ini
[Container]
Image=ghcr.io/alam00000/bentopdf-simple:latest
ContainerName=bentopdf
PublishPort=3000:8080
Network=bentopdf.network
```

## 업데이트

```bash
# Pull latest image
docker compose pull

# Recreate container
docker compose up -d
```
