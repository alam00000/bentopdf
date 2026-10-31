---
title: Podpis cyfrowy
description: Dodawaj kryptograficzne podpisy cyfrowe do plików PDF za pomocą certyfikatów X.509. Obsługuje formaty PKCS#12 i PEM oraz opcje widocznego podpisu.
---

# Podpis cyfrowy

Podpis cyfrowy to kryptograficzny dowód, że konkretna osoba podpisała dokument i że dokument nie został zmieniony od tego czasu. W przeciwieństwie do narysowanego podpisu (który jest tylko obrazem) podpis cyfrowy używa certyfikatów X.509 i standardów PKCS#7, aby zapewnić weryfikowalną autentyczność i integralność.

BentoPDF nakłada podpisy cyfrowe w całości w Twojej przeglądarce. Twój klucz prywatny nigdy nie opuszcza urządzenia.

## Jak to działa

1. Prześlij plik PDF.
2. Prześlij plik certyfikatu (.pfx, .p12 lub .pem).
3. Wpisz hasło certyfikatu, aby go odblokować. Narzędzie wyświetli podmiot certyfikatu, wystawcę i okres ważności.
4. Opcjonalnie skonfiguruj metadane podpisu (powód, lokalizacja, dane kontaktowe).
5. Opcjonalnie włącz **widoczny podpis** z dostosowaniem pozycji, rozmiaru, obrazu i tekstu.
6. Kliknij **Podpisz PDF**.

## Obsługiwane formaty certyfikatów

| Format      | Rozszerzenia | Opis                                                                                                               |
| ----------- | ------------ | ------------------------------------------------------------------------------------------------------------------ |
| **PKCS#12** | .pfx, .p12   | Standardowy w branży pakiet zawierający klucz prywatny i łańcuch certyfikatów. Najpopularniejszy format.           |
| **PEM**     | .pem         | Format tekstowy. Musi zawierać certyfikat i klucz prywatny w jednym pliku. Obsługuje zaszyfrowane klucze prywatne. |

## Opcje widocznego podpisu

Po włączeniu na stronie PDF renderowany jest widoczny blok podpisu:

- **Pozycja**: współrzędne X/Y oraz szerokość/wysokość w punktach
- **Strona**: pierwsza strona, ostatnia strona, wszystkie strony lub konkretny numer strony
- **Obraz**: prześlij obraz PNG, JPG lub WebP (Twój odręczny podpis, pieczęć firmy itp.)
- **Tekst**: własny tekst z konfigurowalnym kolorem i rozmiarem czcionki. Jeśli nie podano obrazu ani tekstu, narzędzie automatycznie generuje tekst z nazwy pospolitej certyfikatu (common name) i bieżącej daty.

## Metadane podpisu

- **Powód**: dlaczego dokument został podpisany (np. "Zatwierdzono", "Przejrzano")
- **Lokalizacja**: gdzie odbyło się podpisywanie (np. "Nowy Jork, NY")
- **Dane kontaktowe**: jak skontaktować się z podpisującym (np. adres e-mail)

## Uwaga o połączeniu z internetem

Podpisywanie może wymagać połączenia z internetem. Biblioteka podpisująca pobiera łańcuch certyfikatów z adresów URL zapisanych w rozszerzeniu Authority Information Access (AIA) Twojego certyfikatu. Jeśli te serwery są nieosiągalne, podpisywanie nie powiedzie się dla certyfikatów wymagających walidacji łańcucha.

## Zastosowania

- Podpisywanie umów, ofert i porozumień prawnie wiążącymi podpisami cyfrowymi
- Poświadczanie oficjalnych dokumentów w procesach wymagających uwierzytelniania opartego na PKI
- Podpisywanie faktur PDF dla zgodności z przepisami (wiele krajów UE wymaga podpisanych cyfrowo e-faktur)
- Dodawanie organizacyjnego zatwierdzenia do rysunków technicznych lub dokumentów jakościowych

## Wskazówki

- Certyfikaty samopodpisane nadają się do testów, ale w Adobe Reader pokażą ostrzeżenia. W dokumentach produkcyjnych używaj certyfikatu od zaufanego urzędu certyfikacji.
- Widoczny podpis jest wyłącznie wizualny. Podpis kryptograficzny jest osadzany niezależnie od tego, czy widoczny blok jest włączony.
- Zweryfikuj podpisany PDF narzędziem Zweryfikuj podpis PDF, aby potwierdzić, że podpis jest nienaruszony.

## Powiązane narzędzia

- [Zweryfikuj podpis PDF](./validate-signature-pdf): weryfikuj podpisy cyfrowe w podpisanych plikach PDF
- [Spłaszcz PDF](./flatten-pdf): spłaszcz formularze przed podpisaniem, aby zapobiec modyfikacjom
- [Szyfruj PDF](./protect-pdf): dodaj ochronę hasłem na wierzch podpisu cyfrowego
- [Usuń metadane](./remove-metadata): usuń metadane przed podpisaniem
