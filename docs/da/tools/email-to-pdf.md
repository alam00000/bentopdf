---
title: E-mail til PDF
description: Konvertér EML- og MSG-e-mailfiler til PDF i din browser. Bevarer headere, brødtekst og vedhæftningsliste.
---

# E-mail til PDF

Konvertér gemte e-mailfiler til rene, udskrivbare PDF'er. Værktøjet fortolker EML- og MSG-filer, udtrækker hele beskeden (headere, brødtekst og metadata om vedhæftninger) og gengiver det hele i en struktureret PDF. Nyttigt til juridisk bevisindsamling, journalføring eller blot til at udskrive en vigtig e-mail.

## Understøttede formater

| Format | Filtypenavn | Noter                                                                   |
| :----- | :---------- | :---------------------------------------------------------------------- |
| EML    | `.eml`      | Standard MIME-e-mailformat (eksporteres fra de fleste e-mailprogrammer) |
| MSG    | `.msg`      | Microsoft Outlooks proprietære format                                   |

## Sådan fungerer det

1. Klik på uploadområdet eller træk og slip dine EML- eller MSG-filer. Du kan blande begge formater i en enkelt batch.
2. Gennemgå fillisten. Fjern uønskede poster med papirkurvsikonet, eller klik på **Tilføj flere filer** for at medtage flere e-mails.
3. Konfigurér konverteringsindstillingerne (se nedenfor).
4. Klik på **Konvertér til PDF**. Værktøjet fortolker hver e-mail, gengiver indholdet som formateret HTML og konverterer det til PDF via PyMuPDF-motoren.
5. En enkelt e-mail downloades direkte som PDF. Flere e-mails pakkes i `emails-converted.zip`.

## Indstillinger

| Indstilling                  | Standard | Beskrivelse                                                                                                 |
| :--------------------------- | :------- | :---------------------------------------------------------------------------------------------------------- |
| **Sidestørrelse**            | A4       | Vælg mellem A4-, Letter- eller Legal-sidemål.                                                               |
| **Medtag CC og BCC**         | Til      | Når den er aktiveret, vises CC- og BCC-modtagerlister i e-mailens headerafsnit i PDF'en.                    |
| **Medtag vedhæftningsliste** | Til      | Når den er aktiveret, vises en liste over e-mailens filvedhæftninger (med filnavne og størrelser) i PDF'en. |

## Anvendelser

- Arkivér vigtig forretningskorrespondance som PDF til compliance eller revision
- Udskriv e-mailtråde til retssager eller anmodninger om bevisindsamling
- Opret en permanent registrering af ordrebekræftelser, kvitteringer eller kontrakter modtaget på e-mail
- Sikkerhedskopiér Outlook MSG-filer i et format, der ikke kræver Outlook for at blive læst
- Dokumentér kundesupporthenvendelser fra eksporterede EML-filer

## Tips

- Både EML (brugt af Thunderbird, Apple Mail og de fleste e-mailprogrammer) og Outlook MSG-filer understøttes. Eksportér e-mails fra dit e-mailprogram og slip dem direkte i værktøjet.
- HTML-formaterede e-mails beholder deres styling i PDF'en. E-mails i almindelig tekst gengives med ren, læsbar formatering.
- Vedhæftningslisten viser filnavne og størrelser, men indlejrer ikke selve vedhæftningsfilerne i PDF'en.

## Relaterede værktøjer

- [XML til PDF](./xml-to-pdf)
- [XPS til PDF](./xps-to-pdf)
