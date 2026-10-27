---
title: PDF til Word
description: Konvertér PDF-filer til redigerbare Word-dokumenter (DOCX). Understøtter batchkonvertering af flere PDF-filer på én gang.
---

# PDF til Word

Konverterer PDF-filer til redigerbare Word-dokumenter (`.docx`). Værktøjet bruger PyMuPDF til at genopbygge dokumentets indhold og bevarer tekst, grundlæggende formatering og layout. Understøtter konvertering af enkeltfiler og batchkonvertering.

## Sådan fungerer det

1. Upload en eller flere PDF-filer ved at klikke på slipområdet eller trække filer hen på det. Du kan tilføje flere filer eller fjerne enkelte fra listen.
2. Klik på **Konvertér** for at starte behandlingen.
3. En enkelt fil downloades som `filename.docx`. Flere filer pakkes i `converted-documents.zip`.

## Indstillinger

Dette værktøj har ingen konfigurerbare indstillinger. Hver PDF konverteres til DOCX med PyMuPDF's indbyggede konverteringsmotor.

## Outputformat

- **Enkelt fil**: `filename.docx`
- **Flere filer**: `converted-documents.zip` med én `.docx` pr. input-PDF.

## Anvendelser

- Redigere tekst i en PDF, som du har modtaget, og som skal ændres.
- Konvertere arkiverede PDF-rapporter til et format, som kolleger kan redigere i Microsoft Word eller Google Docs.
- Hente indhold fra PDF-kontrakter eller tilbud ind i Word til gennemgang med ændringsmarkering.
- Migrere ældre PDF-dokumentation til et redigerbart format.

## Tips

- Komplekse layouts med tekst i flere kolonner, indlejrede formularer eller meget grafik konverteres muligvis ikke perfekt. Gennemgå outputtet, og justér formateringen i dit tekstbehandlingsprogram.
- Scannede PDF-filer (kun billeder) giver tomme eller minimale DOCX-filer. Kør dem gennem OCR først for at tilføje et tekstlag.
- Batchtilstand er effektiv til at konvertere hele mapper med PDF-filer: upload dem alle på én gang.

## Relaterede værktøjer

- [PDF til tekst](./pdf-to-text)
- [PDF til Markdown](./pdf-to-markdown)
- [PDF Workflow-bygger](./pdf-workflow)
