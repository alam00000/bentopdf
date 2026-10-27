---
title: PDF na TIFF
description: Konwertuj strony PDF na obrazy TIFF, powszechnie używane w druku, faksie i archiwizacji. W razie błędu kodowania wraca do PNG.
---

# PDF na TIFF

Konwertuje każdą stronę PDF na obraz TIFF. TIFF to standardowy format w produkcji poligraficznej, systemach faksowych i archiwizacji dokumentów. Narzędzie używa kompresji PackBits do kodowania TIFF i wraca do PNG, jeśli kodowanie strony się nie powiedzie.

## Jak to działa

1. Prześlij plik PDF, klikając strefę upuszczania lub przeciągając na nią plik.
2. Kliknij **Konwertuj**, aby przetworzyć plik.
3. Pojedynczy plik TIFF lub archiwum ZIP pobiera się automatycznie.

## Opcje

To narzędzie nie ma konfigurowalnych opcji. Strony są renderowane w stałej skali 2x.

## Format wyjściowy

- **Jedna strona**: `filename.tiff`
- **Wiele stron**: `filename_tiffs.zip` zawierający `page_1.tiff`, `page_2.tiff` itd.

Jeśli kodowanie TIFF dla danej strony się nie powiedzie (z powodu problemów z kompresją), ta strona zostanie zapisana jako plik `.png`. W takim przypadku ZIP będzie zawierał mieszankę plików TIFF i PNG.

## Przypadki użycia

- Składanie dokumentów w urzędach lub systemach prawnych, które wymagają formatu TIFF.
- Przygotowywanie stron do wysyłki faksem przez cyfrowe usługi faksowe.
- Archiwizowanie zeskanowanych dokumentów w powszechnie obsługiwanym formacie bezstratnym.
- Przekazywanie stron do korporacyjnych systemów zarządzania dokumentami.

## Wskazówki

- Pliki TIFF są duże. Jeśli jakość bez strat potrzebna jest tylko do użytku w sieci lub na ekranie, lepszym wyborem jest [PDF na PNG](./pdf-to-png).
- Sprawdź zawartość ZIP, jeśli niektóre strony wymagały zapasowego formatu PNG, bo możesz chcieć przekonwertować je osobno.

## Powiązane narzędzia

- [PDF na PNG](./pdf-to-png)
- [PDF na BMP](./pdf-to-bmp)
- [PDF na JPG](./pdf-to-jpg)
