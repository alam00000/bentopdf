---
title: PDF na tekst
description: Wyodrębnij zwykły tekst z plików PDF. Obsługuje zbiorcze wyodrębnianie z wielu plików PDF z wynikiem w plikach TXT.
---

# PDF na tekst

Wyodrębnia całą zawartość tekstową z plików PDF i zapisuje ją jako zwykłe pliki `.txt`. Obsługuje przetwarzanie zbiorcze: prześlij wiele plików PDF i wyodrębnij tekst każdego z nich w jednej operacji. Wykorzystuje PyMuPDF.

## Jak to działa

1. Prześlij jeden lub więcej plików PDF, klikając strefę upuszczania lub przeciągając na nią pliki. Zarządzaj listą plików za pomocą przycisków Dodaj więcej i Wyczyść.
2. Kliknij **Wyodrębnij**, aby rozpocząć przetwarzanie.
3. Pojedynczy plik pobiera się jako `filename.txt`. Wiele plików daje archiwum `pdf-to-text.zip`.

## Opcje

To narzędzie nie ma konfigurowalnych opcji. Cały tekst jest wyodrębniany z każdej strony w kolejności czytania.

## Format wyjściowy

- **Jeden plik**: `filename.txt`
- **Wiele plików**: `pdf-to-text.zip` zawierający jeden plik `.txt` dla każdego wejściowego PDF.

## Przypadki użycia

- Wyodrębnianie tekstu głównego z raportów PDF do indeksowania pełnotekstowego.
- Konwertowanie e-booków lub artykułów PDF na zwykły tekst do czytania na urządzeniach z e-papierem.
- Pobieranie tekstu z umów lub dokumentów prawnych do analizy słów kluczowych.
- Usuwanie formatowania z plików PDF, aby uzyskać czysty tekst dla skryptów przetwarzania danych.
- Przygotowywanie korpusu tekstowego z archiwów PDF do przetwarzania języka naturalnego.

## Wskazówki

- Zeskanowane pliki PDF (tylko obraz) dadzą puste pliki tekstowe, ponieważ nie ma warstwy tekstowej do wyodrębnienia. Najpierw przepuść zeskanowane dokumenty przez OCR.
- Wynik zachowuje kolejność czytania zinterpretowaną przez PyMuPDF, która zazwyczaj biegnie od lewej do prawej i z góry na dół. Układy wielokolumnowe mogą dać przeplatany tekst.
- Aby uzyskać ustrukturyzowany wynik z nagłówkami i formatowaniem, wypróbuj [PDF na Markdown](./pdf-to-markdown). Dla ustrukturyzowanego JSON gotowego dla AI użyj [Przygotuj PDF dla AI](./prepare-pdf-for-ai).

## Powiązane narzędzia

- [PDF na Markdown](./pdf-to-markdown)
- [Przygotuj PDF dla AI](./prepare-pdf-for-ai)
- [PDF na Word](./pdf-to-word)
