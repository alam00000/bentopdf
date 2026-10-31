---
title: Usuń puste strony
description: Automatycznie wykrywaj i usuwaj puste lub prawie puste strony z PDF z regulowaną czułością.
---

# Usuń puste strony

Przeskanuj PDF w poszukiwaniu pustych lub prawie pustych stron i usuń je automatycznie. Narzędzie renderuje każdą stronę i analizuje zawartość pikseli, aby ustalić, czy jest pusta, a następnie pozwala potwierdzić, które strony usunąć, przed przetwarzaniem.

## Jak to działa

1. Wgraj plik PDF.
2. Dostosuj suwak **Czułość**, aby określić, jak ściśle definiowana jest "pustość".
3. Kliknij **Wykryj puste strony**, aby przeskanować dokument.
4. Narzędzie pokazuje miniatury wykrytych pustych stron do przejrzenia.
5. Potwierdź wybór i pobierz oczyszczony PDF bez pustych stron.

## Opcje

- **Czułość**: suwak od 0% do 100% (domyślnie 80%). Wyższe wartości są bardziej rygorystyczne i oznaczają tylko strony całkowicie lub prawie białe. Niższe wartości są bardziej tolerancyjne i wychwytują strony z minimalną zawartością, jak pojedyncza kropka lub blady znak wodny.

## Funkcje

- Analiza każdej strony na poziomie pikseli w celu wykrycia pustej zawartości
- Regulowany suwak czułości do precyzyjnego dostrojenia wykrywania
- Podgląd miniatur wykrytych pustych stron do ręcznej weryfikacji
- Zachowuje wszystkie niepuste strony dokładnie w niezmienionej postaci
- Obsługuje dokumenty o dowolnym rozmiarze i liczbie stron
- Informacja o postępie podczas skanowania

## Zastosowania

- Porządkowanie zeskanowanych dokumentów, w których skaner uchwycił puste odwrotki jednostronnych oryginałów
- Usuwanie stron rozdzielających z masowo skanowanych partii dokumentów
- Usuwanie pustych stron wstawianych przez systemy zarządzania dokumentami
- Porządkowanie PDF eksportowanych z edytorów tekstu, które czasem dodają puste strony na końcu
- Zmniejszanie rozmiaru pliku przez usunięcie niepotrzebnych pustych stron

## Wskazówki

- Zacznij od domyślnej czułości 80% i dostosowuj ją stąd. Jeśli narzędzie pomija strony, które wyglądają na puste, obniż czułość. Jeśli oznacza strony z lekką zawartością, którą chcesz zachować, podnieś ją.
- Narzędzie renderuje każdą stronę, aby przeanalizować jej zawartość, więc czas przetwarzania rośnie wraz z liczbą stron. Przy bardzo dużych dokumentach spodziewaj się krótkiego oczekiwania.
- Przejrzyj wykryte puste strony w podglądzie miniatur przed potwierdzeniem usunięcia. Strony z bladymi nagłówkami, stopkami lub znakami wodnymi mogą zostać oznaczone, zależnie od ustawień czułości.

## Powiązane narzędzia

- [Przytnij PDF](./crop-pdf)
- [Edytor PDF](./edit-pdf)
- [Numery stron](./page-numbers)
