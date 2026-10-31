---
title: PDF til JSON
description: Konvertér PDF-filer til struktureret JSON-format med CPDF. Eksporterer PDF'ens interne struktur som maskinlæsbare JSON-data.
---

# PDF til JSON

Konverterer en eller flere PDF-filer til JSON-format. Værktøjet bruger CPDF (Coherent PDF) til at serialisere den interne struktur i hver PDF til en maskinlæsbar JSON-repræsentation. Outputtet leveres altid som et ZIP-arkiv.

## Sådan fungerer det

1. Vælg en eller flere PDF-filer med filvælgeren.
2. Klik på **Konvertér** for at starte behandlingen. Konverteringen kører i en web worker i baggrunden.
3. Et ZIP-arkiv downloades med én JSON-fil for hver input-PDF.

Statuslinjen viser fremdriften gennem konverteringen og oprettelsen af ZIP-filen.

## Indstillinger

Dette værktøj har ingen konfigurerbare indstillinger. Hver PDF konverteres til sin fulde JSON-repræsentation.

## Outputformat

- En `pdfs-to-json.zip`-fil med `filename.json` for hver input-PDF.

JSON-outputtet repræsenterer PDF'ens interne objektstruktur, herunder sidetræer, skrifttypereferencer, metadata og indholdsstrømme.

## Anvendelser

- Undersøge den interne struktur i en PDF til fejlfinding eller validering.
- Udtrække struktureret metadata og sideegenskaber programmatisk.
- Sende PDF-strukturdata ind i brugerdefinerede behandlingspipelines.
- Revidere PDF-dokumenter for overholdelse af krav ved at analysere deres objekttræer.

## Tips

- Dette værktøj udskriver den rå PDF-objektstruktur, ikke udtrukket tekstindhold. Hvis du har brug for sidetekst i JSON-format, kan du i stedet bruge [Forbered PDF til AI](./prepare-pdf-for-ai).
- Til almindelig tekstudtrækning er [PDF til tekst](./pdf-to-text) mere ligetil.
- Store PDF-filer med komplekse strukturer giver meget store JSON-filer.

## Relaterede værktøjer

- [PDF til tekst](./pdf-to-text)
- [Forbered PDF til AI](./prepare-pdf-for-ai)
- [Udtræk PDF-tabeller](./extract-tables)
