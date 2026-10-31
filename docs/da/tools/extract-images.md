---
title: Udtræk billeder
description: Udtræk alle indlejrede billeder fra PDF-filer. Forhåndsvis dem i et gitter og download dem enkeltvis eller som et ZIP-arkiv.
---

# Udtræk billeder

Trækker alle indlejrede billeder ud af en eller flere PDF-filer. De udtrukne billeder vises i et forhåndsvisningsgitter, hvor du kan downloade dem enkeltvis eller tage alt på én gang som en ZIP. Drevet af PyMuPDF.

## Sådan fungerer det

1. Upload en eller flere PDF'er ved at klikke på slipzonen eller trække filer hen på den. Tilføj flere filer, eller fjern enkelte efter behov.
2. Klik på **Udtræk** for at starte behandlingen.
3. Værktøjet scanner hver side i hver uploadet PDF og finder og udtrækker indlejrede billeder.
4. De udtrukne billeder vises i et gitter med miniaturer. Hvert billede har en downloadknap.
5. Klik på **Download alle** for at gemme alt som et ZIP-arkiv.

## Indstillinger

Dette værktøj har ingen konfigurerbare indstillinger. Alle indlejrede billeder udtrækkes i deres oprindelige format (typisk PNG, JPEG eller det format, billedet blev indlejret i PDF'en med).

## Outputformat

- Billeder vises i et forhåndsvisningsgitter med navne som `image_1.png`, `image_2.jpg` osv.
- **Download alle** giver `extracted-images.zip` med alle billeder.
- Enkelte billeder kan downloades ét ad gangen fra gitteret.

## Anvendelser

- Gendan fotos eller grafik fra en PDF til genbrug i et andet projekt.
- Udtræk produktbilleder fra en katalog-PDF til en webshopsannonce.
- Træk diagrammer ud af teknisk dokumentation til brug i præsentationer.
- Gennemgå, hvilke billeder der er indlejret i et dokument, før du deler det.

## Tips

- Værktøjet udtrækker billeder præcis, som de er gemt i PDF'en. Det gengiver ikke sider som billeder. Til det kan du bruge [PDF til PNG](./pdf-to-png) eller [PDF til JPG](./pdf-to-jpg).
- Hvis værktøjet melder "Ingen billeder fundet", bruger PDF'en muligvis vektorgrafik i stedet for indlejrede rasterbilleder, eller også er det et skannet dokument, hvor hele siden er ét stort billede.
- Batchbehandling virker på tværs af flere PDF'er. Alle billeder fra alle filer samles i ét gitter og én ZIP.

## Relaterede værktøjer

- [PDF til PNG](./pdf-to-png)
- [PDF til JPG](./pdf-to-jpg)
- [PDF Workflow-bygger](./pdf-workflow)
