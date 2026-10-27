---
title: Reconeixement OCR de PDF
description: Fes que els PDF escanejats es puguin cercar i copiar amb Tesseract OCR, amb compatibilitat amb diversos idiomes i filtratge de caràcters.
---

# Reconeixement OCR de PDF

Converteix documents escanejats en PDF en què es pot cercar i copiar. L'eina fa servir Tesseract OCR per reconèixer el text de les imatges i superposa una capa de text invisible sobre les pàgines originals, de manera que es conserva l'aspecte visual i el contingut es pot cercar completament.

## Com funciona

1. Puja un PDF escanejat o basat en imatges.
2. Selecciona un o més idiomes presents al document a la llista d'idiomes amb cercador.
3. Si vols, ajusta la configuració avançada (resolució, binarització, llista blanca).
4. Fes clic a **Inicia l'OCR** i segueix el progrés a la barra de progrés en temps real.
5. Quan acabi, revisa el text extret i baixa el PDF cercable o un fitxer `.txt` de text pla.

## Funcionalitats

- OCR multilingüe amb un selector d'idiomes amb cercador
- La capa de text invisible conserva l'aspecte original del document
- Barra de progrés en temps real i registre de sortida durant el processament
- Baixa els resultats com a PDF cercable o com a fitxer de text pla
- Copia el text extret directament al porta-retalls
- Tres nivells de resolució per equilibrar velocitat i precisió

## Opcions

| Paràmetre                                     | Valors                                                                                               | Per defecte | Finalitat                                                                                   |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------- |
| **Resolució**                                 | Estàndard (192 DPI), Alta (288 DPI), Ultra (384 DPI)                                                 | Alta        | Una resolució més alta millora la precisió amb text petit, però triga més                   |
| **Binaritza la imatge**                       | Activat / Desactivat                                                                                 | Desactivat  | Millora el contrast d'escanejos nets convertint-los a blanc i negre                         |
| **Preajust de la llista blanca de caràcters** | Cap, Alfanumèric, Números i moneda, Només lletres, Només números, Factura, Formularis, Personalitzat | Cap         | Restringeix els caràcters reconeguts per millorar la precisió en tipus de document concrets |
| **Llista blanca de caràcters**                | Text lliure                                                                                          | Buit        | Conjunt de caràcters manual quan el preajust és Personalitzat                               |

## Casos d'ús

- Fer que els contractes i les factures escanejats es puguin cercar per poder fer Ctrl+F
- Extreure text de documents fotografiats o de registres antics en paper
- Processar tiquets amb el preajust Factura per capturar amb precisió imports i dates
- Crear PDF accessibles a partir d'escanejos que només contenen imatges per complir requisits normatius
- Extreure per lots el contingut de text de llibres o manuals escanejats

## Consells

- Selecciona diversos idiomes si el document conté contingut en llengües mixtes (p. ex., capçaleres en anglès amb text en japonès).
- Fes servir l'opció de binarització en documents amb text esvaït o de poc contrast: pot millorar considerablement la precisió del reconeixement.
- Els preajustos Factura i Formularis de la llista blanca redueixen dràsticament els falsos positius en documents estructurats en ignorar les formes de caràcter irrellevants.

## Eines relacionades

- [Extreu taules de PDF](./extract-tables)
- [Fusiona PDF](./merge-pdf)
- [Comprimeix PDF](./compress-pdf)
