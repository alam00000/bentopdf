---
title: Wyprostuj PDF
description: Automatycznie prostuj przekrzywione strony w zeskanowanych plikach PDF dzięki wykrywaniu pochylenia OpenCV. Regulowany próg i ustawienia DPI.
---

# Wyprostuj PDF

Zeskanowane dokumenty rzadko są idealnie proste. Nawet niewielkie przekrzywienie pogarsza dokładność OCR i sprawia, że wydruk wygląda niedbale. To narzędzie używa algorytmów przetwarzania obrazu OpenCV, aby wykryć kąt pochylenia każdej strony i obrócić ją z powrotem do poziomu.

## Jak to działa

1. Prześlij jeden lub więcej zeskanowanych plików PDF.
2. Ustaw **Próg pochylenia**: strony z wykrytym pochyleniem poniżej tej wartości pozostają nietknięte.
3. Wybierz **Jakość przetwarzania (DPI)**: wyższe DPI poprawia dokładność wykrywania, ale trwa dłużej.
4. Kliknij **Wyprostuj PDF**.
5. Po przetworzeniu panel wyników pokazuje wykryty kąt każdej strony i informację, czy została skorygowana.

## Opcje

| Ustawienie            | Wartości                   | Domyślnie |
| --------------------- | -------------------------- | --------- |
| **Próg pochylenia**   | 0,1, 0,5, 1,0, 2,0 stopnia | 0,5       |
| **DPI przetwarzania** | 100, 150, 200, 300         | 150       |

## Jak działa wykrywanie pochylenia

Narzędzie renderuje każdą stronę do obrazu w wybranym DPI, a następnie używa OpenCV do wykrycia dominujących kątów linii w treści. Jeśli wykryte pochylenie przekracza próg, strona jest obracana o kąt przeciwny, aby ją wyprostować. Strony poniżej progu są przekazywane bez zmian.

## Zastosowania

- Porządkowanie hurtowo skanowanych umów lub dokumentów prawnych
- Przygotowanie zeskanowanych paragonów lub faktur do przetwarzania OCR
- Prostowanie stron ze skanera płaskiego przy niespójnym układaniu papieru
- Poprawa jakości wizualnej zdigitalizowanych materiałów archiwalnych

## Wskazówki

- Obniż próg do 0,1 stopnia, jeśli potrzebujesz idealnego wyrównania do OCR.
- 150 DPI jest szybkie i dokładne dla większości dokumentów. Użyj 300 DPI dla bardzo małego tekstu lub stron z drobnymi detalami.
- Prostowanie działa najlepiej na dokumentach z wyraźnymi poziomymi liniami tekstu. Może sobie nie radzić ze stronami złożonymi głównie z obrazów lub ukośnych elementów projektu.

## Powiązane narzędzia

- [Rasteryzuj PDF](./rasterize-pdf): zamień wyprostowany wynik na płaski PDF oparty na obrazach
- [Kompresuj PDF](./compress-pdf): zmniejsz rozmiar pliku po prostowaniu
- [Napraw PDF](./repair-pdf): napraw problemy strukturalne w zeskanowanych plikach PDF
