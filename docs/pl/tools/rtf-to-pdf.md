---
title: RTF na PDF
description: Konwertuj pliki Rich Text Format (RTF) na PDF w przeglądarce za pomocą silnika opartego na LibreOffice.
---

# RTF na PDF

Konwertuj dokumenty Rich Text Format na PDF. RTF to wieloplatformowy format dokumentów obsługiwany przez praktycznie każdy edytor tekstu. To narzędzie używa działającego w przeglądarce silnika LibreOffice do renderowania plików RTF z zachowaniem formatowania: pogrubienie, kursywa, tabele i osadzone obrazy trafiają do PDF.

## Obsługiwane formaty

| Format | Rozszerzenia | Typy MIME                     |
| :----- | :----------- | :---------------------------- |
| RTF    | `.rtf`       | `text/rtf`, `application/rtf` |

## Jak to działa

1. Kliknij obszar wgrywania lub przeciągnij i upuść jeden lub więcej plików RTF.
2. Przejrzyj listę plików. Dodaj kolejne lub usuń zbędne.
3. Kliknij **Konwertuj na PDF**. Silnik LibreOffice inicjalizuje się przy pierwszym użyciu, a następnie przetwarza każdy plik.
4. Pojedynczy plik pobiera się bezpośrednio jako PDF. Wiele plików jest dostarczanych jako `rtf-converted.zip`.

## Opcje

To narzędzie nie ma dodatkowych ustawień. Konwersja zachowuje oryginalne formatowanie RTF.

## Wynik

| Liczba plików | Wynik                                                            |
| :------------ | :--------------------------------------------------------------- |
| 1 plik        | Pobranie pojedynczego PDF (np. `letter.pdf`)                     |
| 2+ pliki      | Archiwum ZIP (`rtf-converted.zip`) zawierające jeden PDF na plik |

## Zastosowania

- Konwersja starszych dokumentów RTF z dawnych edytorów tekstu na nowoczesne PDF
- Zamiana szablonów e-maili RTF na podglądy PDF
- Przetwarzanie wyników RTF z oprogramowania prawniczego lub medycznego
- Wsadowa konwersja plików RTF z systemu zarządzania dokumentami na PDF do archiwizacji

## Wskazówki

- Silnik LibreOffice jest ładowany raz i buforowany. Pierwsza konwersja w sesji trwa kilka sekund dłużej, kolejne są szybsze.
- Pliki RTF z osadzonymi obiektami OLE mogą nie renderować wszystkich obiektów idealnie. Zwykły tekst, obrazy i standardowe formatowanie konwertują się niezawodnie.
- Jeśli pliki RTF utworzono w Microsoft Word, możesz też skonwertować je bezpośrednio narzędziem [Word na PDF](./word-to-pdf), które przyjmuje RTF obok DOC i DOCX.

## Powiązane narzędzia

- [Word na PDF](./word-to-pdf)
- [ODT na PDF](./odt-to-pdf)
- [Tekst na PDF](./txt-to-pdf)
