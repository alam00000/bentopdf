---
title: XPS na PDF
description: Konwertuj dokumenty XPS i OXPS na format PDF w przeglądarce. Bez wysyłania, bez rejestracji, w pełni prywatnie.
---

# XPS na PDF

Konwertuj dokumenty Microsoft XPS i OXPS na standardowe pliki PDF. XPS (XML Paper Specification) był odpowiedzią Microsoftu na PDF, ale jego obsługa na różnych platformach zanikła. To narzędzie sprawia, że takie dokumenty znów można czytać wszędzie.

## Obsługiwane formaty

| Format | Rozszerzenie | Uwagi                                           |
| :----- | :----------- | :---------------------------------------------- |
| XPS    | `.xps`       | Oryginalny format Microsoft XPS                 |
| OXPS   | `.oxps`      | Open XPS, wariant zgodny ze standardem ECMA-388 |

## Jak to działa

1. Kliknij obszar przesyłania lub przeciągnij i upuść pliki XPS/OXPS. Można wybrać wiele plików naraz.
2. Przejrzyj listę plików. Usuń pojedyncze pliki ikoną kosza lub kliknij **Dodaj więcej plików**, aby dołączyć kolejne dokumenty.
3. Kliknij **Konwertuj na PDF**. Silnik PyMuPDF przetwarza każdy dokument lokalnie w przeglądarce.
4. Pojedynczy plik jest pobierany bezpośrednio jako PDF. Wiele plików jest pakowanych do archiwum ZIP o nazwie `xps-converted.zip`.

## Opcje

To narzędzie wykonuje bezpośrednią konwersję formatu bez dodatkowej konfiguracji. Wynik zachowuje oryginalne wymiary stron, grafikę wektorową, czcionki i obrazy ze źródła XPS.

## Zastosowania

- Otwieranie plików XPS otrzymanych ze starszych systemów Windows, w których domyślnym sterownikiem drukowania był XPS
- Konwersja dokumentów OXPS z Windows 10/11 w celu udostępnienia ich użytkownikom macOS lub Linuksa
- Archiwizacja starych plików XPS w szerzej obsługiwanym formacie
- Udostępnianie dokumentów urzędowych lub firmowych opartych na XPS odbiorcom zewnętrznym

## Wskazówki

- Rozszerzenia `.xps` i `.oxps` są obsługiwane automatycznie, więc można je mieszać w jednej partii.
- Jeśli oryginalny plik XPS powstał ze sterownika drukowania o wysokiej rozdzielczości, wynikowy PDF zachowuje tę jakość. Nie następuje żadne ponowne próbkowanie.

## Powiązane narzędzia

- [Word na PDF](./word-to-pdf)
- [XML na PDF](./xml-to-pdf)
