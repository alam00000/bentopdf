---
title: Linearyzuj PDF
description: Optymalizuj pliki PDF pod kątem szybkiego wyświetlania w sieci dzięki stopniowemu ładowaniu. Znane też jako optymalizacja "Szybki podgląd w sieci Web".
---

# Linearyzuj PDF

Linearyzacja zmienia strukturę PDF-a tak, aby pierwszą stronę można było wyświetlić, zanim cały plik zostanie pobrany. Adobe nazywa to "Szybkim podglądem w sieci Web". Jeśli udostępniasz PDF-y na stronie internetowej lub przez portal dokumentów, linearyzacja sprawia, że otwierają się wyraźnie szybciej.

## Jak to działa

1. Prześlij jeden lub więcej plików PDF.
2. Kliknij **Linearyzuj PDF-y**.
3. Pobierz wyniki jako archiwum ZIP zawierające wszystkie zlinearyzowane pliki.

Nie ma ustawień do skonfigurowania. Narzędzie używa flagi `--linearize` programu QPDF, która porządkuje wewnętrzną strukturę PDF-a bez zmiany jego zawartości wizualnej.

## Co robi linearyzacja

- Zmienia kolejność obiektów PDF tak, aby dane pierwszej strony znalazły się na początku pliku
- Dodaje słownik linearyzacji i tablice wskazówek, aby przeglądarki wiedziały, gdzie znaleźć każdą stronę
- Umożliwia żądania zakresów bajtów: przeglądarka może pobrać tylko pierwszą stronę bez pobierania całego pliku
- Porządkuje tablicę odwołań krzyżowych dla wydajnego dostępu swobodnego

## Funkcje

- Wsadowe przetwarzanie wielu PDF-ów w jednej operacji
- Wynik zachowuje całą zawartość, czcionki, obrazy i elementy interaktywne
- Używa QPDF (WebAssembly) do niezawodnej linearyzacji zgodnej ze standardami
- Wyniki są pakowane do ZIP dla wygodnego pobrania

## Zastosowania

- Udostępnianie raportów PDF na stronie, gdzie użytkownicy oczekują natychmiastowego wyświetlenia strony
- Osadzanie PDF-ów w aplikacjach webowych z przeglądarkami w przeglądarce
- Publikowanie katalogów lub instrukcji PDF dostępnych przez wolne łącza mobilne
- Przygotowanie dokumentów dla sieci dostarczania treści (CDN), które obsługują zakresy bajtów

## Wskazówki

- Linearyzuj po zakończeniu wszystkich innych edycji. Każda późniejsza modyfikacja (łączenie, dodawanie stron) zepsuje linearyzację.
- Połącz z narzędziem Kompresuj PDF, aby uzyskać najmniejsze i najszybciej ładujące się PDF-y.
- Linearyzacja dodaje niewielki narzut do rozmiaru pliku (zwykle poniżej 1%).

## Powiązane narzędzia

- [Kompresuj PDF](./compress-pdf): zmniejsz rozmiar pliku przed linearyzacją
- [Napraw PDF](./repair-pdf): napraw problemy strukturalne uniemożliwiające linearyzację
- [Usuń metadane](./remove-metadata): usuń metadane przed publikacją w sieci
