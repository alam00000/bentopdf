---
title: SVG na PDF
description: Konwertuj grafiki wektorowe SVG na PDF z kontrolą jakości, w całości w przeglądarce.
---

# SVG na PDF

Konwertuj pliki Scalable Vector Graphics (SVG) na PDF. Narzędzie rasteryzuje każdy SVG za pomocą silnika renderowania przeglądarki, a następnie osadza wynik w jego natywnej rozdzielczości. Przydatne do zamiany ikon wektorowych, diagramów i ilustracji w przenośne dokumenty.

## Obsługiwane formaty

| Format | Rozszerzenia |
| :----- | :----------- |
| SVG    | `.svg`       |

## Jak to działa

1. Kliknij obszar wgrywania lub przeciągnij i upuść jeden lub więcej plików SVG.
2. Przejrzyj listę plików i zarządzaj nią.
3. Wybierz poziom **jakości PDF**.
4. Kliknij **Konwertuj na PDF**. Wynik pobiera się jako `from_svgs.pdf`.

Każdy SVG jest odczytywany jako tekst, renderowany na kanwie w swojej wewnętrznej szerokości i wysokości (domyślnie 800x600, jeśli nie podano wymiarów) i eksportowany jako PNG. Ten PNG jest następnie osadzany w PDF za pomocą pdf-lib. Przezroczyste obszary są wypełniane białym tłem.

## Opcje

**Jakość PDF** kontroluje kompresję po rasteryzacji:

- **Wysoka jakość**: najbliższa oryginalnemu renderowaniu.
- **Średnia jakość** (domyślnie): dobry kompromis.
- **Niska jakość**: najmniejszy plik, pewna utrata szczegółów.

## Zastosowania

- Konwersja diagramów architektonicznych lub inżynieryjnych z SVG na PDF gotowy do druku
- Pakowanie zestawów ikon w referencyjny PDF dla systemu projektowego
- Zamiana wizualizacji danych (D3.js, eksporty bibliotek wykresów) na PDF gotowe do raportu
- Tworzenie drukowalnych wersji infografik opartych na SVG

## Wskazówki

- Pliki SVG bez jawnych atrybutów `width` i `height` renderują się w 800x600 pikseli. Aby uzyskać najlepsze wyniki, ustaw wymiary w źródle SVG przed konwersją.
- Złożone pliki SVG z zewnętrznymi odwołaniami do czcionek lub połączonymi obrazami mogą nie renderować się idealnie. Osadź wszystkie zasoby w SVG, aby uzyskać niezawodny wynik.
- Ponieważ SVG jest rasteryzowany, PDF będzie zawierał obraz bitmapowy zamiast ścieżek wektorowych. Do prawdziwie wektorowego PDF potrzebne jest dedykowane narzędzie wektorowe.

## Powiązane narzędzia

- [Obrazy do PDF](./image-to-pdf)
- [PNG na PDF](./png-to-pdf)
- [BMP na PDF](./bmp-to-pdf)
