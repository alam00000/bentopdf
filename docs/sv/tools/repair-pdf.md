---
title: Reparera PDF
description: Återställ data från skadade eller korrupta PDF-filer med QPDF:s reparationsmotor. Stöder batchbearbetning.
---

# Reparera PDF

När en PDF inte vill öppnas, visar förvrängt innehåll eller ger fel i din läsare försöker det här verktyget bygga upp dess interna struktur på nytt. Det använder QPDF:s reparationsmotor, som kan återställa data efter många typer av skador: trasiga korsreferenstabeller, avkortade strömmar, ogiltiga objektreferenser och mer.

## Så fungerar det

1. Ladda upp en eller flera skadade PDF-filer.
2. Klicka på **Reparera PDF**.
3. En enskild reparerad fil laddas ned direkt. Flera filer ger ett ZIP-arkiv.

Verktyget skickar varje fil genom QPDF med flaggan `--decrypt`, vilket tvingar QPDF att läsa och skriva om hela PDF-strukturen och åtgärda återställningsbara problem på vägen.

## Funktioner

- Batchreparation av flera PDF-filer i en operation
- Automatisk identifiering av återställningsbara respektive icke återställningsbara filer
- Rapportering av lyckat/misslyckat per fil vid bearbetning av flera filer
- Använder QPDF (WebAssembly), ett beprövat bibliotek för PDF-transformering

## Vad den kan åtgärda

- Trasiga eller saknade korsreferenstabeller
- Avkortade filslut från ofullständiga nedladdningar
- Ogiltig objektnumrering och strömlängder
- Mindre strukturella inkonsekvenser från buggiga PDF-generatorer
- Krypteringsartefakter från misslyckade dekrypteringsförsök

## Vad den inte kan åtgärda

- Kraftigt avkortade filer där det mesta av innehållsdatan saknas
- PDF-filer krypterade med ett lösenord som du inte har
- Filer som egentligen inte är PDF-filer (fel filändelse)
- Bildskador inuti PDF-filen (strukturen åtgärdas, men pixeldata återskapas inte)

## Användningsområden

- Återställa en PDF från en misslyckad nedladdning via e-post
- Öppna filer skapade av äldre eller icke-standardiserade PDF-generatorer
- Åtgärda PDF-filer som fungerar i en läsare men inte i en annan
- Förbereda skadade arkivdokument för långtidslagring

## Tips

- Om reparationen misslyckas, försök öppna filen i en webbläsare först. Webbläsare har egen återställningslogik och kan visa tillräckligt mycket för att spara om filen.
- För krypterade PDF-filer där reparationen misslyckas, prova Dekryptera PDF först och reparera sedan den dekrypterade utdatan.

## Relaterade verktyg

- [Komprimera PDF](./compress-pdf): rensa den reparerade PDF-filens struktur ytterligare
- [Linjärisera PDF](./linearize-pdf): optimera den reparerade filen för webbleverans
- [Platta till PDF](./flatten-pdf): platta till formulär som kan ha skadats
