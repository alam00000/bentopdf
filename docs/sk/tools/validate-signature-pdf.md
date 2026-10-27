---
title: Overiť PDF podpis
description: Overte digitálne podpisy v PDF súboroch. Skontrolujte platnosť certifikátu, identitu podpisujúceho, integritu dokumentu a stav reťazca dôvery.
---

# Overiť PDF podpis

Nahrajte podpísané PDF a tento nástroj extrahuje každý digitálny podpis, identifikuje podpisujúceho, skontroluje platnosť certifikátu a oznámi, či bol dokument po podpísaní zmenený. Môžete tiež zadať dôveryhodný certifikát na overenie reťazca podpisu.

## Ako to funguje

1. Nahrajte podpísaný PDF súbor. Overovanie sa spustí automaticky.
2. Nástroj zobrazí súhrn: počet nájdených podpisov a koľko z nich je platných.
3. Každý podpis má podrobnú kartu s menom podpisujúceho, vydavateľom, dátumami a stavom.
4. Voliteľne nahrajte **dôveryhodný certifikát** (.pem, .crt, .cer, .der) na overenie podpisu voči konkrétnej kotve dôvery. Opätovné overenie prebehne automaticky.

## Čo sa kontroluje

### Analýza podpisu

Nástroj extrahuje z PDF objekty podpisu PKCS#7, dekóduje štruktúru ASN.1 a získa X.509 certifikát podpisujúceho spolu s reťazcom certifikátov vloženým v podpise.

### Platnosť certifikátu

- **Expirácia**: Je certifikát momentálne v rozsahu platnosti?
- **Detekcia vlastného podpisu**: Je certifikát svojím vlastným vydavateľom?
- **Reťazec dôvery**: Ak je zadaný dôveryhodný certifikát, vedie k nemu reťazec certifikátu podpisujúceho?

### Kryptografické overenie

- Nástroj zrekonštruuje bajty pokryté hodnotou `/ByteRange` podpisu, zahašuje ich algoritmom deklarovaným podpisujúcim a porovná výsledok s atribútom `messageDigest` v podpise.
- Potom znova serializuje podpísané atribúty ako DER SET a overí podpis voči verejnému kľúču certifikátu podpisujúceho.
- **Podpis je označený ako platný, iba ak prejdú všetky tieto kontroly.** Ak boli bajty PDF po podpísaní zmenené alebo vložený podpis nezodpovedá kľúču podpisujúceho, stav ukáže „Neplatný: kryptografické overenie zlyhalo" s konkrétnym dôvodom.

#### Podporované algoritmy podpisu

| Algoritmus              | Spôsob overenia                                                                  |
| ----------------------- | -------------------------------------------------------------------------------- |
| RSA (PKCS#1 v1.5)       | node-forge `publicKey.verify`, so záložným Web Crypto                            |
| RSA-PSS (RSASSA-PSS)    | Web Crypto `verify({name: 'RSA-PSS', saltLength})`                               |
| ECDSA P-256/P-384/P-521 | Web Crypto `verify({name: 'ECDSA', hash})` po konverzii podpisu DER → IEEE P1363 |

Ak podpis používa algoritmus mimo tohto zoznamu (napríklad Ed25519, SM2 alebo RSA s nezvyčajným OID hašu), karta zobrazí žltý stav **„Neoverený: nepodporovaný algoritmus podpisu"** spolu s konkrétnym OID alebo dôvodom. Ide o zámerné rozlíšenie troch stavov:

- **Platný**: podpis bol kryptograficky overený voči verejnému kľúču podpisujúceho.
- **Neplatný**: overenie prebehlo a dopadlo negatívne (zmenené bajty, nezhoda kľúča).
- **Neoverený**: nástroj nedokázal spustiť overenie pre tento algoritmus. Metadáta certifikátu sa stále zobrazia, ale podpis považujte za „neznámy" a overte ho v Adobe Acrobat alebo príkazom `openssl cms -verify`.

### Nezabezpečené hašovacie algoritmy

- Podpisy používajúce **MD5 alebo SHA-1** sú odmietnuté ako neplatné a označené stavom „Nezabezpečený haš". Na oba algoritmy existujú zverejnené kolízne útoky, takže podpis nad hašom SHA-1 alebo MD5 nezaručuje integritu.
- SHA-224, SHA-256, SHA-384 a SHA-512 sú akceptované.

### Pokrytie dokumentu

- **Úplné pokrytie**: Podpis pokrýva celý PDF súbor, teda po podpísaní neboli pridané ani zmenené žiadne bajty.
- **Čiastočné pokrytie**: Podpis pokrýva iba časť súboru. Môže to naznačovať zmeny po podpísaní (nie nutne škodlivé -- prírastkové ukladanie vytvára čiastočné pokrytie).

## Podrobnosti podpisu

Každá karta podpisu zobrazuje:

- **Podpísal**: Bežné meno, organizácia a e-mail z certifikátu podpisujúceho
- **Vydavateľ**: Certifikačná autorita, ktorá vydala certifikát podpisujúceho
- **Podpísané dňa**: Časová pečiatka vložená v podpise
- **Platné od / Platné do**: Obdobie platnosti certifikátu
- **Dôvod**: Prečo bol dokument podpísaný (ak je uvedený)
- **Miesto**: Kde bol podpísaný (ak je uvedené)
- **Stav pokrytia**: Úplné alebo čiastočné
- **Odznak dôvery**: Dôveryhodný alebo Mimo reťazca dôvery (iba ak je zadaný vlastný certifikát)

### Technické podrobnosti

Rozbaľte sekciu technických podrobností, kde nájdete:

- Sériové číslo certifikátu podpisujúceho
- Hašovací algoritmus (SHA-256, SHA-512 a pod.)
- Algoritmus podpisu (RSA so SHA-256, ECDSA so SHA-256 a pod.)
- Chybové hlásenia pre neplatné podpisy

## Prípady použitia

- Overenie digitálne podpísanej zmluvy pred jej spolupodpísaním
- Audit podpísaných dokumentov na potvrdenie, že neboli pozmenené
- Kontrola, či certifikát od podpísania dokumentu nevypršal
- Overenie podpisov voči koreňovému certifikátu vašej organizácie
- Kontrola údajov o podpise na úradných alebo právnych dokumentoch

## Tipy

- Certifikát s vlastným podpisom neznamená, že podpis je neplatný -- znamená to, že identitu podpisujúceho nemožno overiť cez dôveryhodnú tretiu stranu. Pri interných dokumentoch je to bežné.
- Čiastočné pokrytie nemusí vždy znamenať manipuláciu. Mnohé PDF postupy pridávajú prírastkové aktualizácie (napríklad druhý podpis), ktoré vytvárajú čiastočné pokrytie.
- Ak chcete overiť reťazec dôvery, nahrajte ako dôveryhodný certifikát koreňový alebo sprostredkujúci certifikát vašej organizácie.

## Súvisiace nástroje

- [Digitálny podpis PDF](./digital-sign-pdf) -- podpíšte PDF vlastným certifikátom
- [Zlúčiť vrstvy PDF](./flatten-pdf) -- zlúčte vrstvy PDF pred podpísaním, aby ste zabránili úpravám po podpise
- [Odstrániť metadáta](./remove-metadata) -- vyčistite PDF pred pridaním podpisu
