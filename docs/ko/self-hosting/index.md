# 셀프 호스팅 가이드

BentoPDF는 자체 인프라에서 셀프 호스팅할 수 있습니다. 이 가이드는 다양한 배포 옵션을 다룹니다.

## Docker / Podman으로 빠르게 시작하기

BentoPDF를 셀프 호스팅하는 가장 빠른 방법입니다.

> [!TIP]
> BentoPDF는 두 가지 빌드로 제공됩니다.
>
> - **셀프 호스팅 빌드**: `ghcr.io/alam00000/bentopdf-simple:latest`. 마케팅 요소(히어로, FAQ, 후기, 푸터)를 **제외한** 모든 PDF 도구를 제공합니다. 내부/팀/조직 배포에 사용하세요. 기능이 줄어든 "라이트" 버전이 **아닙니다**.
> - **상업용 빌드**: `ghcr.io/alam00000/bentopdf:latest`. 전체 마케팅 사이트를 포함하며 bentopdf.com 자체와, 공개 서비스를 운영하는 상업용 라이선스 보유자가 사용합니다.
>
> 잘 모르겠다면 셀프 호스팅 빌드를 받으세요.

> [!IMPORTANT]
> Office 파일 변환에는 `SharedArrayBuffer`가 필요하며, 이를 위해 앱이 교차 출처 격리되어 있고 보안 컨텍스트에서 제공되어야 합니다. 공식 이미지는 필요한 COOP/COEP 헤더를 이미 전송하지만, `http://192.168.x.x` 같은 일반 HTTP 로컬 네트워크 출처에서는 브라우저가 여전히 `SharedArrayBuffer`를 비활성화합니다.
>
> `http://localhost`는 같은 기기에서 테스트할 때만 사용하세요. 사용자가 LAN IP나 호스트 이름으로 BentoPDF에 접속한다면 HTTPS로 종단 처리하세요.

```bash
# Docker
docker run -d -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest

# Podman
podman run -d -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest
```

또는 Docker Compose / Podman Compose로:

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

## Podman Quadlet (Linux Systemd)

BentoPDF를 systemd 서비스로 실행합니다. `~/.config/containers/systemd/bentopdf.container`를 만듭니다.

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

Quadlet 전체 문서는 [Docker 배포 가이드](/ko/self-hosting/docker)를 참고하세요.

## 소스에서 빌드하기

```bash
# Clone and build
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf
npm install
npm run build

# The built files are in the `dist` folder
```

## 구성 옵션

### 셀프 호스팅 빌드 (Simple Mode)

셀프 호스팅 빌드(`bentopdf-simple` 이미지, Simple Mode라고도 함)는 상업용 빌드와 **기능이 동일**합니다. 모든 PDF 도구가 들어 있고 똑같이 작동합니다. bentopdf.com 자체나 공개 서비스를 운영하는 상업용 배포에서만 의미가 있는 마케팅 요소만 숨깁니다. **기능이 줄어든 "라이트" 버전이 아닙니다.**

**셀프 호스팅 빌드가 숨기는 것** (외관상 변경일 뿐이며 PDF 기능은 제거되지 않습니다):

- 탐색 모음, 히어로 섹션, 기능 섹션, FAQ, 후기, 푸터
- 페이지 제목을 "PDF 도구"로 변경

**셀프 호스팅 빌드가 유지하는 것** (실제 PDF 작업을 수행하는 모든 것):

- 모든 PDF 도구 (병합, 분할, 편집, 서명, OCR, Office 변환 등)
- 사용자 지정 브랜딩 지원, 모든 빌드 시점 및 런타임 구성

상업용 빌드(`ghcr.io/alam00000/bentopdf:latest`)는 bentopdf.com 자체를 구동하며 공개 서비스를 운영하는 상업용 라이선스 보유자가 사용합니다. 내부 도구에는 어울리지 않는 히어로, FAQ, 후기, 푸터가 추가됩니다.

팀, 조직 또는 내부 도구로 BentoPDF를 셀프 호스팅한다면 셀프 호스팅 빌드를 받으세요.

```bash
# Use the pre-built image (recommended)
docker run -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest

# Or build it yourself
SIMPLE_MODE=true npm run build
```

자세한 내용은 [SIMPLE_MODE.md](https://github.com/alam00000/bentopdf/blob/main/SIMPLE_MODE.md)를 참고하세요.

### 상업용 빌드 (자체 브랜드의 공개 배포)

상업용 빌드(`bentopdf` 이미지, `-simple` 접미사 없음)는 bentopdf.com 자체를 구동합니다. 모든 PDF 도구에 더해 전체 마케팅 사이트(히어로, 기능, FAQ, 후기, 푸터)를 포함합니다. **자체 브랜드로 BentoPDF를 공개 PDF 서비스로 배포**하려는 경우에 이 빌드를 사용하세요. 예를 들면 다음과 같습니다.

- 자체 도메인에서 최종 사용자를 위한 호스팅 SaaS로 BentoPDF를 운영하는 경우
- 도구 화면만이 아니라 랜딩 페이지 경험(마케팅 섹션 + 도구)을 원하는 경우
- BentoPDF를 상용 제품에 포함하는 상업용 라이선스 보유자인 경우

**그대로 실행** (BentoPDF 브랜딩, 빌드를 미리 확인할 때 유용):

```bash
docker run -p 3000:8080 ghcr.io/alam00000/bentopdf:latest
```

**자체 브랜드로 빌드** (일반적인 상업용 워크플로):

```bash
docker build \
  --build-arg VITE_BRAND_NAME="AcmePDF" \
  --build-arg VITE_BRAND_LOGO="images/acme-logo.svg" \
  --build-arg VITE_FOOTER_TEXT="© 2026 Acme Corp. All rights reserved." \
  -t acmepdf .

docker run -p 3000:8080 acmepdf
```

다른 모든 빌드 시점 옵션(`BASE_URL`, `VITE_DEFAULT_LANGUAGE`, `DISABLE_TOOLS`, WASM URL 재정의 등)은 셀프 호스팅 빌드와 같은 방식으로 작동합니다.

::: warning 라이선스
상업용 빌드는 BentoPDF의 두 가지 라이선스 옵션 중 어느 쪽으로든 실행할 수 있습니다.

- **AGPL-3.0** (무료): 브랜딩 수정과 주변 비즈니스 로직을 포함한 전체 소스 코드를 AGPL로 공개하는 배포에서 허용됩니다.
- **상업용 라이선스** ($79 평생): 브랜딩 포크나 비즈니스 코드를 오픈소스로 공개하지 않는 비공개/독점 배포에 필요합니다.

전체 비교는 [라이선스 페이지](https://www.bentopdf.com/licensing)를 참고하세요. AGPL 라이선스의 WASM 모듈(PyMuPDF, Ghostscript, CoherentPDF)은 런타임에 CDN에서 로드되므로 이미지에 포함되지 않으며 라이선스 상태에 영향을 주지 않습니다.
:::

### Base URL

하위 디렉터리에 배포합니다.

```bash
BASE_URL=/pdf-tools/ npm run build
```

### 사용자 지정 브랜딩

기본 BentoPDF 로고, 이름, 푸터 텍스트를 빌드 시점에 직접 만든 것으로 바꿉니다.

| 변수               | 설명                               | 기본값                                  |
| ------------------ | ---------------------------------- | --------------------------------------- |
| `VITE_BRAND_NAME`  | 헤더와 푸터에 표시되는 브랜드 이름 | `BentoPDF`                              |
| `VITE_BRAND_LOGO`  | `public/` 기준 로고 경로           | `images/favicon-no-bg.svg`              |
| `VITE_FOOTER_TEXT` | 사용자 지정 푸터/저작권 텍스트     | `© 2026 BentoPDF. All rights reserved.` |

```bash
# Place your logo in public/, then build
VITE_BRAND_NAME="AcmePDF" \
VITE_BRAND_LOGO="images/acme-logo.svg" \
VITE_FOOTER_TEXT="© 2026 Acme Corp. Internal use only." \
npm run build
```

또는 Docker로:

```bash
docker build \
  --build-arg VITE_BRAND_NAME="AcmePDF" \
  --build-arg VITE_BRAND_LOGO="images/acme-logo.svg" \
  --build-arg VITE_FOOTER_TEXT="© 2026 Acme Corp. Internal use only." \
  -t acmepdf .
```

브랜딩은 전체 모드와 Simple Mode 모두에서 작동하며, 다른 모든 빌드 시점 옵션(`BASE_URL`, `SIMPLE_MODE`, `VITE_DEFAULT_LANGUAGE`)과 함께 사용할 수 있습니다.

### 특정 도구 비활성화

규정 준수나 보안을 위해 개별 도구를 숨깁니다. 비활성화된 도구는 홈페이지, 검색, 단축키, 워크플로 빌더, 직접 URL 접근에서 제거됩니다.

도구 ID는 `.html`을 뺀 페이지 URL입니다. 아무 도구나 열어 URL을 확인하세요(예: `edit-pdf`, `sign-pdf`, `encrypt-pdf`).

**빌드 시점** (번들에 포함됨):

```bash
DISABLE_TOOLS="edit-pdf,sign-pdf" npm run build
```

**런타임** (재빌드 불필요, `config.json`을 마운트):

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

두 방법을 함께 사용할 수 있으며 목록이 병합됩니다.

`config.json`에 `editorDisabledCategories`를 추가하면 도구 전체를 비활성화하지 않고 PDF 편집기 내부의 특정 기능(예: 교정)만 비활성화할 수도 있습니다. 전체 카테고리 목록은 [Docker 가이드](/ko/self-hosting/docker#에디터-기능-비활성화)를 참고하세요.

## 배포 가이드

플랫폼을 선택하세요.

- [Vercel](/ko/self-hosting/vercel)
- [Netlify](/ko/self-hosting/netlify)
- [Cloudflare Pages](/ko/self-hosting/cloudflare)
- [AWS S3 + CloudFront](/ko/self-hosting/aws)
- [Hostinger](/ko/self-hosting/hostinger)
- [Nginx](/ko/self-hosting/nginx)
- [Apache](/ko/self-hosting/apache)
- [Docker](/ko/self-hosting/docker)
- [Kubernetes](/ko/self-hosting/kubernetes)
- [CORS 프록시](/ko/self-hosting/cors-proxy) - 디지털 서명에 필요

## 자주 발생하는 문제

### Word / ODT / Excel / PowerPoint를 PDF로 변환이 멈춤 (SharedArrayBuffer 사용 불가)

**증상**: LibreOffice 기반 문서 변환(Word, ODT, Excel, PowerPoint를 PDF로)이 약 55%에서 멈추거나 시작되지 않습니다. 브라우저 콘솔에 다음이 표시될 수 있습니다.

> `ReferenceError: SharedArrayBuffer is not defined`

...또는 `window.crossOriginIsolated`가 `false`로 보고되거나, WASM 컴파일이 `expected magic word 00 61 73 6d, found 1f 8b 08 08`을 보고합니다.

**원인**: LibreOffice WASM에는 `SharedArrayBuffer`가 필요하며, 브라우저는 페이지가 **교차 출처 격리**되어 있고 **보안 컨텍스트**에서 제공될 때만 이를 활성화합니다. 즉 두 가지가 모두 충족되어야 합니다.

1. 모든 응답에 다음 두 헤더가 포함되어야 합니다.
   - `Cross-Origin-Embedder-Policy: require-corp`
   - `Cross-Origin-Opener-Policy: same-origin`
2. 페이지가 `https://...` 또는 `http://localhost`에서 제공되어야 합니다. LAN IP의 일반 HTTP(예: `http://192.168.x.x`)는 보안 컨텍스트로 인정되지 않으며, 브라우저가 `SharedArrayBuffer`를 비활성화합니다.

`00 61 73 6d / 1f 8b 08 08` 불일치는 별도의 하위 증상입니다. 미리 압축된 `.wasm.gz` / `.data.gz` 파일에 `Content-Encoding: gzip` 응답 헤더가 없어서 브라우저가 압축 해제된 WASM이 아닌 원시 gzip 바이트를 받는 것입니다.

**해결**: 정확한 설정은 플랫폼별 배포 가이드를 참고하세요.

- [Nginx →](/ko/self-hosting/nginx#word-odt-excel을-pdf로-변환이-작동하지-않음)
- [Apache →](/ko/self-hosting/apache#word-odt-excel을-pdf로-변환이-작동하지-않음)
- [AWS S3 + CloudFront →](/ko/self-hosting/aws#_3b단계-응답-헤더-정책-libreoffice-wasm에-필수)
- [Cloudflare Pages →](/ko/self-hosting/cloudflare#설정-파일) (`_headers` 파일)
- [Netlify →](/ko/self-hosting/netlify#word-odt-excel을-pdf로-변환이-55-에서-멈춤) (`netlify.toml`)
- [Vercel →](/ko/self-hosting/vercel#word-odt-excel을-pdf로-변환이-작동하지-않음) (`vercel.json`)
- [Hostinger →](/ko/self-hosting/hostinger#libreoffice-도구가-작동하지-않음) (`.htaccess`)
- [Kubernetes →](/ko/self-hosting/kubernetes#sharedarraybuffer-헤더가-계속-작동하는지-확인-ingress-gateway)
- **Docker**: 번들된 nginx 설정이 자동으로 처리하므로 별도 조치가 필요 없습니다.

**확인**: 아무 BentoPDF 페이지에서 DevTools 콘솔을 열고 다음을 실행하세요.

```js
console.log(window.crossOriginIsolated); // should be true
console.log(typeof SharedArrayBuffer); // should be "function"
```

페이지가 HTTPS 또는 `http://localhost`이고 모든 응답에 COEP/COOP 헤더가 모두 있으면 두 검사 모두 통과합니다. `http://192.168.x.x` 같은 루프백이 아닌 HTTP 출처라면 HTTPS로 종단 처리하세요. 헤더만으로 해결할 방법은 없습니다.

### `.mjs` 파일이 `application/octet-stream`으로 제공됨

**증상**: PDF 서명 / 양식 작성기 / 일부 다른 도구에서 뷰어가 비어 있거나 로드에 실패합니다. 브라우저 콘솔에 다음이 보고됩니다.

> `Failed to load module script: The server responded with a non-JavaScript MIME type of "application/octet-stream". Strict MIME type checking is enforced for module scripts per HTML spec.`

**원인**: 웹 서버나 리버스 프록시에 `.mjs` 파일의 MIME 타입 매핑이 없습니다(내장 PDF 뷰어는 이 확장자의 ES 모듈을 포함합니다). 많은 기본 서버 설정은 인식하지 못하는 확장자를 `application/octet-stream`으로 처리하며, 브라우저는 이를 ES 모듈로 실행하지 않습니다.

**해결**: 정확한 스니펫은 플랫폼별 배포 가이드를 참고하세요.

- [Nginx →](/ko/self-hosting/nginx#pdf-서명-또는-양식-작성기에-빈-뷰어가-표시됨-mjs-mime-오류)
- [Apache →](/ko/self-hosting/apache#pdf-서명-또는-form-filler에-빈-뷰어가-표시됨-mjs-mime-오류)
- [AWS S3 + CloudFront →](/ko/self-hosting/aws#_2단계-빌드-및-업로드) (`aws s3 cp ... --include "*.mjs"` 참고)
- [Kubernetes →](/ko/self-hosting/kubernetes#mjs-mime-타입-오류-pdf-서명-양식-작성기-iframe이-비어-있음)
- **Docker, Vercel, Netlify, Cloudflare Pages, Hostinger**: 자동으로 처리되므로 별도 조치가 필요 없습니다.

**확인**: DevTools → Network 탭을 열어 실패한 `.mjs` 요청을 찾고 `Content-Type` 응답 헤더를 확인하세요. `application/javascript`여야 합니다. 여전히 `application/octet-stream`이라면 바깥쪽 리버스 프록시나 CDN이 타입을 다시 판별하고 있을 수 있으니, 서비스 경로의 각 계층을 확인하세요.

## WASM 구성 (AGPL 구성 요소)

BentoPDF는 AGPL 라이선스 처리 라이브러리를 소스 코드에 **번들하지 않지만**, 모든 기능이 바로 작동하도록 **CDN URL을 미리 구성**해 둡니다. 수동 설정이 필요 없습니다.

::: tip 기본 제로 설정
v2.0.0부터 WASM 모듈은 환경 변수를 통해 jsDelivr CDN에서 로드되도록 미리 구성되어 있습니다. 모든 고급 기능이 사용자 설정 없이 바로 작동합니다.
:::

| 구성 요소       | 라이선스 | 기능                                         |
| --------------- | -------- | -------------------------------------------- |
| **PyMuPDF**     | AGPL-3.0 | EPUB/MOBI/FB2/XPS 변환, 이미지 추출, 표 추출 |
| **Ghostscript** | AGPL-3.0 | PDF/A 변환, 압축, 기울기 보정, 래스터화      |
| **CoherentPDF** | AGPL-3.0 | 목차, 첨부파일, 북마크를 유지한 PDF 병합     |

### 기본 환경 변수

이 값은 `.env.production`에 설정되어 빌드에 포함됩니다.

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

### WASM URL 재정의

사용자 지정 배포를 위해 빌드 시점에 기본값을 재정의할 수 있습니다.

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

모듈을 완전히 비활성화하려면(고급 설정에서 사용자가 직접 구성해야 함) 해당 변수를 빈 문자열로 설정하세요.

OCR의 경우 모든 `VITE_TESSERACT_*` 변수를 비워 두고 기본 온라인 에셋을 사용하거나, 셀프 호스팅/오프라인 OCR을 위해 worker/core/lang URL을 함께 설정하세요. 특정 OCR 언어만 번들한다면 `VITE_TESSERACT_AVAILABLE_LANGUAGES`에도 같은 쉼표 구분 코드를 설정하세요. 그러면 UI가 설치된 언어만 제공하고, 지원되지 않는 선택은 설명이 포함된 오류로 실패합니다. 완전 오프라인으로 검색 가능한 PDF를 출력하려면 번들된 OCR 글꼴을 제공하는 내부 디렉터리를 `VITE_OCR_FONT_BASE_URL`로 설정하세요.

사용자는 UI의 **고급 설정**에서 언제든지 이 기본값을 재정의할 수도 있습니다. 브라우저에 저장된 사용자 재정의가 환경 기본값보다 우선합니다.

### 폐쇄망 / 오프라인 배포

인터넷에 접속할 수 없는 네트워크(정부, 의료, 금융 등)를 위한 방법입니다. WASM URL은 **빌드 시점**에 JavaScript에 포함되고, 실제 WASM 파일은 런타임에 **사용자의 브라우저**가 다운로드합니다. 따라서 인터넷이 되는 컴퓨터에서 모든 것을 준비한 뒤 격리된 네트워크로 옮겨야 합니다.

#### 자동화 스크립트 (권장)

포함된 `prepare-airgap.sh` 스크립트가 WASM 패키지 다운로드, Docker 이미지 빌드, 설정 스크립트가 포함된 독립 실행형 번들 생성까지 전체 과정을 자동화합니다.

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

다음과 같은 번들 디렉터리가 만들어집니다.

```
bentopdf-airgap-bundle/
  bentopdf.tar              # Docker image
  *.tgz                     # WASM packages (PyMuPDF, Ghostscript, CoherentPDF, Tesseract)
  tesseract-langdata/       # OCR traineddata files
  ocr-fonts/                # OCR text-layer font files
  setup.sh                  # Setup script for the air-gapped side
  README.md                 # Instructions
```

USB, 내부 아티팩트 저장소 또는 승인된 방법으로 번들을 폐쇄망에 옮깁니다. 그런 다음 포함된 설정 스크립트를 실행합니다.

```bash
cd bentopdf-airgap-bundle
bash setup.sh
```

설정 스크립트는 Docker 이미지를 로드하고 WASM 파일을 추출하며, 선택적으로 컨테이너를 시작합니다.

**스크립트 옵션:**

| 플래그                         | 설명                                             | 기본값                     |
| ------------------------------ | ------------------------------------------------ | -------------------------- |
| `--wasm-base-url <url>`        | WASM을 내부적으로 호스팅할 위치                  | _(필수, 없으면 입력 요청)_ |
| `--image-name <name>`          | Docker 이미지 태그                               | `bentopdf`                 |
| `--output-dir <path>`          | 출력 번들 디렉터리                               | `./bentopdf-airgap-bundle` |
| `--simple-mode`                | Simple Mode 활성화                               | off                        |
| `--base-url <path>`            | 하위 디렉터리 기본 URL (예: `/pdf/`)             | `/`                        |
| `--language <code>`            | 기본 UI 언어 (예: `fr`, `de`)                    | _(없음)_                   |
| `--brand-name <name>`          | 사용자 지정 브랜드 이름                          | _(없음)_                   |
| `--brand-logo <path>`          | `public/` 기준 로고 경로                         | _(없음)_                   |
| `--footer-text <text>`         | 사용자 지정 푸터 텍스트                          | _(없음)_                   |
| `--ocr-languages <list>`       | 번들할 OCR 언어(쉼표로 구분)                     | `eng`                      |
| `--list-ocr-languages`         | 지원되는 OCR 코드와 이름을 출력하고 종료         | off                        |
| `--search-ocr-language <term>` | 이름이나 약어로 OCR 코드 검색                    | off                        |
| `--dockerfile <path>`          | 사용할 Dockerfile                                | `Dockerfile`               |
| `--skip-docker`                | Docker 빌드와 내보내기 건너뛰기                  | off                        |
| `--skip-wasm`                  | WASM 다운로드 건너뛰기 (기존 `.tgz` 파일 재사용) | off                        |

대화형 프롬프트에서도 `list`를 입력하면 지원되는 전체 Tesseract 코드 목록을 출력하고, `search <term>`을 입력하면 `search german`이나 `search chi` 같은 일치 항목을 찾을 수 있습니다.

::: warning 동일 출처 요구 사항
WASM 파일은 BentoPDF 앱과 **같은 출처**에서 제공되어야 합니다. 웹 워커는 다른 출처의 스크립트를 로드할 수 없는 `importScripts()`를 사용합니다. 예를 들어 BentoPDF가 `https://internal.example.com`에서 실행된다면 WASM 기본 URL도 `https://internal.example.com/wasm`이어야 합니다.
:::

#### 수동 단계

<details>
<summary>스크립트 없이 직접 진행하려는 경우</summary>

**1단계: WASM 및 OCR 패키지 다운로드** (인터넷이 되는 컴퓨터에서)

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

**2단계: 내부 URL로 Docker 이미지 빌드**

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

**3단계: Docker 이미지 내보내기**

```bash
docker save bentopdf -o bentopdf.tar
```

**4단계: 폐쇄망으로 전송**

USB, 내부 아티팩트 저장소 또는 승인된 전송 방법으로 다음을 복사합니다.

- `bentopdf.tar`: Docker 이미지
- 1단계의 `.tgz` WASM/OCR 패키지 다섯 개
- 1단계의 `tesseract-langdata/` 디렉터리
- 1단계의 `ocr-fonts/` 디렉터리

**5단계: 폐쇄망 안에서 설정**

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

`.../ocr/worker.min.js`, `.../ocr/core`, `.../ocr/lang-data`, `.../ocr/fonts`를 포함해 2단계에서 구성한 URL로 파일에 접근할 수 있는지 확인하세요.

</details>

::: info Docker 대신 소스에서 빌드하나요?
`npm run build`를 실행하기 전에 `.env.production`에 변수를 설정하세요.

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

### 자체 WASM 프록시 호스팅

적절한 CORS 헤더와 함께 AGPL WASM 파일을 제공해야 한다면 간단한 프록시를 배포할 수 있습니다. 구현 예시는 [Cloudflare WASM Proxy 가이드](https://github.com/alam00000/bentopdf/blob/main/cloudflare/WASM-PROXY.md)를 참고하세요.

::: tip 왜 분리했나요?
이렇게 분리하면 다음이 보장됩니다.

- 상업용 사용자를 위한 명확한 법적 준수
- BentoPDF 코어가 듀얼 라이선스(AGPL-3.0 / 상업용)를 유지
- WASM 파일은 소스에 번들되지 않고 런타임에 로드됨
  :::

## 시스템 요구 사항

| 요구 사항 | 최소 사양                       |
| --------- | ------------------------------- |
| 저장 공간 | 약 100 MB (AGPL 모듈 제외 코어) |
| RAM       | 512 MB                          |
| CPU       | 최신 프로세서 아무거나          |

::: tip
BentoPDF는 정적 사이트이므로 데이터베이스나 백엔드 서버가 필요 없습니다!
:::
