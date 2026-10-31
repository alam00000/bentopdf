---
title: Przygotuj PDF dla AI
description: Wyodrębnij zawartość PDF do ustrukturyzowanego JSON zoptymalizowanego dla LLM i potoków AI, takich jak LlamaIndex. Obsługuje przetwarzanie wsadowe.
---

# Przygotuj PDF dla AI

Wyodrębnia zawartość plików PDF i strukturyzuje ją jako JSON zoptymalizowany pod kątem wczytywania przez duże modele językowe (LLM) i frameworki AI, takie jak LlamaIndex. Zawartość każdej strony jest wyodrębniana i porządkowana w ustrukturyzowanym formacie gotowym dla potoków RAG, chatbotów lub systemów wyszukiwania semantycznego.

## Jak to działa

1. Wgraj jeden lub więcej plików PDF, klikając strefę upuszczania lub przeciągając na nią pliki.
2. Kliknij **Wyodrębnij**, aby rozpocząć przetwarzanie.
3. Pojedynczy plik pobiera się jako `filename_llm.json`. Wiele plików daje archiwum `pdf-for-ai.zip`.

Narzędzie korzysta z integracji PyMuPDF z LlamaIndex, aby wyodrębnić zawartość na poziomie stron wraz z metadanymi, tworząc wynik, który można bezpośrednio wczytać do frameworków AI.

## Opcje

To narzędzie nie ma konfigurowalnych opcji. Wszystkie strony są wyodrębniane z pełnym tekstem i metadanymi.

## Format wyniku

- **Pojedynczy plik**: `filename_llm.json`
- **Wiele plików**: `pdf-for-ai.zip` zawierający jeden `_llm.json` na każdy wejściowy PDF.

Wynik JSON jest zgodny ze schematem dokumentu LlamaIndex, z tekstem poszczególnych stron i polami metadanych.

## Zastosowania

- Przygotowywanie dokumentów PDF dla potoków generowania wspomaganego wyszukiwaniem (RAG).
- Budowanie przeszukiwalnej bazy wiedzy z archiwów PDF dla chatbota AI.
- Przekazywanie raportów PDF do przepływów analizy opartych na LLM.
- Wstępne przetwarzanie prac naukowych dla systemów wyszukiwania semantycznego i odpowiadania na pytania.
- Tworzenie ustrukturyzowanych danych treningowych z kolekcji dokumentów PDF.

## Wskazówki

- Do zwykłego wyodrębniania tekstu bez formatowania pod AI użyj [PDF na Tekst](./pdf-to-text).
- Do wyniku w Markdown zachowującego nagłówki i strukturę użyj [PDF na Markdown](./pdf-to-markdown).
- Zeskanowane pliki PDF dadzą pusty lub minimalny wynik. Najpierw uruchom na nich OCR, aby dodać warstwę tekstową przed wyodrębnieniem.

## Powiązane narzędzia

- [PDF na Tekst](./pdf-to-text)
- [PDF na Markdown](./pdf-to-markdown)
- [PDF na JSON](./pdf-to-json)
