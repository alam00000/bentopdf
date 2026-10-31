---
title: ODT na PDF
description: Konwertuj pliki OpenDocument Text (ODT) na PDF w przeglądarce za pomocą silnika opartego na LibreOffice.
---

# ODT na PDF

Konwertuj pliki OpenDocument Text na PDF. ODT to natywny format LibreOffice Writer, Apache OpenOffice i innych otwartych edytorów tekstu. To narzędzie używa działającego w przeglądarce silnika LibreOffice, aby uzyskać dokładne konwersje zachowujące formatowanie, tabele, obrazy i style.

## Obsługiwane formaty

| Format            | Rozszerzenia |
| :---------------- | :----------- |
| OpenDocument Text | `.odt`       |

## Jak to działa

1. Kliknij obszar przesyłania lub przeciągnij i upuść jeden lub więcej plików ODT.
2. Przejrzyj listę plików. Dodaj kolejne pliki lub usuń niepotrzebne.
3. Kliknij **Konwertuj na PDF**. Silnik LibreOffice inicjalizuje się (wskaźnik postępu pokazuje stan ładowania), a następnie każdy plik jest konwertowany.
4. Pojedynczy plik pobiera się bezpośrednio jako PDF. Wiele plików jest pakowanych do `odt-converted.zip`.

## Opcje

To narzędzie nie ma dodatkowej konfiguracji. Konwersja zachowuje formatowanie oryginalnego dokumentu możliwie wiernie.

## Wynik

| Liczba plików | Wynik                                                             |
| :------------ | :---------------------------------------------------------------- |
| 1 plik        | Pobranie pojedynczego PDF (np. `document.pdf`)                    |
| 2+ plików     | Archiwum ZIP (`odt-converted.zip`) z jednym PDF dla każdego pliku |

## Przypadki użycia

- Konwertowanie dokumentów z LibreOffice Writer na PDF w celu udostępnienia użytkownikom Microsoft Office
- Tworzenie gotowych do druku plików PDF z prac naukowych napisanych w formacie OpenDocument
- Zbiorcza konwersja folderu szablonów ODT na pliki PDF do dystrybucji
- Generowanie plików PDF z plików ODT tworzonych przez zautomatyzowane systemy generowania dokumentów

## Wskazówki

- Silnik LibreOffice ładuje się przy pierwszym użyciu i jest buforowany dla kolejnych konwersji. Pierwsze ładowanie trwa kilka sekund, potem konwersje są szybkie.
- Złożone dokumenty z osadzonymi obiektami OLE lub nietypowymi czcionkami mogą wyglądać nieco inaczej niż w LibreOffice na komputerze. Przed konwersją zbiorczą przetestuj próbkę.
- W przypadku dokumentów Word (`.doc`, `.docx`) użyj zamiast tego narzędzia [Word na PDF](./word-to-pdf), które również korzysta z silnika LibreOffice, ale bezpośrednio przyjmuje formaty Microsoft.

## Powiązane narzędzia

- [Word na PDF](./word-to-pdf)
- [RTF na PDF](./rtf-to-pdf)
- [Tekst na PDF](./txt-to-pdf)
