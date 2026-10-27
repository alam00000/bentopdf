---
title: HEIC na PDF
description: Konwertuj obrazy HEIC i HEIF z iPhone'ów i iPadów na PDF bezpośrednio w przeglądarce.
---

# HEIC na PDF

Konwertuj obrazy HEIC/HEIF na PDF. HEIC to domyślny format zdjęć na iPhone'ach i iPadach od iOS 11. To narzędzie pozwala zamienić te zdjęcia w PDF-y bez instalowania programów na komputerze i bez wysyłania plików na serwer.

## Obsługiwane formaty

| Format | Rozszerzenia |
| :----- | :----------- |
| HEIC   | `.heic`      |
| HEIF   | `.heif`      |

## Jak to działa

1. Kliknij obszar przesyłania lub przeciągnij i upuść pliki HEIC/HEIF.
2. Sprawdź listę plików i usuń niepotrzebne.
3. Kliknij **Konwertuj na PDF**. Wynik zostanie pobrany jako `from_heic.pdf`.

Każdy plik HEIC jest dekodowany biblioteką heic2any, która konwertuje go do PNG w jakości 92%. Następnie PNG jest osadzany w PDF za pomocą pdf-lib, a każdy obraz trafia na osobną stronę w pełnej rozdzielczości.

## Opcje

To narzędzie nie udostępnia dodatkowych ustawień. Obrazy HEIC są przed osadzeniem konwertowane do PNG w wysokiej jakości (0,92).

## Zastosowania

- Tworzenie PDF-a ze zdjęć z iPhone'a do załączenia do zgłoszenia ubezpieczeniowego lub raportu
- Zamiana zdjęć HEIC z oferty nieruchomości w jeden dokument do wydruku
- Zamiana zrzutów ekranu z iPada (format HEIF) w PDF do udostępnienia
- Zbiorcza konwersja zdjęć z wakacji do dziennika podróży

## Wskazówki

- Dekodowanie HEIC odbywa się w całości w przeglądarce przy użyciu WebAssembly. Pierwsza konwersja może chwilę potrwać, gdy ładuje się dekoder.
- Jeśli chcesz połączyć HEIC z innymi formatami obrazów (JPG, PNG itd.), użyj narzędzia [Obrazy do PDF](./image-to-pdf), które obsługuje HEIC razem ze wszystkimi innymi formatami.
- Pliki HEIC z iPhone'ów często zawierają dane EXIF, w tym współrzędne GPS. Wynikowy PDF nie przenosi tych metadanych.

## Powiązane narzędzia

- [Obrazy do PDF](./image-to-pdf)
- [JPG na PDF](./jpg-to-pdf)
- [PNG na PDF](./png-to-pdf)
