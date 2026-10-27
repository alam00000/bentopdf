---
title: Word a PDF
description: Converteix documents de Word (DOC, DOCX), ODT i RTF a PDF al navegador conservant tot el format.
---

# Word a PDF

Converteix documents de Microsoft Word i formats compatibles a PDF. L'eina utilitza un motor LibreOffice que s'executa al navegador i que admet fitxers DOC, DOCX, ODT i RTF, conservant a la sortida el format, les taules, les imatges, les capçaleres, els peus de pàgina i els estils.

## Formats admesos

| Format                  | Extensions |
| :---------------------- | :--------- |
| Word (modern)           | `.docx`    |
| Word (antic)            | `.doc`     |
| Text OpenDocument       | `.odt`     |
| Format de text enriquit | `.rtf`     |

## Com funciona

1. Fes clic a l'àrea de càrrega o arrossega i deixa anar els documents de Word. Pots seleccionar diversos fitxers alhora.
2. Revisa i gestiona la llista de fitxers.
3. Fes clic a **Converteix a PDF**. El motor LibreOffice es carrega en el primer ús (un indicador de progrés mostra l'estat d'inicialització) i després es converteix cada fitxer.
4. Un sol fitxer es descarrega directament com a PDF. Diversos fitxers s'empaqueten a `word-converted.zip`.

## Opcions

Aquesta eina no té cap configuració addicional. El motor LibreOffice genera la sortida amb el seu perfil d'exportació a PDF per defecte.

## Sortida

| Nombre d'entrades | Sortida                                                             |
| :---------------- | :------------------------------------------------------------------ |
| 1 fitxer          | Baixada d'un sol PDF (nom de fitxer original amb l'extensió `.pdf`) |
| 2 o més fitxers   | Arxiu ZIP (`word-converted.zip`) que conté un PDF per fitxer        |

## Casos d'ús

- Convertir un currículum o una carta de presentació de DOCX a PDF abans d'enviar una candidatura
- Convertir per lots un conjunt de contractes o propostes a PDF per lliurar-los a un client
- Convertir fitxers `.doc` antics en PDF moderns per a l'arxivament a llarg termini
- Convertir a PDF documents col·laboratius de Google Docs (exportats com a DOCX)
- Generar PDF llestos per imprimir a partir de plantilles de Word utilitzades en la generació automatitzada de documents

## Consells

- El motor LibreOffice es descarrega un cop per sessió i es desa a la memòria cau. Espera uns segons de càrrega a la primera conversió, amb conversions posteriors molt més ràpides.
- El format complex (macros, controls ActiveX, SmartArt avançat) pot no convertir-se perfectament. Els elements estàndard d'un document (text, taules, imatges, capçaleres, notes al peu) es converteixen de manera fiable.
- Com que aquesta eina també accepta ODT i RTF, pots utilitzar-la com a convertidor únic per a tots els formats de processament de textos.

## Eines relacionades

- [ODT a PDF](./odt-to-pdf)
- [RTF a PDF](./rtf-to-pdf)
- [Excel a PDF](./excel-to-pdf)
- [PowerPoint a PDF](./powerpoint-to-pdf)
