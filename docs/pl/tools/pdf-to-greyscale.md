---
title: PDF na odcienie szarości
description: Konwertuj kolorowy PDF na wersję w odcieniach szarości (czarno-białą). Tworzy nowy PDF ze wszystkimi kolorami usuniętymi z każdej strony.
---

# PDF na odcienie szarości

Konwertuje kolorowy PDF na wersję w odcieniach szarości. Każda strona jest renderowana, pozbawiana nasycenia i osadzana ponownie jako obraz JPEG w nowym PDF. Wynik zachowuje oryginalne wymiary stron.

## Jak to działa

1. Prześlij plik PDF, klikając strefę upuszczania lub przeciągając na nią plik.
2. Kliknij **Konwertuj**, aby przetworzyć plik.
3. Nowy plik `greyscale.pdf` pobiera się ze wszystkimi stronami przekonwertowanymi na czarno-białe.

Pod spodem każda strona jest renderowana w skali 2x, dane pikseli przechodzą przez filtr odcieni szarości, następnie są ponownie kodowane jako JPEG o jakości 90% i umieszczane w nowym dokumencie PDF.

## Opcje

To narzędzie nie ma konfigurowalnych opcji. Konwersja do odcieni szarości używa standardowego wzoru luminancji, a jakość JPEG jest stała i wynosi 90%.

## Format wyjściowy

- Pojedynczy plik `greyscale.pdf` zawierający wszystkie strony jako obrazy JPEG w odcieniach szarości.

## Przypadki użycia

- Przygotowywanie dokumentów do druku czarno-białego, aby oszczędzić na kolorowym tuszu.
- Spełnianie wymogów dotyczących składania dokumentów prawnych lub urzędowych, które wymagają odcieni szarości.
- Zmniejszanie rozmiaru plików PDF z dużą ilością koloru (obrazy JPEG w odcieniach szarości są mniejsze niż kolorowe).
- Tworzenie spójnego stylu wizualnego dokumentów z mieszanymi stronami kolorowymi i czarno-białymi.

## Wskazówki

- Ponieważ każda strona jest rasteryzowana i osadzana ponownie jako JPEG, wynik jest oparty na obrazach. Tekst z oryginalnego PDF nie będzie już zaznaczalny ani przeszukiwalny. Jeśli potrzebujesz potem przeszukiwalnego tekstu, przepuść wynik przez narzędzie OCR.
- Aby mieć większą kontrolę nad korektą kolorów (jasność, kontrast, nasycenie), skorzystaj z narzędzia Dostosuj kolory lub węzła Greyscale w [Kreator przepływów PDF](./pdf-workflow).

## Powiązane narzędzia

- [PDF na JPG](./pdf-to-jpg)
- [PDF na PNG](./pdf-to-png)
- [Kreator przepływów PDF](./pdf-workflow)
