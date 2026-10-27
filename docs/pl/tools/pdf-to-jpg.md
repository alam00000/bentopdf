---
title: PDF na JPG
description: Konwertuj strony PDF na obrazy JPG z regulowaną jakością. Jednostronicowe PDF pobierają się bezpośrednio, wielostronicowe jako ZIP.
---

# PDF na JPG

Konwertuje każdą stronę PDF na obraz JPG. Dokumenty jednostronicowe pobierają się jako samodzielny plik `.jpg`. Wielostronicowe pliki PDF dają archiwum ZIP z jednym plikiem JPG na stronę.

## Jak to działa

1. Prześlij plik PDF, klikając strefę upuszczania lub przeciągając na nią plik. Narzędzie wyświetla nazwę pliku, jego rozmiar i liczbę stron.
2. Dostosuj suwak **Jakość**, aby sterować kompresją JPG.
3. Kliknij **Konwertuj**, aby rozpocząć przetwarzanie.
4. Wynik pobiera się automatycznie: pojedynczy JPG dla jednostronicowych PDF lub plik ZIP dla dokumentów wielostronicowych.

## Opcje

- **Jakość**: suwak od 0% do 100% (domyślnie 90%). Wyższe wartości dają ostrzejsze obrazy i większe pliki. Niższe wartości kompresują mocniej.

Strony są wewnętrznie renderowane w skali 2x, więc rozdzielczość wyniku jest dwukrotnie większa niż wymiary strony PDF. Standardowa strona w formacie Letter daje obraz o rozmiarze około 1 224 x 1 584 pikseli.

## Format wyjściowy

- **Jedna strona**: `filename.jpg`
- **Wiele stron**: `filename_jpgs.zip` zawierający `page_1.jpg`, `page_2.jpg` itd.

## Przypadki użycia

- Generowanie miniatur podglądu dla systemu zarządzania dokumentami.
- Udostępnianie strony z raportu w czacie lub e-mailu, które nie obsługują PDF.
- Tworzenie zasobów graficznych z diagramów lub ilustracji w PDF.
- Archiwizowanie zeskanowanych dokumentów jako pojedynczych obrazów.

## Wskazówki

- Aby uzyskać wynik bez strat, użyj zamiast tego [PDF na PNG](./pdf-to-png).
- Ustawienie jakości 80-90% daje dobry kompromis między rozmiarem pliku a wiernością obrazu.
- Jeśli potrzebujesz określonego formatu dla każdej strony, rozważ [Kreator przepływów PDF](./pdf-workflow), który ma węzeł wyjściowy PDF na obrazy.

## Powiązane narzędzia

- [PDF na PNG](./pdf-to-png)
- [PDF na WebP](./pdf-to-webp)
- [PDF na BMP](./pdf-to-bmp)
- [PDF na TIFF](./pdf-to-tiff)
