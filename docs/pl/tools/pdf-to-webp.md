---
title: PDF na WebP
description: Konwertuj strony PDF na obrazy WebP z regulowaną jakością. Mniejsze pliki niż JPG przy porównywalnej jakości obrazu.
---

# PDF na WebP

Konwertuje każdą stronę PDF na obraz WebP. WebP zwykle daje pliki o 25-35% mniejsze niż JPG przy tej samej postrzeganej jakości, co czyni go dobrym wyborem do użytku w sieci.

## Jak to działa

1. Prześlij plik PDF, klikając strefę upuszczania lub przeciągając na nią plik.
2. Dostosuj suwak **Jakość**.
3. Kliknij **Konwertuj**, aby przetworzyć plik.
4. Pojedynczy plik `.webp` lub archiwum ZIP pobiera się automatycznie.

## Opcje

- **Jakość**: suwak od 0% do 100% (domyślnie 85%). Steruje poziomem kompresji stratnej. Wyższe wartości zachowują więcej szczegółów.

Strony są wewnętrznie renderowane w skali 2x, co daje obrazy o wymiarach mniej więcej dwukrotnie większych niż natywne wymiary PDF.

## Format wyjściowy

- **Jedna strona**: `filename.webp`
- **Wiele stron**: `filename_webps.zip` zawierający `page_1.webp`, `page_2.webp` itd.

## Przypadki użycia

- Przygotowywanie podglądów stron dla witryn, gdzie liczy się przepustowość.
- Generowanie lekkich wersji obrazkowych ulotek lub broszur do mediów społecznościowych.
- Zbiorcza konwersja wielostronicowych dokumentów na zestaw obrazów zoptymalizowanych dla sieci.

## Wskazówki

- WebP jest obsługiwany we wszystkich nowoczesnych przeglądarkach. Dla zgodności ze starszymi środowiskami użyj [PDF na JPG](./pdf-to-jpg).
- Jakość 80-85% jest zwykle nieodróżnialna od oryginału na ekranie, a pliki pozostają małe.

## Powiązane narzędzia

- [PDF na JPG](./pdf-to-jpg)
- [PDF na PNG](./pdf-to-png)
- [PDF na BMP](./pdf-to-bmp)
