---
title: Beskyt PDF
description: Beskyt PDF-filer med adgangskode og 256-bit AES-kryptering. Angiv bruger- og ejeradgangskoder med konfigurerbare brugsbegrænsninger.
---

# Beskyt PDF

Lås din PDF bag en adgangskode, så kun autoriserede personer kan åbne den. BentoPDF bruger 256-bit AES-kryptering, den samme standard som banker og offentlige myndigheder bruger, og den udføres helt i din browser via QPDF.

## Sådan fungerer det

1. Upload en PDF-fil.
2. Angiv en **brugeradgangskode** (påkrævet). Det er den adgangskode, folk skal bruge for at åbne filen.
3. Angiv eventuelt en **ejeradgangskode**. Når den er sat, får PDF'en brugsbegrænsninger, der forhindrer udskrivning, redigering, kopiering og annotering.
4. Klik på **Kryptér PDF**.
5. Download den krypterede fil.

## Adgangskodetyper

### Brugeradgangskode (påkrævet)

Brugeradgangskoden er det, modtagerne skriver for at åbne PDF'en. Uden den er dokumentet helt utilgængeligt. Enhver krypteret PDF skal have en.

### Ejeradgangskode (valgfri)

Ejeradgangskoden styrer, hvad en autoriseret bruger kan gøre, efter filen er åbnet. Når du angiver en særskilt ejeradgangskode, anvender BentoPDF automatisk det strengeste sæt begrænsninger:

- Ændring deaktiveret
- Udtrækning/kopiering deaktiveret
- Udskrivning deaktiveret
- Annotering deaktiveret
- Formularudfyldning deaktiveret
- Dokumentsammensætning deaktiveret

Hvis du lader ejeradgangskoden stå tom, er PDF'en krypteret (den kræver stadig brugeradgangskoden for at blive åbnet), men har ingen brugsbegrænsninger, når den først er åbnet.

## Krypteringsdetaljer

- **Algoritme**: AES-256 (256-bit Advanced Encryption Standard)
- **Nøglelængde**: 256 bit
- **Standard**: PDF 2.0-kryptering (QPDF-implementering)

AES-256 kan med nutidens teknologi ikke brute-force'es i praksis. Sikkerheden i din krypterede PDF afhænger helt af adgangskodens styrke.

## Anvendelsesmuligheder

- Beskytte fortrolige regnskabsrapporter, før de sendes på e-mail
- Sikre juridiske dokumenter, der deles med modpartens advokat
- Tilføje en adgangskode til patientjournaler eller personhenførbare oplysninger
- Distribuere betalt indhold (e-bøger, rapporter) med adgangskontrol
- Overholde databeskyttelsespolitikker, der kræver kryptering af lagrede data

## Tips

- Brug en stærk, unik adgangskode. En adgangssætning på 12+ tegn med store og små bogstaver, tal og symboler er ideel.
- Del adgangskoden via en anden kanal (telefon, sms), aldrig i den samme e-mail som PDF'en.
- Hvis du kun vil begrænse handlinger (ingen udskrivning, ingen kopiering) uden at kræve adgangskode for at åbne, så brug værktøjet Skift tilladelser i stedet.

## Relaterede værktøjer

- [Dekryptér PDF](./unlock-pdf): fjern kryptering, når du kender adgangskoden
- [Skift tilladelser](./change-permissions): ændr bestemte brugsbegrænsninger
- [Fjern begrænsninger](./remove-restrictions): fjern al sikkerhed fra en PDF
- [Rens PDF](./sanitize-pdf): fjern skjult indhold, før du krypterer
