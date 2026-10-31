---
title: Zabezpiecz PDF
description: Zabezpiecz pliki PDF hasłem za pomocą 256-bitowego szyfrowania AES. Ustaw hasła użytkownika i właściciela z konfigurowalnymi ograniczeniami użycia.
---

# Zabezpiecz PDF

Zablokuj PDF hasłem, aby otworzyć go mogły tylko upoważnione osoby. BentoPDF używa 256-bitowego szyfrowania AES, tego samego standardu, którego używają banki i agencje rządowe, stosowanego w całości w przeglądarce przez QPDF.

## Jak to działa

1. Wgraj plik PDF.
2. Wpisz **hasło użytkownika** (wymagane). To hasło, którego potrzebują osoby otwierające plik.
3. Opcjonalnie wpisz **hasło właściciela**. Po jego ustawieniu PDF zyskuje ograniczenia użycia, które blokują drukowanie, edycję, kopiowanie i adnotacje.
4. Kliknij **Szyfruj PDF**.
5. Pobierz zaszyfrowany plik.

## Rodzaje haseł

### Hasło użytkownika (wymagane)

Hasło użytkownika to to, co odbiorcy wpisują, aby otworzyć PDF. Bez niego dokument jest całkowicie niedostępny. Każdy zaszyfrowany PDF musi je mieć.

### Hasło właściciela (opcjonalne)

Hasło właściciela kontroluje, co upoważniony użytkownik może zrobić po otwarciu pliku. Gdy ustawisz odrębne hasło właściciela, BentoPDF automatycznie stosuje najsurowszy zestaw ograniczeń:

- Modyfikacja wyłączona
- Wyodrębnianie/kopiowanie wyłączone
- Drukowanie wyłączone
- Adnotacje wyłączone
- Wypełnianie formularzy wyłączone
- Składanie dokumentu wyłączone

Jeśli pozostawisz hasło właściciela puste, PDF jest zaszyfrowany (nadal wymaga hasła użytkownika do otwarcia), ale po otwarciu nie ma ograniczeń użycia.

## Szczegóły szyfrowania

- **Algorytm**: AES-256 (256-bitowy Advanced Encryption Standard)
- **Długość klucza**: 256 bitów
- **Standard**: szyfrowanie PDF 2.0 (implementacja QPDF)

Złamanie AES-256 metodą siłową jest przy obecnej technologii obliczeniowo niewykonalne. Bezpieczeństwo zaszyfrowanego PDF zależy wyłącznie od siły hasła.

## Zastosowania

- Ochrona poufnych raportów finansowych przed wysłaniem e-mailem
- Zabezpieczanie dokumentów prawnych udostępnianych drugiej stronie sporu
- Dodawanie hasła do dokumentacji medycznej lub danych osobowych
- Dystrybucja płatnych treści (e-booków, raportów) z kontrolą dostępu
- Zgodność z politykami ochrony danych wymagającymi szyfrowania danych w spoczynku

## Wskazówki

- Użyj silnego, unikalnego hasła. Idealna jest fraza hasła z co najmniej 12 znaków, z wielkimi i małymi literami, cyframi i symbolami.
- Przekaż hasło innym kanałem (telefon, SMS), nigdy w tym samym e-mailu co PDF.
- Jeśli chcesz tylko ograniczyć działania (bez drukowania, bez kopiowania) bez wymagania hasła do otwarcia, użyj zamiast tego narzędzia Zmień uprawnienia.

## Powiązane narzędzia

- [Odszyfruj PDF](./unlock-pdf): usuń szyfrowanie, gdy znasz hasło
- [Zmień uprawnienia](./change-permissions): zmień wybrane ograniczenia użycia
- [Usuń restrykcje](./remove-restrictions): usuń wszystkie zabezpieczenia z PDF
- [Sanityzuj PDF](./sanitize-pdf): usuń ukrytą zawartość przed szyfrowaniem
