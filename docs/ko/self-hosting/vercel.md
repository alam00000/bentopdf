# Vercel에 배포하기

[Vercel](https://vercel.com)은 정적 사이트를 가장 쉽게 배포할 수 있는 환경을 제공합니다.

## 원클릭 배포

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/alam00000/bentopdf)

## 수동 배포

### 1단계: 저장소 포크

[bentopdf/bentopdf](https://github.com/alam00000/bentopdf)를 GitHub 계정으로 포크합니다.

### 2단계: Vercel로 가져오기

1. [vercel.com/new](https://vercel.com/new)로 이동합니다
2. 포크한 저장소를 선택합니다
3. 프로젝트를 구성합니다.

| 설정             | 값              |
| ---------------- | --------------- |
| Framework Preset | Vite            |
| Build Command    | `npm run build` |
| Output Directory | `dist`          |
| Install Command  | `npm install`   |

### 3단계: 환경 변수 (선택 사항)

필요한 경우 다음을 추가합니다.

| 변수                    | 설명                                                |
| ----------------------- | --------------------------------------------------- |
| `SIMPLE_MODE`           | 최소 UI를 사용하려면 `true`로 설정                  |
| `VITE_BRAND_NAME`       | 사용자 지정 브랜드 이름 ("BentoPDF" 대체)           |
| `VITE_BRAND_LOGO`       | `public/` 기준 로고 경로 (예: `images/my-logo.svg`) |
| `VITE_FOOTER_TEXT`      | 사용자 지정 바닥글/저작권 텍스트                    |
| `VITE_DEFAULT_LANGUAGE` | 기본 UI 언어 (예: `fr`, `de`, `es`)                 |

### 4단계: 배포

"Deploy"를 클릭하고 빌드가 끝날 때까지 기다립니다.

## 사용자 지정 도메인

1. 프로젝트 설정으로 이동합니다
2. "Domains"로 이동합니다
3. 사용자 지정 도메인을 추가합니다
4. 안내에 따라 DNS를 구성합니다

## 제한 사항

::: warning 대용량 파일
Vercel의 서버리스 함수에는 50MB 제한이 있습니다. BentoPDF는 정적 사이트이므로 영향을 받지 않아야 하지만, WASM 모듈은 용량이 큽니다(총 약 100MB). `/public` 폴더에서 제공되도록 하세요.
:::

## 문제 해결

### 빌드 시간 초과

빌드 시간이 초과되면 다음을 시도해 보세요.

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

### 새로고침 시 404

SPA 라우팅을 위해 `vercel.json`을 추가합니다.

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Word/ODT/Excel을 PDF로 변환이 작동하지 않음

LibreOffice WASM 변환에는 `SharedArrayBuffer`가 필요하며, 이를 위해 모든 페이지에 다음 응답 헤더가 있어야 합니다.

- `Cross-Origin-Embedder-Policy: require-corp`
- `Cross-Origin-Opener-Policy: same-origin`

미리 압축된 `.wasm.gz` 및 `.data.gz` 파일도 브라우저가 압축을 풀 수 있도록 `Content-Encoding: gzip`이 필요합니다.

`vercel.json`에 다음을 추가합니다.

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

확인하려면 DevTools 콘솔을 열고 `console.log(window.crossOriginIsolated)`를 실행하세요. `true`가 반환되어야 합니다.
