---
title: Ändra behörigheter
description: Ange eller ändra PDF-behörigheter för utskrift, kopiering, redigering och kommentarer. Använder 256-bitars AES-kryptering.
---

# Ändra behörigheter

Finjustera vad mottagarna kan göra med din PDF. Till skillnad från enkel kryptering som bara låser filen bakom ett lösenord låter det här verktyget dig selektivt tillåta eller förbjuda utskrift, kopiering, redigering, kommentarer, ifyllning av formulär, dokumentsammansättning och sidextrahering, allt framtvingat genom 256-bitars AES-kryptering.

## Så fungerar det

1. Ladda upp en PDF-fil.
2. Om PDF-filen redan är krypterad, ange **Nuvarande lösenord**.
3. Ange ett **Nytt användarlösenord** (krävs för att öppna) och/eller ett **Nytt ägarlösenord** (styr behörigheterna).
4. Slå på eller av enskilda behörigheter med kryssrutorna.
5. Klicka på **Ändra behörigheter**.
6. Ladda ner den uppdaterade PDF-filen.

Om du lämnar båda fälten för nya lösenord tomma dekrypterar verktyget PDF-filen helt och tar bort all kryptering och alla begränsningar.

## Behörighetskontroller

| Behörighet                        | Vad den styr                                             |
| --------------------------------- | -------------------------------------------------------- |
| **Tillåt utskrift**               | Om dokumentet får skrivas ut                             |
| **Tillåt kopiering**              | Om text och bilder får markeras och kopieras             |
| **Tillåt ändringar**              | Om dokumentets innehåll får redigeras                    |
| **Tillåt kommentarer**            | Om kommentarer, markeringar och stämplar får läggas till |
| **Tillåt ifyllning av formulär**  | Om interaktiva formulärfält får fyllas i                 |
| **Tillåt dokumentsammansättning** | Om sidor får infogas, tas bort eller roteras             |
| **Tillåt sidextrahering**         | Om enskilda sidor får extraheras                         |

Alla behörigheter kräver ett ägarlösenord för att kunna framtvingas. Utan ägarlösenord ignoreras behörighetsflaggorna av de flesta PDF-läsare.

## Så fungerar behörigheter i PDF

PDF-behörigheter är en del av krypteringsspecifikationen. De lagras som bitflaggor i krypteringsordlistan och framtvingas av kompatibla PDF-läsare. Den viktiga skillnaden:

- **Användarlösenord**: Krävs för att över huvud taget öppna filen.
- **Ägarlösenord**: Krävs för att ändra behörigheter eller ta bort begränsningar. Utan det styr behörighetsflaggorna vilka åtgärder användaren kan utföra.

Om du bara anger ett ägarlösenord (inget användarlösenord) kan vem som helst öppna filen men är begränsad till de tillåtna åtgärderna. Om du anger båda kräver filen ett lösenord för att öppnas och är begränsad efter autentisering.

## Användningsfall

- Distribuera en rapport som kan visas och skrivas ut men inte redigeras eller kopieras
- Dela en avtalsmall som mottagarna kan fylla i men inte ändra
- Publicera en PDF-katalog där kopiering av bilder är avstängd
- Tillåta kommentarer i ett granskningsutkast samtidigt som strukturella ändringar förhindras

## Tips

- För att vara effektiv bör du alltid ange ett ägarlösenord. Behörigheter utan ägarlösenord går inte att framtvinga.
- Vissa PDF-verktyg från tredje part ignorerar behörighetsflaggor. För starkare skydd kan du överväga att rasterisera PDF-filen eller använda DRM.
- Använd det här verktyget för att uppgradera gamla RC4-krypterade PDF-filer till AES-256.

## Relaterade verktyg

- [Skydda PDF](./protect-pdf): enkelt lösenordsskydd utan detaljerade behörigheter
- [Lås upp PDF](./unlock-pdf): ta bort krypteringen helt
- [Ta bort begränsningar](./remove-restrictions): ta bort alla begränsningar när du har ägarlösenordet
