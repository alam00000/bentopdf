---
title: ODT를 PDF로
description: LibreOffice 기반 엔진으로 OpenDocument Text(ODT) 파일을 브라우저에서 PDF로 변환합니다.
---

# ODT를 PDF로

OpenDocument Text 파일을 PDF로 변환합니다. ODT는 LibreOffice Writer, Apache OpenOffice 및 기타 오픈소스 워드 프로세서의 기본 형식입니다. 이 도구는 브라우저 기반 LibreOffice 엔진을 사용해 서식, 표, 이미지, 스타일을 그대로 유지하는 정확한 변환을 제공합니다.

## 지원 형식

| 형식              | 확장자 |
| :---------------- | :----- |
| OpenDocument Text | `.odt` |

## 사용 방법

1. 업로드 영역을 클릭하거나 ODT 파일을 하나 이상 끌어다 놓습니다.
2. 파일 목록을 확인합니다. 파일을 더 추가하거나 필요 없는 파일을 제거할 수 있습니다.
3. **PDF로 변환**을 클릭합니다. LibreOffice 엔진이 초기화되고(진행 표시기에 로드 상태가 표시됩니다) 각 파일이 변환됩니다.
4. 파일 하나는 PDF로 바로 다운로드됩니다. 여러 파일은 `odt-converted.zip`으로 묶입니다.

## 옵션

이 도구에는 추가 설정이 없습니다. 변환 시 원본 문서의 서식을 최대한 그대로 유지합니다.

## 출력

| 입력 수       | 출력                                                      |
| :------------ | :-------------------------------------------------------- |
| 파일 1개      | PDF 한 개 다운로드 (예: `document.pdf`)                   |
| 파일 2개 이상 | 파일당 PDF 하나가 담긴 ZIP 압축 파일(`odt-converted.zip`) |

## 활용 사례

- LibreOffice Writer 문서를 Microsoft Office 사용자와 공유하기 위해 PDF로 변환하기
- OpenDocument 형식으로 작성한 학술 논문에서 인쇄용 PDF 만들기
- ODT 템플릿 폴더를 배포용 PDF로 일괄 변환하기
- 자동 문서 생성 시스템이 만든 ODT 파일에서 PDF 생성하기

## 팁

- LibreOffice 엔진은 처음 사용할 때 로드되고 이후 변환을 위해 캐시됩니다. 처음 로드에는 몇 초가 걸리지만 그 후에는 변환이 빠릅니다.
- 포함된 OLE 개체나 특이한 글꼴이 있는 복잡한 문서는 데스크톱 LibreOffice와 약간 다르게 렌더링될 수 있습니다. 일괄 변환 전에 샘플로 테스트하세요.
- Word 문서(`.doc`, `.docx`)에는 [Word를 PDF로](./word-to-pdf) 도구를 사용하세요. 이 도구도 LibreOffice 엔진을 쓰지만 Microsoft 형식을 직접 받습니다.

## 관련 도구

- [Word를 PDF로](./word-to-pdf)
- [RTF를 PDF로](./rtf-to-pdf)
- [텍스트를 PDF로](./txt-to-pdf)
