---
title: TIFF na PDF
description: Konwertuj jedno- i wielostronicowe obrazy TIFF na format PDF w przeglądarce z pełną obsługą stron.
---

# TIFF na PDF

Konwertuj pliki TIFF na PDF, w tym wielostronicowe TIFF. Każda strona (lub "IFD") w pliku TIFF staje się osobną stroną w wynikowym PDF. Jest to szczególnie przydatne dla zeskanowanych dokumentów, faksów i obrazów medycznych, które często są przechowywane jako wielostronicowe pliki TIFF.

## Obsługiwane formaty

| Format | Rozszerzenia    |
| :----- | :-------------- |
| TIFF   | `.tiff`, `.tif` |

## Jak to działa

1. Kliknij obszar wgrywania lub przeciągnij i upuść pliki TIFF.
2. Przejrzyj listę plików i zarządzaj nią według potrzeb.
3. Kliknij **Konwertuj na PDF**. Wynik pobiera się jako `from_tiff.pdf`.

Narzędzie dekoduje każdy plik TIFF za pomocą dekodera TIFF w JavaScript, wyodrębniając surowe dane pikseli RGBA każdej strony. Każda strona jest renderowana na kanwie, eksportowana jako PNG i osadzana w PDF. Wymiary stron odpowiadają oryginalnym stronom TIFF.

## Opcje

To narzędzie nie udostępnia dodatkowych ustawień jakości. Obrazy są osadzane w natywnej rozdzielczości.

## Zastosowania

- Konwersja wielostronicowych dokumentów faksowych (TIFF-F) na bardziej przenośny format PDF
- Zamiana archiwów zeskanowanych dokumentów przechowywanych jako TIFF na przeszukiwalne PDF (następnie połącz z narzędziem OCR)
- Przetwarzanie plików obrazowania medycznego (preparaty patologiczne, eksporty radiologiczne), które używają TIFF
- Konwersja plików TIFF z danymi GIS lub obrazami satelitarnymi na dokumenty do udostępniania

## Wskazówki

- Wielostronicowe pliki TIFF są w pełni obsługiwane. 10-stronicowy TIFF da 10-stronicowy PDF. Nie musisz najpierw dzielić pliku TIFF.
- Bardzo duże pliki TIFF (setki megabajtów) mogą przetwarzać się dłużej, ponieważ cały plik musi zostać zdekodowany w pamięci przeglądarki.
- Jeśli potrzebujesz OCR na powstałym PDF, uruchom po konwersji narzędzie [OCR PDF](./ocr-pdf).

## Powiązane narzędzia

- [Obrazy do PDF](./image-to-pdf)
- [BMP na PDF](./bmp-to-pdf)
- [JPG na PDF](./jpg-to-pdf)
