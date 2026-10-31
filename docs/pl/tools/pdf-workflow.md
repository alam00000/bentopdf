---
title: Kreator przepływów PDF
description: Buduj własne potoki przetwarzania PDF wizualnie, łącząc węzły na kanwie. Łącz operacje takie jak scalanie, kompresja, znak wodny i eksport.
---

# Kreator przepływów PDF

Kreator przepływów pozwala połączyć wiele operacji na PDF w jeden zautomatyzowany potok. Zamiast uruchamiać narzędzia po kolei, łączysz wizualny graf węzłów (wejście, przetwarzanie, wyjście) i wykonujesz wszystko jednym kliknięciem. Twoje pliki nigdy nie opuszczają przeglądarki.

## Jak to działa

Interfejs jest podzielony na trzy panele: **przybornik węzłów** po lewej, **kanwę** pośrodku i **panel ustawień** po prawej, który pojawia się po zaznaczeniu węzła.

1. **Dodawaj węzły**, klikając je na lewym pasku bocznym lub przeciągając bezpośrednio na kanwę. Użyj paska wyszukiwania u góry przybornika, aby filtrować według nazwy.
2. **Łącz węzły**, przeciągając z gniazda wyjściowego (dół węzła) do gniazda wejściowego (góra innego węzła). Połączenia biegną od góry do dołu.
3. **Konfiguruj ustawienia**, klikając węzeł, aby otworzyć jego panel ustawień po prawej. Każdy typ węzła ma własne opcje (zakresy stron, suwaki jakości, hasła itd.).
4. **Uruchom przepływ**, klikając przycisk **Uruchom** na pasku narzędzi. Silnik wykonuje węzły w porządku topologicznym, przetwarzając każdy po kolei. Pasek stanu na dole śledzi postęp.
5. **Pobierz wyniki**: końcowy węzeł Pobierz zapisuje końcowy PDF (lub ZIP, jeśli powstaje wiele plików).

## Kategorie węzłów

Węzły są podzielone na sześć kategorii, każda oznaczona kolorem na kanwie:

- **Wejście** (niebieski): Wejście PDF, Wejście obrazów, Word/Excel/PowerPoint na PDF oraz ponad 15 innych konwerterów formatów, które dostarczają pliki do potoku.
- **Edycja i adnotacje** (indygo): Przytnij, Greyscale, Odwróć kolory, Znak wodny, Numery stron, Nagłówek i Stopka, Efekt skanera, Dostosuj kolory, Kolor tła, Usuń puste strony, Usuń adnotacje.
- **Organizacja i zarządzanie** (fiolet): Połącz, Podziel, Wyodrębnij strony, Obróć, Usuń strony, Odwróć, Dodaj pustą stronę, Podziel strony, N-Up, Napraw rozmiar strony, Połącz w jedną stronę, Broszura, Plakatowanie, Edytuj metadane, Spis treści, OCR.
- **Optymalizacja i naprawa** (bursztyn): Kompresuj, Rasteryzuj, Linearyzuj, Wyprostuj, PDF na PDF/A, Czcionka na krzywe, Napraw.
- **Zabezpieczanie PDF** (róż): Szyfruj, Odszyfruj, Sanityzuj, Spłaszcz, Podpis cyfrowy, Redaguj.
- **Wyjście** (morski): Pobierz (automatycznie wykrywa pojedynczy PDF lub ZIP), PDF na obrazy, PDF na tekst, PDF na DOCX, PDF na XLSX, PDF na CSV, PDF na SVG, PDF na Markdown, Wyodrębnij obrazy.

## Zapisywanie i wczytywanie przepływów

Pasek narzędzi udostępnia cztery opcje trwałego zapisu:

- **Zapisz**: zapisuje bieżący przepływ jako nazwany szablon w pamięci lokalnej przeglądarki. Możesz zapisać wiele szablonów.
- **Wczytaj**: otwiera okno z listą wszystkich zapisanych szablonów. Kliknij Wczytaj, aby przywrócić szablon, lub usuń te, których już nie potrzebujesz.
- **Eksportuj**: pobiera przepływ jako plik `.json`, aby można go było udostępnić lub zachować jako kopię zapasową.
- **Importuj**: wczytuje z dysku plik przepływu `.json`, przywracając wszystkie węzły, pozycje i połączenia.

Szablony są zachowywane między sesjami w pamięci lokalnej. Wyeksportowane pliki JSON są przenośne między przeglądarkami i urządzeniami.

## Model wykonania

Silnik buduje graf zależności z Twoich połączeń i wykonuje węzły w porządku topologicznym. Jeśli którykolwiek węzeł zawiedzie, wykonanie zostaje wstrzymane, a niepowodzenie oznaczone na czerwono. Kilka zasad, o których warto pamiętać:

- Każdy przepływ potrzebuje co najmniej jednego węzła **Wejście** i jednego węzła **Wyjście**.
- Silnik wykrywa zależności cykliczne i blokuje wykonanie z błędem.
- Węzeł **Szyfruj** musi być ostatnim krokiem przetwarzania przed węzłem wyjściowym. Umieszczenie go wcześniej wywoła ostrzeżenie walidacji, ponieważ kolejne węzły nie mogą operować na zaszyfrowanych danych.
- Pliki PDF chronione hasłem proszą o hasło podczas wykonania.
- Obsługiwane są wejścia z wieloma plikami PDF: węzeł Połącz może je scalić, a węzły przetwarzania zbiorczego przetworzą każdy PDF osobno.

## Typy gniazd

Połączenia używają typowanych gniazd, aby zapobiegać nieprawidłowemu łączeniu:

- **PDF** (indygo): pojedynczy dokument PDF.
- **MultiPDF** (bursztyn): wiele dokumentów PDF zebranych razem.
- **Image** (zielony): obraz binarny.

## Opcje

Każdy węzeł ma własną konfigurację dostępną w prawym panelu ustawień. Typowe wzorce to:

- **Zakresy stron** w węzłach Podziel, Wyodrębnij strony, Usuń strony
- **Suwaki jakości** w węzłach wyjściowych konwersji obrazów
- **Pola haseł** w węzłach Szyfruj i Odszyfruj
- **Pola tekstowe** dla Znaku wodnego, Nagłówka i Stopki, Edycji metadanych
- **Kąty obrotu** w węźle Obróć
- **Poziom kompresji** w węźle Kompresuj
- **Wybór języka OCR** w węźle OCR

## Przypadki użycia

- **Potok przetwarzania faktur**: Wejście PDF -> OCR -> Wyodrębnij tabele -> Pobierz jako CSV.
- **Standaryzacja raportów**: Word na PDF -> Napraw rozmiar strony -> Dodaj numery stron -> Znak wodny -> Kompresuj -> Pobierz.
- **Przygotowanie do archiwizacji**: Wejście PDF -> Napraw -> Spłaszcz -> Sanityzuj -> PDF na PDF/A -> Pobierz.
- **Zbiorcze wyodrębnianie obrazów**: Wejście PDF (wiele plików) -> Wyodrębnij obrazy -> Pobierz ZIP.
- **Broszury gotowe do druku**: Wejście PDF -> Broszura -> Przytnij -> Kompresuj -> Pobierz.
- **Bezpieczna dystrybucja**: Wejście PDF -> Redaguj -> Usuń adnotacje -> Szyfruj -> Pobierz.

## Wskazówki

- Użyj klawisza **Delete** lub **Backspace**, aby usunąć zaznaczony węzeł z kanwy.
- Kliknij przycisk **X** na pasku stanu węzła, aby usunąć go bezpośrednio.
- Przesuwaj kanwę, klikając i przeciągając puste miejsce. Podczas przesuwania kursor zmienia się w ikonę chwytania.
- Na urządzeniach mobilnych użyj przycisku **+** na pasku narzędzi, aby przełączyć przybornik węzłów.
- Jeśli przepływ tworzy wiele plików wyjściowych, węzeł Pobierz automatycznie pakuje je do ZIP.
- Zacznij prosto: zbuduj i przetestuj potok z dwóch węzłów, zanim dodasz złożoność.

## Powiązane narzędzia

- [PDF na Tekst](./pdf-to-text)
- [PDF na Excel](./pdf-to-excel)
- [Wyodrębnij obrazy](./extract-images)
- [PDF na Markdown](./pdf-to-markdown)
