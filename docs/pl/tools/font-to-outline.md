---
title: Czcionka na krzywe
description: Zamień wszystkie czcionki PDF na kontury wektorowe, aby dokument wyglądał tak samo na każdym urządzeniu. Eliminuje problemy z zależnością od czcionek.
---

# Czcionka na krzywe

Zamiana czcionek na krzywe przekształca każdy znak tekstu z glifu opartego na czcionce w ścieżkę wektorową. PDF przestaje zależeć od zainstalowanych czcionek: wygląda identycznie na każdym urządzeniu, w każdym systemie operacyjnym i na każdej drukarce. To standardowy krok w pracy przedprodukcyjnej (prepress).

## Jak to działa

1. Prześlij jeden lub więcej plików PDF.
2. Kliknij **Konwertuj na krzywe**.
3. Ghostscript zamienia cały tekst na ścieżki wektorowe.
4. Pobierz wynik. Wiele plików da archiwum ZIP.

Nie ma żadnych ustawień do skonfigurowania. Narzędzie używa Ghostscript (WebAssembly), aby w jednym przebiegu zamienić wszystkie odwołania do czcionek na ścieżki konturowe.

## Co się zmienia

- Znaki tekstu stają się krzywymi wektorowymi (ścieżkami béziera)
- Osadzanie czcionek nie jest już potrzebne, a PDF jest samowystarczalny na poziomie glifów
- Rozmiar pliku może wzrosnąć, ponieważ ścieżki wektorowe są zwykle większe niż odwołania do czcionek
- Wygląd wizualny zostaje zachowany co do joty

## Co tracisz

- Zaznaczanie tekstu i kopiowanie
- Możliwość przeszukiwania tekstu (Ctrl+F przestaje działać)
- Możliwość edycji treści tekstu
- Dostępność dla czytników ekranu

## Zastosowania

- Wysyłanie PDF-ów do drukarni, która wymaga czcionek zamienionych na krzywe
- Udostępnianie dokumentów z własnymi lub licencjonowanymi czcionkami osobom, które ich nie mają
- Zapobieganie podmianie czcionek, która zmienia wygląd dokumentu w innych systemach
- Przygotowanie PDF-ów do grawerowania laserowego lub cięcia CNC, które wymagają wejścia wektorowego
- Zapewnienie, że PDF z wieloma logotypami wyświetla się poprawnie na wszystkich platformach

## Wskazówki

- Zachowaj oryginalny PDF. Zamiana na krzywe jest nieodwracalna, nie da się zamienić ścieżek z powrotem na edytowalny tekst.
- Jeśli tekst ma pozostać przeszukiwalny, rozważ zamiast tego narzędzie Rasteryzuj PDF, a następnie OCR.
- PDF-y z krzywymi bywają większe. Jeśli rozmiar pliku ma znaczenie, uruchom potem Kompresuj PDF.

## Powiązane narzędzia

- [Spłaszcz PDF](./flatten-pdf): spłaszcz formularze i adnotacje bez ruszania czcionek
- [Rasteryzuj PDF](./rasterize-pdf): zamień na PDF oparty na obrazach zamiast konturów wektorowych
- [Kompresuj PDF](./compress-pdf): zmniejsz rozmiar pliku po zamianie na krzywe
- [PDF na PDF/A](./pdf-to-pdfa): konwertuj do archiwizacji po zapewnieniu niezależności od czcionek
