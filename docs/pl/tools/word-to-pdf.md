---
title: Word na PDF
description: Konwertuj dokumenty Word (DOC, DOCX), ODT i RTF na PDF w przeglądarce z pełnym zachowaniem formatowania.
---

# Word na PDF

Konwertuj dokumenty Microsoft Word i zgodne formaty na PDF. Narzędzie używa działającego w przeglądarce silnika LibreOffice, który obsługuje pliki DOC, DOCX, ODT i RTF, zachowując w wyniku formatowanie, tabele, obrazy, nagłówki, stopki i style.

## Obsługiwane formaty

| Format            | Rozszerzenia |
| :---------------- | :----------- |
| Word (nowoczesny) | `.docx`      |
| Word (starszy)    | `.doc`       |
| OpenDocument Text | `.odt`       |
| Rich Text Format  | `.rtf`       |

## Jak to działa

1. Kliknij obszar przesyłania lub przeciągnij i upuść dokumenty Word. Można wybrać wiele plików naraz.
2. Przejrzyj listę plików i zarządzaj nią.
3. Kliknij **Konwertuj na PDF**. Silnik LibreOffice ładuje się przy pierwszym użyciu (wskaźnik postępu pokazuje stan inicjalizacji), a następnie każdy plik jest konwertowany.
4. Pojedynczy plik jest pobierany bezpośrednio jako PDF. Wiele plików jest pakowanych do `word-converted.zip`.

## Opcje

To narzędzie nie ma dodatkowych ustawień. Silnik LibreOffice tworzy wynik przy użyciu domyślnego profilu eksportu PDF.

## Wynik

| Liczba plików | Wynik                                                                |
| :------------ | :------------------------------------------------------------------- |
| 1 plik        | Pobranie jednego PDF (oryginalna nazwa pliku z rozszerzeniem `.pdf`) |
| 2+ plików     | Archiwum ZIP (`word-converted.zip`) z jednym PDF dla każdego pliku   |

## Zastosowania

- Konwersja CV lub listu motywacyjnego z DOCX na PDF przed wysłaniem aplikacji
- Wsadowa konwersja zestawu umów lub ofert na PDF do dostarczenia klientowi
- Zamiana starszych plików `.doc` na nowoczesne pliki PDF do długoterminowej archiwizacji
- Konwersja dokumentów współdzielonych z Dokumentów Google (eksportowanych jako DOCX) na PDF
- Tworzenie gotowych do druku plików PDF z szablonów Word używanych w automatycznym generowaniu dokumentów

## Wskazówki

- Silnik LibreOffice jest pobierany raz na sesję i buforowany. Przy pierwszej konwersji należy się spodziewać kilku sekund ładowania, a kolejne będą znacznie szybsze.
- Złożone formatowanie (makra, kontrolki ActiveX, zaawansowane SmartArt) może nie zostać przekonwertowane idealnie. Standardowe elementy dokumentu (tekst, tabele, obrazy, nagłówki, przypisy) konwertują się niezawodnie.
- Ponieważ to narzędzie przyjmuje także ODT i RTF, możesz używać go jako uniwersalnego konwertera wszystkich formatów edytorów tekstu.

## Powiązane narzędzia

- [ODT na PDF](./odt-to-pdf)
- [RTF na PDF](./rtf-to-pdf)
- [Excel na PDF](./excel-to-pdf)
- [PowerPoint na PDF](./powerpoint-to-pdf)
