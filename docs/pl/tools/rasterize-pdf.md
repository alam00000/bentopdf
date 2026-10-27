---
title: Rasteryzuj PDF
description: Konwertuj strony PDF na PDF oparty na obrazach. Spłaszcz wszystkie warstwy, usuń zaznaczalny tekst i kontroluj DPI oraz format obrazu.
---

# Rasteryzuj PDF

Rasteryzacja zamienia każdą stronę PDF w obraz i składa te obrazy z powrotem w PDF. Wynik wygląda identycznie jak oryginał, ale nie zawiera zaznaczalnego tekstu, elementów interaktywnych ani edytowalnych warstw. To w praktyce wysokiej jakości fotokopia.

## Jak to działa

1. Wgraj jeden lub więcej plików PDF.
2. Ustaw **DPI** (rozdzielczość) wyniku rasteryzacji.
3. Wybierz **format obrazu**: PNG dla jakości bezstratnej lub JPEG dla mniejszych plików.
4. Opcjonalnie zaznacz **Konwertuj na odcienie szarości**.
5. Kliknij **Rasteryzuj PDF**. Wiele plików pobiera się jako ZIP.

## Opcje

| Ustawienie            | Wartości                          | Domyślnie |
| --------------------- | --------------------------------- | --------- |
| **DPI**               | 72, 150, 200, 300, 600            | 150       |
| **Format obrazu**     | PNG (bezstratny), JPEG (mniejszy) | PNG       |
| **Odcienie szarości** | Wł./Wył.                          | Wył.      |

## Wskazówki dotyczące DPI

- **72**: tylko do oglądania na ekranie, najmniejszy rozmiar pliku
- **150**: dobry kompromis do ogólnego użytku
- **200**: wyraźniejszy tekst, umiarkowany rozmiar pliku
- **300**: jakość do druku
- **600**: wysokiej jakości archiwizacja lub druk profesjonalny

## Zastosowania

- Uniemożliwienie wyodrębnienia tekstu z poufnych dokumentów przed udostępnieniem
- Eliminowanie problemów z zależnością od czcionek przez zamianę tekstu na piksele
- Tworzenie "płaskiej" wersji PDF ze złożonymi warstwami lub przezroczystością, które wyglądają inaczej w różnych przeglądarkach
- Przygotowanie PDF dla systemu, który przyjmuje tylko dane wejściowe w postaci obrazów
- Usuwanie ukrytej zawartości (jak śledzone zmiany lub dane formularzy) przez sprowadzenie PDF do samych obrazów

## Wskazówki

- 150 DPI w PNG to solidne ustawienie domyślne. Wybieraj więcej tylko do druku lub gdy musisz powiększać drobne szczegóły.
- JPEG daje wyraźnie mniejsze pliki, ale wprowadza artefakty kompresji na ostrych krawędziach tekstu.
- Rasteryzacja jest nieodwracalna, więc zachowaj oryginalny PDF, jeśli możesz później potrzebować edytowalnego tekstu.

## Powiązane narzędzia

- [Kompresuj PDF](./compress-pdf): zmniejsz rozmiar zrasteryzowanego PDF
- [Wyprostuj PDF](./deskew-pdf): wyprostuj strony przed rasteryzacją zeskanowanych dokumentów
- [Czcionka na krzywe](./font-to-outline): zamień czcionki na ścieżki wektorowe, jeśli chcesz zachować skalowalność
- [Spłaszcz PDF](./flatten-pdf): spłaszcz formularze bez konwersji na obrazy
