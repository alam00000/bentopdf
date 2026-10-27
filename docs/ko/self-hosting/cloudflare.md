# Cloudflare Pages에 배포하기

[Cloudflare Pages](https://pages.cloudflare.com)는 대역폭 제한 없이 빠른 글로벌 정적 사이트 호스팅을 제공합니다.

## 빠른 배포

1. [Cloudflare Pages](https://dash.cloudflare.com/?to=/:account/pages)로 이동합니다
2. "Create a project"를 클릭합니다
3. GitHub 저장소를 연결합니다

## 빌드 설정

| 설정               | 값              |
| ------------------ | --------------- |
| 프레임워크 프리셋  | None            |
| 빌드 명령어        | `npm run build` |
| 빌드 출력 디렉터리 | `dist`          |
| 루트 디렉터리      | `/`             |

## 환경 변수

Settings → Environment variables에서 다음을 추가하세요:

| 변수                    | 값                                    |
| ----------------------- | ------------------------------------- |
| `NODE_VERSION`          | `18`                                  |
| `SIMPLE_MODE`           | `false` (선택)                        |
| `VITE_BRAND_NAME`       | 사용자 지정 브랜드 이름 (선택)        |
| `VITE_BRAND_LOGO`       | `public/` 기준 로고 경로 (선택)       |
| `VITE_FOOTER_TEXT`      | 사용자 지정 푸터/저작권 텍스트 (선택) |
| `VITE_DEFAULT_LANGUAGE` | 기본 UI 언어, 예: `fr` (선택)         |

## 설정 파일

`public` 폴더에 `_headers`를 만드세요:

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

::: warning 중요
Word/ODT/Excel/PowerPoint를 PDF로 변환하려면 `Cross-Origin-Embedder-Policy` 및 `Cross-Origin-Opener-Policy` 헤더가 필요합니다. 이 헤더가 없으면 `SharedArrayBuffer`를 사용할 수 없고 LibreOffice WASM 엔진이 초기화되지 못합니다.
:::

SPA 라우팅을 위해 `_redirects`를 만드세요:

```
/*    /index.html   200
```

## 사용자 지정 도메인

1. Pages 프로젝트로 이동합니다
2. "Custom domains"를 클릭합니다
3. 도메인을 추가합니다
4. 도메인이 Cloudflare에 있으면 Cloudflare가 DNS를 자동으로 설정합니다

## 장점

- **무료 무제한 대역폭**
- 300개 이상의 엣지 로케이션을 갖춘 **글로벌 CDN**
- **자동 HTTPS**
- 풀 리퀘스트용 **미리보기 배포**
- **빠른 빌드**

## 문제 해결

### 대용량 파일 업로드

Cloudflare Pages는 최대 25MB 파일을 지원합니다. WASM 모듈은 문제없겠지만 제한에 걸린다면 다음을 고려하세요:

```bash
# Split large files during build
npm run build
```

### Worker 크기 제한

고급 라우팅에 Cloudflare Workers를 사용하는 경우, 무료 플랜에는 1MB 제한이 있다는 점에 유의하세요.

## CORS 프록시 Worker (디지털 서명용)

디지털 서명 도구는 인증서 체인을 가져오기 위해 CORS 프록시가 필요합니다. 포함된 worker를 배포하세요:

```bash
cd cloudflare
npx wrangler login
npx wrangler deploy
```

### 보안 기능

| 기능               | 설명                     |
| ------------------ | ------------------------ |
| **URL 제한**       | 인증서 URL만 허용        |
| **파일 크기 제한** | 요청당 최대 10MB         |
| **속도 제한**      | IP당 분당 60회 (KV 필요) |
| **사설 IP 차단**   | localhost, 내부 IP 차단  |

### 속도 제한 활성화

```bash
# Create KV namespace
npx wrangler kv namespace create "RATE_LIMIT_KV"

# Add to wrangler.toml with returned ID:
# [[kv_namespaces]]
# binding = "RATE_LIMIT_KV"
# id = "YOUR_ID"

npx wrangler deploy
```

### 프록시 URL로 빌드

```bash
VITE_CORS_PROXY_URL=https://your-worker.workers.dev npm run build
```

또는 Docker로:

```bash
export VITE_CORS_PROXY_URL="https://your-worker.workers.dev"
DOCKER_BUILDKIT=1 docker build \
  --secret id=VITE_CORS_PROXY_URL,env=VITE_CORS_PROXY_URL \
  -t your-bentopdf .
```

> **참고:** HMAC 서명 설정은 [README](https://github.com/alam00000/bentopdf#digital-signature-cors-proxy-required)를 참고하세요.
