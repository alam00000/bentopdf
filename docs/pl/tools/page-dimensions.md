---
title: Wymiary strony
description: Analizuj rozmiary stron PDF, orientację, proporcje i obrót. Wykrywaj dokumenty z mieszanymi rozmiarami i eksportuj dane do CSV.
---

# Wymiary strony

Narzędzie diagnostyczne, które odczytuje każdą stronę PDF i podaje jej dokładne wymiary, orientację, nazwę standardowego rozmiaru, proporcje, powierzchnię i obrót. Przydatne do wychwytywania stron o różnych rozmiarach przed drukiem lub do udokumentowania właściwości otrzymanego pliku PDF.

## Jak to działa

1. Prześlij plik PDF. Analiza rusza automatycznie, bez przycisku.
2. Panel podsumowania pokazuje łączną liczbę stron, liczbę unikalnych rozmiarów stron oraz informację, czy dokument ma mieszane rozmiary.
3. Przeglądaj pełną tabelę wyników ze szczegółami dla każdej strony.
4. Przełączaj jednostki wyświetlania między punktami, calami, milimetrami i pikselami.
5. Kliknij **Eksportuj do CSV**, aby zapisać dane.

## Raportowane pola

| Kolumna             | Opis                                                    |
| ------------------- | ------------------------------------------------------- |
| Nr strony           | Kolejny numer strony                                    |
| Wymiary             | Szerokość x Wysokość w wybranej jednostce               |
| Standardowy rozmiar | Dopasowana nazwa (A4, Letter itp.) lub "Niestandardowy" |
| Orientacja          | Pionowa lub pozioma                                     |
| Proporcje           | Stosunek szerokości do wysokości jako liczba dziesiętna |
| Powierzchnia        | Powierzchnia strony w wybranej jednostce do kwadratu    |
| Obrót               | Obrót strony w stopniach                                |

## Funkcje

- Automatyczne wykrywanie standardowych rozmiarów papieru (A3, A4, A5, Letter, Legal, Tabloid i innych)
- Ostrzeżenie o mieszanych rozmiarach z zestawieniem, jakie rozmiary występują i ile stron z nich korzysta
- Przeliczanie jednostek między punktami, calami, milimetrami i pikselami (przy 96 PPI)
- Eksport do CSV do użycia w arkuszach kalkulacyjnych lub systemach dokumentacji

## Przypadki użycia

- Sprawdzenie, czy wszystkie strony mają format A4, przed wysłaniem dokumentu do drukarni
- Diagnozowanie, dlaczego połączony PDF drukuje się z nieoczekiwanymi marginesami na niektórych stronach
- Dokumentowanie układu stron dużego archiwum PDF na potrzeby rekordów metadanych
- Wskazywanie obróconych stron wymagających korekty

## Wskazówki

- Jeśli podsumowanie pokazuje "Różne rozmiary", użyj narzędzia Napraw rozmiar strony, aby ujednolicić rozmiary przed drukiem.
- Pole obrotu pomaga zidentyfikować strony, które wyświetlają się poprawnie, ale mają niezerowy atrybut obrotu, co może powodować problemy w niektórych przepływach pracy.

## Powiązane narzędzia

- [Napraw rozmiar strony](./fix-page-size): ujednolicenie stron po wykryciu mieszanych rozmiarów
- [Kompresuj PDF](./compress-pdf): optymalizacja PDF po naprawie problemów ze stronami
- [Obróć PDF](./rotate-pdf): korekta obróconych stron
