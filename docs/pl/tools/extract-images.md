---
title: Wyodrębnij obrazy
description: Wyodrębnij wszystkie osadzone obrazy z plików PDF. Przeglądaj je w siatce i pobieraj pojedynczo lub jako archiwum ZIP.
---

# Wyodrębnij obrazy

Wyciąga wszystkie osadzone obrazy z jednego lub wielu plików PDF. Wyodrębnione obrazy są wyświetlane w siatce podglądu, gdzie możesz pobierać je pojedynczo lub wszystkie naraz jako ZIP. Działa na PyMuPDF.

## Jak to działa

1. Prześlij jeden lub więcej plików PDF, klikając strefę upuszczania lub przeciągając na nią pliki. W razie potrzeby dodaj więcej plików lub usuń pojedyncze.
2. Kliknij **Wyodrębnij**, aby rozpocząć przetwarzanie.
3. Narzędzie skanuje każdą stronę każdego przesłanego PDF, znajdując i wyodrębniając osadzone obrazy.
4. Wyodrębnione obrazy pojawiają się w siatce z miniaturami. Każdy obraz ma przycisk pobierania.
5. Kliknij **Pobierz wszystko**, aby zapisać całość jako archiwum ZIP.

## Opcje

To narzędzie nie ma konfigurowalnych opcji. Wszystkie osadzone obrazy są wyodrębniane w natywnym formacie (zwykle PNG, JPEG lub w formacie użytym przy osadzaniu obrazu w PDF).

## Format wyniku

- Obrazy są wyświetlane w siatce podglądu pod nazwami `image_1.png`, `image_2.jpg` itd.
- **Pobierz wszystko** tworzy `extracted-images.zip` ze wszystkimi obrazami.
- Pojedyncze obrazy można pobierać po jednym z siatki.

## Zastosowania

- Odzyskiwanie zdjęć lub grafik z PDF do ponownego użycia w innym projekcie.
- Wyodrębnianie zdjęć produktów z katalogu PDF do oferty w sklepie internetowym.
- Wyciąganie diagramów z dokumentacji technicznej do prezentacji.
- Audyt obrazów osadzonych w dokumencie przed jego udostępnieniem.

## Wskazówki

- Narzędzie wyodrębnia obrazy dokładnie tak, jak są zapisane w PDF. Nie renderuje stron jako obrazów. Do tego użyj [PDF na PNG](./pdf-to-png) lub [PDF na JPG](./pdf-to-jpg).
- Jeśli narzędzie zgłasza "Nie znaleziono obrazów", PDF może używać grafiki wektorowej zamiast osadzonych obrazów rastrowych lub może być zeskanowanym dokumentem, w którym cała strona jest jednym dużym obrazem.
- Przetwarzanie wsadowe działa na wielu plikach PDF. Wszystkie obrazy ze wszystkich plików są łączone w jedną siatkę i jeden ZIP.

## Powiązane narzędzia

- [PDF na PNG](./pdf-to-png)
- [PDF na JPG](./pdf-to-jpg)
- [Kreator przepływów PDF](./pdf-workflow)
