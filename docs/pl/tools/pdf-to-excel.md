---
title: PDF na Excel
description: Wyodrębnij tabele z dokumentów PDF do arkusza Excel. Każda tabela trafia do osobnego arkusza z odwołaniem do strony.
---

# PDF na Excel

Wyodrębnia tabele z PDF i zapisuje je jako arkusz kalkulacyjny Excel (`.xlsx`). Każda wykryta tabela trafia do osobnego arkusza, oznaczonego numerem tabeli i stroną źródłową. Wykorzystuje PyMuPDF do wykrywania tabel i bibliotekę SheetJS do generowania plików Excel.

## Jak to działa

1. Prześlij plik PDF, klikając strefę upuszczania lub przeciągając na nią plik.
2. Kliknij **Konwertuj**, aby rozpocząć wyodrębnianie tabel.
3. Narzędzie skanuje każdą stronę w poszukiwaniu tabel, a następnie buduje skoroszyt Excel.
4. Plik `.xlsx` pobiera się z jednym arkuszem na tabelę.

## Opcje

To narzędzie nie ma konfigurowalnych opcji. Wszystkie wykryte tabele są wyodrębniane automatycznie.

## Format wyjściowy

- Pojedynczy plik `filename.xlsx`.
- **Jedna tabela**: jeden arkusz o nazwie "Table".
- **Wiele tabel**: arkusze o nazwach "Table 1 (Page 3)", "Table 2 (Page 5)" itd. Nazwy arkuszy są skracane do 31 znaków (limit Excela).

## Przypadki użycia

- Konwertowanie raportów finansowych w PDF na edytowalne arkusze do dalszej analizy.
- Wyodrębnianie tabel zapasów lub zamówień z plików PDF od dostawców.
- Przenoszenie danych strukturalnych z formularzy lub katalogów PDF do Excela w celu sortowania i filtrowania.
- Archiwizowanie tabelarycznych danych z PDF w formacie, z którym mogą pracować mniej techniczni współpracownicy.

## Wskazówki

- Jeśli narzędzie zgłasza "Nie znaleziono tabel", PDF prawdopodobnie używa swobodnego układu tekstu zamiast uporządkowanych tabel. Spróbuj zamiast tego [PDF na Tekst](./pdf-to-text), aby pobrać surową zawartość.
- Dla prostszego płaskiego formatu użyj [PDF na CSV](./pdf-to-csv). Do pobierania poszczególnych tabel w wielu formatach użyj [Wyodrębnij tabele PDF](./extract-tables).
- Sprawdź nazwy arkuszy, aby zidentyfikować, z której strony pochodzi każda tabela.

## Powiązane narzędzia

- [PDF na CSV](./pdf-to-csv)
- [Wyodrębnij tabele PDF](./extract-tables)
- [PDF na Tekst](./pdf-to-text)
