---
title: Wyświetl metadane
description: Sprawdź wszystkie właściwości metadanych pliku PDF, w tym informacje o dokumencie, dane XMP i szczegóły strukturalne.
---

# Wyświetl metadane

Sprawdź ukryte właściwości osadzone w pliku PDF. Narzędzie wyświetla informacje o dokumencie (tytuł, autor, daty), metadane XMP, wymiary stron i inne dane strukturalne w czytelnej formie.

## Jak to działa

1. Prześlij plik PDF.
2. Narzędzie od razu analizuje plik i wyświetla wszystkie dostępne metadane w uporządkowanych sekcjach.
3. Przejrzyj słownik informacji o dokumencie, drzewo metadanych XMP i właściwości strukturalne.
4. Nie jest potrzebny żaden krok przetwarzania: metadane są wyświetlane zaraz po wczytaniu pliku.

## Funkcje

- Wyświetla standardowe pola informacji o dokumencie: Title, Author, Subject, Keywords, Creator, Producer
- Pokazuje daty utworzenia i modyfikacji w czytelnym formacie
- Analizuje i wyświetla pełne drzewo metadanych XMP z zagnieżdżonymi przestrzeniami nazw
- Konwertuje format daty PDF (`D:20240101120000Z`) na czytelne daty
- Uporządkowane w zwijane sekcje dla łatwej nawigacji

## Sekcje metadanych

| Sekcja                      | Zawartość                                                                             |
| --------------------------- | ------------------------------------------------------------------------------------- |
| **Informacje o dokumencie** | Title, Author, Subject, Keywords, Creator, Producer, Creation Date, Modification Date |
| **Metadane XMP**            | Pełne drzewo metadanych XML z przestrzeniami nazw Dublin Core, XAP, PDF i własnymi    |
| **Właściwości dokumentu**   | Liczba stron, wersja PDF, rozmiar pliku, status szyfrowania                           |

## Zastosowania

- Sprawdzenie, kto jest autorem pliku PDF i kiedy był ostatnio modyfikowany
- Weryfikacja, czy metadane zostały poprawnie ustawione przed publikacją dokumentu
- Audyt plików PDF pod kątem prywatności, czyli sprawdzenie, jakie dane osobowe są osadzone
- Ustalenie, jakiego oprogramowania użyto do utworzenia lub zmodyfikowania pliku PDF (pole Producer)
- Przegląd metadanych XMP pod kątem zgodności z zarządzaniem zasobami cyfrowymi

## Wskazówki

- Ciągi dat PDF zaczynające się od `D:` są automatycznie konwertowane na format Twojej strefy czasowej.
- Jeśli pola metadanych są puste, twórca pliku PDF po prostu ich nie ustawił. Nie wszystkie pliki PDF zawierają bogate metadane.
- Aby zmodyfikować metadane po sprawdzeniu, użyj [Edytuj metadane](./edit-metadata). Aby usunąć je całkowicie, użyj Usuń metadane.

## Powiązane narzędzia

- [Edytuj metadane](./edit-metadata)
- [Warstwy PDF (OCG)](./pdf-layers)
- [Porównaj PDF](./compare-pdfs)
