---
title: Excel a PDF
description: Converteix fulls de càlcul d'Excel (XLS, XLSX), ODS i fitxers CSV a PDF conservant el format.
---

# Excel a PDF

Converteix fitxers de full de càlcul en PDF. L'eina admet fitxers d'Excel moderns, el format XLS antic, fulls de càlcul OpenDocument i fins i tot CSV, tots renderitzats amb un motor LibreOffice al navegador que conserva el format de les cel·les, les fórmules (com a valors calculats), els gràfics i els dissenys de diversos fulls.

## Formats compatibles

| Format                      | Extensions |
| :-------------------------- | :--------- |
| Excel (modern)              | `.xlsx`    |
| Excel (antic)               | `.xls`     |
| Full de càlcul OpenDocument | `.ods`     |
| CSV                         | `.csv`     |

## Com funciona

1. Fes clic a la zona de càrrega o arrossega i deixa anar els fitxers de full de càlcul.
2. Revisa la llista de fitxers. Afegeix-ne més o elimina els que no vulguis.
3. Fes clic a **Converteix a PDF**. El motor LibreOffice s'inicialitza la primera vegada que s'utilitza i després processa cada fitxer.
4. Un sol fitxer es baixa directament com a PDF. Si són diversos, es lliuren com a `excel-converted.zip`.

## Opcions

Aquesta eina no té cap configuració addicional. El motor LibreOffice determina el disseny de pàgina, l'escala i l'àrea d'impressió segons els paràmetres integrats del full de càlcul.

## Resultat

| Nombre d'entrades | Resultat                                                             |
| :---------------- | :------------------------------------------------------------------- |
| 1 fitxer          | Baixada d'un únic PDF (nom de fitxer original amb l'extensió `.pdf`) |
| 2 o més fitxers   | Arxiu ZIP (`excel-converted.zip`) amb un PDF per cada fitxer         |

## Casos d'ús

- Convertir informes financers o pressupostos d'Excel a PDF per distribuir-los
- Crear PDF llestos per imprimir a partir de fulls de càlcul d'inventari o de catàlegs de productes
- Compartir els resultats d'una anàlisi de dades amb parts interessades que no tenen Excel instal·lat
- Arxivar informes trimestrals en un format no editable
- Convertir fitxers ODS de LibreOffice Calc a PDF

## Consells

- Els gràfics incrustats al full de càlcul es renderitzen al PDF. Assegura't que es vegin correctament al fitxer d'origen abans de convertir.
- Si el full de càlcul té diversos fulls, tots s'inclouen al PDF resultant.
- Per a dades CSV simples sense format, l'eina [CSV a PDF](./csv-to-pdf) ofereix una conversió més lleugera. Fes servir Excel a PDF quan necessitis conservar el format, els gràfics o diversos fulls.

## Eines relacionades

- [CSV a PDF](./csv-to-pdf)
- [Word a PDF](./word-to-pdf)
- [PowerPoint a PDF](./powerpoint-to-pdf)
