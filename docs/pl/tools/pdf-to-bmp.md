---
title: PDF na BMP
description: Konwertuj strony PDF na nieskompresowane obrazy BMP. Przydatne w starszych systemach i procesach drukarskich wymagających bitmap.
---

# PDF na BMP

Konwertuje każdą stronę PDF na obraz BMP (bitmapa). BMP to format nieskompresowany, więc wynik jest dokładny co do piksela i bez utraty jakości, ale pliki są duże.

## Jak to działa

1. Prześlij plik PDF, klikając strefę upuszczania lub przeciągając na nią plik.
2. Kliknij **Konwertuj**, aby przetworzyć plik.
3. Pojedynczy plik `.bmp` lub archiwum ZIP pobiera się automatycznie.

## Opcje

To narzędzie nie ma konfigurowalnych opcji. Strony są renderowane w stałej skali 2x, co daje obrazy o wymiarach w przybliżeniu dwukrotnie większych niż natywne wymiary strony PDF.

## Format wyjściowy

- **Jedna strona**: `filename.bmp`
- **Wiele stron**: `filename_bmps.zip` zawierający `page_1.bmp`, `page_2.bmp` itd.

## Przypadki użycia

- Przekazywanie stron PDF do starszych systemów lub urządzeń, które przyjmują tylko BMP.
- Przygotowywanie nieskompresowanych obrazów do określonych procesów drukarskich.
- Używanie wyniku bitmapowego jako wejścia do narzędzi do przetwarzania obrazów, które wymagają surowych danych pikseli.

## Wskazówki

- Pliki BMP są bardzo duże, ponieważ przechowują surowe dane pikseli bez kompresji. W większości zastosowań [PDF na PNG](./pdf-to-png) daje jakość bez strat i znacznie mniejsze pliki.
- Jeśli system docelowy przyjmuje PNG lub TIFF, wybierz te formaty, aby oszczędzić miejsce na dysku.

## Powiązane narzędzia

- [PDF na PNG](./pdf-to-png)
- [PDF na TIFF](./pdf-to-tiff)
- [PDF na JPG](./pdf-to-jpg)
