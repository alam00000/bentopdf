---
title: Zweryfikuj podpis
description: Weryfikuj podpisy cyfrowe w plikach PDF. Sprawdź ważność certyfikatu, tożsamość podpisującego, integralność dokumentu i status łańcucha zaufania.
---

# Zweryfikuj podpis

Prześlij podpisany plik PDF, a narzędzie wyodrębni każdy podpis cyfrowy, zidentyfikuje podpisującego, sprawdzi ważność certyfikatu i poinformuje, czy dokument został zmodyfikowany po podpisaniu. Możesz też podać zaufany certyfikat, aby zweryfikować łańcuch podpisu.

## Jak to działa

1. Prześlij podpisany plik PDF. Weryfikacja rozpocznie się automatycznie.
2. Narzędzie wyświetli podsumowanie: liczbę znalezionych podpisów i ile z nich jest ważnych.
3. Każdy podpis ma osobną kartę ze szczegółami: podpisujący, wystawca, daty i status.
4. Opcjonalnie prześlij **zaufany certyfikat** (.pem, .crt, .cer, .der), aby zweryfikować podpis względem konkretnego punktu zaufania. Ponowna weryfikacja uruchomi się automatycznie.

## Co jest sprawdzane

### Analiza podpisu

Narzędzie wyodrębnia z pliku PDF obiekty podpisu PKCS#7, dekoduje strukturę ASN.1 i pobiera certyfikat X.509 podpisującego wraz z ewentualnym łańcuchem certyfikatów osadzonym w podpisie.

### Ważność certyfikatu

- **Wygaśnięcie**: czy certyfikat mieści się obecnie w okresie ważności?
- **Wykrywanie samopodpisanych**: czy certyfikat jest własnym wystawcą?
- **Łańcuch zaufania**: gdy podano zaufany certyfikat, czy certyfikat podpisującego prowadzi do niego łańcuchem?

### Weryfikacja kryptograficzna

- Narzędzie odtwarza bajty objęte `/ByteRange` podpisu, haszuje je algorytmem zadeklarowanym przez podpisującego i porównuje wynik z atrybutem `messageDigest` wewnątrz podpisu.
- Następnie ponownie serializuje podpisane atrybuty jako DER SET i weryfikuje podpis kluczem publicznym certyfikatu podpisującego.
- **Podpis jest uznawany za ważny tylko wtedy, gdy wszystkie te kroki zakończą się powodzeniem.** Jeśli bajty pliku PDF zmieniono po podpisaniu lub osadzony podpis nie pasuje do klucza podpisującego, status pokaże "Nieprawidłowy: weryfikacja kryptograficzna nie powiodła się" wraz z konkretnym powodem.

#### Obsługiwane algorytmy podpisu

| Algorytm                | Ścieżka weryfikacji                                                              |
| ----------------------- | -------------------------------------------------------------------------------- |
| RSA (PKCS#1 v1.5)       | node-forge `publicKey.verify`, z awaryjnym użyciem Web Crypto                    |
| RSA-PSS (RSASSA-PSS)    | Web Crypto `verify({name: 'RSA-PSS', saltLength})`                               |
| ECDSA P-256/P-384/P-521 | Web Crypto `verify({name: 'ECDSA', hash})` po konwersji podpisu DER → IEEE P1363 |

Jeśli podpis używa algorytmu spoza tej listy (na przykład Ed25519, SM2 lub RSA z nietypowym OID skrótu), karta pokazuje na żółto **"Niezweryfikowany: nieobsługiwany algorytm podpisu"** wraz z konkretnym OID lub powodem. To celowe rozróżnienie trzech stanów:

- **Prawidłowy**: podpis został kryptograficznie zweryfikowany kluczem publicznym podpisującego.
- **Nieprawidłowy**: weryfikacja się odbyła i dała wynik negatywny (zmienione bajty, niezgodność klucza).
- **Niezweryfikowany**: narzędzie nie mogło przeprowadzić weryfikacji dla tego algorytmu. Metadane certyfikatu są nadal wyświetlane, ale podpis należy traktować jako "nieznany" i zweryfikować go w Adobe Acrobat lub za pomocą `openssl cms -verify`.

### Niebezpieczne algorytmy skrótu

- Podpisy używające **MD5 lub SHA-1** są odrzucane jako nieważne i oznaczane statusem "Niebezpieczny skrót". Oba algorytmy mają opublikowane ataki kolizyjne, więc podpis złożony na skrócie SHA-1 lub MD5 nie gwarantuje integralności.
- SHA-224, SHA-256, SHA-384 i SHA-512 są akceptowane.

### Zakres pokrycia dokumentu

- **Pełne pokrycie**: podpis obejmuje cały plik PDF, czyli po podpisaniu nie dodano ani nie zmieniono żadnych bajtów.
- **Częściowe pokrycie**: podpis obejmuje tylko część pliku. Może to oznaczać modyfikacje po podpisaniu (niekoniecznie złośliwe, bo zapisy przyrostowe dają częściowe pokrycie).

## Szczegóły podpisu

Każda karta podpisu pokazuje:

- **Podpisał**: nazwę zwykłą, organizację i adres e-mail z certyfikatu podpisującego
- **Wystawca**: urząd certyfikacji, który wystawił certyfikat podpisującego
- **Data podpisu**: znacznik czasu osadzony w podpisie
- **Ważny od / Ważny do**: okres ważności certyfikatu
- **Powód**: powód podpisania dokumentu (jeśli podano)
- **Lokalizacja**: miejsce podpisania (jeśli podano)
- **Status pokrycia**: pełne lub częściowe
- **Odznaka zaufania**: zaufany lub spoza łańcucha zaufania (tylko gdy podano własny certyfikat)

### Szczegóły techniczne

Rozwiń sekcję szczegółów technicznych, aby zobaczyć:

- Numer seryjny certyfikatu podpisującego
- Algorytm skrótu (SHA-256, SHA-512 itd.)
- Algorytm podpisu (RSA z SHA-256, ECDSA z SHA-256 itd.)
- Komunikaty o błędach dla nieważnych podpisów

## Zastosowania

- Weryfikacja podpisanej cyfrowo umowy przed kontrasygnatą
- Audyt podpisanych dokumentów w celu potwierdzenia, że nie zostały zmienione
- Sprawdzenie, czy certyfikat wygasł od czasu podpisania dokumentu
- Weryfikacja podpisów względem certyfikatu głównego Twojej organizacji
- Sprawdzanie szczegółów podpisu w dokumentach urzędowych lub prawnych

## Wskazówki

- Certyfikat samopodpisany nie oznacza, że podpis jest nieważny. Oznacza, że tożsamości podpisującego nie można potwierdzić przez zaufaną stronę trzecią. To częste w dokumentach wewnętrznych.
- Częściowe pokrycie nie zawsze oznacza manipulację. Wiele procesów PDF dodaje aktualizacje przyrostowe (jak drugi podpis), które dają częściowe pokrycie.
- Prześlij certyfikat główny lub pośredni swojej organizacji jako zaufany certyfikat, aby uzyskać weryfikację łańcucha zaufania.

## Powiązane narzędzia

- [Podpis cyfrowy PDF](./digital-sign-pdf): podpisz pliki PDF własnym certyfikatem
- [Spłaszcz PDF](./flatten-pdf): spłaszcz plik PDF przed podpisaniem, aby zapobiec modyfikacjom po podpisie
- [Usuń metadane](./remove-metadata): wyczyść plik PDF przed złożeniem podpisu
