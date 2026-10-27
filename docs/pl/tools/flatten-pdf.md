---
title: Spłaszcz PDF
description: Spłaszcz interaktywne formularze i adnotacje do statycznej zawartości. Pola formularza przestają być edytowalne, a adnotacje zostają wtopione w stronę.
---

# Spłaszcz PDF

Spłaszczanie wtapia elementy interaktywne (pola formularzy, listy rozwijane, pola wyboru, adnotacje, podświetlenia, karteczki) bezpośrednio w zawartość strony. Wygląd pozostaje taki sam, ale nic nie da się już edytować ani wyodrębnić. To odpowiednik wydrukowania wypełnionego formularza i zeskanowania go z powrotem, tyle że jakość pozostaje idealna.

## Jak to działa

1. Prześlij jeden lub więcej plików PDF.
2. Kliknij **Spłaszcz PDF**.
3. Pojedynczy plik pobierze się bezpośrednio. Wiele plików da archiwum ZIP.

Narzędzie używa pdf-lib do spłaszczania pól formularzy (przez `form.flatten()`) oraz dedykowanego mechanizmu do wtapiania adnotacji w strumień strony. Obie operacje odbywają się w jednym przebiegu.

## Co zostaje spłaszczone

- **Pola formularzy**: pola tekstowe, pola wyboru, przyciski opcji, listy rozwijane, pola podpisu
- **Adnotacje**: komentarze, podświetlenia, przekreślenia, podkreślenia, karteczki, pieczątki, adnotacje odręczne
- **Elementy interaktywne**: przyciski, wyzwalacze akcji

## Co pozostaje bez zmian

- Zawartość tekstowa (nadal można ją zaznaczać i przeszukiwać)
- Obrazy i grafiki
- Układ i wymiary stron
- Zakładki i spis treści
- Hiperłącza (chyba że są oparte na adnotacjach)

## Zastosowania

- Zablokowanie wypełnionego formularza, aby odbiorcy nie mogli zmienić przesłanych odpowiedzi
- Przygotowanie PDF-a do archiwizacji, gdzie elementy interaktywne są zbędne
- Naprawa problemów z wyświetlaniem, gdy adnotacje renderują się inaczej w różnych przeglądarkach PDF
- Upewnienie się, że podpisanego dokumentu nie da się zmodyfikować po złożeniu podpisu
- Zmniejszenie rozmiaru pliku przez usunięcie definicji pól formularzy i obiektów adnotacji

## Wskazówki

- Spłaszczaj dopiero po zakończeniu wszystkich edycji. Nie da się cofnąć spłaszczenia PDF-a.
- Jeśli oprócz spłaszczenia chcesz usunąć metadane, JavaScript i załączniki, użyj zamiast tego narzędzia Sanityzuj PDF, które ma spłaszczanie wśród swoich opcji.
- Niektóre PDF-y zgłaszają "nie znaleziono formularza". To normalne, jeśli dokument ma tylko adnotacje i nie ma pól formularza.

## Powiązane narzędzia

- [Sanityzuj PDF](./sanitize-pdf): spłaszcz formularze i usuń metadane, skrypty i więcej
- [Rasteryzuj PDF](./rasterize-pdf): zamień na PDF oparty na obrazach, aby spłaszczyć maksymalnie
- [Czcionka na krzywe](./font-to-outline): zamień czcionki na ścieżki wektorowe
- [Szyfruj PDF](./protect-pdf): zablokuj spłaszczony PDF hasłem
