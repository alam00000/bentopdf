---
title: WebP na PDF
description: Konwertuj obrazy WebP na PDF bezpośrednio w przeglądarce z regulowaną jakością kompresji.
---

# WebP na PDF

Konwertuj format obrazów WebP od Google na PDF. Jest to szczególnie przydatne, gdy pobrane z sieci obrazy są w formacie WebP, a potrzebujesz ich w bardziej uniwersalnym formacie do druku lub udostępniania.

## Obsługiwane formaty

| Format | Rozszerzenia |
| :----- | :----------- |
| WebP   | `.webp`      |

## Jak to działa

1. Kliknij obszar przesyłania lub przeciągnij i upuść pliki WebP.
2. Przejrzyj listę plików i usuń te, których nie potrzebujesz.
3. Wybierz poziom **Jakość PDF**.
4. Kliknij **Konwertuj na PDF**. Wynik zostanie pobrany jako `from_webps.pdf`.

Wewnątrz każdy obraz WebP jest dekodowany przez API canvas przeglądarki, a następnie osadzany w PDF za pomocą pdf-lib. Dzięki temu konwersja działa w każdej przeglądarce obsługującej dekodowanie WebP (wszystkie nowoczesne ją mają).

## Opcje

**Jakość PDF** steruje kompresją podczas osadzania obrazów:

- **Wysoka jakość**: zachowuje najwięcej szczegółów.
- **Średnia jakość** (domyślnie): zrównoważony wynik.
- **Niska jakość**: najmniejszy rozmiar pliku.

## Zastosowania

- Konwersja obrazów pobranych z sieci i zapisanych jako WebP na PDF do wydruku
- Pakowanie zrzutów ekranu WebP z Chrome lub Edge do dokumentacji
- Tworzenie portfolio PDF z obrazów eksportowanych z narzędzi graficznych, które domyślnie używają WebP
- Archiwizacja obrazów WebP w bardziej uniwersalnie czytelnym formacie

## Wskazówki

- WebP jest wewnętrznie dekodowany do PNG przed osadzeniem w PDF, więc obrazy WebP bezstratne zachowują jakość przy ustawieniu Wysoka.
- Jeśli masz mieszankę WebP i innych formatów obrazów, użyj zamiast tego narzędzia [Obrazy do PDF](./image-to-pdf), które przyjmuje wszystko naraz.

## Powiązane narzędzia

- [Obrazy do PDF](./image-to-pdf)
- [PNG na PDF](./png-to-pdf)
- [JPG na PDF](./jpg-to-pdf)
