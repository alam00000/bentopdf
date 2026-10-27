---
title: JSON na PDF
description: Odtwarzaj pliki PDF z formatu JSON używanego przez BentoPDF. Konwertuj eksporty JSON z powrotem na oryginalne dokumenty PDF.
---

# JSON na PDF

Odtwarzaj dokumenty PDF z plików JSON utworzonych wcześniej narzędziem **PDF na JSON** w BentoPDF. To narzędzie do konwersji w obie strony: bierze ustrukturyzowaną reprezentację JSON dokumentu PDF i odbudowuje oryginalny dokument.

::: warning
To narzędzie przyjmuje tylko pliki JSON utworzone przez konwerter PDF na JSON w BentoPDF. Standardowe pliki JSON z API, baz danych lub innych narzędzi nie są obsługiwane.
:::

## Obsługiwane formaty

| Wejście | Opis                                                        |
| :------ | :---------------------------------------------------------- |
| `.json` | Pliki JSON wyeksportowane narzędziem PDF na JSON z BentoPDF |

## Jak to działa

1. Kliknij obszar przesyłania lub przeciągnij i upuść jeden lub więcej plików JSON.
2. Lista plików pokazuje każdy wybrany plik wraz z jego rozmiarem.
3. Kliknij **Konwertuj na PDF**. Narzędzie przetwarza wszystkie pliki za pomocą Web Workera i silnika CPDF.
4. Wynik zostanie pobrany jako `jsons-to-pdf.zip`, zawierający po jednym PDF-ie na każdy plik JSON.

Konwersja działa w tle w Web Workerze, więc interfejs pozostaje responsywny nawet przy dużych plikach.

## Opcje

To narzędzie nie ma konfigurowalnych opcji. Struktura JSON w pełni określa wynikowy PDF.

## Wynik

Przy konwersji wielu plików JSON wyniki są dostarczane jako archiwum ZIP. Każdy PDF ma nazwę pliku źródłowego JSON (np. `report.json` zmienia się w `report.pdf`).

## Zastosowania

- Odtwarzanie PDF-ów z kopii zapasowej lub archiwum opartego na JSON
- Przepuszczenie PDF-a przez JSON w celu inspekcji, a potem z powrotem do PDF
- Odbudowa dokumentów po programowych modyfikacjach struktury JSON
- Sprawdzenie, czy eksport PDF na JSON uchwycił całą zawartość dokumentu, przez przekonwertowanie go z powrotem

## Wskazówki

- Jeśli chcesz zamienić dowolne dane JSON (np. odpowiedzi API lub pliki konfiguracyjne) na sformatowany PDF, lepiej sprawdzi się narzędzie [Tekst na PDF](./txt-to-pdf). Wklej JSON jako tekst, a zostanie wyrenderowany z odpowiednim formatowaniem.
- Aby to narzędzie działało, silnik CPDF WebAssembly musi być dostępny. Instancje self-hosted wymagają skonfigurowanych plików CPDF WASM.

## Powiązane narzędzia

- [Tekst na PDF](./txt-to-pdf)
- [Markdown na PDF](./markdown-to-pdf)
- [CSV na PDF](./csv-to-pdf)
