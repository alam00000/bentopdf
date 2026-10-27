---
title: Sanityzuj PDF
description: Usuń ukrytą i potencjalnie niebezpieczną zawartość z plików PDF, w tym metadane, JavaScript, osadzone pliki, adnotacje i warstwy.
---

# Sanityzuj PDF

PDF może zawierać znacznie więcej, niż widać na ekranie. Ukryte metadane, osadzony JavaScript, załączniki, dane formularzy i informacje o warstwach mogą ujawniać wrażliwe dane lub stwarzać zagrożenia. Sanityzacja usuwa to wszystko, zostawiając czysty dokument bezpieczny do publicznego udostępnienia.

## Jak to działa

1. Wgraj plik PDF.
2. Wybierz z listy, które elementy usunąć.
3. Kliknij **Sanityzuj PDF**.
4. Pobierz oczyszczony plik.

## Opcje sanityzacji

Wszystkie opcje są domyślnie włączone. Odznacz te, które chcesz zachować.

| Opcja                     | Co usuwa                                                                     |
| ------------------------- | ---------------------------------------------------------------------------- |
| **Spłaszcz formularze**   | Zamienia interaktywne pola formularzy na statyczną zawartość                 |
| **Usuń metadane**         | Usuwa autora, tytuł, datę utworzenia, informacje o oprogramowaniu i dane XMP |
| **Usuń adnotacje**        | Usuwa komentarze, wyróżnienia, karteczki i znaczniki                         |
| **Usuń JavaScript**       | Eliminuje osadzone skrypty, które mogłyby uruchomić się przy otwarciu        |
| **Usuń osadzone pliki**   | Usuwa załączniki osadzone w PDF                                              |
| **Usuń warstwy (OCG)**    | Spłaszcza grupy zawartości opcjonalnej do jednej warstwy                     |
| **Usuń łącza**            | Usuwa hiperłącza i odwołania do adresów URL                                  |
| **Usuń drzewo struktury** | Usuwa strukturę dokumentu używaną do tagowania dostępności                   |
| **Usuń MarkInfo**         | Usuwa informacje o oznaczonej zawartości                                     |
| **Usuń czcionki**         | Usuwa osadzone dane czcionek (używaj ostrożnie)                              |

## Zastosowania

- Przygotowanie PDF do publicznego wydania przez usunięcie wewnętrznych metadanych (nazwisk autorów, wersji oprogramowania, historii edycji)
- Usunięcie JavaScriptu z PDF otrzymanego z niezaufanego źródła przed jego otwarciem
- Oczyszczenie PDF przed wysłaniem klientowi, który nie powinien widzieć osadzonych komentarzy ani nazw pól formularzy
- Usunięcie ukrytych warstw z rysunku architektonicznego przed udostępnieniem wersji końcowej
- Zgodność z wymogami minimalizacji danych wynikającymi z przepisów o ochronie prywatności

## Wskazówki

- Pozostaw opcję "Usuń czcionki" odznaczoną, chyba że masz pewność, że PDF nadal wyrenderuje się poprawnie. Usunięcie czcionek może sprawić, że tekst będzie niewidoczny w niektórych przeglądarkach.
- Jeśli potrzebujesz tylko usunąć metadane, dedykowane narzędzie Usuń metadane jest szybsze i bardziej wyspecjalizowane.
- Sanityzacja jest nieodwracalna. Zachowaj oryginalny plik.

## Powiązane narzędzia

- [Usuń metadane](./remove-metadata): usuń tylko metadane, nie dotykając pozostałej zawartości
- [Spłaszcz PDF](./flatten-pdf): spłaszcz konkretnie formularze i adnotacje
- [Szyfruj PDF](./protect-pdf): dodaj ochronę hasłem po sanityzacji
- [Rasteryzuj PDF](./rasterize-pdf): opcja ostateczna, konwersja na obrazy eliminująca całą ukrytą zawartość
