---
title: CSV til PDF
description: Konvertér CSV-regnearksfiler til formaterede PDF-tabeller direkte i din browser.
---

# CSV til PDF

Gør CSV-filer om til rene, formaterede PDF-dokumenter. Hver CSV-fil fortolkes og gengives som en tabel i PDF'en. Det er nyttigt, når du skal udskrive eller dele tabeldata uden at modtageren behøver regnearksprogrammer.

## Understøttede formater

| Format | Filtypenavne |
| :----- | :----------- |
| CSV    | `.csv`       |

## Sådan fungerer det

1. Klik på uploadområdet eller træk og slip en eller flere CSV-filer.
2. Gennemgå fillisten. Tilføj flere filer eller fjern uønskede.
3. Klik på **Konvertér til PDF**. En statusindikator viser konverteringens fremdrift.
4. En enkelt fil downloades direkte som PDF. Flere filer pakkes i `csv-converted.zip`.

## Indstillinger

Dette værktøj har ingen yderligere konfiguration. CSV-filen fortolkes og formateres automatisk som en tabel.

## Output

| Antal input | Output                                             |
| :---------- | :------------------------------------------------- |
| 1 fil       | Download af en enkelt PDF (f.eks. `data.pdf`)      |
| 2+ filer    | ZIP-arkiv (`csv-converted.zip`) med én PDF pr. fil |

## Anvendelser

- Konvertér eksporterede databaserapporter til udskrivbare PDF-tabeller
- Del økonomidata eller lagerlister med personer, der ikke har Excel
- Opret PDF-versioner af CSV-logfiler til compliance-dokumentation
- Udskriv adresselister, karakterark eller andre tabeldata gemt som CSV

## Tips

- For de bedste resultater bør din CSV bruge standard kommaseparatorer. Værktøjet følger almindelige CSV-konventioner.
- Hvis din CSV har mange kolonner, kan tabellen blive presset sammen for at passe til sidebredden. Overvej at dele brede datasæt op i flere filer.
- Til Excel-filer (`.xls`, `.xlsx`) kan du bruge værktøjet [Excel til PDF](./excel-to-pdf), som bevarer regnearksformatering og flere ark.

## Relaterede værktøjer

- [Excel til PDF](./excel-to-pdf)
- [Tekst til PDF](./txt-to-pdf)
- [JSON til PDF](./json-to-pdf)
