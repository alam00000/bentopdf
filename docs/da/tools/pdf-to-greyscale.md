---
title: PDF til gråtoner
description: Konvertér en farve-PDF til en gråtoneversion (sort-hvid). Giver en ny PDF, hvor al farve er fjernet fra hver side.
---

# PDF til gråtoner

Konverterer en farve-PDF til en gråtoneversion. Hver side gengives, affarves og indlejres igen som et JPEG-billede i en ny PDF. Outputtet bevarer de oprindelige sidemål.

## Sådan fungerer det

1. Upload en PDF ved at klikke på slipområdet eller trække en fil hen på det.
2. Klik på **Konvertér** for at behandle filen.
3. En ny `greyscale.pdf` downloades med alle sider konverteret til sort-hvid.

Bag kulisserne gengives hver side i 2x skala, pixeldataene sendes gennem et gråtonefilter, kodes derefter igen som JPEG i 90 % kvalitet og placeres i et nyt PDF-dokument.

## Indstillinger

Dette værktøj har ingen konfigurerbare indstillinger. Gråtonekonverteringen bruger en standardformel for luminans, og JPEG-kvaliteten er fast på 90 %.

## Outputformat

- En enkelt `greyscale.pdf`-fil med alle sider som gråtone-JPEG-billeder.

## Anvendelser

- Forberede dokumenter til sort-hvid udskrivning for at spare på farvekassetter.
- Opfylde indsendelseskrav til juridiske eller offentlige indberetninger, der kræver gråtoner.
- Reducere filstørrelsen på PDF-filer med meget farve (JPEG-gråtonebilleder er mindre end farvebilleder).
- Skabe en ensartet visuel stil på tværs af dokumenter med blandede farve- og sort-hvide sider.

## Tips

- Fordi hver side rasteriseres og indlejres igen som JPEG, er outputtet billedbaseret. Tekst i den oprindelige PDF kan ikke længere markeres eller søges i. Hvis du bagefter har brug for søgbar tekst, kan du køre outputtet gennem OCR-værktøjet.
- Til mere kontrol over farvejusteringer (lysstyrke, kontrast, mætning) kan du se på værktøjet Justér farver eller gråtonenoden i [PDF Workflow-bygger](./pdf-workflow).

## Relaterede værktøjer

- [PDF til JPG](./pdf-to-jpg)
- [PDF til PNG](./pdf-to-png)
- [PDF Workflow-bygger](./pdf-workflow)
