---
title: OCR PDF
description: Spraw, by zeskanowane PDF-y były przeszukiwalne i kopiowalne dzięki Tesseract OCR z obsługą wielu języków i filtrowaniem znaków.
---

# OCR PDF

Zamień zeskanowane dokumenty w przeszukiwalne, kopiowalne PDF-y. Narzędzie używa Tesseract OCR do rozpoznawania tekstu na obrazach i nakłada niewidoczną warstwę tekstową na oryginalne strony, zachowując ich wygląd i czyniąc zawartość w pełni przeszukiwalną.

## Jak to działa

1. Prześlij zeskanowany PDF lub PDF oparty na obrazach.
2. Wybierz z przeszukiwalnej listy jeden lub więcej języków występujących w dokumencie.
3. Opcjonalnie dostosuj ustawienia zaawansowane (rozdzielczość, binaryzacja, biała lista).
4. Kliknij **Rozpocznij OCR** i śledź postęp na pasku postępu w czasie rzeczywistym.
5. Po zakończeniu przejrzyj wyodrębniony tekst, a następnie pobierz przeszukiwalny PDF lub zwykły plik `.txt`.

## Funkcje

- OCR w wielu językach z przeszukiwalnym selektorem języka
- Niewidoczna warstwa tekstowa zachowuje oryginalny wygląd dokumentu
- Pasek postępu i dziennik w czasie rzeczywistym podczas przetwarzania
- Pobieranie wyników jako przeszukiwalny PDF lub zwykły plik tekstowy
- Kopiowanie wyodrębnionego tekstu bezpośrednio do schowka
- Trzy poziomy rozdzielczości do balansowania szybkości i dokładności

## Opcje

| Ustawienie                    | Wartości                                                                                       | Domyślnie | Cel                                                                                    |
| ----------------------------- | ---------------------------------------------------------------------------------------------- | --------- | -------------------------------------------------------------------------------------- |
| **Rozdzielczość**             | Standardowa (192 DPI), Wysoka (288 DPI), Ultra (384 DPI)                                       | Wysoka    | Wyższa rozdzielczość poprawia dokładność przy małym tekście, ale trwa dłużej           |
| **Binaryzacja obrazu**        | Włączona / Wyłączona                                                                           | Wyłączona | Zwiększa kontrast czystych skanów przez konwersję do czerni i bieli                    |
| **Gotowa biała lista znaków** | Brak, Alfanumeryczne, Liczby + waluta, Tylko litery, Tylko liczby, Faktura, Formularze, Własna | Brak      | Ogranicza rozpoznawane znaki, aby poprawić dokładność dla określonych typów dokumentów |
| **Biała lista znaków**        | Dowolny tekst                                                                                  | Pusta     | Ręczny zestaw znaków, gdy gotowa lista jest ustawiona na Własna                        |

## Zastosowania

- Uczynienie zeskanowanych umów i faktur przeszukiwalnymi, aby móc je przeglądać przez Ctrl+F
- Wyodrębnianie tekstu z sfotografowanych dokumentów lub starych papierowych zapisów
- Przetwarzanie paragonów z gotową listą Faktura, aby dokładnie wychwycić kwoty i daty
- Tworzenie dostępnych PDF-ów ze skanów zawierających tylko obrazy, aby spełnić wymogi zgodności
- Zbiorcze wyodrębnianie tekstu ze zeskanowanych książek lub instrukcji

## Wskazówki

- Wybierz kilka języków, jeśli dokument zawiera treść w mieszanych językach (np. angielskie nagłówki z japońskim tekstem głównym).
- Użyj binaryzacji dla dokumentów z wyblakłym lub niskokontrastowym tekstem: może znacząco poprawić dokładność rozpoznawania.
- Gotowe listy Faktura i Formularze radykalnie zmniejszają liczbę fałszywych trafień w dokumentach ustrukturyzowanych, ignorując nieistotne kształty znaków.

## Powiązane narzędzia

- [Wyodrębnij tabele PDF](./extract-tables)
- [Połącz PDF](./merge-pdf)
- [Kompresuj PDF](./compress-pdf)
