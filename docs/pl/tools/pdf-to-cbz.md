---
title: PDF na CBZ
description: Konwertuj PDF na plik CBZ (Comic Book Archive) dla czytników komiksów, takich jak Komga, Kavita, CDisplayEx i Calibre.
---

# PDF na CBZ

Konwertuje PDF na plik CBZ (Comic Book ZIP), standardowy format cyfrowych komiksów i mangi. Każda strona PDF staje się obrazem w archiwum. Narzędzie generuje metadane w trzech formatach dla maksymalnej zgodności: ComicInfo.xml, metadata.opf i ComicBookInfo JSON.

## Jak to działa

1. Prześlij plik PDF, klikając strefę upuszczania lub przeciągając na nią plik.
2. Wybierz format obrazu, jakość, skalę i opcjonalne metadane.
3. Kliknij **Konwertuj**, aby wygenerować plik CBZ.
4. Plik `.cbz` pobiera się automatycznie.

## Opcje

| Opcja           | Wartości        | Domyślnie | Opis                                                                                                |
| --------------- | --------------- | --------- | --------------------------------------------------------------------------------------------------- |
| Format obrazu   | JPEG, PNG, WebP | JPEG      | JPEG dla kolorowych komiksów, PNG dla czarno-białej mangi bez strat, WebP dla najlepszej kompresji. |
| Jakość          | 50–100%         | 85%       | Steruje kompresją JPEG/WebP. Ukryta dla PNG (zawsze bez strat).                                     |
| Skala           | 1.0x–4.0x       | 2.0x      | Wyższa skala daje ostrzejsze obrazy na ekranach o wysokiej rozdzielczości.                          |
| Skala szarości  | Wł./Wył.        | Wył.      | Konwertuje strony na skalę szarości. Zmniejsza rozmiar pliku dla treści czarno-białych.             |
| Tryb mangi      | Wł./Wył.        | Wył.      | Ustawia w metadanych kierunek czytania od prawej do lewej.                                          |
| Dołącz metadane | Wł./Wył.        | Wł.       | Osadza ComicInfo.xml, metadata.opf i ComicBookInfo JSON.                                            |

## Pola metadanych

Gdy metadane są włączone, możesz wypełnić:

- **Tytuł**: wykrywany automatycznie z nazwy pliku PDF.
- **Seria**: nazwa serii (np. "Naruto").
- **Numer (#)**: numer wydania w serii.
- **Tom (Vol.)**: numer tomu.
- **Autor(zy)**: nazwa scenarzysty lub twórcy.
- **Wydawca**: firma wydawnicza.
- **Tagi / Gatunek**: tagi oddzielone przecinkami (np. "Akcja, Przygoda").
- **Rok wydania**: rok publikacji (1900–2100).
- **Ocena**: ocena społeczności od 0 do 5.

## Zgodność metadanych

Narzędzie zapisuje metadane w trzech formatach, aby każdy czytnik mógł je znaleźć:

| Format             | Lokalizacja         | Obsługiwany przez                           |
| ------------------ | ------------------- | ------------------------------------------- |
| ComicInfo.xml      | Plik wewnątrz ZIP   | Komga, Kavita, CDisplayEx, Mylar, ComicRack |
| metadata.opf       | Plik wewnątrz ZIP   | Calibre                                     |
| ComicBookInfo JSON | Pole komentarza ZIP | Calibre (zapasowo)                          |

## Format wyjściowy

- `filename.cbz`: archiwum ZIP zawierające ponumerowane obrazy stron i pliki metadanych.

Obrazy stron mają nazwy z numerami uzupełnionymi zerami (`01.jpg`, `02.jpg` itd.), aby czytniki wyświetlały je we właściwej kolejności.

## Przypadki użycia

- Konwertowanie PDF z mangą lub komiksami do użytku w czytnikach komiksów.
- Budowanie cyfrowej biblioteki komiksów w Komga, Kavita lub Calibre.
- Konwertowanie zeskanowanych komiksów do formatu przyjaznego czytnikom.
- Udostępnianie komiksów w formacie zachowującym kierunek czytania i metadane.

## Wskazówki

- Użyj **JPEG** dla kolorowych komiksów i **PNG** dla czarno-białej mangi, ponieważ PNG bardzo efektywnie kompresuje treści czarno-białe.
- Włącz **Skalę szarości** dla mangi, aby znacząco zmniejszyć rozmiar pliku.
- Wypełnij pola **Seria** i **Numer**, aby menedżery bibliotek (Komga, Calibre) mogły automatycznie uporządkować Twoją kolekcję.
- **WebP** oferuje najlepszą kompresję, ale starsze czytniki komiksów mogą go nie obsługiwać.

## Powiązane narzędzia

- [PDF na JPG](./pdf-to-jpg)
- [PDF na PNG](./pdf-to-png)
- [PDF na TIFF](./pdf-to-tiff)
- [Wyodrębnij obrazy](./extract-images)
