---
title: PDF a Word
description: Converteix fitxers PDF en documents Word (DOCX) editables. Admet la conversió en lot de diversos PDF alhora.
---

# PDF a Word

Converteix fitxers PDF en documents Word (`.docx`) editables. L'eina utilitza PyMuPDF per reconstruir el contingut del document, conservant el text, el format bàsic i el disseny. Admet la conversió individual i en lot.

## Com funciona

1. Carrega un o més PDF fent clic a la zona de càrrega o arrossegant-hi fitxers. Pots afegir-ne més o eliminar-ne de la llista individualment.
2. Fes clic a **Converteix** per iniciar el processament.
3. Un sol fitxer es baixa com a `filename.docx`. Diversos fitxers s'empaqueten a `converted-documents.zip`.

## Opcions

Aquesta eina no té opcions configurables. Cada PDF es converteix a DOCX amb el motor de conversió integrat de PyMuPDF.

## Format de sortida

- **Un fitxer**: `filename.docx`
- **Diversos fitxers**: `converted-documents.zip` amb un `.docx` per a cada PDF d'entrada.

## Casos d'ús

- Editar el text d'un PDF que has rebut i que necessites modificar.
- Convertir informes PDF arxivats en un format que els companys puguin editar a Microsoft Word o Google Docs.
- Passar contingut de contractes o propostes en PDF a Word per revisar-los amb control de canvis.
- Migrar documentació antiga en PDF a un format editable.

## Consells

- Els dissenys complexos amb text en diverses columnes, formularis incrustats o molts gràfics poden no convertir-se perfectament. Revisa la sortida i ajusta el format al teu processador de textos.
- Els PDF escanejats (només imatge) produiran fitxers DOCX buits o mínims. Passa'ls abans per OCR per afegir-hi una capa de text.
- El mode en lot és eficient per convertir carpetes senceres de PDF: carrega'ls tots alhora.

## Eines relacionades

- [PDF a text](./pdf-to-text)
- [PDF a Markdown](./pdf-to-markdown)
- [Creador de fluxos de treball PDF](./pdf-workflow)
