---
title: Numeracja Batesa
description: Nanoś numery Batesa na jeden lub wiele plików PDF z konfigurowalnymi szablonami, dopełnieniem, czcionkami i pozycją.
---

# Numeracja Batesa

Numeracja Batesa nanosi kolejne identyfikatory na każdą stronę Twoich plików PDF. To standardowa metoda oznaczania dokumentów w postępowaniach prawnych, audytach i procesach zgodności. To narzędzie obsługuje wiele plików, konfigurowalne szablony i tworzy osobno ponumerowane pliki PDF lub jedno archiwum ZIP.

## Jak to działa

1. Wgraj jeden lub więcej plików PDF. Możesz przeciągnąć wiele plików naraz.
2. Wybierz gotowy styl lub utwórz własny szablon.
3. Skonfiguruj pozycję, czcionkę, rozmiar, kolor i numery początkowe.
4. Kliknij **Zastosuj numery Batesa**, aby przetworzyć.
5. Pojedynczy plik pobierze się bezpośrednio. Wiele plików pobierze się jako archiwum ZIP.

## Opcje

- **Gotowy styl**: wybierz jeden z wbudowanych formatów:
  - Exhibit + Case + Bates + Page (np. "Exhibit 1 Case XYZ 000001 Page 1")
  - Exhibit + Case + Bates (bez numeru strony)
  - Case + Bates
  - Tylko numer Batesa (np. "000001")
  - Własny (napisz własny szablon)
- **Dostosuj styl**: ciąg szablonu z symbolami zastępczymi: `[BATES]`, `[PAGE]`, `[FILE]`, `[FILENAME]`.
- **Dopełnienie numeru Batesa**: liczba cyfr (od 3 do 6) dla numerów Batesa dopełnionych zerami. Widoczne tylko w trybie własnym.
- **Pozycja**: nagłówek lub stopka, lewo, środek lub prawo.
- **Numer Batesa zaczyna się od**: pierwszy numer Batesa. Domyślnie 1. Numeracja jest kontynuowana między plikami.
- **Licznik plików zaczyna się od**: numer początkowy dla symbolu `[FILE]`.
- **Czcionka**: Helvetica, Times New Roman lub Courier.
- **Rozmiar czcionki**: rozmiar nanoszonego tekstu.
- **Kolor**: próbnik koloru dla tekstu numeru Batesa.

## Funkcje

- Podgląd na żywo pokazujący, jak numery Batesa pojawią się we wszystkich wgranych plikach
- Obsługa wielu plików z ciągłą numeracją między dokumentami
- Zmiana kolejności plików metodą przeciągnij i upuść, aby sterować sekwencją numeracji
- Sześć opcji pozycji (nagłówek/stopka, lewo/środek/prawo)
- Adaptacyjne obliczanie marginesów uwzględniające różne rozmiary stron
- Wynik ZIP dla partii wielu plików
- Symbole zastępcze w szablonie dla maksymalnej elastyczności

## Przypadki użycia

- Numerowanie dokumentów ujawnienia w sporach sądowych kolejnymi numerami dowodów
- Numerowanie pakietów dowodów z audytu obejmujących dziesiątki plików
- Nanoszenie numerów referencyjnych na dokumentację zgodności
- Etykietowanie załączników do zgłoszeń patentowych identyfikatorami przypisanymi do sprawy

## Wskazówki

- Przeciągnij pliki na liście, aby zmienić ich kolejność przed przetwarzaniem. Sekwencja numeracji Batesa podąża za tą kolejnością.
- Użyj symbolu `[FILENAME]`, aby dołączyć oryginalną nazwę pliku do nanoszonego tekstu, co pomaga powiązać strony z dokumentami źródłowymi.
- Pole podglądu aktualizuje się w czasie rzeczywistym przy zmianie ustawień, więc możesz sprawdzić format przed przetwarzaniem.

## Powiązane narzędzia

- [Numery stron](./page-numbers)
- [Dodaj etykiety stron](./add-page-labels)
- [Nagłówek i Stopka](./header-footer)
