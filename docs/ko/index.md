---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: 'BentoPDF'
  text: '무료 오픈소스 PDF 도구'
  tagline: 브라우저에서 PDF를 전부 처리하세요. 업로드 없음. 서버 없음. 완벽한 개인정보 보호.
  actions:
    - theme: brand
      text: 시작하기
      link: /ko/getting-started
    - theme: alt
      text: 도구 보기
      link: /ko/tools/
    - theme: alt
      text: 직접 호스팅
      link: /ko/self-hosting/
    - theme: alt
      text: 상용 라이선스
      link: /ko/licensing

features:
  - icon: 🔒
    title: 100% 개인정보 보호
    details: 파일이 기기 밖으로 나가지 않습니다. 모든 처리는 WebAssembly를 사용해 브라우저에서 로컬로 이루어집니다.
  - icon: ⚡
    title: 빠르고 무료
    details: 회원가입, 제한, 워터마크가 없습니다. 무제한으로 PDF를 영원히 무료로 처리하세요.
  - icon: 🛠️
    title: 50개 이상의 도구
    details: 변환, 편집, 병합, 분할, 압축, 서명, OCR 등. 필요한 모든 것을 한곳에서.

  - icon: 🌐
    title: 직접 호스팅 가능
    details: 자체 인프라에 배포하세요. Docker, Vercel, Netlify, AWS는 물론, 셀프 호스팅 OCR 워커, 언어 데이터, 텍스트 레이어 글꼴을 갖춘 완전 폐쇄망 환경까지 지원합니다.
---

## 오프라인 OCR

폐쇄망이나 오프라인 환경에서 BentoPDF를 직접 호스팅하는 경우, OCR에는 Tesseract 워커와 traineddata 파일 외에도 필요한 것이 있습니다. 검색 가능한 PDF를 만들려면 OCR 텍스트 레이어 글꼴도 내부에서 제공해야 합니다.
`VITE_OCR_FONT_BASE_URL`, 번들된 `ocr-fonts/` 디렉터리, 업데이트된 폐쇄망 워크플로를 포함한 전체 설정은 [셀프 호스팅](/ko/self-hosting/)을 참고하세요.
