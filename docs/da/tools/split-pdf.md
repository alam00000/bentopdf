---
title: Opdel PDF
description: Opdel en PDF i mindre filer efter sideinterval, visuelt udvalg, bogmærker, lige/ulige sider eller faste intervaller.
---

# Opdel PDF

Del en PDF op i mindre dokumenter med en af seks opdelingstilstande. Fra enkle sideintervaller til bogmærkebaseret opdeling dækker dette værktøj alle scenarier, hvor et dokument skal deles.

## Sådan fungerer det

1. Upload en enkelt PDF-fil.
2. Vælg en opdelingstilstand i rullemenuen.
3. Konfigurér tilstandens indstillinger (sideintervaller, udvalg osv.).
4. Klik på knappen til at behandle.
5. Resultatet downloades som en enkelt PDF eller et ZIP-arkiv afhængigt af tilstand og indstillinger.

## Opdelingstilstande

| Tilstand           | Beskrivelse                                                                                                                 |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| **Interval**       | Angiv sideintervaller som `1-3, 5, 8-10`. Flere intervaller giver separate PDF'er i et ZIP-arkiv. Ét interval giver én PDF. |
| **Visuelt udvalg** | Gennemse sideminiaturer, og klik for at vælge de sider, du vil have. De valgte sider udtrækkes til en ny PDF.               |
| **Lige / ulige**   | Udtræk kun sider med lige eller ulige numre.                                                                                |
| **Alle sider**     | Opdel hver side i sin egen PDF-fil, downloadet som ZIP.                                                                     |
| **Bogmærker**      | Opdel ved bogmærkegrænser. Vælg bogmærkeniveauet for at styre, hvor opdelingerne sker.                                      |
| **Hver N. side**   | Opdel i bidder på N sider hver (f.eks. hver 5. side). Den sidste bid kan have færre sider.                                  |

## Funktioner

- Seks forskellige opdelingstilstande, der dækker stort set alle behov
- Visuel sidevælger med miniaturer, der indlæses ved behov
- Bogmærkebevidst opdeling med niveaufiltrering
- ZIP-output som mulighed i interval- og visuel tilstand
- Håndterer sideintervaller med blandet syntaks (`1-3, 5, 8-10`)
- Advarsel, når opdeling i N sider giver ujævne bidder

## Anvendelsesmuligheder

- Udtrække et bestemt kapitel eller afsnit fra et stort dokument
- Adskille ulige og lige sider til dobbeltsidede udskrivningsforløb
- Dele en bog-PDF i enkelte kapitelfiler ved bogmærkegrænser
- Udtrække bestemte sider (som en underskriftsside) fra en kontrakt
- Opdele en samlet rapport i filer pr. afsnit til distribution

## Tips

- Flere sideintervaller adskilt af kommaer (f.eks. `1-5, 10-15, 20-25`) giver separate PDF'er, én pr. interval, samlet i et ZIP-arkiv.
- Bogmærketilstanden kræver, at PDF'en rent faktisk indeholder bogmærker. Hvis der ikke findes nogen, får du en fejlmeddelelse.
- Afkrydsningsfeltet "Download som ZIP" i interval- og visuel tilstand lader dig få individuelle PDF'er pr. side i stedet for en samlet fil.

## Relaterede værktøjer

- [Flet PDF](./merge-pdf)
- [Udtræk sider](./extract-pages)
- [Slet sider](./delete-pages)
- [PDF Multi-værktøj](./pdf-multi-tool)
