---
title: Platta till PDF
description: Platta till interaktiva formulär och anteckningar till statiskt innehåll. Gör formulärfält icke-redigerbara och bränner in anteckningar på sidan.
---

# Platta till PDF

Utplattning slår ihop interaktiva element (formulärfält, listrutor, kryssrutor, anteckningar, markeringar, klisterlappar) direkt med sidinnehållet. Det visuella utseendet förblir detsamma, men inget går längre att redigera eller extrahera. Det är PDF-motsvarigheten till att skriva ut ett ifyllt formulär och skanna in det igen, fast kvaliteten förblir perfekt.

## Så fungerar det

1. Ladda upp en eller flera PDF-filer.
2. Klicka på **Platta till PDF**.
3. En enskild fil laddas ned direkt. Flera filer ger ett ZIP-arkiv.

Verktyget använder pdf-lib för att platta till formulärfält (via `form.flatten()`) och en särskild anteckningsutplattare för att bränna in anteckningar i sidflödet. Båda åtgärderna sker i ett enda pass.

## Vad som plattas till

- **Formulärfält**: Textfält, kryssrutor, alternativknappar, listrutor, signaturfält
- **Anteckningar**: Kommentarer, markeringar, genomstrykning, understrykning, klisterlappar, stämplar, pennanteckningar
- **Interaktiva element**: Knappar, åtgärdsutlösare

## Vad som förblir oförändrat

- Textinnehåll (förblir markerbart och sökbart)
- Bilder och grafik
- Sidlayout och sidmått
- Bokmärken och innehållsförteckning
- Hyperlänkar (om de inte är anteckningsbaserade)

## Användningsområden

- Låsa ett ifyllt formulär så att mottagare inte kan ändra de inskickade svaren
- Förbereda en PDF för arkivering där interaktiva element är onödiga
- Åtgärda visningsproblem som orsakas av att anteckningar renderas olika i olika läsare
- Säkerställa att ett signerat dokument inte kan ändras efter att signaturen lagts till
- Minska filstorleken genom att ta bort formulärfältsdefinitioner och anteckningsobjekt

## Tips

- Platta till först när alla redigeringar är klara. Det går inte att ångra utplattningen av en PDF.
- Om du behöver platta till och dessutom ta bort metadata, JavaScript och bilagor, använd verktyget Sanera PDF i stället. Det har utplattning som ett av sina alternativ.
- Vissa PDF-filer rapporterar "inget formulär hittades". Det är normalt om dokumentet bara har anteckningar och inga formulärfält.

## Relaterade verktyg

- [Sanera PDF](./sanitize-pdf): platta till formulär och ta bort metadata, skript och mer
- [Rasterisera PDF](./rasterize-pdf): konvertera till bildbaserad PDF för maximal utplattning
- [Typsnitt till kontur](./font-to-outline): platta till typsnitt till vektorbanor
- [Skydda PDF](./protect-pdf): lås den utplattade PDF-filen med ett lösenord
