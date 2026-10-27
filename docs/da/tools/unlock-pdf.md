---
title: Lås PDF op
description: Fjern adgangskodebeskyttelse fra krypterede PDF-filer. Understøtter batchdekryptering med én adgangskode til flere filer.
---

# Lås PDF op

Hvis du har adgangskoden til en krypteret PDF, fjerner dette værktøj krypteringen helt og producerer en oplåst kopi, som alle kan åbne uden adgangskode. Det understøtter batchdekryptering, når flere PDF-filer deler den samme adgangskode.

## Sådan fungerer det

1. Upload en eller flere krypterede PDF-filer.
2. Indtast den **adgangskode**, der blev brugt til at beskytte filerne.
3. Klik på **Dekryptér PDF**.
4. En enkelt fil downloades direkte. Flere filer giver et ZIP-arkiv med alle de oplåste PDF-filer.

## Funktioner

- Dekryptering af enkeltfiler og batches
- Håndterer både brugeradgangskoder og ejeradgangskoder
- Giver et helt ukrypteret resultat uden resterende begrænsninger
- Tydelig fejlrapportering ved forkerte adgangskoder eller beskadigede filer
- Succes og fejl pr. fil i batchtilstand

## Forskellen fra Fjern begrænsninger

**Dekryptér PDF** kræver adgangskoden og fjerner al kryptering. **Fjern begrænsninger** retter sig mod brugsbegrænsninger (udskrivning, kopiering, redigering) og kræver muligvis ikke en adgangskode, hvis der kun er sat en ejeradgangskode. Brug Dekryptér, når PDF-filen slet ikke kan åbnes uden adgangskode.

## Anvendelsesområder

- Permanent oplåsning af PDF-filer, du selv har krypteret tidligere, når adgangskoden ikke længere er nødvendig
- Fjernelse af kryptering fra en batch af arkiverede dokumenter for lettere langtidsadgang
- Klargøring af adgangskodebeskyttede PDF-filer til et dokumenthåndteringssystem, der ikke understøtter krypterede filer
- Oplåsning af PDF-filer før de flettes med andre dokumenter (mange fletteværktøjer kan ikke behandle krypteret input)

## Tips

- Adgangskodefeltet gælder for alle uploadede filer. Hvis dine PDF-filer har forskellige adgangskoder, skal du behandle dem i separate batches.
- Hvis du får fejlen "Forkert adgangskode", så kontrollér for mellemrum til sidst eller caps lock.
- Efter dekryptering har resultatet ingen sikkerhed. Kryptér igen med Kryptér PDF, hvis du vil bruge en ny adgangskode.

## Relaterede værktøjer

- [Kryptér PDF](./protect-pdf): anvend kryptering igen med en ny adgangskode
- [Fjern begrænsninger](./remove-restrictions): fjern brugsbegrænsninger uden fuld dekryptering
- [Skift tilladelser](./change-permissions): ændr bestemte tilladelser på en krypteret PDF
