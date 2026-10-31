---
title: PNG til PDF
description: Konvertér et eller flere PNG-billeder til et PDF-dokument med justerbar kvalitet, helt i din browser.
---

# PNG til PDF

Konvertér PNG-billeder til PDF, mens deres fulde opløsning bevares. Hver PNG bliver til sin egen side, tilpasset det oprindelige billedes mål. Gennemsigtighed håndteres automatisk.

## Understøttede formater

| Format | Filtypenavne |
| :----- | :----------- |
| PNG    | `.png`       |

## Sådan fungerer det

1. Klik på uploadområdet, eller træk og slip PNG-filer. Du kan vælge flere på én gang.
2. Administrér fillisten: fjern uønskede filer, eller tilføj flere.
3. Vælg et niveau for **PDF-kvalitet** i rullemenuen.
4. Klik på **Konvertér til PDF**. Outputtet downloades som `from_jpgs.pdf`.

Værktøjet bruger pdf-lib til at indlejre hvert billede direkte. Hvis en PNG ikke kan indlejres direkte (f.eks. på grund af en usædvanlig farveprofil), falder det tilbage til at gengive den via et canvas som JPEG.

## Indstillinger

**PDF-kvalitet** styrer den komprimering, der anvendes før indlejring:

- **Høj kvalitet**: minimal komprimering, største filstørrelse.
- **Mellem kvalitet** (standard): god balance mellem størrelse og klarhed.
- **Lav kvalitet**: maksimal komprimering, mindste output.

## Anvendelser

- Konvertere skærmbilleder til en PDF med flere sider til fejlrapporter eller dokumentation
- Pakke eksporter af UI-design i én fil til gennemgang
- Gøre diagrameksporter (draw.io, Excalidraw) til en delbar PDF
- Samle en række diagrambilleder til en rapport

## Tips

- PNG-filer med gennemsigtighed får en hvid baggrund i PDF'en. Hvis du har brug for en anden baggrund, skal du redigere billederne på forhånd.
- Til skærmbilleder og diagrammer med skarpe kanter og tekst undgår Høj kvalitet JPEG-komprimeringsartefakter. Mellem eller Lav kan konvertere til JPEG internt.

## Relaterede værktøjer

- [Billeder til PDF](./image-to-pdf)
- [JPG til PDF](./jpg-to-pdf)
- [SVG til PDF](./svg-to-pdf)
