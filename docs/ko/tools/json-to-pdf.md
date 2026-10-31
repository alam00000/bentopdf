---
title: JSON을 PDF로
description: BentoPDF의 JSON 형식에서 PDF 파일을 복원합니다. JSON으로 내보낸 파일을 원래 PDF 문서로 되돌립니다.
---

# JSON을 PDF로

BentoPDF의 **PDF를 JSON으로** 도구로 이전에 만든 JSON 파일에서 PDF 문서를 복원합니다. PDF의 구조화된 JSON 표현을 받아 원래 문서를 다시 만드는 왕복 변환 도구입니다.

::: warning
이 도구는 BentoPDF의 PDF를 JSON으로 변환기가 만든 JSON 파일만 허용합니다. API, 데이터베이스, 다른 도구에서 가져온 일반 JSON 파일은 지원되지 않습니다.
:::

## 지원 형식

| 입력    | 설명                                              |
| :------ | :------------------------------------------------ |
| `.json` | BentoPDF의 PDF를 JSON으로 도구로 내보낸 JSON 파일 |

## 사용 방법

1. 업로드 영역을 클릭하거나 JSON 파일을 하나 이상 끌어다 놓으세요.
2. 파일 목록에 선택한 각 파일이 크기와 함께 표시됩니다.
3. **PDF로 변환**을 클릭하세요. 도구가 Web Worker와 CPDF 엔진으로 모든 파일을 처리합니다.
4. 결과는 입력한 JSON 파일마다 PDF 하나씩을 담은 `jsons-to-pdf.zip`으로 다운로드됩니다.

변환은 백그라운드 Web Worker에서 실행되므로 큰 파일에서도 UI가 계속 반응합니다.

## 옵션

이 도구에는 설정할 수 있는 옵션이 없습니다. JSON 구조가 출력 PDF를 완전히 결정합니다.

## 출력

여러 JSON 파일을 변환하면 결과가 ZIP 아카이브로 제공됩니다. 각 PDF는 원본 JSON 파일 이름을 따릅니다(예: `report.json`은 `report.pdf`가 됨).

## 활용 사례

- JSON 기반 백업 또는 보관 파이프라인에서 PDF 복원하기
- PDF를 JSON으로 변환해 확인한 뒤 다시 PDF로 되돌리기
- JSON 구조를 프로그램으로 수정한 후 문서 다시 만들기
- PDF를 JSON으로 내보낸 결과가 문서 내용을 모두 담았는지 다시 변환해 검증하기

## 팁

- API 응답이나 설정 파일 같은 임의의 JSON 데이터를 서식 있는 PDF로 변환하려면 [텍스트를 PDF로](./txt-to-pdf) 도구가 더 적합합니다. JSON을 텍스트로 붙여넣으면 적절한 서식으로 렌더링됩니다.
- 이 도구가 작동하려면 CPDF WebAssembly 엔진을 사용할 수 있어야 합니다. 직접 호스팅하는 인스턴스는 CPDF WASM 파일을 설정해야 합니다.

## 관련 도구

- [텍스트를 PDF로](./txt-to-pdf)
- [Markdown을 PDF로](./markdown-to-pdf)
- [CSV를 PDF로](./csv-to-pdf)
