# 기여하기

BentoPDF에 기여해 주셔서 감사합니다! 이 가이드를 따라 쉽게 시작해 보세요.

## 시작하기

### 사전 요구 사항

- Node.js 18+
- npm 9+
- Git

### 설정

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/bentopdf.git
cd bentopdf

# Install dependencies
npm install

# Start development server
npm run dev
```

## 프로젝트 구조

```
bentopdf/
├── src/
│   ├── js/
│   │   ├── config/       # Tool definitions
│   │   ├── logic/        # Tool page logic
│   │   ├── utils/        # Shared utilities
│   │   └── ui.ts         # UI helpers
│   ├── pages/            # Tool HTML pages
│   └── css/              # Styles
├── public/
│   ├── locales/          # Translations
│   └── pymupdf-wasm/     # WASM modules
├── docs/                 # Documentation (VitePress)
└── scripts/              # Build scripts
```

## 새 도구 추가하기

### 1단계: 로직 파일 만들기

`src/js/logic/your-tool-page.ts`를 만드세요:

```typescript
import { showLoader, hideLoader, showAlert } from '../ui.js';
import { state } from '../state.js';

document.addEventListener('DOMContentLoaded', () => {
  // Your tool logic here
});
```

### 2단계: HTML 페이지 만들기

기존 도구 템플릿을 참고하여 `src/pages/your-tool.html`을 만드세요.

### 3단계: 도구 등록하기

`src/js/config/tools.ts`에 다음을 추가하세요:

```typescript
{
  href: import.meta.env.BASE_URL + 'your-tool.html',
  name: 'Your Tool',
  icon: 'ph-icon-name',
  subtitle: 'Description of your tool.',
}
```

### 4단계: 빌드 설정에 추가하기

`vite.config.ts`에 페이지를 추가하세요:

```typescript
'your-tool': resolve(__dirname, 'src/pages/your-tool.html'),
```

### 5단계: 번역 추가하기

`public/locales/`의 모든 로케일 파일에 항목을 추가하세요:

```json
{
  "yourTool": {
    "name": "Your Tool",
    "subtitle": "Description"
  }
}
```

## 코드 스타일

- 모든 새 코드는 TypeScript로 작성하세요
- 일관성을 위해 기존 패턴을 따르세요
- 커밋하기 전에 `npm run format`을 실행하세요
- 프로덕션 코드에는 주석을 넣지 마세요 (주석은 빌드 중에 제거됩니다)

## 풀 리퀘스트 절차

1. 기능 브랜치를 만드세요: `git checkout -b feature/your-feature`
2. 변경 사항을 작성하세요
3. 꼼꼼히 테스트하세요: `npm run build`
4. 변경 내용을 명확히 설명하여 PR을 제출하세요

## 번역

새 언어를 추가하는 방법은 [TRANSLATION.md](https://github.com/alam00000/bentopdf/blob/main/TRANSLATION.md)를 참고하세요.

## 기여자 라이선스 계약

PR이 병합되기 전에 CLA에 서명해야 합니다:

- [개인 CLA (ICLA)](https://github.com/alam00000/bentopdf/blob/main/ICLA.md)
- [법인 CLA (CCLA)](https://github.com/alam00000/bentopdf/blob/main/CCLA.md)

## 도움 받기

- [GitHub 이슈](https://github.com/alam00000/bentopdf/issues)
- [Discord 커뮤니티](https://discord.gg/Bgq3Ay3f2w)

## 라이선스

BentoPDF는 듀얼 라이선스로 제공됩니다:

- **AGPL-3.0**: 전체 소스 코드를 공개적으로 공유하는 오픈소스 프로젝트용
- **상용 라이선스**: 독점/비공개 소스 애플리케이션용 - [평생 라이선스 $79에 구매하기](https://buy.polar.sh/polar_cl_ThDfffbl733x7oAodcIryCzhlO57ZtcWPq6HJ1qMChd)

기여하면 기여한 내용이 위 조건에 따라 라이선스된다는 데 동의하는 것으로 간주됩니다.
