---
title: PDF-workflowbygger
description: Byg brugerdefinerede PDF-behandlingspipelines visuelt ved at forbinde noder på et lærred. Kæd operationer som flet, komprimer, vandmærke og eksportér sammen.
---

# PDF-workflowbygger

Workflow-byggeren lader dig kæde flere PDF-operationer sammen i én automatiseret pipeline. I stedet for at køre værktøjer et ad gangen sammensætter du en visuel graf af noder (input, behandling, output) og kører det hele med et enkelt klik. Dine filer forlader aldrig browseren.

## Sådan fungerer det

Grænsefladen er delt i tre paneler: en **nodeværktøjskasse** til venstre, **lærredet** i midten og et **indstillingspanel** til højre, som vises, når du vælger en node.

1. **Tilføj noder** ved at klikke på dem i sidebjælken til venstre, eller træk dem direkte ind på lærredet. Brug søgefeltet øverst i værktøjskassen til at filtrere efter navn.
2. **Forbind noder** ved at trække fra en outputsokkel (nederst på en node) til en inputsokkel (øverst på en anden node). Forbindelser løber oppefra og ned.
3. **Konfigurér indstillinger** ved at klikke på en node for at åbne dens indstillingspanel til højre. Hver nodetype har sine egne indstillinger (sideintervaller, kvalitetsskydere, adgangskoder osv.).
4. **Kør workflowet** ved at klikke på knappen **Kør** på værktøjslinjen. Motoren udfører noderne i topologisk rækkefølge og behandler dem én efter én. En statuslinje nederst følger fremdriften.
5. **Download resultater**: den afsluttende Download-node gemmer den endelige PDF (eller ZIP, hvis der oprettes flere filer).

## Nodekategorier

Noderne er organiseret i seks kategorier, som hver har sin farve på lærredet:

- **Input** (blå): PDF-input, Billedinput, Word/Excel/PowerPoint til PDF og mere end 15 andre formatkonvertere, der leverer filer ind i pipelinen.
- **Redigér og annotér** (indigo): Beskær, Gråtoner, Invertér farver, Vandmærke, Sidetal, Sidehoved og sidefod, Scannereffekt, Justér farver, Baggrundsfarve, Fjern tomme sider, Fjern annotationer.
- **Organisér og administrér** (violet): Flet, Opdel, Udtræk sider, Roter, Slet sider, Vend, Tilføj tom side, Opdel sider, N-Up, Ret sidestørrelse, Kombinér til én side, Hæfte, Posterisér, Redigér metadata, Indholdsfortegnelse, OCR.
- **Optimér og reparér** (rav): Komprimer, Rasterisér, Lineariser, Ret skæve sider, PDF til PDF/A, Skrifttype til kontur, Reparér.
- **Beskyt PDF** (rosa): Kryptér, Dekryptér, Rens, Flatten, Digital signatur, Sortlæg.
- **Output** (blågrøn): Download (registrerer automatisk enkelt PDF eller ZIP), PDF til billeder, PDF til tekst, PDF til DOCX, PDF til XLSX, PDF til CSV, PDF til SVG, PDF til Markdown, Udtræk billeder.

## Gemme og indlæse workflows

Værktøjslinjen har fire muligheder for at bevare dit arbejde:

- **Gem**: gemmer det aktuelle workflow som en navngivet skabelon i din browsers lokale lager. Du kan gemme flere skabeloner.
- **Indlæs**: åbner en dialog med alle gemte skabeloner. Klik på Indlæs for at gendanne en, eller slet skabeloner, du ikke længere har brug for.
- **Eksportér**: downloader workflowet som en `.json`-fil, så du kan dele eller sikkerhedskopiere det.
- **Importér**: indlæser en `.json`-workflowfil fra disken og gendanner alle noder, positioner og forbindelser.

Skabeloner bevares mellem sessioner i det lokale lager. Eksporterede JSON-filer kan flyttes mellem browsere og computere.

## Udførelsesmodel

Motoren bygger en afhængighedsgraf ud fra dine forbindelser og udfører noderne i topologisk rækkefølge. Hvis en node fejler, stopper udførelsen, og den fejlende node markeres rød. Nogle regler at huske:

- Hvert workflow har brug for mindst én **Input**-node og én **Output**-node.
- Motoren registrerer cirkulære afhængigheder og blokerer udførelsen med en fejl.
- Noden **Kryptér** skal være det sidste behandlingstrin før outputnoden. Hvis den placeres tidligere, udløses en valideringsadvarsel, fordi efterfølgende noder ikke kan arbejde med krypterede data.
- Adgangskodebeskyttede PDF-filer beder om en adgangskode under udførelsen.
- Input med flere PDF-filer understøttes: Flet-noden kan kombinere dem, eller batchbehandlende noder behandler hver PDF enkeltvis.

## Soklertyper

Forbindelser bruger typede sokler for at forhindre ugyldige koblinger:

- **PDF** (indigo): et enkelt PDF-dokument.
- **MultiPDF** (rav): flere PDF-dokumenter samlet.
- **Image** (grøn): en billedblob.

## Indstillinger

Hver node har sin egen konfiguration, som du kan nå via indstillingspanelet til højre. Almindelige eksempler:

- **Sideintervaller** på noderne Opdel, Udtræk sider og Slet sider
- **Kvalitetsskydere** på billedkonverterings-outputnoder
- **Adgangskodefelter** på noderne Kryptér og Dekryptér
- **Tekstfelter** til Vandmærke, Sidehoved og sidefod og Redigér metadata
- **Rotationsvinkler** på noden Roter
- **Komprimeringsniveau** på noden Komprimer
- **Valg af OCR-sprog** på OCR-noden

## Anvendelser

- **Fakturabehandlingspipeline**: PDF-input -> OCR -> Udtræk PDF-tabeller -> Download som CSV.
- **Standardisering af rapporter**: Word til PDF -> Ret sidestørrelse -> Tilføj sidetal -> Vandmærke -> Komprimer -> Download.
- **Forberedelse til arkivering**: PDF-input -> Reparér -> Flatten -> Rens -> PDF til PDF/A -> Download.
- **Batchudtrækning af billeder**: PDF-input (flere filer) -> Udtræk billeder -> Download ZIP.
- **Udskriftsklare hæfter**: PDF-input -> Hæfte -> Beskær -> Komprimer -> Download.
- **Sikker distribution**: PDF-input -> Sortlæg -> Fjern annotationer -> Kryptér -> Download.

## Tips

- Brug **Delete** eller **Backspace** til at fjerne den valgte node fra lærredet.
- Klik på knappen **X** i en nodes statuslinje for at slette den direkte.
- Panorér lærredet ved at klikke og trække på tomt område. Markøren skifter til et gribeikon under panorering.
- På mobil kan du bruge knappen **+** på værktøjslinjen til at vise eller skjule nodeværktøjskassen.
- Hvis dit workflow giver flere outputfiler, samler Download-noden dem automatisk i en ZIP.
- Start enkelt: byg og test en pipeline med to noder, før du tilføjer kompleksitet.

## Relaterede værktøjer

- [PDF til tekst](./pdf-to-text)
- [PDF til Excel](./pdf-to-excel)
- [Udtræk billeder](./extract-images)
- [PDF til Markdown](./pdf-to-markdown)
