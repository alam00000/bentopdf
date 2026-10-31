---
title: Wyodrębnij tabele PDF
description: Wykrywaj i wyodrębniaj tabele z dokumentów PDF. Eksportuj jako CSV, JSON lub Markdown z dokładnością do pojedynczej tabeli.
---

# Wyodrębnij tabele PDF

Wykrywa wszystkie tabele w PDF i pozwala wyeksportować je w wybranym formacie: CSV, JSON lub Markdown. Każda tabela jest wyodrębniana osobno wraz z metadanymi strony i położenia. Działa na silniku wykrywania tabel PyMuPDF.

## Jak to działa

1. Prześlij PDF, klikając strefę upuszczania lub przeciągając na nią plik.
2. Wybierz preferowany **format eksportu**: CSV, JSON lub Markdown.
3. Kliknij **Wyodrębnij**, aby rozpocząć przetwarzanie.
4. Jeśli znaleziono jedną tabelę, pobiera się ją jako pojedynczy plik. Wiele tabel daje archiwum ZIP z jednym plikiem na tabelę.

## Opcje

- **Format eksportu**: wybierz spośród:
  - **CSV**: wartości oddzielone przecinkami z prawidłowym cytowaniem pól zawierających przecinki, cudzysłowy lub znaki nowej linii. Odpowiedni dla arkuszy kalkulacyjnych i baz danych.
  - **JSON**: struktura tablicy tablic, sformatowana z wcięciem 2 spacji. Odpowiedni do przetwarzania programowego.
  - **Markdown**: format tabeli rozdzielanej znakami pionowej kreski, renderowany przez PyMuPDF. Odpowiedni dla dokumentacji i plików README.

## Format wyniku

- **Pojedyncza tabela**: `filename_table.csv` (lub `.json` / `.md`)
- **Wiele tabel**: `filename_tables.zip` zawierający pliki o nazwach `table_1_page3.csv`, `table_2_page5.csv` itd.

## Zastosowania

- Wyodrębnianie wybranych tabel z długich raportów PDF bez pobierania danych z całego dokumentu.
- Uzyskiwanie tabel w formacie Markdown do wklejania bezpośrednio w zgłoszenia GitHub, wiki lub dokumentację.
- Pobieranie ustrukturyzowanych danych JSON z tabel PDF do integracji API lub skryptów.
- Porównywanie tabel między różnymi wersjami PDF przez wyeksportowanie obu do CSV i porównanie różnic.

## Wskazówki

- To narzędzie daje kontrolę nad każdą tabelą osobno. Jeśli chcesz po prostu wrzucić wszystkie tabele do jednego pliku CSV, użyj [PDF na CSV](./pdf-to-csv). Dla pełnego skoroszytu Excel użyj [PDF na Excel](./pdf-to-excel).
- Tabele obejmujące wiele stron mogą zostać wykryte jako osobne tabele na każdej stronie. Może być konieczne ręczne ich połączenie.
- Jeśli nie wykryto żadnych tabel, PDF może być zeskanowanym obrazem. Najpierw uruchom na nim OCR, aby dodać warstwę tekstową.

## Powiązane narzędzia

- [PDF na CSV](./pdf-to-csv)
- [PDF na Excel](./pdf-to-excel)
- [PDF na Tekst](./pdf-to-text)
