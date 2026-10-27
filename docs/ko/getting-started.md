# 시작하기

BentoPDF에 오신 것을 환영합니다! 이 가이드로 빠르게 시작해 보세요.

## BentoPDF란?

BentoPDF는 **브라우저에서 전부 실행되는** 무료 오픈소스 개인정보 보호 중심 PDF 도구 모음입니다. 파일이 기기 밖으로 나가지 않으며, 모든 처리는 WebAssembly(WASM) 기술로 로컬에서 이루어집니다.

## 빠른 시작

### 옵션 1: 호스팅 버전 사용하기

[bentopdf.com](https://www.bentopdf.com)에 접속하면 설치 없이 바로 BentoPDF를 사용할 수 있습니다.

### 옵션 2: Docker로 직접 호스팅하기

> [!IMPORTANT]
> Office 파일 변환에는 `SharedArrayBuffer`가 필요하며, 다음이 모두 충족되어야 합니다:
>
> - `Cross-Origin-Opener-Policy: same-origin`
> - `Cross-Origin-Embedder-Policy: require-corp`
> - 보안 컨텍스트
>
> `http://localhost`는 브라우저가 루프백을 신뢰할 수 있는 주소로 취급하므로 로컬 테스트에서 작동합니다. `http://192.168.x.x` 같은 LAN IP는 대체로 그렇지 않으므로, 네트워크의 다른 기기에서 접속할 때 Word/Excel/PowerPoint 변환에는 HTTPS가 필요합니다.

```bash
# Pull and run the Docker image (self-hosted build)
docker run -d -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest

# Or use Docker Compose
curl -O https://raw.githubusercontent.com/alam00000/bentopdf/main/docker-compose.yml
docker compose up -d
```

> [!TIP]
> BentoPDF는 두 가지 빌드로 제공됩니다. 위에서 사용한 **셀프 호스팅 빌드**(`bentopdf-simple`)는 내부/팀/조직 배포용이고, **상용 빌드**(`bentopdf:latest`)는 bentopdf.com 자체와 공개 서비스를 운영하는 상용 라이선스 보유자가 사용합니다. 두 빌드 모두 같은 PDF 도구를 제공하며, 상용 빌드에는 bentopdf.com의 히어로, FAQ, 후기, 푸터가 추가됩니다. 잘 모르겠다면 셀프 호스팅 빌드를 사용하세요.

그런 다음 브라우저에서 `http://localhost:3000`을 여세요.

> [!NOTE]
> 폐쇄망 OCR 배포를 준비한다면 Tesseract 워커, 코어 런타임, traineddata 파일 외에 OCR 텍스트 레이어 글꼴도 내부에서 호스팅해야 합니다. `VITE_OCR_FONT_BASE_URL`과 번들된 `ocr-fonts/` 디렉터리를 포함한 전체 설정은 [셀프 호스팅](/ko/self-hosting/)에 문서화되어 있습니다.

### 옵션 3: 소스에서 빌드하기

```bash
# Clone the repository
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf

# Install dependencies
npm install

# Start development server
npm run dev
```

## 한눈에 보는 기능

| 카테고리         | 도구                                                     |
| ---------------- | -------------------------------------------------------- |
| **PDF로 변환**   | Word, Excel, PowerPoint, 이미지, Markdown, EPUB, MOBI 등 |
| **PDF에서 변환** | JPG, PNG, 텍스트, Excel, SVG 등                          |
| **편집 및 주석** | 서명, 하이라이트, 민감 정보 삭제, 양식 작성, 스탬프 추가 |
| **정리**         | 병합, 분할, 회전, 페이지 삭제, 순서 변경                 |
| **최적화**       | 압축, 복구, 평탄화, OCR                                  |
| **보안**         | 암호화, 복호화, 제한 해제                                |

## 브라우저 지원

BentoPDF는 최신 브라우저에서 가장 잘 작동합니다:

- ✅ Chrome/Edge 90+
- ✅ Firefox 90+
- ✅ Safari 15+

## 다음 단계

- [모든 도구 살펴보기](/ko/tools/)
- [BentoPDF 직접 호스팅하기](/ko/self-hosting/)
- [프로젝트에 기여하기](/ko/contributing)
