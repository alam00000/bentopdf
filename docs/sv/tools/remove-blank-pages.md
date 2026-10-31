---
title: Ta bort tomma sidor
description: Identifiera och ta bort tomma eller nästan tomma sidor från din PDF automatiskt, med justerbar känslighet.
---

# Ta bort tomma sidor

Sök igenom din PDF efter tomma eller nästan tomma sidor och ta bort dem automatiskt. Verktyget renderar varje sida och analyserar pixelinnehållet för att avgöra om den är tom, och låter dig sedan bekräfta vilka sidor som ska tas bort innan bearbetningen.

## Så fungerar det

1. Ladda upp din PDF-fil.
2. Justera reglaget **Känslighet** för att styra hur strikt "tom" definieras.
3. Klicka på **Identifiera tomma sidor** för att skanna dokumentet.
4. Verktyget visar miniatyrer av identifierade tomma sidor så att du kan granska dem.
5. Bekräfta urvalet och ladda ned den rensade PDF-filen utan de tomma sidorna.

## Alternativ

- **Känslighet**: Ett reglage från 0 % till 100 % (standard 80 %). Högre värden är strängare och flaggar bara sidor som är helt eller nästan helt vita. Lägre värden är mer toleranta och fångar sidor med minimalt innehåll, som en enstaka prick eller en svag vattenstämpel.

## Funktioner

- Analys på pixelnivå av varje sida för att hitta tomt innehåll
- Justerbart känslighetsreglage för finjustering av identifieringen
- Miniatyrförhandsvisning av identifierade tomma sidor för manuell kontroll
- Bevarar alla sidor som inte är tomma exakt som de är
- Hanterar dokument av valfri storlek eller sidantal
- Förloppsindikator under skanningen

## Användningsområden

- Rensa skannade dokument där skannern fångat tomma baksidor på ensidiga original
- Ta bort avskiljarsidor från skannade dokumentbuntar
- Ta bort tomma sidor som lagts in av dokumenthanteringssystem
- Rensa PDF-filer exporterade från ordbehandlare som ibland har tomma sidor på slutet
- Minska filstorleken genom att ta bort onödiga tomma sidor

## Tips

- Börja med standardkänsligheten 80 % och justera därifrån. Om verktyget missar sidor som ser tomma ut för dig, sänk känsligheten. Om det flaggar sidor med ljust innehåll som du vill behålla, höj den.
- Verktyget renderar varje sida för att analysera innehållet, så bearbetningstiden växer med sidantalet. För mycket stora dokument kan du få vänta en kort stund.
- Granska de identifierade tomma sidorna i miniatyrförhandsvisningen innan du bekräftar borttagningen. Sidor med svaga sidhuvuden, sidfötter eller vattenstämplar kan flaggas beroende på känslighetsinställningen.

## Relaterade verktyg

- [Beskär PDF](./crop-pdf)
- [PDF-redigerare](./edit-pdf)
- [Sidnummer](./page-numbers)
