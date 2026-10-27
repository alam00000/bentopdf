---
title: Napraw PDF
description: Odzyskaj dane z uszkodzonych plików PDF za pomocą silnika naprawy QPDF. Obsługuje przetwarzanie wsadowe.
---

# Napraw PDF

Gdy PDF nie chce się otworzyć, wyświetla zniekształconą zawartość lub powoduje błędy w przeglądarce, to narzędzie próbuje odbudować jego wewnętrzną strukturę. Używa silnika naprawy QPDF, który potrafi odzyskać dane po wielu rodzajach uszkodzeń: zepsutych tablicach odwołań krzyżowych, ściętych strumieniach, nieprawidłowych odwołaniach do obiektów i innych.

## Jak to działa

1. Wgraj jeden lub więcej uszkodzonych plików PDF.
2. Kliknij **Napraw PDF**.
3. Pojedynczy naprawiony plik pobiera się bezpośrednio. Wiele plików daje archiwum ZIP.

Narzędzie przepuszcza każdy plik przez QPDF z flagą `--decrypt`, która wymusza odczytanie i ponowne zapisanie całej struktury PDF, naprawiając po drodze możliwe do odzyskania problemy.

## Funkcje

- Wsadowa naprawa wielu plików PDF w jednej operacji
- Automatyczne rozpoznawanie plików możliwych i niemożliwych do odzyskania
- Raport sukcesu/porażki dla każdego pliku przy przetwarzaniu wielu plików
- Używa QPDF (WebAssembly), sprawdzonej biblioteki do przekształcania PDF

## Co może naprawić

- Zepsute lub brakujące tablice odwołań krzyżowych
- Ucięte końcówki plików po niekompletnych pobraniach
- Nieprawidłowe numerowanie obiektów i długości strumieni
- Drobne niespójności strukturalne z błędnych generatorów PDF
- Artefakty szyfrowania po nieudanych próbach odszyfrowania

## Czego nie może naprawić

- Mocno ściętych plików, w których brakuje większości danych
- Plików PDF zaszyfrowanych hasłem, którego nie masz
- Plików, które w rzeczywistości nie są PDF (złe rozszerzenie)
- Uszkodzeń obrazów w PDF (struktura zostanie naprawiona, ale dane pikseli nie są odtwarzane)

## Zastosowania

- Odzyskanie PDF po nieudanym pobraniu z e-maila
- Otwieranie plików utworzonych przez starsze lub niestandardowe generatory PDF
- Naprawa plików PDF, które działają w jednej przeglądarce, a w innej nie
- Przygotowanie uszkodzonych dokumentów archiwalnych do długoterminowego przechowywania

## Wskazówki

- Jeśli naprawa się nie powiedzie, spróbuj najpierw otworzyć plik w przeglądarce internetowej. Przeglądarki mają własną logikę odzyskiwania i mogą wyrenderować wystarczająco dużo zawartości, by zapisać plik ponownie.
- W przypadku zaszyfrowanych plików PDF, których naprawa się nie udaje, najpierw użyj Odszyfruj PDF, a potem napraw odszyfrowany wynik.

## Powiązane narzędzia

- [Kompresuj PDF](./compress-pdf): dodatkowo uporządkuj strukturę naprawionego PDF
- [Linearyzuj PDF](./linearize-pdf): zoptymalizuj naprawiony plik do dostarczania przez sieć
- [Spłaszcz PDF](./flatten-pdf): spłaszcz formularze, które mogły zostać uszkodzone
