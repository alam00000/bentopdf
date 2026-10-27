---
title: Excel na PDF
description: Konwertuj arkusze Excel (XLS, XLSX), ODS i pliki CSV na PDF z zachowaniem formatowania.
---

# Excel na PDF

Konwertuj pliki arkuszy kalkulacyjnych na PDF. Narzędzie obsługuje nowoczesne pliki Excel, starszy format XLS, arkusze OpenDocument, a nawet CSV, wszystko renderowane przez działający w przeglądarce silnik LibreOffice, który zachowuje formatowanie komórek, formuły (jako obliczone wartości), wykresy i układy wielu arkuszy.

## Obsługiwane formaty

| Format              | Rozszerzenia |
| :------------------ | :----------- |
| Excel (nowoczesny)  | `.xlsx`      |
| Excel (starszy)     | `.xls`       |
| Arkusz OpenDocument | `.ods`       |
| CSV                 | `.csv`       |

## Jak to działa

1. Kliknij obszar przesyłania lub przeciągnij i upuść pliki arkuszy kalkulacyjnych.
2. Przejrzyj listę plików. Dodaj kolejne pliki lub usuń niechciane.
3. Kliknij **Konwertuj na PDF**. Silnik LibreOffice inicjalizuje się przy pierwszym użyciu, a następnie przetwarza każdy plik.
4. Pojedynczy plik pobiera się bezpośrednio jako PDF. Wiele plików jest dostarczanych jako `excel-converted.zip`.

## Opcje

To narzędzie nie ma dodatkowej konfiguracji. Silnik LibreOffice określa układ strony, skalowanie i obszar wydruku na podstawie wbudowanych ustawień arkusza.

## Wynik

| Liczba plików wejściowych | Wynik                                                                |
| :------------------------ | :------------------------------------------------------------------- |
| 1 plik                    | Pobranie jednego PDF (oryginalna nazwa pliku z rozszerzeniem `.pdf`) |
| 2+ pliki                  | Archiwum ZIP (`excel-converted.zip`) z jednym PDF na każdy plik      |

## Zastosowania

- Konwersja raportów finansowych lub budżetów z Excela na PDF do dystrybucji
- Tworzenie gotowych do druku plików PDF z arkuszy inwentarza lub katalogu produktów
- Udostępnianie wyników analizy danych interesariuszom, którzy nie mają zainstalowanego Excela
- Archiwizacja raportów kwartalnych w formacie bez możliwości edycji
- Konwersja plików ODS z LibreOffice Calc na PDF

## Wskazówki

- Wykresy osadzone w arkuszu są renderowane w PDF. Przed konwersją upewnij się, że wyglądają poprawnie w pliku źródłowym.
- Jeśli arkusz ma wiele arkuszy (kart), wszystkie są uwzględniane w wynikowym PDF.
- Dla prostych danych CSV bez formatowania narzędzie [CSV na PDF](./csv-to-pdf) zapewnia lżejszą konwersję. Użyj Excel na PDF, gdy potrzebujesz zachować formatowanie, wykresy lub wiele arkuszy.

## Powiązane narzędzia

- [CSV na PDF](./csv-to-pdf)
- [Word na PDF](./word-to-pdf)
- [PowerPoint na PDF](./powerpoint-to-pdf)
