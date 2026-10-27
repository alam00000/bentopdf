---
title: PDF na PDF/A
description: Konwertuj standardowe pliki PDF na format PDF/A do długoterminowej archiwizacji. Obsługuje poziomy zgodności PDF/A-1b, PDF/A-2b i PDF/A-3b.
---

# PDF na PDF/A

PDF/A to ustandaryzowany przez ISO podzbiór PDF zaprojektowany do długoterminowego przechowywania cyfrowego. To narzędzie konwertuje standardowe pliki PDF na dokumenty zgodne z PDF/A za pomocą Ghostscript działającego bezpośrednio w przeglądarce.

## Jak to działa

1. Prześlij jeden lub więcej plików PDF.
2. Wybierz **Wersję PDF/A** z listy rozwijanej.
3. Opcjonalnie włącz **Wstępne spłaszczenie PDF** dla złożonych plików, w których zwykła konwersja kończy się błędem.
4. Kliknij **Konwertuj na PDF/A**. Wiele plików daje archiwum ZIP.

## Wersje PDF/A

| Wersja       | Ograniczenia                                             | Najlepsze do                                              |
| ------------ | -------------------------------------------------------- | --------------------------------------------------------- |
| **PDF/A-1b** | Najbardziej restrykcyjna. Bez przezroczystości i warstw. | Maksymalnej zgodności ze starszymi systemami archiwizacji |
| **PDF/A-2b** | Dopuszcza przezroczystość i JPEG2000.                    | Archiwizacji ogólnego przeznaczenia (zalecana)            |
| **PDF/A-3b** | Dopuszcza osadzone załączniki w dowolnym formacie.       | Archiwizacji dokumentów wraz z plikami danych źródłowych  |

PDF/A-2b jest wybrana domyślnie i sprawdza się w zdecydowanej większości zastosowań archiwizacyjnych.

## Opcja wstępnego spłaszczenia

Niektóre pliki PDF zawierają elementy uniemożliwiające czystą konwersję do PDF/A: nietypowe kodowania czcionek, złożone stosy przezroczystości lub uszkodzone struktury wewnętrzne. Włączenie opcji **Wstępne spłaszczenie** rasteryzuje PDF w 300 DPI przed konwersją, co gwarantuje zgodność kosztem tego, że tekst przestaje być zaznaczalny. Użyj jej jako rozwiązania awaryjnego, gdy standardowa konwersja zgłasza błędy.

Wstępne spłaszczenie wymaga silnika PyMuPDF WASM.

## Przypadki użycia

- Spełnianie wymogów archiwizacyjnych urzędów lub sądów (w wielu jurysdykcjach PDF/A jest obowiązkowy w dokumentach sądowych)
- Składanie dokumentów do repozytoriów instytucjonalnych lub bibliotek cyfrowych
- Zachowywanie dokumentów biznesowych, dla których oryginalne oprogramowanie może nie istnieć za dziesięć lat
- Przygotowywanie faktur zgodnie ze standardami e-fakturowania wymagającymi PDF/A-3b z załącznikami XML

## Wskazówki

- Najpierw spróbuj konwersji bez wstępnego spłaszczenia. Włącz je tylko wtedy, gdy pojawi się błąd.
- PDF/A osadza wszystkie czcionki, więc pliki wynikowe są często większe niż oryginały.
- Jeśli w Twoim procesie wymagana jest ścisła zgodność, zweryfikuj wynik w dedykowanym walidatorze PDF/A.

## Powiązane narzędzia

- [Kompresuj PDF](./compress-pdf): zmniejsz rozmiar pliku po konwersji
- [Spłaszcz PDF](./flatten-pdf): spłaszcz formularze przed konwersją do PDF/A
- [Usuń metadane](./remove-metadata): usuń metadane przed archiwizacją
