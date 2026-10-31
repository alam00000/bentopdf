---
title: Efekt skanera
description: Spraw, by PDF wyglądał jak zeskanowany dokument, z regulowanym szumem, obrotem, rozmyciem i efektami starzenia papieru.
---

# Efekt skanera

Zamień czysty cyfrowy PDF w coś, co wygląda, jakby wyszło ze skanera płaskiego. Narzędzie stosuje konfigurowalny szum, lekki obrót, rozmycie, zmiany jasności i opcjonalne zażółcenie, aby symulować niedoskonałości fizycznego skanu.

## Jak to działa

1. Wgraj plik PDF.
2. Edytor otwiera się z podglądem na żywo pierwszej strony obok panelu ustawień.
3. Dostosuj parametry efektu skanowania za pomocą suwaków i przełączników.
4. Podgląd aktualizuje się w czasie rzeczywistym podczas zmiany ustawień.
5. Kliknij **Zastosuj**, aby przetworzyć wszystkie strony i pobrać wynik.

## Opcje

- **Przestrzeń barw (przełącznik odcieni szarości)**: konwertuje wynik na odcienie szarości dla klasycznego czarno-białego skanu.
- **Obramowanie**: dodaje subtelne ciemne obramowanie wokół krawędzi strony, imitując artefakty brzegowe skanera.
- **Obrót**: stosuje lekki obrót (od -5 do +5 stopni), symulując krzywe podanie papieru.
- **Zmienność obrotu**: dodaje losową zmienność kąta obrotu, tak aby każda strona była przechylona nieco inaczej.
- **Jasność**: przesuwa ogólną jasność w górę lub w dół.
- **Kontrast**: reguluje kontrast, symulując różnice w jakości tonera.
- **Rozmycie**: stosuje rozmycie Gaussa, aby zmiękczyć krawędzie tekstu jak w skanie niskiej jakości.
- **Szum**: dodaje losowy szum pikseli, symulując ziarno czujnika skanera. Wyższe wartości dają bardziej ziarnisty efekt.
- **Zażółcenie**: dodaje ciepły żółty odcień, symulując stary lub z recyklingu papier.
- **Rozdzielczość**: ustawia DPI wyniku. Niższe wartości dają bardziej spikselowany, skanopodobny wygląd.
- **Resetuj**: przywraca wszystkie ustawienia domyślne.

## Funkcje

- Podgląd w czasie rzeczywistym, aktualizowany przy każdej zmianie parametru
- Losowa zmienność obrotu dla każdej strony, dla realistycznych różnic
- Dziesięć niezależnie regulowanych parametrów
- Tryb odcieni szarości dla autentycznego czarno-białego skanu
- Kontrola rozdzielczości od jakości faksu o niskim DPI po jakość archiwalną o wysokim DPI

## Zastosowania

- Sprawianie, by cyfrowo utworzone dokumenty wyglądały, jakby zostały zeskanowane i wydrukowane
- Symulowanie fizycznego starzenia dokumentów przy odtwarzaniu dokumentów historycznych
- Testowanie oprogramowania OCR na skanach o pogorszonej jakości
- Tworzenie dokumentów pasujących stylem do istniejących zeskanowanych archiwów

## Wskazówki

- Zacznij od subtelnych wartości. Szum na poziomie 10-20, lekki obrót o 0,5 stopnia i minimalne rozmycie dają już przekonujący wygląd skanu.
- Połącz tryb odcieni szarości z lekkim zażółceniem, aby uzyskać efekt "kserokopii kserokopii".
- Niższe ustawienia rozdzielczości (100-150 DPI) dają najbardziej realistyczny wygląd faksu.

## Powiązane narzędzia

- [Odwróć kolory](./invert-colors)
- [Dostosuj kolory](./adjust-colors)
- [Kolor tła](./background-color)
