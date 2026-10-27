---
title: Usuń metadane
description: Usuń wszystkie ukryte metadane z plików PDF, w tym autora, tytuł, datę utworzenia, producenta, dane XMP i identyfikatory dokumentu.
---

# Usuń metadane

Każdy PDF zawiera metadane, które mogą ujawniać, kto go utworzył, jakiego oprogramowania użyto, kiedy ostatnio go zmodyfikowano i nie tylko. To narzędzie usuwa to wszystko: słownik informacji, strumienie metadanych XMP, identyfikatory dokumentu i dane specyficzne dla aplikacji, pozostawiając czysty dokument bez śladu pochodzenia.

## Jak to działa

1. Wgraj plik PDF.
2. Kliknij **Usuń metadane**.
3. Pobierz oczyszczony plik.

Brak opcji do skonfigurowania. Narzędzie jest z założenia dokładne: czyści wszystko.

## Co zostaje usunięte

- **Pola słownika informacji**: tytuł, autor, temat, słowa kluczowe, twórca, producent, data utworzenia, data modyfikacji
- **Strumień metadanych XMP**: blok metadanych oparty na XML, przechowywany w katalogu dokumentu
- **Identyfikatory dokumentu**: unikalne identyfikatory w trailerze PDF, które mogą służyć do śledzenia dokumentu między systemami
- **PieceInfo**: metadane specyficzne dla aplikacji, dodawane przez programy takie jak Illustrator czy InDesign

## Co zostaje

- Cała widoczna zawartość stron (tekst, obrazy, grafika)
- Pola formularzy i adnotacje
- Zakładki i łącza
- Sama struktura dokumentu

## Zastosowania

- Usuwanie imienia i nazwy organizacji z dokumentu przed anonimową publikacją
- Usuwanie znaczników czasu utworzenia, które ujawniają, kiedy dokument przygotowano
- Czyszczenie ciągów producenta, które identyfikują stos oprogramowania PDF
- Przygotowanie dokumentów do zgłoszeń regulacyjnych wymagających PDF bez metadanych
- Usuwanie śladów historii edycji przed udostępnieniem dokumentu na zewnątrz

## Wskazówki

- Najpierw użyj narzędzia Wyświetl metadane, aby zobaczyć dokładnie, jakie metadane zawiera Twój PDF, zanim je usuniesz.
- Jeśli musisz usunąć metadane _oraz_ JavaScript, adnotacje i osadzone pliki, użyj Sanityzuj PDF dla dokładniejszego czyszczenia.
- Usunięcie metadanych jest trwałe. Zachowaj oryginał, jeśli możesz później potrzebować tych danych.

## Powiązane narzędzia

- [Sanityzuj PDF](./sanitize-pdf): usuń metadane oraz skrypty, załączniki i więcej
- [Szyfruj PDF](./protect-pdf): zabezpiecz oczyszczony PDF hasłem
- [Kompresuj PDF](./compress-pdf): usunięcie metadanych może nieznacznie zmniejszyć rozmiar pliku; skompresuj, aby zaoszczędzić więcej
