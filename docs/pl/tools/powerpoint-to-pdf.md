---
title: PowerPoint na PDF
description: Konwertuj prezentacje PowerPoint (PPT, PPTX) i pliki ODP na PDF z zachowaniem formatowania slajdów.
---

# PowerPoint na PDF

Konwertuj pliki prezentacji na PDF. Każdy slajd staje się stroną w dokumencie wynikowym, a tekst, obrazy, kształty i przejścia są renderowane przez działający w przeglądarce silnik LibreOffice. Obsługiwane są zarówno nowe, jak i starsze formaty PowerPoint oraz format OpenDocument Presentation.

## Obsługiwane formaty

| Format                    | Rozszerzenia |
| :------------------------ | :----------- |
| PowerPoint (nowy)         | `.pptx`      |
| PowerPoint (starszy)      | `.ppt`       |
| OpenDocument Presentation | `.odp`       |

## Jak to działa

1. Kliknij obszar wgrywania lub przeciągnij i upuść pliki prezentacji.
2. Przejrzyj listę plików. Dodaj kolejne lub usuń zbędne.
3. Kliknij **Konwertuj na PDF**. Silnik LibreOffice ładuje się przy pierwszym użyciu, a następnie konwertuje każdy plik.
4. Pojedynczy plik pobiera się bezpośrednio jako PDF. Wiele plików jest pakowanych do `powerpoint-converted.zip`.

## Opcje

To narzędzie nie ma dodatkowych ustawień. Slajdy są renderowane w swoich natywnych wymiarach.

## Wynik

| Liczba plików | Wynik                                                                     |
| :------------ | :------------------------------------------------------------------------ |
| 1 plik        | Pobranie pojedynczego PDF (oryginalna nazwa pliku z rozszerzeniem `.pdf`) |
| 2+ pliki      | Archiwum ZIP (`powerpoint-converted.zip`) zawierające jeden PDF na plik   |

## Zastosowania

- Konwersja prezentacji na PDF przed udostępnieniem odbiorcom, którzy mogą nie mieć PowerPointa
- Tworzenie drukowalnej wersji slajdów jako materiału na konferencję lub warsztaty
- Archiwizowanie prezentacji w formacie wyglądającym identycznie na każdym urządzeniu
- Wsadowa konwersja biblioteki prezentacji ODP z LibreOffice Impress na PDF
- Przygotowanie wersji PDF prezentacji dla inwestorów jako załącznika do e-maila

## Wskazówki

- Animacje i przejścia slajdów nie są odwzorowywane w PDF. Każdy slajd jest zapisywany jako statyczna strona.
- Osadzone filmy nie pojawią się w wyniku. W razie potrzeby zastąp je zrzutem ekranu lub obrazem zastępczym.
- Notatki prelegenta nie są uwzględniane w domyślnym eksporcie PDF. Jeśli potrzebujesz notatek, najpierw wyeksportuj plik z natywnego widoku "Drukuj notatki" w PowerPoincie.
- Silnik LibreOffice jest buforowany po pierwszym załadowaniu, więc konwersja drugiej prezentacji w tej samej sesji jest znacznie szybsza.

## Powiązane narzędzia

- [Word na PDF](./word-to-pdf)
- [Excel na PDF](./excel-to-pdf)
- [Obrazy do PDF](./image-to-pdf)
