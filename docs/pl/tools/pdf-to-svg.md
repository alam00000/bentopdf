---
title: PDF na SVG
description: Konwertuj strony PDF na skalowalną grafikę wektorową SVG. Zachowuje tekst i kształty jako ścieżki wektorowe do nieograniczonego skalowania.
---

# PDF na SVG

Konwertuje każdą stronę PDF na plik SVG (Scalable Vector Graphics). W przeciwieństwie do formatów rastrowych SVG zachowuje ścieżki wektorowe, tekst i kształty, więc wynik skaluje się do dowolnego rozmiaru bez pikselizacji. Wykorzystuje PyMuPDF.

## Jak to działa

1. Prześlij jeden lub więcej plików PDF, klikając strefę upuszczania lub przeciągając na nią pliki. Możesz dodać wiele plików i zarządzać nimi pojedynczo.
2. Kliknij **Konwertuj**, aby przetworzyć wszystkie przesłane pliki.
3. Konwersje pojedynczego jednostronicowego pliku pobierają się jako samodzielny `.svg`. Wszystko inne pobiera się jako archiwum ZIP.

## Opcje

To narzędzie nie ma konfigurowalnych opcji. Każda strona jest konwertowana na SVG za pomocą natywnego eksportu wektorowego PyMuPDF.

## Format wyjściowy

- **Jeden plik, jedna strona**: `filename.svg`
- **Jeden plik, wiele stron**: `filename_svg.zip` zawierający `page_1.svg`, `page_2.svg` itd.
- **Wiele plików**: `pdf_to_svg.zip` z plikami uporządkowanymi według nazwy dokumentu źródłowego.

## Przypadki użycia

- Wyodrębnianie wektorowych diagramów, wykresów lub ilustracji z raportów PDF do użycia na stronach WWW.
- Edytowanie zawartości stron PDF w edytorze wektorowym, takim jak Inkscape lub Illustrator.
- Osadzanie skalowalnych podglądów stron w responsywnych aplikacjach webowych.
- Wyodrębnianie logo lub grafik z broszur PDF z zachowaniem ostrych krawędzi.

## Wskazówki

- SVG działa najlepiej z plikami PDF zawierającymi treści wektorowe. Zeskanowane dokumenty lub PDF z dużą liczbą obrazów dadzą duże pliki SVG z osadzonymi danymi rastrowymi.
- Dla rastrowego wyniku z PDF bogatych w obrazy użyj zamiast tego [PDF na PNG](./pdf-to-png) lub [PDF na JPG](./pdf-to-jpg).
- To narzędzie obsługuje konwersję zbiorczą: prześlij wiele plików PDF naraz, aby przekonwertować je wszystkie jednym przebiegiem.

## Powiązane narzędzia

- [PDF na PNG](./pdf-to-png)
- [PDF na JPG](./pdf-to-jpg)
- [PDF na Markdown](./pdf-to-markdown)
