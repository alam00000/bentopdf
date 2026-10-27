---
title: CBZ na PDF
description: Konwertuj archiwa komiksów CBZ i CBR na PDF w przeglądarce. Za darmo, prywatnie, bez wysyłania plików.
---

# CBZ na PDF

Zamień archiwa komiksów na pliki PDF. CBZ i CBR to standardowe formaty komiksów cyfrowych: są to po prostu archiwa ZIP lub RAR wypełnione obrazami. To narzędzie wyodrębnia każdą stronę, zachowuje kolejność czytania i tworzy czysty PDF, w którym każdy obraz staje się stroną w pełnym rozmiarze.

## Obsługiwane formaty

| Format | Rozszerzenie | Uwagi                                                                |
| :----- | :----------- | :------------------------------------------------------------------- |
| CBZ    | `.cbz`       | Archiwum komiksu oparte na ZIP (przetwarzane lokalnie przez pdf-lib) |
| CBR    | `.cbr`       | Archiwum komiksu oparte na RAR (przetwarzane przez silnik PyMuPDF)   |

Konwerter CBZ rozpoznaje obrazy JPEG, PNG, GIF, BMP, WebP, AVIF, TIFF, HEIC i JXL w archiwum. Niestandardowe formaty są automatycznie konwertowane do PNG przed osadzeniem.

## Jak to działa

1. Kliknij obszar przesyłania lub przeciągnij i upuść pliki CBZ lub CBR. W jednej partii możesz mieszać oba formaty.
2. Przejrzyj listę plików. Usuń zbędne lub kliknij **Dodaj więcej plików**, aby dodać kolejne.
3. Kliknij **Konwertuj na PDF**. W przypadku plików CBZ narzędzie rozpakowuje archiwum, sortuje pliki obrazów po nazwie w porządku naturalnym, wykrywa rzeczywisty format każdego obrazu i osadza je w PDF za pomocą pdf-lib. Pliki CBR są zamiast tego przetwarzane przez silnik PyMuPDF.
4. Pojedynczy plik pobiera się jako PDF. Wiele plików daje archiwum ZIP o nazwie `comic-converted.zip`.

## Opcje

Nie jest wymagana żadna konfiguracja. Każdy obraz staje się stroną dopasowaną do oryginalnych wymiarów, więc rozkładówki pozostają szerokie, a pojedyncze strony wąskie.

## Zastosowania

- Czytanie komiksów na tablecie lub w aplikacji na telefonie, która obsługuje PDF, ale nie CBZ/CBR
- Drukowanie wybranych stron komiksu cyfrowego
- Archiwizacja kolekcji komiksów w formacie, który otworzy każda przeglądarka plików
- Udostępnianie komiksu osobie, która nie ma dedykowanego czytnika komiksów

## Wskazówki

- Obrazy w archiwum są sortowane w porządku naturalnym (więc `page2.jpg` jest przed `page10.jpg`). Nazywaj pliki ze spójną numeracją, aby kolejność stron była prawidłowa.
- Konwerter wykrywa formaty obrazów po sygnaturach binarnych, a nie po rozszerzeniach plików. PNG omyłkowo nazwany `.jpg` zostanie osadzony poprawnie.
- Pliki CBZ są przetwarzane w całości w przeglądarce bez ładowania silnika PyMuPDF, więc konwertują się szybciej niż pliki CBR.

## Powiązane narzędzia

- [EPUB na PDF](./epub-to-pdf)
- [MOBI na PDF](./mobi-to-pdf)
- [Obrazy do PDF](./image-to-pdf)
