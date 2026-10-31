---
title: PDF na Markdown
description: Konwertuj dokumenty PDF na format Markdown z opcjonalnym wyodrębnianiem obrazów. Obsługuje zbiorczą konwersję wielu plików.
---

# PDF na Markdown

Konwertuje pliki PDF na format Markdown (`.md`), zachowując nagłówki, akapity, listy i podstawowe formatowanie. Opcjonalnie wyodrębnia i dołącza osadzone obrazy. Obsługuje konwersję pojedynczą i zbiorczą. Wykorzystuje PyMuPDF.

## Jak to działa

1. Prześlij jeden lub więcej plików PDF, klikając strefę upuszczania lub przeciągając na nią pliki.
2. Opcjonalnie przełącz **Dołącz obrazy**, aby osadzić wyodrębnione obrazy w wyniku Markdown.
3. Kliknij **Konwertuj**, aby rozpocząć przetwarzanie.
4. Pojedynczy plik pobiera się jako `filename.md`. Wiele plików daje `markdown-files.zip`.

## Opcje

- **Dołącz obrazy**: po zaznaczeniu osadzone obrazy z PDF są wyodrębniane i przywoływane w wyniku Markdown. Po odznaczeniu konwertowana jest tylko treść tekstowa.

## Format wyjściowy

- **Jeden plik**: `filename.md`
- **Wiele plików**: `markdown-files.zip` zawierający jeden plik `.md` dla każdego wejściowego PDF.

## Przypadki użycia

- Konwertowanie dokumentacji PDF na Markdown dla generatora stron statycznych, takiego jak VitePress, Hugo lub Jekyll.
- Zamienianie artykułów naukowych w PDF na edytowalny Markdown dla aplikacji do notatek, takich jak Obsidian.
- Migrowanie starszych baz wiedzy w PDF do formatu tekstowego przyjaznego dla Gita.
- Wyodrębnianie ustrukturyzowanej treści z e-booków PDF w celu ponownego sformatowania.

## Wskazówki

- Opcja Dołącz obrazy jest przydatna, gdy PDF zawiera diagramy lub rysunki istotne dla treści. Wyłącz ją dla dokumentów z dużą ilością tekstu, aby wynik był czysty.
- Złożone układy z paskami bocznymi, przypisami lub tekstem w wielu kolumnach mogą dawać niedoskonały Markdown. Przejrzyj wynik i w razie potrzeby popraw.
- Aby uzyskać surowy tekst bez formatowania, użyj zamiast tego [PDF na Tekst](./pdf-to-text).

## Powiązane narzędzia

- [PDF na Tekst](./pdf-to-text)
- [PDF na Word](./pdf-to-word)
- [Przygotuj PDF dla AI](./prepare-pdf-for-ai)
