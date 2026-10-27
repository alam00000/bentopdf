---
title: Usuń restrykcje
description: Usuń ochronę hasłem, ograniczenia drukowania, blokady edycji i limity kopiowania z plików PDF.
---

# Usuń restrykcje

PDF może mieć dwa rodzaje haseł: hasło użytkownika (wymagane do otwarcia pliku) i hasło właściciela (określa, co można z nim robić). To narzędzie usuwa oba, wraz ze wszystkimi powiązanymi ograniczeniami: blokadami drukowania, edycji, kopiowania i adnotacji.

## Jak to działa

1. Wgraj plik PDF.
2. Jeśli PDF ma hasło właściciela, wpisz je w polu **Hasło właściciela**. Pozostaw puste, jeśli PDF ma tylko ograniczenia użycia bez hasła.
3. Kliknij **Usuń restrykcje**.
4. Pobierz PDF bez ograniczeń.

Narzędzie używa flag QPDF `--decrypt` i `--remove-restrictions`, aby utworzyć czystą kopię bez ograniczeń.

## Co zostaje usunięte

- Ochrona hasłem (zarówno hasło użytkownika, jak i właściciela)
- Ograniczenia drukowania
- Ograniczenia edycji
- Ograniczenia kopiowania tekstu i obrazów
- Ograniczenia adnotacji i komentowania
- Wszystkie inne ograniczenia bezpieczeństwa zapisane w PDF

## Zastosowania

- Odblokowanie własnego PDF, którego hasło ustawiono lata temu
- Usuwanie ograniczeń drukowania z dokumentu, do którego masz legalny dostęp
- Włączenie kopiowania i wklejania w materiałach źródłowych do robienia notatek
- Przygotowanie plików PDF dla narzędzi dostępności, które nie radzą sobie z dokumentami z ograniczeniami

## Wskazówki

- Jeśli hasło właściciela jest ustawione, musisz je znać. To narzędzie nie łamie ani nie zgaduje haseł.
- Jeśli chcesz zachować szyfrowanie pliku, ale zmienić wybrane uprawnienia, użyj zamiast tego narzędzia Zmień uprawnienia.
- Plik wynikowy nie ma żadnego szyfrowania, więc każdy, kto go otrzyma, może go swobodnie otworzyć.

## Powiązane narzędzia

- [Odszyfruj PDF](./unlock-pdf): odblokuj PDF, gdy znasz hasło użytkownika
- [Szyfruj PDF](./protect-pdf): zastosuj ponownie szyfrowanie z nowymi ustawieniami
- [Zmień uprawnienia](./change-permissions): selektywnie zmień, które działania są dozwolone
