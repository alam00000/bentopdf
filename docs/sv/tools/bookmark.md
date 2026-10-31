---
title: Redigera bokmärken
description: Lägg till, redigera, importera, exportera och ta bort PDF-bokmärken med en visuell redigerare och stöd för CSV/JSON.
---

# Redigera bokmärken

Bokmärkesredigeraren ger dig full kontroll över PDF-bokmärken för navigering (även kallade konturer). Du kan lägga till nya bokmärken, redigera befintliga, ändra hierarkin och importera eller exportera bokmärkesdata i formaten CSV och JSON.

## Så fungerar det

1. Ladda upp din PDF genom att klicka eller dra en fil till släppytan.
2. Markera eventuellt **Extrahera befintliga bokmärken automatiskt** för att hämta dokumentets nuvarande bokmärkesträd.
3. Redigeraren öppnas i delad vy: PDF-visaren till vänster och bokmärkespanelen till höger.
4. Skriv en bokmärkestitel och klicka på **Lägg till på sidan** för att skapa ett nytt bokmärke som pekar på den aktuella sidan.
5. Använd verktygsfältets knappar för att ordna om, formatera eller ta bort bokmärken.
6. Klicka på **Spara PDF med bokmärken** för att ladda ner den uppdaterade filen.

## Funktioner

- Visuell PDF-visare med sidnavigering, zoomkontroller och fält för att gå till en sida
- Lägg till bokmärken på valfri sida med ett enda klick
- Klicka direkt på PDF-filen för att ange en exakt bokmärkesdestination (väljarläge)
- Nästlad bokmärkeshierarki med omordning via dra och släpp
- Batchåtgärder: markera flera bokmärken för att ändra färg, stil eller ta bort dem på en gång
- Bokmärkessökning för att snabbt hitta poster i stora träd
- Ångra och gör om för alla ändringar
- Importera bokmärken från CSV (titel, sida, nivå) eller JSON-filer
- Exportera bokmärken till CSV eller JSON för extern redigering
- Bokmärkesformatering: färg (röd, blå, grön, gul, lila) och teckenstil (fet, kursiv, fet kursiv)
- Snabb navigering: bläddra mellan sidor med sida upp/ned-tangenterna

## Alternativ

- **Extrahera befintliga bokmärken automatiskt**: När det är markerat läser verktyget in och visar PDF-filens nuvarande bokmärken vid inladdning.
- **Batchläge**: Slå på för att markera flera bokmärken och tillämpa massändringar av färg, stil eller borttagning.
- **Expandera/dölj alla**: Visa eller dölj snabbt nästlade underbokmärken.

## Användningsfall

- Lägga till en innehållsförteckning i en lärobok eller manual som saknar bokmärken
- Strukturera om bokmärken i ett skannat dokument efter OCR-bearbetning
- Exportera bokmärken till CSV, redigera dem i ett kalkylblad och sedan importera dem igen
- Rensa upp automatiskt genererade bokmärken med felaktiga sidhänvisningar
- Lägga till färgade bokmärken för att markera viktiga avsnitt i en juridisk inlaga

## Tips

- Använd CSV-import för att skapa många bokmärken på en gång. Formatet är enkelt: `title,page,level` där nivå 1 är högsta nivån.
- Väljarläget låter dig klicka på en exakt plats på PDF-sidan för att ange bokmärkets destination, vilket är mer exakt än att bara ange ett sidnummer.
- Exportera dina bokmärken innan du gör stora ändringar så att du har en säkerhetskopia.

## Relaterade verktyg

- [Innehållsförteckning](./table-of-contents)
- [PDF-redigerare](./edit-pdf)
- [Lägg till sidetiketter](./add-page-labels)
