---
title: Komprimer PDF
description: Reducer PDF-filstørrelsen med op til 90 % med Hyper Compress-motoren. Understøtter målfilstørrelser, batchbehandling og tilpassede kvalitetsindstillinger.
---

# Komprimer PDF

Gør dine PDF-filer mindre uden at ødelægge dem. Komprimer PDF drives af [Hyper Compress](https://www.bentopdf.com/hyper-compress), BentoPDF's egen komprimeringsmotor. Den genkomprimerer billeder, laver delmængder af skrifttyper og fletter dem og fjerner overflødig vægt som indlejrede miniaturebilleder og private programdata. PDF'en forbliver fuldt funktionel: tekst kan stadig markeres, og links og formularfelter virker fortsat.

Hyper Compress er kompileret til WebAssembly og følger med BentoPDF, så komprimering virker offline og i isolerede (air-gapped) installationer uden ekstra opsætning.

## Sådan fungerer det

1. Upload en eller flere PDF'er ved at klikke på slipzonen eller trække filer ind.
2. Vælg et **komprimeringsniveau**: Lav, Medium, Høj eller Tabsfri.
3. Angiv eventuelt en **målfilstørrelse**, eller udvid **Brugerdefinerede indstillinger** for finjustering, herunder **Konvertér til gråtoner**.
4. Klik på **Komprimer PDF**. Ved flere filer får du en samlet ZIP-download.

## Særlige dokumenter

- **Digitalt signerede PDF'er** returneres uændrede, fordi enhver ændring ville ugyldiggøre signaturen. Slå **Tilsidesæt indholdsbeskyttelse** til under Brugerdefinerede indstillinger for at fjerne signaturerne og komprimere dem. Den synlige signatur bliver på siden, men filen er ikke længere signeret.
- **PDF/A-filer** mister deres PDF/A-mærkning efter komprimering, så filen aldrig hævder en overensstemmelse, den ikke længere opfylder. Slå **Bevar PDF/A** til under Brugerdefinerede indstillinger for i stedet at beholde filens overensstemmelse.
- **Adgangskodebeskyttede PDF'er** får et adgangskodefelt på deres filkort. Indtast adgangskoden dér, så åbner Hyper Compress selv filen, uden separat oplåsningstrin. Med to eller flere låste filer låser ét fælles felt alle filer op, som bruger samme adgangskode. Den komprimerede kopi har ingen adgangskode. Brug [Kryptér PDF](./protect-pdf) til at tilføje en igen.
- **Scanninger uden tekstlag** kan blive endnu mindre med **Rasterisér sider** under Brugerdefinerede indstillinger, som erstatter hver side med ét optimeret billede. Det springes over for dokumenter med markérbar tekst, herunder OCR-behandlede scanninger, medmindre **Tilsidesæt indholdsbeskyttelse** er slået til. Så bliver tekstsider også til billeder, så tekst ikke længere kan markeres, og links holder op med at virke.

## Komprimeringsniveauer

| Niveau      | Billedkvalitet | Maks. opløsning | Bedst til                       |
| ----------- | -------------- | --------------- | ------------------------------- |
| **Lav**     | 80             | 200 DPI         | Bevarelse af visuel kvalitet    |
| **Mellem**  | 50             | 150 DPI         | Dagligdags dokumenter           |
| **Høj**     | 20             | 72 DPI          | E-mail-vedhæftninger, webupload |
| **Tabsfri** | Billeder urørt | Uændret         | Arkivkopier                     |

Høj fjerner også indlejringen af de 14 standardskrifttyper i PDF samt lignende skrifttyper som Arial, når det er sikkert.

## Målfilstørrelse

Angiv en størrelse i KB eller MB, og Hyper Compress søger efter den bedste billedkvalitet, der stadig passer, med udgangspunkt i det valgte niveau. Hvis dokumentet ikke kan blive så lille, får du den mindste version, det kan lave, og en besked om det. De dedikerede sider som [Komprimer PDF til 1 MB](https://www.bentopdf.com/compress-pdf-to-1mb) åbner med målet allerede udfyldt.

## Brugerdefinerede indstillinger

Udvid panelet Brugerdefinerede indstillinger for at justere Hyper Compress direkte. Når du vælger et komprimeringsniveau, nulstilles disse til det niveaus værdier, og hvis du ændrer en af dem, skifter niveauet til Brugerdefineret.

- **Tilsidesæt indholdsbeskyttelse**: Som standard lader Hyper Compress signerede PDF'er være urørte og rasteriserer ikke sider med tekst. Når den slås til, springes begge over. Den forbliver slået til, når du skifter niveau.

- **Billeder**: billedkvalitet, maksimal opløsning, gennemtvunget gensampling, farvereduktion, beskæring af usynlige billedområder, fjernelse af alternative billeder, forenkling af farveprofiler, JPEG 2000 og tabsfri tilstand
- **Skrifttyper**: delmængder, sammenfletning af dubletter og fjernelse af indlejring af standardskrifttyper og deres lignende
- **Indhold**: fladning af annotationer, formularfelter eller links
- **Oprydning**: fjernelse af miniaturebilleder, programdata, artikeltråde, weboptagelsesoplysninger, strukturtræet eller outputhensigter
- **Rasterisér**: erstatning af sider med billeder til scanninger, der kun består af billeder. Springes over, når dokumentet har markérbar tekst
- **Output**: Bevar PDF/A og Brotli-komprimering til PDF 2.0-læsere, der understøtter det

## Anvendelser

- Få en rapport på 50 MB under grænsen for e-mail-vedhæftninger
- Få en scanning under en portals strenge uploadgrænse med en målfilstørrelse
- Optimér marketing-PDF'er til hurtigere downloads fra et website
- Arkivér store dokumentsamlinger, hvor lageromkostninger har betydning
- Reducér mobildataforbruget, når du deler PDF'er via beskedapps

## Tips

- Start med Medium. Hvis resultatet stadig er for stort, kan du angive en målfilstørrelse eller gå op til Høj.
- For en scanning uden tekstlag kan du slå Rasterisér sider til under Brugerdefinerede indstillinger.
- Konvertér til gråtoner under Brugerdefinerede indstillinger kan skære i filstørrelsen for farvetunge dokumenter.

## Relaterede værktøjer

- [Lineariser PDF](./linearize-pdf): optimér den komprimerede PDF til hurtig visning på nettet
- [Rasterisér PDF](./rasterize-pdf): konvertér sider til billeder ved en bestemt DPI, også sider med tekst
- [Reparér PDF](./repair-pdf): ret en PDF, der gik i stykker under komprimering andetsteds
- [Fjern metadata](./remove-metadata): fjern skjulte data af hensyn til privatlivet
