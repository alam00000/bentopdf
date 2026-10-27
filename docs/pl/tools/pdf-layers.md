---
title: Warstwy PDF (OCG)
description: Wyświetlaj, przełączaj, dodawaj i usuwaj warstwy Optional Content Group (OCG) w dokumencie PDF.
---

# Warstwy PDF (OCG)

Zarządzaj grupami treści opcjonalnej (Optional Content Groups, OCG), zwanymi potocznie "warstwami", wewnątrz pliku PDF. Możesz przełączać widoczność warstw, dodawać nowe warstwy (także zagnieżdżone warstwy podrzędne), usuwać warstwy i zapisywać zmodyfikowany PDF.

## Jak to działa

1. Prześlij plik PDF.
2. Kliknij przycisk przetwarzania, aby załadować dokument za pomocą silnika PyMuPDF.
3. Narzędzie wyświetla wszystkie istniejące warstwy wraz ze stanem widoczności, blokadą i hierarchią zagnieżdżenia.
4. Zaznaczaj pola wyboru, aby pokazać lub ukryć warstwy. Zablokowanych warstw nie można przełączać.
5. Dodawaj nowe warstwy najwyższego poziomu, wpisując nazwę i klikając przycisk dodawania, lub dodawaj warstwy podrzędne pod istniejącą warstwą nadrzędną.
6. Usuń warstwy, których już nie potrzebujesz.
7. Kliknij **Zapisz**, aby pobrać zmodyfikowany PDF z zastosowanymi zmianami warstw.

## Funkcje

- Wyświetla hierarchię warstw z odpowiednimi wcięciami dla warstw zagnieżdżonych
- Włączanie i wyłączanie widoczności warstwy
- Wskaźnik zablokowanej warstwy zapobiega przypadkowym zmianom
- Dodawanie warstw najwyższego poziomu lub podrzędnych z własnymi nazwami
- Usuwanie pojedynczych warstw
- Zapisuje wszystkie zmiany w nowym pliku PDF

## Przypadki użycia

- Przełączanie widoczności warstw oznaczeń w rysunkach architektonicznych lub inżynierskich
- Dodawanie nowych warstw adnotacji do wielowarstwowego dokumentu projektowego
- Usuwanie przestarzałych warstw z szablonu przed jego dystrybucją
- Sprawdzanie, jakie warstwy istnieją w złożonym PDF otrzymanym od strony trzeciej

## Wskazówki

- Jeśli PDF nie ma warstw, narzędzie pokazuje pusty stan z propozycją dodania warstwy. Nie wszystkie pliki PDF używają warstw OCG, są one najczęstsze w eksportach CAD i plikach projektowych.
- Warstwy podrzędne są wizualnie wcięte pod warstwą nadrzędną. Warstwy można zagnieżdżać na dowolną głębokość.
- Zablokowane warstwy są wyświetlane z ikoną kłódki, a ich pola wyboru są wyłączone. Te blokady ustawia twórca pliku PDF.

## Powiązane narzędzia

- [Wyświetl metadane](./view-metadata)
- [Edytuj metadane](./edit-metadata)
- [Duplikuj i organizuj](./organize-pdf)
