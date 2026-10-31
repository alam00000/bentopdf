---
title: Nagłówek i stopka
description: Dodawaj własny tekst nagłówka i stopki na stronach PDF z dynamicznymi zmiennymi numeru strony.
---

# Nagłówek i stopka

Dodaj tekst w sześciu miejscach na stronach PDF: nagłówek po lewej, nagłówek na środku, nagłówek po prawej, stopka po lewej, stopka na środku i stopka po prawej. Narzędzie obsługuje dynamiczne zmienne numeru strony i łącznej liczby stron, więc możesz tworzyć szablony typu "Strona 3 z 10", które aktualizują się automatycznie na każdej stronie.

## Jak to działa

1. Prześlij plik PDF.
2. Pojawi się panel opcji z kontrolkami formatowania i sześcioma polami tekstowymi.
3. Wpisz żądany tekst w dowolnym miejscu nagłówka lub stopki.
4. Użyj symboli zastępczych `{page}` i `{total}` do dynamicznej numeracji stron.
5. Dostosuj rozmiar i kolor czcionki oraz opcjonalnie ogranicz zakres do określonych stron.
6. Kliknij **Dodaj nagłówek i stopkę**, aby przetworzyć i pobrać plik.

## Opcje

- **Zakres stron**: opcjonalnie ogranicz, które strony dostają nagłówki i stopki. Zostaw puste, aby zastosować do wszystkich stron. Format: "1-3, 5" (zakresy oddzielone przecinkami).
- **Rozmiar czcionki**: od 6 do 24 punktów. Domyślnie 10.
- **Kolor czcionki**: wybierz dowolny kolor selektorem kolorów.
- **Nagłówek po lewej / na środku / po prawej**: pola tekstowe dla górnej części każdej strony.
- **Stopka po lewej / na środku / po prawej**: pola tekstowe dla dolnej części każdej strony.

## Funkcje

- Sześć niezależnych miejsc na tekst na każdej stronie
- Dynamiczna zmienna `{page}` wstawiająca numer bieżącej strony
- Dynamiczna zmienna `{total}` wstawiająca łączną liczbę stron
- Filtrowanie zakresu stron, aby objąć tylko wybrane strony
- Własny rozmiar i kolor czcionki
- Czcionka Helvetica dla czystego, profesjonalnego wyglądu

## Zastosowania

- Dodanie "Strona {page} z {total}" na środku stopki raportu
- Umieszczenie nazwy firmy w nagłówku po lewej i daty dokumentu w nagłówku po prawej
- Dodawanie klauzul poufności w stopce dokumentów prawnych
- Oznaczanie numerów rewizji dokumentu na wybranych zakresach stron

## Wskazówki

- Połącz `{page}` i `{total}` w jednym polu, aby uzyskać formaty takie jak "Strona {page} z {total}" lub "{page}/{total}".
- Większość pól możesz zostawić pustych i wypełnić tylko potrzebne miejsca. Puste pola są po prostu pomijane.
- W przypadku bardziej złożonych nagłówków z obrazami lub logo rozważ użycie narzędzia [Dodaj znak wodny](./add-watermark) ustawionego u góry strony.

## Powiązane narzędzia

- [Numery stron](./page-numbers)
- [Dodaj znak wodny](./add-watermark)
- [Numeracja Batesa](./bates-numbering)
