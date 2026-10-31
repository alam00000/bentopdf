---
title: PDF na Word
description: Konwertuj pliki PDF na edytowalne dokumenty Word (DOCX). Obsługuje zbiorczą konwersję wielu plików PDF naraz.
---

# PDF na Word

Konwertuje pliki PDF na edytowalne dokumenty Word (`.docx`). Narzędzie używa PyMuPDF do odtworzenia zawartości dokumentu, zachowując tekst, podstawowe formatowanie i układ. Obsługuje konwersję pojedynczą i zbiorczą.

## Jak to działa

1. Prześlij jeden lub więcej plików PDF, klikając strefę upuszczania lub przeciągając na nią pliki. Możesz dodać więcej plików lub usunąć pojedyncze z listy.
2. Kliknij **Konwertuj**, aby rozpocząć przetwarzanie.
3. Pojedynczy plik pobiera się jako `filename.docx`. Wiele plików jest pakowanych do `converted-documents.zip`.

## Opcje

To narzędzie nie ma konfigurowalnych opcji. Każdy PDF jest konwertowany na DOCX za pomocą wbudowanego silnika konwersji PyMuPDF.

## Format wyjściowy

- **Jeden plik**: `filename.docx`
- **Wiele plików**: `converted-documents.zip` zawierający jeden plik `.docx` dla każdego wejściowego PDF.

## Przypadki użycia

- Edytowanie tekstu w otrzymanym pliku PDF, który trzeba zmodyfikować.
- Konwertowanie zarchiwizowanych raportów PDF do formatu, który współpracownicy mogą edytować w Microsoft Word lub Dokumentach Google.
- Przenoszenie treści z umów lub ofert w PDF do Worda w celu nanoszenia poprawek.
- Migrowanie starszej dokumentacji PDF do formatu edytowalnego.

## Wskazówki

- Złożone układy z tekstem w wielu kolumnach, osadzonymi formularzami lub dużą ilością grafiki mogą nie przekonwertować się idealnie. Przejrzyj wynik i dostosuj formatowanie w edytorze tekstu.
- Zeskanowane pliki PDF (tylko obraz) dadzą puste lub minimalne pliki DOCX. Najpierw przepuść je przez OCR, aby dodać warstwę tekstową.
- Tryb zbiorczy jest wydajny przy konwertowaniu całych folderów plików PDF: prześlij je wszystkie naraz.

## Powiązane narzędzia

- [PDF na Tekst](./pdf-to-text)
- [PDF na Markdown](./pdf-to-markdown)
- [Kreator przepływów PDF](./pdf-workflow)
