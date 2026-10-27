---
title: Edytuj zakładki
description: Dodawaj, edytuj, importuj, eksportuj i usuwaj zakładki PDF w edytorze wizualnym z obsługą CSV i JSON.
---

# Edytuj zakładki

Edytor zakładek daje pełną kontrolę nad zakładkami nawigacyjnymi PDF (nazywanymi też konspektem). Możesz dodawać nowe zakładki, edytować istniejące, zmieniać hierarchię oraz importować i eksportować dane zakładek w formatach CSV i JSON.

## Jak to działa

1. Prześlij plik PDF, klikając lub przeciągając go do strefy upuszczania.
2. Opcjonalnie zaznacz **Automatycznie wyodrębnij istniejące zakładki**, aby wczytać bieżące drzewo zakładek dokumentu.
3. Edytor otworzy się w widoku podzielonym: przeglądarka PDF po lewej, panel zakładek po prawej.
4. Wpisz tytuł zakładki i kliknij **Dodaj do strony**, aby utworzyć zakładkę wskazującą bieżącą stronę.
5. Użyj przycisków na pasku narzędzi, aby zmieniać kolejność, stylizować lub usuwać zakładki.
6. Kliknij **Zapisz PDF z zakładkami**, aby pobrać zaktualizowany plik.

## Funkcje

- Wizualna przeglądarka PDF z nawigacją po stronach, sterowaniem powiększeniem i polem przejścia do strony
- Dodawanie zakładek do dowolnej strony jednym kliknięciem
- Kliknięcie bezpośrednio na PDF, aby ustawić dokładne miejsce docelowe zakładki (tryb wskazywania)
- Zagnieżdżona hierarchia zakładek ze zmianą kolejności przez przeciąganie
- Operacje zbiorcze: zaznacz wiele zakładek, aby zmienić kolor, styl lub usunąć je naraz
- Wyszukiwanie zakładek do szybkiego znajdowania wpisów w dużych drzewach
- Cofanie i ponawianie wszystkich zmian
- Import zakładek z plików CSV (tytuł, strona, poziom) lub JSON
- Eksport zakładek do CSV lub JSON w celu edycji zewnętrznej
- Stylizacja zakładek: kolor (czerwony, niebieski, zielony, żółty, fioletowy) i styl czcionki (pogrubiony, kursywa, pogrubiona kursywa)
- Szybka nawigacja: przewijanie stron klawiszami Page Up/Page Down

## Opcje

- **Automatycznie wyodrębnij istniejące zakładki**: po zaznaczeniu narzędzie odczytuje i wyświetla bieżące zakładki PDF po wczytaniu.
- **Tryb wsadowy**: przełącz, aby zaznaczyć wiele zakładek i zastosować zbiorczo kolor, styl lub usuwanie.
- **Rozwiń/zwiń wszystko**: szybko pokazuje lub ukrywa zagnieżdżone zakładki podrzędne.

## Zastosowania

- Dodawanie spisu treści do podręcznika lub instrukcji bez zakładek
- Przebudowa zakładek w zeskanowanym dokumencie po OCR
- Eksport zakładek do CSV, edycja w arkuszu kalkulacyjnym i ponowny import
- Porządkowanie automatycznie wygenerowanych zakładek z błędnymi odwołaniami do stron
- Dodawanie kolorowych zakładek oznaczających ważne sekcje w piśmie prawnym

## Wskazówki

- Użyj importu CSV do masowego tworzenia zakładek. Format jest prosty: `title,page,level`, gdzie poziom 1 oznacza najwyższy poziom.
- Tryb wskazywania pozwala kliknąć dokładne miejsce na stronie PDF jako cel zakładki, co jest precyzyjniejsze niż samo wskazanie numeru strony.
- Wyeksportuj zakładki przed większymi zmianami, aby mieć kopię zapasową.

## Powiązane narzędzia

- [Spis treści](./table-of-contents)
- [Edytor PDF](./edit-pdf)
- [Dodaj etykiety stron](./add-page-labels)
