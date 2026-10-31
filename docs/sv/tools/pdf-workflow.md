---
title: PDF-arbetsflödesbyggare
description: Bygg egna PDF-bearbetningskedjor visuellt genom att koppla ihop noder på en canvas. Kedja åtgärder som sammanfogning, komprimering, vattenstämpel och export.
---

# PDF-arbetsflödesbyggare

Med arbetsflödesbyggaren kan du kedja flera PDF-åtgärder till en enda automatiserad pipeline. I stället för att köra verktygen ett i taget kopplar du ihop en visuell graf av noder (indata, bearbetning, utdata) och kör allt med ett klick. Dina filer lämnar aldrig webbläsaren.

## Så fungerar det

Gränssnittet är uppdelat i tre paneler: en **nodverktygslåda** till vänster, **canvasen** i mitten och en **inställningspanel** till höger som visas när du markerar en nod.

1. **Lägg till noder** genom att klicka på dem i det vänstra sidofältet eller dra dem direkt till canvasen. Använd sökfältet högst upp i verktygslådan för att filtrera efter namn.
2. **Koppla ihop noder** genom att dra från ett utdatauttag (nederst på en nod) till ett indatauttag (överst på en annan nod). Kopplingar går uppifrån och ned.
3. **Konfigurera inställningar** genom att klicka på en nod för att öppna dess inställningspanel till höger. Varje nodtyp har sina egna alternativ (sidintervall, kvalitetsreglage, lösenord osv.).
4. **Kör arbetsflödet** genom att klicka på knappen **Kör** i verktygsfältet. Motorn kör noderna i topologisk ordning och bearbetar dem en i taget. Ett statusfält längst ned visar förloppet.
5. **Ladda ner resultat**: den avslutande nedladdningsnoden sparar den slutliga PDF-filen (eller en ZIP om flera filer skapas).

## Nodkategorier

Noderna är ordnade i sex kategorier, var och en färgkodad på canvasen:

- **Indata** (blå): PDF-indata, bildindata, Word/Excel/PowerPoint till PDF och över 15 andra formatkonverterare som matar in filer i kedjan.
- **Redigera & kommentera** (indigo): Beskär, Gråskala, Invertera färger, Vattenstämpel, Sidnummer, Sidhuvud & sidfot, Skannereffekt, Justera färger, Bakgrundsfärg, Ta bort tomma sidor, Ta bort kommentarer.
- **Organisera & hantera** (violett): Sammanfoga, Dela, Extrahera sidor, Rotera, Ta bort sidor, Omvänd, Lägg till tom sida, Dela sidor, N-Up, Fixa sidstorlek, Kombinera till en sida, Broschyr, Posterisera, Redigera metadata, Innehållsförteckning, OCR.
- **Optimera & reparera** (bärnsten): Komprimera, Rastrera, Linjärisera, Räta upp, PDF till PDF/A, Typsnitt till konturer, Reparera.
- **Säkra PDF** (ros): Kryptera, Dekryptera, Sanera, Platta till, Digital signatur, Maskera.
- **Utdata** (blågrön): Nedladdning (identifierar automatiskt enskild PDF eller ZIP), PDF till bilder, PDF till text, PDF till DOCX, PDF till XLSX, PDF till CSV, PDF till SVG, PDF till Markdown, Extrahera bilder.

## Spara och läsa in arbetsflöden

Verktygsfältet har fyra alternativ för att spara:

- **Spara**: sparar det aktuella arbetsflödet som en namngiven mall i webbläsarens lokala lagring. Du kan spara flera mallar.
- **Läs in**: öppnar en dialogruta med alla sparade mallar. Klicka på Läs in för att återställa en, eller ta bort mallar du inte längre behöver.
- **Exportera**: laddar ner arbetsflödet som en `.json`-fil så att du kan dela eller säkerhetskopiera det.
- **Importera**: läser in en `.json`-arbetsflödesfil från disk och återställer alla noder, positioner och kopplingar.

Mallar finns kvar mellan sessioner i den lokala lagringen. Exporterade JSON-filer kan flyttas mellan webbläsare och datorer.

## Körningsmodell

Motorn bygger en beroendegraf utifrån dina kopplingar och kör noder i topologisk ordning. Om en nod misslyckas stoppas körningen och den felande noden markeras röd. Några regler att ha i åtanke:

- Varje arbetsflöde behöver minst en **indatanod** och en **utdatanod**.
- Motorn upptäcker cirkulära beroenden och blockerar körningen med ett fel.
- Noden **Kryptera** måste vara det sista bearbetningssteget före utdatanoden. Om den placeras tidigare utlöses en valideringsvarning, eftersom efterföljande noder inte kan arbeta med krypterade data.
- Lösenordsskyddade PDF-filer ber om ett lösenord under körningen.
- Indata med flera PDF-filer stöds: noden Sammanfoga kan kombinera dem, eller så bearbetar batchnoderna varje PDF för sig.

## Uttagstyper

Kopplingar använder typade uttag för att förhindra ogiltiga kopplingar:

- **PDF** (indigo): ett enskilt PDF-dokument.
- **MultiPDF** (bärnsten): flera PDF-dokument samlade.
- **Bild** (grön): en bildblob.

## Alternativ

Varje nod har sin egen konfiguration som nås via den högra inställningspanelen. Vanliga mönster är:

- **Sidintervall** på noderna Dela, Extrahera sidor och Ta bort sidor
- **Kvalitetsreglage** på utdatanoder för bildkonvertering
- **Lösenordsfält** på noderna Kryptera och Dekryptera
- **Textfält** för Vattenstämpel, Sidhuvud & sidfot och Redigera metadata
- **Rotationsvinklar** på noden Rotera
- **Komprimeringsnivå** på noden Komprimera
- **Val av OCR-språk** på noden OCR

## Användningsområden

- **Fakturabearbetning**: PDF-indata -> OCR -> Extrahera tabeller -> Ladda ner som CSV.
- **Standardisering av rapporter**: Word till PDF -> Fixa sidstorlek -> Lägg till sidnummer -> Vattenstämpel -> Komprimera -> Ladda ner.
- **Arkivförberedelse**: PDF-indata -> Reparera -> Platta till -> Sanera -> PDF till PDF/A -> Ladda ner.
- **Batchextrahering av bilder**: PDF-indata (flera filer) -> Extrahera bilder -> Ladda ner ZIP.
- **Utskriftsklara broschyrer**: PDF-indata -> Broschyr -> Beskär -> Komprimera -> Ladda ner.
- **Säker distribution**: PDF-indata -> Maskera -> Ta bort kommentarer -> Kryptera -> Ladda ner.

## Tips

- Använd **Delete** eller **Backspace** för att ta bort den markerade noden från canvasen.
- Klicka på knappen **X** i en nods statusfält för att ta bort den direkt.
- Panorera canvasen genom att klicka och dra på tom yta. Markören ändras till en grepp-ikon under panoreringen.
- På mobil, använd knappen **+** i verktygsfältet för att visa eller dölja nodverktygslådan.
- Om ditt arbetsflöde ger flera utdatafiler paketerar nedladdningsnoden dem automatiskt i en ZIP.
- Börja enkelt: bygg och testa en pipeline med två noder innan du gör det mer komplext.

## Relaterade verktyg

- [PDF till text](./pdf-to-text)
- [PDF till Excel](./pdf-to-excel)
- [Extrahera bilder](./extract-images)
- [PDF till Markdown](./pdf-to-markdown)
