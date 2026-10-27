---
title: E-mail na PDF
description: Konwertuj pliki e-mail EML i MSG na PDF w przeglądarce. Zachowuje nagłówki, treść i listę załączników.
---

# E-mail na PDF

Zamień zapisane pliki e-mail na czyste, nadające się do druku pliki PDF. Narzędzie parsuje pliki EML i MSG, wyodrębnia całą wiadomość (nagłówki, treść i metadane załączników) i renderuje wszystko w uporządkowany PDF. Przydaje się do e-discovery, prowadzenia dokumentacji lub zwykłego wydrukowania ważnego e-maila.

## Obsługiwane formaty

| Format | Rozszerzenie | Uwagi                                                                      |
| :----- | :----------- | :------------------------------------------------------------------------- |
| EML    | `.eml`       | Standardowy format e-mail MIME (eksportowany z większości klientów poczty) |
| MSG    | `.msg`       | Własnościowy format Microsoft Outlook                                      |

## Jak to działa

1. Kliknij obszar przesyłania lub przeciągnij i upuść pliki EML lub MSG. W jednej partii możesz mieszać oba formaty.
2. Przejrzyj listę plików. Usuń niechciane pozycje ikoną kosza lub kliknij **Dodaj więcej plików**, aby dołączyć kolejne e-maile.
3. Skonfiguruj opcje konwersji (patrz niżej).
4. Kliknij **Konwertuj na PDF**. Narzędzie parsuje każdy e-mail, renderuje treść jako stylizowany HTML i konwertuje ją na PDF przez silnik PyMuPDF.
5. Pojedynczy e-mail pobiera się bezpośrednio jako PDF. Wiele e-maili jest pakowanych do `emails-converted.zip`.

## Opcje

| Opcja                        | Domyślnie | Opis                                                                                      |
| :--------------------------- | :-------- | :---------------------------------------------------------------------------------------- |
| **Rozmiar strony**           | A4        | Wybierz wymiary strony: A4, Letter lub Legal.                                             |
| **Dołącz DW i UDW**          | Włączone  | Po włączeniu listy odbiorców DW i UDW pojawiają się w sekcji nagłówka e-maila w PDF.      |
| **Dołącz listę załączników** | Włączone  | Po włączeniu w PDF pojawia się lista załączników e-maila (z nazwami plików i rozmiarami). |

## Zastosowania

- Archiwizacja ważnej korespondencji biznesowej jako PDF na potrzeby zgodności lub audytu
- Drukowanie wątków e-mail na potrzeby postępowań prawnych lub wniosków o ujawnienie dokumentów
- Tworzenie trwałego zapisu potwierdzeń zamówień, paragonów lub umów otrzymanych e-mailem
- Tworzenie kopii zapasowych plików MSG z Outlooka w formacie, który nie wymaga Outlooka do odczytu
- Dokumentowanie kontaktów z obsługą klienta na podstawie wyeksportowanych plików EML

## Wskazówki

- Obsługiwane są zarówno pliki EML (używane przez Thunderbirda, Apple Mail i większość klientów poczty), jak i pliki MSG z Outlooka. Wyeksportuj e-maile z klienta poczty i upuść je bezpośrednio w narzędziu.
- E-maile w formacie HTML zachowują swoją stylizację w PDF. E-maile w czystym tekście są renderowane z czytelnym, przejrzystym formatowaniem.
- Lista załączników pokazuje nazwy plików i rozmiary, ale nie osadza samych plików załączników w PDF.

## Powiązane narzędzia

- [XML na PDF](./xml-to-pdf)
- [XPS na PDF](./xps-to-pdf)
