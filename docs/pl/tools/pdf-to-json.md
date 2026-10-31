---
title: PDF na JSON
description: Konwertuj pliki PDF na ustrukturyzowany format JSON za pomocą CPDF. Eksportuje wewnętrzną strukturę PDF jako dane JSON czytelne dla maszyn.
---

# PDF na JSON

Konwertuje jeden lub więcej plików PDF na format JSON. Narzędzie używa CPDF (Coherent PDF) do serializacji wewnętrznej struktury każdego PDF do czytelnej dla maszyn reprezentacji JSON. Wynik jest zawsze dostarczany jako archiwum ZIP.

## Jak to działa

1. Wybierz jeden lub więcej plików PDF za pomocą selektora plików.
2. Kliknij **Konwertuj**, aby rozpocząć przetwarzanie. Konwersja działa w tle w web workerze.
3. Pobiera się archiwum ZIP zawierające jeden plik JSON dla każdego wejściowego PDF.

Pasek stanu pokazuje postęp etapów konwersji i tworzenia archiwum ZIP.

## Opcje

To narzędzie nie ma konfigurowalnych opcji. Każdy PDF jest konwertowany do pełnej reprezentacji JSON.

## Format wyjściowy

- Plik `pdfs-to-json.zip` zawierający `filename.json` dla każdego wejściowego PDF.

Wynik JSON przedstawia wewnętrzną strukturę obiektów PDF, w tym drzewa stron, odwołania do czcionek, metadane i strumienie zawartości.

## Przypadki użycia

- Sprawdzanie wewnętrznej struktury PDF w celu debugowania lub walidacji.
- Programowe wyodrębnianie ustrukturyzowanych metadanych i właściwości stron.
- Przekazywanie danych o strukturze PDF do własnych potoków przetwarzania.
- Audytowanie dokumentów PDF pod kątem zgodności przez analizę ich drzew obiektów.

## Wskazówki

- To narzędzie zwraca surową strukturę obiektów PDF, a nie wyodrębniony tekst. Jeśli potrzebujesz tekstu stron w formacie JSON, użyj zamiast tego [Przygotuj PDF dla AI](./prepare-pdf-for-ai).
- Do zwykłego wyodrębniania tekstu prostszy jest [PDF na Tekst](./pdf-to-text).
- Duże pliki PDF o złożonej strukturze dają bardzo duże pliki JSON.

## Powiązane narzędzia

- [PDF na Tekst](./pdf-to-text)
- [Przygotuj PDF dla AI](./prepare-pdf-for-ai)
- [Wyodrębnij tabele PDF](./extract-tables)
