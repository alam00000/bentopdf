---
title: Naprzemienne i mieszane strony
description: Łącz pliki PDF, przeplatając strony z każdego pliku w naprzemiennej kolejności, z zachowaniem zakładek.
---

# Naprzemienne i mieszane strony

Przeplataj strony z wielu plików PDF tak, aby strony występowały naprzemiennie między dokumentami. To narzędzie wybierzesz, gdy zwykłe łączenie dokleiłoby pliki jeden za drugim, a potrzebujesz strony 1 z pliku A, potem strony 1 z pliku B, potem strony 2 z pliku A i tak dalej.

## Jak to działa

1. Wgraj co najmniej dwa pliki PDF za pomocą strefy upuszczania.
2. Narzędzie wyświetli każdy plik z liczbą stron i rozmiarem.
3. Przeciągaj uchwyty, aby zmienić kolejność, czyj plik zaczyna sekwencję przeplatania.
4. Kliknij **Wymieszaj strony**, aby utworzyć przeplatany wynik.
5. Wynik zostanie pobrany jako `alternated-mixed.pdf`.

## Funkcje

- Przeplata strony z dowolnej liczby plików PDF (minimum dwa)
- Zmiana kolejności plików metodą przeciągnij i upuść, aby sterować priorytetem przeplatania
- Zachowuje zakładki z dokumentów źródłowych
- Wyświetla liczbę stron i rozmiar każdego wgranego pliku
- Przetwarza w dedykowanym web workerze, dzięki czemu interfejs pozostaje responsywny

## Przypadki użycia

- Składanie skanów dwustronnych, gdy strony nieparzyste i parzyste zeskanowano osobno
- Łączenie arkuszy z pytaniami z kluczami odpowiedzi, tak by po każdym pytaniu następowała odpowiedź
- Łączenie dokumentów w dwóch językach strona po stronie (np. angielski po jednej stronie, tłumaczenie na następnej)
- Przeplatanie skanów awersu i rewersu z skanera jednostronnego

## Wskazówki

- Jeśli źródłowe pliki PDF mają różną liczbę stron, strony krótszego dokumentu skończą się pierwsze, a pozostałe strony dłuższego pojawią się na końcu.
- Kolejność plików ma znaczenie: pierwszy plik na liście wnosi pierwszą stronę wyniku. W razie potrzeby przeciągnij, aby zmienić kolejność.

## Powiązane narzędzia

- [Połącz PDF](./merge-pdf)
- [Duplikuj i organizuj](./organize-pdf)
- [Podziel PDF](./split-pdf)
