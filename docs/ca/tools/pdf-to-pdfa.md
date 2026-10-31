---
title: PDF a PDF/A
description: Converteix PDF estàndard a format PDF/A per a l'arxivament a llarg termini. Admet els nivells de conformitat PDF/A-1b, PDF/A-2b i PDF/A-3b.
---

# PDF a PDF/A

PDF/A és un subconjunt de PDF normalitzat per l'ISO i pensat per a la preservació digital a llarg termini. Aquesta eina converteix els teus PDF estàndard en documents compatibles amb PDF/A amb Ghostscript executant-se directament al navegador.

## Com funciona

1. Carrega un o més fitxers PDF.
2. Selecciona una **versió de PDF/A** al menú desplegable.
3. Opcionalment, activa **Aplana el PDF prèviament** per a fitxers complexos que fallen amb la conversió normal.
4. Fes clic a **Converteix a PDF/A**. Si són diversos fitxers, es genera un arxiu ZIP.

## Versions de PDF/A

| Versió       | Restriccions                                    | Ideal per a                                       |
| ------------ | ----------------------------------------------- | ------------------------------------------------- |
| **PDF/A-1b** | La més estricta. Sense transparències ni capes. | Màxima compatibilitat amb sistemes d'arxiu antics |
| **PDF/A-2b** | Permet transparències i JPEG2000.               | Arxivament de propòsit general (recomanada)       |
| **PDF/A-3b** | Permet adjunts incrustats de qualsevol format.  | Arxivar documents amb fitxers de dades d'origen   |

PDF/A-2b ve seleccionada per defecte i serveix per a la gran majoria de necessitats d'arxivament.

## Opció d'aplanament previ

Alguns PDF contenen característiques que impedeixen una conversió neta a PDF/A: codificacions de tipus de lletra poc habituals, piles de transparència complexes o estructures internes malmeses. Activar l'**aplanament previ** rasteritza el PDF a 300 DPI abans de la conversió, cosa que garanteix la conformitat a costa que el text deixi de ser seleccionable. Utilitza'l com a alternativa quan la conversió estàndard produeixi errors.

L'aplanament previ requereix el motor WASM de PyMuPDF.

## Casos d'ús

- Complir els requisits d'arxivament governamentals o legals (moltes jurisdiccions exigeixen PDF/A per als escrits judicials)
- Presentar documents a repositoris institucionals o biblioteques digitals
- Preservar registres empresarials quan el programari original potser ja no existirà d'aquí a deu anys
- Preparar factures per a estàndards de facturació electrònica que requereixen PDF/A-3b amb adjunts XML

## Consells

- Prova primer la conversió sense aplanament previ. Activa'l només si obtens un error.
- PDF/A incrusta tots els tipus de lletra, de manera que els fitxers de sortida sovint són més grans que els originals.
- Valida la sortida amb un validador de PDF/A específic si el teu flux de treball requereix una conformitat estricta.

## Eines relacionades

- [Comprimeix PDF](./compress-pdf): redueix la mida del fitxer després de la conversió
- [Aplana PDF](./flatten-pdf): aplana els formularis abans de convertir a PDF/A
- [Elimina les metadades](./remove-metadata): suprimeix les metadades abans d'arxivar
