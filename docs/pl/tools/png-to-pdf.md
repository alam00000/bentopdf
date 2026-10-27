---
title: PNG na PDF
description: Konwertuj jeden lub więcej obrazów PNG na dokument PDF z regulowaną jakością, w całości w przeglądarce.
---

# PNG na PDF

Konwertuj obrazy PNG na PDF z zachowaniem pełnej rozdzielczości. Każdy plik PNG staje się osobną stroną, dopasowaną do wymiarów oryginalnego obrazu. Przezroczystość jest obsługiwana automatycznie.

## Obsługiwane formaty

| Format | Rozszerzenia |
| :----- | :----------- |
| PNG    | `.png`       |

## Jak to działa

1. Kliknij obszar przesyłania lub przeciągnij i upuść pliki PNG. Możesz wybrać kilka naraz.
2. Zarządzaj listą plików: usuń niepotrzebne lub dodaj kolejne.
3. Wybierz poziom **Jakości PDF** z listy rozwijanej.
4. Kliknij **Konwertuj na PDF**. Wynik pobiera się jako `from_jpgs.pdf`.

Narzędzie używa pdf-lib do bezpośredniego osadzania każdego obrazu. Jeśli PNG nie może zostać osadzony natywnie (np. z powodu nietypowego profilu kolorów), narzędzie wraca do ponownego renderowania przez canvas jako JPEG.

## Opcje

**Jakość PDF** steruje kompresją stosowaną przed osadzeniem:

- **Wysoka jakość**: minimalna kompresja, największy rozmiar pliku.
- **Średnia jakość** (domyślnie): dobry kompromis między rozmiarem a wyrazistością.
- **Niska jakość**: maksymalna kompresja, najmniejszy wynik.

## Przypadki użycia

- Konwertowanie zrzutów ekranu na wielostronicowy PDF do zgłoszeń błędów lub dokumentacji
- Pakowanie eksportów projektów interfejsu w jeden plik do recenzji
- Zamienianie eksportów diagramów (draw.io, Excalidraw) w PDF do udostępniania
- Składanie zestawu obrazów wykresów w raport

## Wskazówki

- Pliki PNG z przezroczystością dostają w PDF białe tło. Jeśli potrzebujesz innego tła, edytuj obrazy wcześniej.
- Dla zrzutów ekranu i diagramów z ostrymi krawędziami i tekstem wysoka jakość pozwala uniknąć artefaktów kompresji JPEG. Średnia lub niska może wewnętrznie konwertować do JPEG.

## Powiązane narzędzia

- [Obrazy do PDF](./image-to-pdf)
- [JPG na PDF](./jpg-to-pdf)
- [SVG na PDF](./svg-to-pdf)
