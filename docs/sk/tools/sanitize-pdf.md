---
title: Vyčistiť PDF
description: Odstráňte z PDF skrytý a potenciálne nebezpečný obsah vrátane metadát, JavaScriptu, vložených súborov, anotácií a vrstiev.
---

# Vyčistiť PDF

PDF môžu obsahovať oveľa viac, než vidíte na obrazovke. Skryté metadáta, vložený JavaScript, prílohy, údaje formulárov a informácie o vrstvách môžu vyzradiť citlivé údaje alebo predstavovať bezpečnostné riziko. Vyčistenie ich všetky odstráni a zostane vám čistý dokument, ktorý môžete bezpečne zdieľať verejne.

## Ako to funguje

1. Nahrajte súbor PDF.
2. V zozname vyberte, ktoré prvky sa majú odstrániť.
3. Kliknite na **Vyčistiť PDF**.
4. Stiahnite vyčistený súbor.

## Možnosti čistenia

Všetky možnosti sú predvolene zapnuté. Zrušte začiarknutie tých, ktoré chcete zachovať.

| Možnosť                          | Čo odstráni                                                                 |
| -------------------------------- | --------------------------------------------------------------------------- |
| **Zlúčiť formuláre**             | Prevedie interaktívne polia formulárov na statický obsah                    |
| **Odstrániť metadáta**           | Odstráni autora, názov, dátum vytvorenia, informácie o softvéri a údaje XMP |
| **Odstrániť anotácie**           | Vymaže komentáre, zvýraznenia, lepiace poznámky a značky                    |
| **Odstrániť JavaScript**         | Odstráni vložené skripty, ktoré by sa mohli spustiť pri otvorení            |
| **Odstrániť vložené súbory**     | Odstráni prílohy vložené v PDF                                              |
| **Odstrániť vrstvy (OCG)**       | Zlúči skupiny voliteľného obsahu do jednej vrstvy                           |
| **Odstrániť odkazy**             | Odstráni hypertextové odkazy a odkazy na URL                                |
| **Odstrániť stromovú štruktúru** | Odstráni štruktúru dokumentu používanú na značkovanie prístupnosti          |
| **Odstrániť MarkInfo**           | Odstráni informácie o označenom obsahu                                      |
| **Odstrániť písma**              | Odstráni údaje vložených písiem (používajte opatrne)                        |

## Prípady použitia

- Príprava PDF na verejné zverejnenie odstránením interných metadát (mená autorov, verzie softvéru, história úprav)
- Odstránenie JavaScriptu z PDF prijatého z nedôveryhodného zdroja pred jeho otvorením
- Vyčistenie PDF pred odoslaním klientovi, ktorý by nemal vidieť vložené komentáre ani názvy polí formulárov
- Odstránenie skrytých vrstiev z architektonického výkresu pred zdieľaním konečnej verzie
- Dodržiavanie požiadaviek na minimalizáciu údajov podľa predpisov o ochrane súkromia

## Tipy

- Možnosť „Odstrániť písma“ nechajte nezačiarknutú, pokiaľ si nie ste istí, že sa PDF stále vykreslí správne. Odstránenie písiem môže v niektorých prehliadačoch spôsobiť, že text bude neviditeľný.
- Ak potrebujete odstrániť len metadáta, samostatný nástroj Odstrániť metadáta je rýchlejší a cielenejší.
- Vyčistenie je nevratné. Pôvodný súbor si ponechajte.

## Súvisiace nástroje

- [Odstrániť metadáta](./remove-metadata): odstránenie len metadát bez zásahu do iného obsahu
- [Zlúčiť vrstvy PDF](./flatten-pdf): cielené zlúčenie formulárov a anotácií
- [Zašifrovať PDF](./protect-pdf): pridanie ochrany heslom po vyčistení
- [Rastrovať PDF](./rasterize-pdf): krajná možnosť, prevod na obrázky na odstránenie všetkého skrytého obsahu
