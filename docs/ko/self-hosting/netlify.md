# Netlify에 배포하기

[Netlify](https://netlify.com)는 넉넉한 무료 요금제와 함께 훌륭한 정적 사이트 호스팅을 제공합니다.

## 원클릭 배포

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/alam00000/bentopdf)

## 수동 배포

### 1단계: 저장소 연결

1. [Netlify](https://app.netlify.com)에 로그인합니다
2. "Add new site" → "Import an existing project"를 클릭합니다
3. GitHub 계정을 연결합니다
4. BentoPDF 포크를 선택합니다

### 2단계: 빌드 설정 구성

| 설정              | 값              |
| ----------------- | --------------- |
| Build command     | `npm run build` |
| Publish directory | `dist`          |
| Node version      | 18+             |

### 3단계: 배포

"Deploy site"를 클릭하고 빌드가 끝날 때까지 기다립니다.

## 설정 파일

프로젝트 루트에 `netlify.toml`을 만듭니다.

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

::: warning 중요
Word/ODT/Excel/PowerPoint를 PDF로 변환하려면 `Cross-Origin-Embedder-Policy` 및 `Cross-Origin-Opener-Policy` 헤더가 필요합니다. 이 헤더가 없으면 `SharedArrayBuffer`를 사용할 수 없어 LibreOffice WASM 엔진이 초기화되지 못합니다.

`.wasm.gz` 및 `.data.gz` 파일의 `Content-Encoding: gzip` 헤더는 브라우저가 자동으로 압축을 풀도록 알려 줍니다. 이 헤더가 없으면 브라우저가 원시 gzip 바이트를 받아 WASM 컴파일이 실패합니다.
:::

## 환경 변수

Site settings → Environment variables에서 설정합니다.

| 변수                    | 설명                                                |
| ----------------------- | --------------------------------------------------- |
| `SIMPLE_MODE`           | 최소 빌드를 사용하려면 `true`로 설정                |
| `VITE_BRAND_NAME`       | 사용자 지정 브랜드 이름 ("BentoPDF" 대체)           |
| `VITE_BRAND_LOGO`       | `public/` 기준 로고 경로 (예: `images/my-logo.svg`) |
| `VITE_FOOTER_TEXT`      | 사용자 지정 바닥글/저작권 텍스트                    |
| `VITE_DEFAULT_LANGUAGE` | 기본 UI 언어 (예: `fr`, `de`, `es`)                 |

## 사용자 지정 도메인

1. Site settings → Domain management로 이동합니다
2. "Add custom domain"을 클릭합니다
3. DNS 구성 안내를 따릅니다

## 대용량 미디어

큰 WASM 파일에는 [Netlify Large Media](https://docs.netlify.com/large-media/overview/) 사용을 고려해 보세요.

```bash
netlify lm:setup
git lfs track "*.wasm"
```

## 문제 해결

### Word/ODT/Excel을 PDF로 변환이 55%에서 멈춤

문서 변환이 55%에서 멈추면 DevTools 콘솔을 열고 다음을 확인하세요.

```js
console.log(window.crossOriginIsolated); // should be true
console.log(typeof SharedArrayBuffer); // should be "function"
```

`crossOriginIsolated`가 `false`이면 `netlify.toml`의 COEP/COOP 헤더가 적용되지 않은 것입니다. 파일이 프로젝트 루트에 있는지 확인하고 다시 배포하세요.

콘솔에 `expected magic word 00 61 73 6d, found 1f 8b 08 08`이 표시되면 `.wasm.gz` 파일에 `Content-Encoding: gzip` 헤더가 빠진 것입니다. `soffice.wasm.gz`와 `soffice.data.gz`용 `[[headers]]` 블록이 `netlify.toml`에 있는지 확인하세요.

### 빌드 실패

Node 버전 호환성을 확인하세요.

```toml
[build.environment]
  NODE_VERSION = "20"
```

### 첫 로딩이 느림

Site settings → Build & deploy → Asset optimization에서 에셋 최적화를 활성화하세요.
