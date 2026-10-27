---
title: Kompresuj PDF
description: Zmniejsz rozmiar pliku PDF nawet o 90% dzięki silnikowi Hyper Compress. Obsługuje docelowe rozmiary plików, przetwarzanie wsadowe i własne ustawienia jakości.
---

# Kompresuj PDF

Zmniejsz pliki PDF bez ich niszczenia. Kompresuj PDF działa na [Hyper Compress](https://www.bentopdf.com/hyper-compress), własnym silniku kompresji BentoPDF. Ponownie kompresuje obrazy, tworzy podzbiory i scala czcionki oraz usuwa zbędny balast, taki jak osadzone miniatury i prywatne dane aplikacji. PDF pozostaje w pełni funkcjonalny: tekst można nadal zaznaczać, a linki i pola formularzy działają.

Hyper Compress jest skompilowany do WebAssembly i dostarczany z BentoPDF, więc kompresja działa offline i we wdrożeniach odciętych od sieci, bez dodatkowej konfiguracji.

## Jak to działa

1. Prześlij jeden lub więcej plików PDF, klikając strefę upuszczania lub przeciągając do niej pliki.
2. Wybierz **Poziom kompresji**: Niski, Średni, Wysoki lub Bezstratny.
3. Opcjonalnie wpisz **Docelowy rozmiar pliku** lub rozwiń **Ustawienia niestandardowe**, aby uzyskać szczegółową kontrolę, w tym **Konwertuj na odcienie szarości**.
4. Kliknij **Kompresuj PDF**. W przypadku wielu plików otrzymasz jedno pobranie ZIP.

## Dokumenty specjalne

- **Podpisane cyfrowo pliki PDF** są zwracane bez zmian, ponieważ każda zmiana unieważniłaby podpis. Włącz **Zastąp ochronę treści** w Ustawieniach niestandardowych, aby usunąć podpisy i skompresować plik. Widoczny podpis pozostaje na stronie, ale plik nie jest już podpisany.
- **Pliki PDF/A** tracą po kompresji oznaczenie PDF/A, aby plik nigdy nie deklarował zgodności, której już nie spełnia. Włącz **Zachowaj PDF/A** w Ustawieniach niestandardowych, aby zamiast tego zachować zgodność pliku.
- **Pliki PDF chronione hasłem** mają pole hasła na karcie pliku. Wpisz tam hasło, a Hyper Compress sam otworzy plik, bez osobnego kroku odblokowania. Przy dwóch lub więcej zablokowanych plikach jedno wspólne pole odblokowuje każdy plik z tym samym hasłem. Skompresowana kopia nie ma hasła; użyj [Szyfruj PDF](./protect-pdf), aby dodać je ponownie.
- **Skany bez warstwy tekstowej** można jeszcze bardziej zmniejszyć za pomocą **Rasteryzuj strony** w Ustawieniach niestandardowych, co zastępuje każdą stronę jednym zoptymalizowanym obrazem. Opcja jest pomijana dla każdego dokumentu z zaznaczalnym tekstem, w tym dla skanów po OCR, chyba że włączono **Zastąp ochronę treści**. Wtedy strony z tekstem też stają się obrazami, więc tekst przestaje być zaznaczalny, a linki przestają działać.

## Poziomy kompresji

| Poziom         | Jakość obrazu     | Maks. rozdzielczość | Najlepsze do                           |
| -------------- | ----------------- | ------------------- | -------------------------------------- |
| **Niski**      | 80                | 200 DPI             | Zachowania jakości wizualnej           |
| **Średni**     | 50                | 150 DPI             | Codziennych dokumentów                 |
| **Wysoki**     | 20                | 72 DPI              | Załączników e-mail, wysyłania do sieci |
| **Bezstratny** | Obrazy nietknięte | Bez zmian           | Kopii archiwalnych                     |

Poziom Wysoki usuwa też osadzenie 14 standardowych czcionek PDF oraz ich odpowiedników, takich jak Arial, gdy jest to bezpieczne.

## Docelowy rozmiar pliku

Wpisz rozmiar w KB lub MB, a Hyper Compress poszuka najlepszej jakości obrazu, która jeszcze się mieści, zaczynając od wybranego poziomu. Jeśli dokument nie może być aż tak mały, otrzymasz najmniejszą możliwą wersję oraz komunikat o tym. Dedykowane strony, takie jak [Kompresuj PDF do 1MB](https://www.bentopdf.com/compress-pdf-to-1mb), otwierają się z już wypełnionym celem.

## Ustawienia niestandardowe

Rozwiń panel Ustawienia niestandardowe, aby bezpośrednio dostosować Hyper Compress. Wybór poziomu kompresji resetuje te ustawienia do wartości tego poziomu, a edycja któregokolwiek z nich przełącza poziom na Niestandardowy.

- **Zastąp ochronę treści**: domyślnie Hyper Compress pozostawia podpisane pliki PDF nietknięte i nie rasteryzuje stron z tekstem. Włączenie tej opcji omija oba zabezpieczenia. Pozostaje włączona po zmianie poziomu.

- **Obrazy**: jakość obrazu, maksymalna rozdzielczość, wymuszone ponowne próbkowanie, redukcja kolorów, przycinanie niewidocznych obszarów obrazów, usuwanie obrazów alternatywnych, upraszczanie profili kolorów, JPEG 2000 i tryb bezstratny
- **Czcionki**: tworzenie podzbiorów, scalanie duplikatów oraz usuwanie osadzenia standardowych czcionek i ich odpowiedników
- **Treść**: spłaszczanie adnotacji, pól formularzy lub linków
- **Czyszczenie**: usuwanie miniatur, danych aplikacji, wątków artykułów, informacji o przechwytywaniu stron WWW, drzewa struktury lub intencji wyjściowych
- **Rasteryzacja**: zastępowanie stron obrazami, dla skanów składających się wyłącznie z obrazów; pomijana, gdy dokument ma zaznaczalny tekst
- **Wyjście**: Zachowaj PDF/A oraz kompresja Brotli dla czytników PDF 2.0, które ją obsługują

## Zastosowania

- Zmniejszenie 50-megabajtowego raportu poniżej limitu załącznika e-mail
- Zmieszczenie skanu w ścisłym limicie wysyłania portalu dzięki docelowemu rozmiarowi pliku
- Optymalizacja PDF marketingowych pod szybsze pobieranie ze strony
- Archiwizacja dużych zbiorów dokumentów, gdy liczą się koszty przechowywania
- Zmniejszenie zużycia danych mobilnych przy udostępnianiu PDF w komunikatorach

## Wskazówki

- Zacznij od poziomu Średni. Jeśli wynik jest nadal za duży, ustaw docelowy rozmiar pliku lub przejdź na Wysoki.
- Dla skanu bez warstwy tekstowej włącz Rasteryzuj strony w Ustawieniach niestandardowych.
- Konwertuj na odcienie szarości, w Ustawieniach niestandardowych, może zmniejszyć rozmiar dokumentów z dużą ilością kolorów.

## Powiązane narzędzia

- [Linearyzuj PDF](./linearize-pdf): zoptymalizuj skompresowany PDF pod szybkie wyświetlanie w sieci
- [Rasteryzuj PDF](./rasterize-pdf): zamień strony na obrazy w określonym DPI, także strony z tekstem
- [Napraw PDF](./repair-pdf): napraw PDF uszkodzony podczas kompresji gdzie indziej
- [Usuń metadane](./remove-metadata): usuń ukryte dane dla prywatności
