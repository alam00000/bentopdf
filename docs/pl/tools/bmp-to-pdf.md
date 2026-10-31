---
title: BMP na PDF
description: Konwertuj obrazy bitmapowe BMP na PDF bezpośrednio w przeglądarce, bez wysyłania na żaden serwer.
---

# BMP na PDF

Konwertuj pliki Windows Bitmap (BMP) na PDF. BMP to nieskompresowany format obrazu, wciąż spotykany w starszych systemach, obrazowaniu medycznym i skanerach przemysłowych. To narzędzie konwertuje je do PDF bez potrzeby instalowania czegokolwiek.

## Obsługiwane formaty

| Format | Rozszerzenia |
| :----- | :----------- |
| BMP    | `.bmp`       |

## Jak to działa

1. Kliknij obszar wgrywania lub przeciągnij i upuść pliki BMP.
2. Przejrzyj listę plików. Dodaj więcej plików lub usuń niechciane.
3. Kliknij **Konwertuj na PDF**. Wynik pobierze się jako `from_bmps.pdf`.

Każdy BMP jest rysowany na canvas, eksportowany jako PNG, a następnie osadzany w PDF za pomocą pdf-lib. Rozmiar strony odpowiada wymiarom oryginalnego obrazu.

## Opcje

To narzędzie nie udostępnia dodatkowych ustawień jakości. Obrazy są osadzane w oryginalnej rozdzielczości jako bezstratny PNG w PDF.

## Przypadki użycia

- Konwertowanie starszych zeskanowanych dokumentów zapisanych jako BMP na archiwalne pliki PDF
- Zamiana zrzutów ekranu BMP z dawnych aplikacji Windows na dokumenty do udostępniania
- Przetwarzanie wyników ze skanerów medycznych lub przemysłowych, które domyślnie zapisują BMP
- Migracja starych archiwów obrazów do bardziej przenośnego formatu

## Wskazówki

- Pliki BMP są nieskompresowane, więc zwykle są duże. Powstały PDF będzie znacznie mniejszy, ponieważ obrazy są wewnętrznie ponownie kodowane jako PNG.
- Jeśli masz pliki BMP razem z innymi formatami obrazów, użyj narzędzia [Obrazy do PDF](./image-to-pdf), aby przekonwertować wszystko w jednej partii.

## Powiązane narzędzia

- [Obrazy do PDF](./image-to-pdf)
- [PNG na PDF](./png-to-pdf)
- [TIFF na PDF](./tiff-to-pdf)
