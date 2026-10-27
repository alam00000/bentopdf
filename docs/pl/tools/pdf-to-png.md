---
title: PDF na PNG
description: Konwertuj strony PDF na obrazy PNG bez strat z regulowaną skalą. Idealne do wysokiej jakości zrzutów i przezroczystych teł.
---

# PDF na PNG

Konwertuje każdą stronę PDF na obraz PNG. PNG używa kompresji bezstratnej, więc wynik zachowuje każdy szczegół oryginalnej strony. Jednostronicowe PDF pobierają się jako plik `.png`, wielostronicowe jako ZIP.

## Jak to działa

1. Prześlij plik PDF, klikając strefę upuszczania lub przeciągając na nią plik.
2. Ustaw suwak **Skala**, aby sterować rozdzielczością wyniku.
3. Kliknij **Konwertuj**, aby rozpocząć przetwarzanie.
4. Pojedynczy plik PNG lub archiwum ZIP pobiera się automatycznie.

## Opcje

- **Skala**: od 1.0x do 3.0x (domyślnie 2.0x). Przy 2.0x standardowa strona w formacie Letter jest renderowana w rozmiarze około 1 224 x 1 584 pikseli. Wyższe wartości skali dają większe, ostrzejsze obrazy kosztem rozmiaru pliku i czasu przetwarzania.

## Format wyjściowy

- **Jedna strona**: `filename.png`
- **Wiele stron**: `filename_pngs.zip` zawierający `page_1.png`, `page_2.png` itd.

## Przypadki użycia

- Wykonywanie wysokiej wierności zrzutów stron PDF do prezentacji.
- Wyodrębnianie wykresów lub diagramów, które wymagają wyraźnych krawędzi i braku artefaktów kompresji.
- Przygotowywanie zasobów do projektowania stron WWW z makiet w PDF.
- Tworzenie obrazów stron bez strat do wstępnego przetwarzania OCR.

## Wskazówki

- Pliki PNG są znacznie większe niż JPG. Jeśli rozmiar pliku jest ważniejszy niż idealna jakość, użyj [PDF na JPG](./pdf-to-jpg) lub [PDF na WebP](./pdf-to-webp).
- Przy skali 1.0x wynik odpowiada natywnej rozdzielczości PDF. Zwiększ do 3.0x dla eksportów w jakości do druku.

## Powiązane narzędzia

- [PDF na JPG](./pdf-to-jpg)
- [PDF na WebP](./pdf-to-webp)
- [PDF na SVG](./pdf-to-svg)
