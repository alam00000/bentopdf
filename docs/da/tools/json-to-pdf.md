---
title: JSON til PDF
description: Genskab PDF-filer fra BentoPDF's JSON-format. Konvertér JSON-eksporter tilbage til deres oprindelige PDF-dokumenter.
---

# JSON til PDF

Genskab PDF-dokumenter fra JSON-filer, der tidligere er oprettet med BentoPDF's værktøj **PDF til JSON**. Dette er et værktøj til rundturskonvertering: det tager den strukturerede JSON-repræsentation af en PDF og genopbygger det oprindelige dokument.

::: warning
Dette værktøj accepterer kun JSON-filer, der er oprettet af BentoPDF's PDF-til-JSON-konverter. Almindelige JSON-filer fra API'er, databaser eller andre værktøjer understøttes ikke.
:::

## Understøttede formater

| Input   | Beskrivelse                                               |
| :------ | :-------------------------------------------------------- |
| `.json` | JSON-filer eksporteret af BentoPDF's PDF-til-JSON-værktøj |

## Sådan fungerer det

1. Klik på uploadområdet, eller træk og slip en eller flere JSON-filer.
2. Fillisten viser hver valgt fil med dens størrelse.
3. Klik på **Konvertér til PDF**. Værktøjet behandler alle filer med en Web Worker og CPDF-motoren.
4. Outputtet downloades som `jsons-to-pdf.zip` med én PDF pr. input-JSON-fil.

Konverteringen kører i en Web Worker i baggrunden, så brugerfladen forbliver responsiv, selv med store filer.

## Indstillinger

Dette værktøj har ingen konfigurerbare indstillinger. JSON-strukturen bestemmer fuldt ud den resulterende PDF.

## Output

Når flere JSON-filer konverteres, leveres resultaterne som et ZIP-arkiv. Hver PDF navngives efter sin kilde-JSON-fil (f.eks. bliver `report.json` til `report.pdf`).

## Anvendelsesområder

- Gendannelse af PDF'er fra en JSON-baseret backup eller arkiveringspipeline
- Rundtur for en PDF gennem JSON til inspektion og derefter tilbage til PDF
- Genopbygning af dokumenter efter programmatiske ændringer i JSON-strukturen
- Kontrol af, at en PDF-til-JSON-eksport har fanget alt dokumentindhold, ved at konvertere den tilbage

## Tips

- Hvis du skal konvertere vilkårlige JSON-data (som API-svar eller konfigurationsfiler) til en formateret PDF, passer værktøjet [Tekst til PDF](./txt-to-pdf) bedre. Indsæt JSON'en som tekst, så gengives den med korrekt formatering.
- CPDF WebAssembly-motoren skal være tilgængelig, for at dette værktøj virker. Selvhostede installationer skal have CPDF WASM-filerne konfigureret.

## Relaterede værktøjer

- [Tekst til PDF](./txt-to-pdf)
- [Markdown til PDF](./markdown-to-pdf)
- [CSV til PDF](./csv-to-pdf)
