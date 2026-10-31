---
title: RTF a PDF
description: Converteix fitxers Rich Text Format (RTF) a PDF al navegador amb un motor basat en LibreOffice.
---

# RTF a PDF

Converteix documents Rich Text Format a PDF. RTF és un format de document multiplataforma compatible amb pràcticament tots els processadors de text. Aquesta eina utilitza un motor LibreOffice al navegador per representar els fitxers RTF amb el format intacte: la negreta, la cursiva, les taules i les imatges incrustades es mantenen al PDF.

## Formats compatibles

| Format | Extensions | Tipus MIME                    |
| :----- | :--------- | :---------------------------- |
| RTF    | `.rtf`     | `text/rtf`, `application/rtf` |

## Com funciona

1. Fes clic a l'àrea de càrrega o arrossega i deixa anar un o més fitxers RTF.
2. Revisa la llista de fitxers. Afegeix-ne o elimina'n segons calgui.
3. Fes clic a **Converteix a PDF**. El motor LibreOffice s'inicialitza el primer cop i després processa cada fitxer.
4. Un sol fitxer es baixa directament com a PDF. Diversos fitxers s'entreguen com a `rtf-converted.zip`.

## Opcions

Aquesta eina no té opcions addicionals. La conversió conserva el format RTF original.

## Sortida

| Nombre d'entrades | Sortida                                               |
| :---------------- | :---------------------------------------------------- |
| 1 fitxer          | Baixada d'un sol PDF (p. ex., `letter.pdf`)           |
| 2+ fitxers        | Arxiu ZIP (`rtf-converted.zip`) amb un PDF per fitxer |

## Casos d'ús

- Convertir documents RTF antics de processadors de text antics a PDF moderns
- Convertir plantilles de correu RTF en previsualitzacions PDF
- Processar la sortida RTF de programari jurídic o mèdic
- Convertir per lots fitxers RTF d'un sistema de gestió documental a PDF per arxivar-los

## Consells

- El motor LibreOffice es carrega una vegada i es desa a la memòria cau. La primera conversió d'una sessió triga uns segons més; les següents són més ràpides.
- Els fitxers RTF amb objectes OLE incrustats poden no representar tots els objectes perfectament. El text pla, les imatges i el format estàndard es converteixen de manera fiable.
- Si els teus fitxers RTF es van crear amb Microsoft Word, també els pots convertir directament amb l'eina [Word a PDF](./word-to-pdf), que accepta RTF a més de DOC i DOCX.

## Eines relacionades

- [Word a PDF](./word-to-pdf)
- [ODT a PDF](./odt-to-pdf)
- [Text a PDF](./txt-to-pdf)
