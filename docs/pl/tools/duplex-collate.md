---
title: Sortowanie skanu dwustronnego
description: Zmień kolejność skanów dwustronnych PDF, w których strony przednie i tylne są w osobnych blokach, na właściwą kolejność przód/tył.
---

# Sortowanie skanu dwustronnego

Sortowanie skanu dwustronnego jest przeznaczone do skanowania z podajnika ADF, gdzie jeden PDF zawiera dwa bloki stron:

- najpierw wszystkie przednie strony
- potem wszystkie tylne strony

Zamiast ręcznie dzielić i składać plik, to narzędzie przeplata oba bloki w naturalną kolejność czytania: przód1, tył1, przód2, tył2 i tak dalej.

## Jak to działa

1. Prześlij jeden PDF utworzony ze skanowania dwustronnego stosu.
2. Ustaw punkt podziału, w którym kończy się blok przodów.
3. Wybierz obsługę bloku tyłów:
   - **Odwróć blok tyłów** (częste, gdy stos jest odwracany przed skanowaniem tyłów)
   - **Zachowaj blok tyłów bez zmian**
4. Kliknij **Scal PDF**, aby pobrać wynik w nowej kolejności.

## Opcje

- **Automatyczne wykrycie podziału (połowa)**: ustawia punkt podziału na `ceil(totalPages / 2)`.
- **Ostrzeżenie o nieparzystej liczbie stron**: ostrzega, gdy łączna liczba stron jest nieparzysta (często oznacza niezgodność skanu).
- **Potwierdzenie nierównych bloków**: prosi o potwierdzenie, gdy rozmiary bloków przodów i tyłów się różnią.
- **Eksport grupowany**: dzieli scalony wynik na osobne pliki PDF według liczby stron oryginalnego dokumentu i pobiera je jako ZIP.

## Zachowanie wyniku

- **Domyślnie**: jeden wynikowy PDF (jeden PDF na wejściu, jeden PDF na wyjściu).
- **Tryb grupowany**: wynik jest dzielony na części według podanej liczby stron na dokument; jeśli powstanie kilka części, są pobierane jako jeden ZIP, w przeciwnym razie pobierany jest pojedynczy PDF.

Jeśli rozmiary bloków są nierówne, sparowane strony są scalane najpierw, a pozostałe niesparowane strony są dołączane na końcu.

## Typowe zastosowania

- Przywracanie kolejności po skanowaniu stosu dwustronnych formularzy w dwóch przebiegach.
- Odtwarzanie kompletów przód/tył ze skanerów biurowych, które zwracają najpierw wszystkie przody, a potem wszystkie tyły.
- Obróbka końcowa skanów archiwalnych przed podziałem na pliki dla poszczególnych dokumentów.

## Wskazówki

- Większość partii dwustronnych powinna mieć parzystą łączną liczbę stron.
- Jeśli tyły wyglądają na odwrócone, przełącz między **Odwróć blok tyłów** a **Zachowaj blok tyłów bez zmian**.
- Dla dwustronicowych oryginałów (przód + tył) użyj eksportu grupowanego z `2` stronami na dokument.

## Powiązane narzędzia

- [Naprzemienne i mieszane strony](./alternate-merge)
- [Podziel PDF](./split-pdf)
- [Połącz PDF](./merge-pdf)
- [Duplikuj i organizuj](./organize-pdf)
