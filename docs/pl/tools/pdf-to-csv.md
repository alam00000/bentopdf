---
title: PDF na CSV
description: Wyodrębnij tabele z dokumentów PDF i wyeksportuj je do jednego pliku CSV. Obsługuje wielostronicowe PDF z automatycznym wykrywaniem tabel.
---

# PDF na CSV

Wyodrębnia tabele z PDF i eksportuje je jako plik CSV. Narzędzie skanuje każdą stronę w poszukiwaniu danych tabelarycznych za pomocą silnika wykrywania tabel PyMuPDF, a następnie zapisuje wszystkie znalezione wiersze w jednym wyniku rozdzielanym przecinkami.

## Jak to działa

1. Prześlij plik PDF, klikając strefę upuszczania lub przeciągając na nią plik.
2. Kliknij **Konwertuj**, aby rozpocząć wyodrębnianie tabel.
3. Narzędzie skanuje każdą stronę i automatycznie identyfikuje tabele.
4. Plik `.csv` pobiera się ze wszystkimi wyodrębnionymi danymi tabel.

Tabele z różnych stron są oddzielone w wyniku pustymi wierszami. Komórki zawierające przecinki, cudzysłowy lub nowe wiersze są prawidłowo poprzedzane znakami ucieczki zgodnie z RFC 4180.

## Opcje

To narzędzie nie ma konfigurowalnych opcji. Wszystkie tabele znalezione w dokumencie są wyodrębniane i łączone w jeden plik CSV.

## Format wyjściowy

- Pojedynczy plik `filename.csv` zawierający wszystkie wykryte tabele.

## Przypadki użycia

- Przenoszenie danych finansowych z wyciągów bankowych lub faktur w PDF do arkusza kalkulacyjnego.
- Wyodrębnianie tabel cenowych z ofert dostawców w celu porównania.
- Konwertowanie tabelarycznych danych badawczych z artykułów PDF do formatu odpowiedniego dla narzędzi analitycznych.
- Migrowanie danych ze starszych raportów PDF do baz danych.

## Wskazówki

- Jeśli nie znaleziono tabel, narzędzie wyświetla komunikat "Nie znaleziono tabel". Zwykle oznacza to, że PDF używa układu tekstu, który wygląda jak tabela, ale nie jest zbudowany jako prawdziwa tabela.
- Aby mieć większą kontrolę nad pojedynczymi tabelami, użyj [Wyodrębnij tabele PDF](./extract-tables), które pozwala wybrać format wyjściowy CSV, JSON lub Markdown.
- Jeśli potrzebujesz danych w formacie Excel z osobnymi arkuszami dla każdej tabeli, użyj [PDF na Excel](./pdf-to-excel).

## Powiązane narzędzia

- [PDF na Excel](./pdf-to-excel)
- [Wyodrębnij tabele PDF](./extract-tables)
- [PDF na Tekst](./pdf-to-text)
