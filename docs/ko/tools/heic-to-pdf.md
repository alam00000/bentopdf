---
title: HEIC를 PDF로
description: iPhone과 iPad의 HEIC 및 HEIF 이미지를 브라우저에서 바로 PDF로 변환합니다.
---

# HEIC를 PDF로

HEIC/HEIF 이미지를 PDF로 변환합니다. HEIC는 iOS 11 이후 iPhone과 iPad의 기본 사진 형식입니다. 이 도구를 사용하면 데스크톱 소프트웨어를 설치하거나 서버에 파일을 업로드하지 않고도 사진을 PDF로 만들 수 있습니다.

## 지원 형식

| 형식 | 확장자  |
| :--- | :------ |
| HEIC | `.heic` |
| HEIF | `.heif` |

## 사용 방법

1. 업로드 영역을 클릭하거나 HEIC/HEIF 파일을 끌어다 놓으세요.
2. 파일 목록을 확인하고 필요 없는 파일을 제거하세요.
3. **PDF로 변환**을 클릭하세요. 결과는 `from_heic.pdf`로 다운로드됩니다.

각 HEIC 파일은 heic2any 라이브러리로 디코딩되어 품질 92%의 PNG로 변환됩니다. 이후 PNG는 pdf-lib를 통해 PDF에 삽입되며, 각 이미지는 원본 해상도 그대로 별도 페이지에 들어갑니다.

## 옵션

이 도구에는 추가 설정이 없습니다. HEIC 이미지는 삽입 전에 높은 품질(0.92)의 PNG로 변환됩니다.

## 활용 사례

- 보험 청구서나 보고서에 첨부할 iPhone 사진으로 PDF 만들기
- 부동산 매물용 HEIC 사진을 인쇄 가능한 문서 하나로 변환하기
- iPad 스크린샷(HEIF 형식)을 공유 가능한 PDF로 만들기
- 여행 일기용 휴가 사진 일괄 변환하기

## 팁

- HEIC 디코딩은 WebAssembly를 사용하여 전적으로 브라우저에서 이루어집니다. 디코더를 불러오는 동안 첫 변환은 시간이 조금 걸릴 수 있습니다.
- HEIC를 다른 이미지 형식(JPG, PNG 등)과 함께 사용해야 한다면 HEIC를 포함한 모든 형식을 처리하는 [이미지를 PDF로](./image-to-pdf) 도구를 사용하세요.
- iPhone의 HEIC 파일에는 GPS 좌표를 포함한 EXIF 데이터가 들어 있는 경우가 많습니다. PDF 출력에는 이 메타데이터가 전달되지 않습니다.

## 관련 도구

- [이미지를 PDF로](./image-to-pdf)
- [JPG를 PDF로](./jpg-to-pdf)
- [PNG를 PDF로](./png-to-pdf)
