---
title: Tekst til PDF
description: Konvertér rene tekstfiler eller skrevet tekst til PDF med brugerdefinerede skrifttyper, farver og sidestørrelser.
---

# Tekst til PDF

Konvertér ren tekst til en formateret PDF. Du kan uploade `.txt`-filer eller skrive direkte i den indbyggede teksteditor. Værktøjet understøtter flere skrifttyper, brugerdefinerede tekstfarver og et bredt udvalg af sidestørrelser, fra A0 ned til A10 samt US Letter, Legal og Tabloid.

## Understøttede formater

| Input              | Filendelser                   |
| :----------------- | :---------------------------- |
| Rene tekstfiler    | `.txt`                        |
| Direkte tekstinput | Skriv eller indsæt i editoren |

## Sådan fungerer det

1. Vælg inputtilstand med kontakten øverst: **Upload filer** eller **Skriv tekst**.
2. Hvis du uploader, så træk og slip eller klik for at vælge en eller flere `.txt`-filer. Hvis du skriver, så indtast din tekst direkte i tekstfeltet.
3. Konfigurér formateringsindstillingerne: skrifttypefamilie, skriftstørrelse, tekstfarve og sidestørrelse.
4. Klik på **Opret PDF**. Resultatet downloades som `text_to_pdf.pdf`.

Når du uploader flere filer, sættes deres indhold sammen med tomme linjer imellem.

## Indstillinger

| Indstilling           | Værdier                                                                          | Standard       |
| :-------------------- | :------------------------------------------------------------------------------- | :------------- |
| **Skrifttypefamilie** | Helvetica (sans-serif), Tiro (serif), Courier (monospace), Times (serif)         | Helvetica      |
| **Skriftstørrelse**   | 6 til 72 pt                                                                      | 12             |
| **Tekstfarve**        | Enhver farve via farvevælger                                                     | Sort (#000000) |
| **Sidestørrelse**     | ISO A0 til A10, B0 til B10, C0 til C10, US Letter, Legal, Tabloid, Ledger, 11x17 | A4             |

RTL-sprog (arabisk, hebraisk, persisk, urdu) registreres automatisk. Når RTL-tekst findes, skifter tekstretning og justering tilsvarende.

## Anvendelsesmuligheder

- Konvertere kodestykker eller logfiler til en udskrivbar PDF med Courier-skrifttype
- Lave en hurtig PDF af mødenoter, der er skrevet på stedet
- Formatere et rent tekstmanuskript med en bestemt skrifttype og sidestørrelse til indsendelse
- Producere en PDF-version af en README eller changelog til offline distribution

## Tips

- Brug tilstanden **Skriv tekst**, når du hurtigt vil konvertere indhold fra udklipsholderen uden først at gemme det som fil.
- Courier (monospace) er det bedste skrifttypevalg til kode, logfiler eller alt indhold, hvor kolonnejustering har betydning.
- Sidemarginerne er faste på 72 punkter (1 tomme) på alle sider.

## Relaterede værktøjer

- [Markdown til PDF](./markdown-to-pdf)
- [CSV til PDF](./csv-to-pdf)
- [Word til PDF](./word-to-pdf)
