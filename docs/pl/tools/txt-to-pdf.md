---
title: Tekst na PDF
description: Konwertuj zwykłe pliki tekstowe lub wpisany tekst na PDF z własnymi czcionkami, kolorami i rozmiarami stron.
---

# Tekst na PDF

Konwertuj zwykły tekst na sformatowany PDF. Możesz wgrać pliki `.txt` lub wpisywać bezpośrednio we wbudowanym edytorze tekstu. Narzędzie obsługuje wiele czcionek, własne kolory tekstu i szeroki wybór rozmiarów stron: od A0 do A10, a także US Letter, Legal i Tabloid.

## Obsługiwane formaty

| Dane wejściowe        | Rozszerzenia               |
| :-------------------- | :------------------------- |
| Zwykłe pliki tekstowe | `.txt`                     |
| Bezpośrednie wpisanie | Wpisz lub wklej w edytorze |

## Jak to działa

1. Wybierz tryb wprowadzania przełącznikiem u góry: **Wgraj pliki** lub **Wpisz tekst**.
2. Jeśli wgrywasz, przeciągnij i upuść lub kliknij, aby wybrać jeden lub więcej plików `.txt`. Jeśli wpisujesz, wprowadź tekst bezpośrednio w polu tekstowym.
3. Skonfiguruj opcje formatowania: rodzinę czcionek, rozmiar czcionki, kolor tekstu i rozmiar strony.
4. Kliknij **Utwórz PDF**. Wynik pobiera się jako `text_to_pdf.pdf`.

Przy wgrywaniu wielu plików ich zawartość jest łączona z pustymi wierszami między nimi.

## Opcje

| Opcja                | Wartości                                                                                   | Domyślnie        |
| :------------------- | :----------------------------------------------------------------------------------------- | :--------------- |
| **Rodzina czcionek** | Helvetica (bezszeryfowa), Tiro (szeryfowa), Courier (stałej szerokości), Times (szeryfowa) | Helvetica        |
| **Rozmiar czcionki** | 6 -- 72 pt                                                                                 | 12               |
| **Kolor tekstu**     | Dowolny kolor z selektora                                                                  | Czarny (#000000) |
| **Rozmiar strony**   | ISO A0--A10, B0--B10, C0--C10, US Letter, Legal, Tabloid, Ledger, 11x17                    | A4               |

Języki pisane od prawej do lewej (arabski, hebrajski, perski, urdu) są wykrywane automatycznie. Po wykryciu tekstu RTL kierunek tekstu i wyrównanie zmieniają się odpowiednio.

## Zastosowania

- Konwersja fragmentów kodu lub plików dziennika na drukowalny PDF czcionką Courier
- Szybkie utworzenie PDF z notatek ze spotkania wpisanych na bieżąco
- Formatowanie manuskryptu w zwykłym tekście określoną czcionką i rozmiarem strony do zgłoszenia
- Przygotowanie wersji PDF pliku README lub dziennika zmian do dystrybucji offline

## Wskazówki

- Użyj trybu **Wpisz tekst**, gdy chcesz szybko skonwertować zawartość schowka bez wcześniejszego zapisywania jej jako pliku.
- Courier (stałej szerokości) to najlepszy wybór czcionki dla kodu, dzienników lub dowolnej zawartości, w której ważne jest wyrównanie kolumn.
- Marginesy strony są stałe i wynoszą 72 punkty (1 cal) z każdej strony.

## Powiązane narzędzia

- [Markdown na PDF](./markdown-to-pdf)
- [CSV na PDF](./csv-to-pdf)
- [Word na PDF](./word-to-pdf)
