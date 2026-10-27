---
title: Digitálny podpis
description: Pridajte do PDF kryptografické digitálne podpisy pomocou certifikátov X.509. Podporuje formáty PKCS#12 a PEM s možnosťou viditeľného podpisu.
---

# Digitálny podpis

Digitálny podpis je kryptografický dôkaz, že dokument podpísala konkrétna osoba a že dokument odvtedy nebol zmenený. Na rozdiel od nakresleného podpisu (ktorý je len obrázok) digitálny podpis využíva certifikáty X.509 a štandardy PKCS#7 na overiteľnú pravosť a integritu.

BentoPDF aplikuje digitálne podpisy úplne vo vašom prehliadači. Váš súkromný kľúč nikdy neopustí vaše zariadenie.

## Ako to funguje

1. Nahrajte súbor PDF.
2. Nahrajte súbor certifikátu (.pfx, .p12 alebo .pem).
3. Zadajte heslo certifikátu na jeho odomknutie. Nástroj zobrazí subjekt certifikátu, vydavateľa a obdobie platnosti.
4. Voliteľne nastavte metadáta podpisu (dôvod, miesto, kontaktné údaje).
5. Voliteľne zapnite **viditeľný podpis** s nastavením polohy, veľkosti, obrázka a textu.
6. Kliknite na **Podpísať PDF**.

## Podporované formáty certifikátov

| Formát      | Prípony    | Popis                                                                                                           |
| ----------- | ---------- | --------------------------------------------------------------------------------------------------------------- |
| **PKCS#12** | .pfx, .p12 | Štandardný balík so súkromným kľúčom a reťazcom certifikátov. Najbežnejší formát.                               |
| **PEM**     | .pem       | Textový formát. Musí obsahovať certifikát aj súkromný kľúč v jednom súbore. Podporuje šifrované súkromné kľúče. |

## Možnosti viditeľného podpisu

Ak je zapnutý, na strane PDF sa vykreslí blok viditeľného podpisu:

- **Poloha**: súradnice X/Y a šírka/výška v bodoch
- **Strana**: prvá strana, posledná strana, všetky strany alebo konkrétne číslo strany
- **Obrázok**: nahrajte obrázok PNG, JPG alebo WebP (váš vlastnoručný podpis, firemnú pečiatku a pod.)
- **Text**: vlastný text s nastaviteľnou farbou a veľkosťou písma. Ak nezadáte obrázok ani text, nástroj automaticky vygeneruje text z bežného mena (common name) certifikátu a aktuálneho dátumu.

## Metadáta podpisu

- **Dôvod**: prečo bol dokument podpísaný (napr. „Schválené“, „Skontrolované“)
- **Miesto**: kde sa podpis uskutočnil (napr. „New York, NY“)
- **Kontaktné údaje**: ako kontaktovať podpisujúceho (napr. e-mailová adresa)

## Poznámka k internetovému pripojeniu

Podpisovanie môže vyžadovať internetové pripojenie. Podpisová knižnica sťahuje reťazec certifikátov z adries URL vložených v rozšírení Authority Information Access (AIA) vášho certifikátu. Ak sú tieto servery nedostupné, podpisovanie zlyhá pri certifikátoch, ktoré vyžadujú overenie reťazca.

## Prípady použitia

- Podpisovanie zmlúv, ponúk a dohôd právne záväznými digitálnymi podpismi
- Certifikácia úradných dokumentov v procesoch vyžadujúcich overovanie na báze PKI
- Podpisovanie PDF faktúr kvôli súladu s predpismi (mnohé krajiny EÚ vyžadujú digitálne podpísané e-faktúry)
- Pridanie schválenia organizácie k technickým výkresom alebo dokumentom kvality

## Tipy

- Certifikáty s vlastným podpisom fungujú na testovanie, ale v Adobe Reader zobrazia varovania. Pre produkčné dokumenty použite certifikát od dôveryhodnej certifikačnej autority.
- Viditeľný podpis je čisto vizuálny. Kryptografický podpis sa vloží bez ohľadu na to, či je viditeľný blok zapnutý.
- Podpísané PDF si overte nástrojom Overiť PDF podpis, aby ste sa uistili, že podpis je neporušený.

## Súvisiace nástroje

- [Overiť PDF podpis](./validate-signature-pdf): overenie digitálnych podpisov v podpísaných PDF
- [Zlúčiť vrstvy PDF](./flatten-pdf): zlúčenie formulárov pred podpisom, aby sa zabránilo úpravám
- [Zašifrovať PDF](./protect-pdf): pridanie ochrany heslom k digitálnemu podpisu
- [Odstrániť metadáta](./remove-metadata): odstránenie metadát pred podpisom
