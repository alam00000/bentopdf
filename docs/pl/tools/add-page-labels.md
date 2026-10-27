---
title: Dodaj etykiety stron
description: Dodawaj etykiety stron PDF z cyframi rzymskimi, prefiksami literowymi, własną numeracją i wieloma regułami na dokument.
---

# Dodaj etykiety stron

Etykiety stron określają, jak numery stron są wyświetlane w przeglądarkach PDF (numer widoczny na pasku narzędzi, a nie wydrukowany na stronie). To narzędzie pozwala przypisać różne schematy etykietowania różnym zakresom stron: cyfry rzymskie dla części wstępnej, liczby dziesiętne dla treści głównej, aneksy oznaczone literami i więcej.

## Jak to działa

1. Wgraj plik PDF.
2. Pojawi się panel opcji z jedną domyślną regułą etykiet.
3. Skonfiguruj każdą regułę: zakres stron, styl, opcjonalny prefiks i wartość początkowa.
4. Kliknij **Dodaj regułę**, aby utworzyć kolejne reguły dla różnych sekcji.
5. Kliknij **Dodaj etykiety stron**, aby zastosować wszystkie reguły i pobrać wynik.

## Opcje

Każda reguła etykiet ma te ustawienia:

- **Zakres stron**: strony, których dotyczy reguła. Zostaw puste dla wszystkich stron. Obsługuje zakresy takie jak `1-4`, `7`, `odd` lub `1-9,30-40`.
- **Styl etykiety**: dziesiętne arabskie, małe cyfry rzymskie (i, ii, iii), wielkie cyfry rzymskie (I, II, III), małe litery (a, b, c), wielkie litery (A, B, C) lub brak etykiety (tylko prefiks).
- **Prefiks etykiety**: opcjonalny tekst dodawany przed każdą etykietą, np. "A-", aby uzyskać etykiety A-1, A-2, A-3.
- **Wartość początkowa**: liczba, od której zaczyna się numeracja. Domyślnie 1. Ustaw 0 dla numeracji od zera.
- **Kontynuuj numerację w rozłącznych zakresach**: włącz, gdy reguła obejmuje strony nieciągłe (jak `1-9,30-40` lub `odd`), a chcesz, by numeracja biegła dalej po kolei.
- **Usuń istniejące etykiety stron**: domyślnie zaznaczone. Czyści wszelkie poprzednie etykiety przed zastosowaniem nowych reguł.

## Funkcje

- Wiele reguł etykiet na dokument dla złożonych schematów numeracji
- Sześć stylów etykiet obejmujących wszystkie standardowe systemy numeracji
- Własny prefiks do etykietowania według sekcji
- Obsługa rozłącznych zakresów z numeracją ciągłą
- Możliwość zachowania lub usunięcia istniejących etykiet

## Przypadki użycia

- Ustawianie etykiet cyframi rzymskimi (i, ii, iii) dla przedmowy książki i dziesiętnych dla tekstu głównego
- Etykietowanie stron aneksów prefiksami literowymi, takimi jak "A-1", "A-2", "B-1", "B-2"
- Poprawianie etykiet stron w zeskanowanym dokumencie, w którym fizyczne numery stron nie zgadzają się z kolejnością stron PDF
- Dodawanie numeracji od zera w dokumentach technicznych

## Wskazówki

- Etykiety stron to metadane, które przeglądarki PDF wyświetlają na pasku nawigacji. Nie są drukowane na samej stronie. Dla widocznych numerów użyj narzędzia [Numery stron](./page-numbers).
- To narzędzie wymaga skonfigurowania CoherentPDF (CPDF) w ustawieniach WASM. Jeśli nie jest skonfigurowany, zostaniesz poproszony o konfigurację.

## Powiązane narzędzia

- [Numery stron](./page-numbers)
- [Numeracja Batesa](./bates-numbering)
- [Edytuj zakładki](./bookmark)
