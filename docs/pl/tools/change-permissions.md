---
title: Zmień uprawnienia
description: Ustaw lub zmień uprawnienia PDF dotyczące drukowania, kopiowania, edycji i adnotacji. Używa 256-bitowego szyfrowania AES.
---

# Zmień uprawnienia

Precyzyjnie określ, co odbiorcy mogą robić z Twoim PDF. W przeciwieństwie do podstawowego szyfrowania, które tylko blokuje plik hasłem, to narzędzie pozwala selektywnie zezwalać na drukowanie, kopiowanie, edycję, dodawanie adnotacji, wypełnianie formularzy, składanie dokumentu i wyodrębnianie stron lub je blokować, a wszystko egzekwowane przez 256-bitowe szyfrowanie AES.

## Jak to działa

1. Prześlij plik PDF.
2. Jeśli PDF jest już zaszyfrowany, wpisz **Aktualne hasło**.
3. Ustaw **Nowe hasło użytkownika** (wymagane do otwarcia) i/lub **Nowe hasło właściciela** (kontroluje uprawnienia).
4. Włączaj i wyłączaj poszczególne uprawnienia za pomocą pól wyboru.
5. Kliknij **Zmień uprawnienia**.
6. Pobierz zaktualizowany PDF.

Jeśli oba pola nowych haseł zostawisz puste, narzędzie całkowicie odszyfruje PDF, usuwając całe szyfrowanie i wszystkie ograniczenia.

## Kontrola uprawnień

| Uprawnienie                          | Co kontroluje                                         |
| ------------------------------------ | ----------------------------------------------------- |
| **Zezwól na drukowanie**             | Czy dokument można drukować                           |
| **Zezwól na kopiowanie**             | Czy tekst i obrazy można zaznaczać i kopiować         |
| **Zezwól na modyfikowanie**          | Czy treść dokumentu można edytować                    |
| **Zezwól na adnotacje**              | Czy można dodawać komentarze, zakreślenia i pieczątki |
| **Zezwól na wypełnianie formularzy** | Czy można wypełniać interaktywne pola formularzy      |
| **Zezwól na składanie dokumentu**    | Czy można wstawiać, usuwać lub obracać strony         |
| **Zezwól na wyodrębnianie stron**    | Czy można wyodrębniać pojedyncze strony               |

Wszystkie uprawnienia wymagają hasła właściciela, aby były egzekwowane. Bez hasła właściciela flagi uprawnień są ignorowane przez większość czytników PDF.

## Jak działają uprawnienia w PDF

Uprawnienia PDF są częścią specyfikacji szyfrowania. Są zapisane jako flagi bitowe w słowniku szyfrowania i egzekwowane przez zgodne czytniki PDF. Kluczowa różnica:

- **Hasło użytkownika**: wymagane do w ogóle otwarcia pliku.
- **Hasło właściciela**: wymagane do zmiany uprawnień lub usunięcia ograniczeń. Bez niego flagi uprawnień określają, jakie operacje może wykonywać użytkownik.

Jeśli ustawisz tylko hasło właściciela (bez hasła użytkownika), każdy może otworzyć plik, ale ma dostęp tylko do dozwolonych operacji. Jeśli ustawisz oba, plik wymaga hasła do otwarcia, a po uwierzytelnieniu obowiązują ograniczenia.

## Zastosowania

- Rozpowszechnianie raportu, który można przeglądać i drukować, ale nie edytować ani kopiować
- Udostępnianie wzoru umowy, który odbiorcy mogą wypełnić, ale nie zmodyfikować
- Publikowanie katalogu PDF z wyłączonym kopiowaniem obrazów
- Zezwalanie na adnotacje w wersji roboczej do recenzji przy jednoczesnym blokowaniu zmian strukturalnych

## Wskazówki

- Aby ochrona była skuteczna, zawsze ustawiaj hasło właściciela. Uprawnień bez hasła właściciela nie da się egzekwować.
- Niektóre zewnętrzne narzędzia PDF ignorują flagi uprawnień. Dla silniejszej ochrony rozważ rasteryzację PDF lub użycie DRM.
- Użyj tego narzędzia, aby zaktualizować stare pliki PDF zaszyfrowane RC4 do AES-256.

## Powiązane narzędzia

- [Szyfruj PDF](./protect-pdf): proste zabezpieczenie hasłem bez szczegółowych uprawnień
- [Odszyfruj PDF](./unlock-pdf): całkowite usunięcie szyfrowania
- [Usuń restrykcje](./remove-restrictions): usuń wszystkie ograniczenia, gdy znasz hasło właściciela
