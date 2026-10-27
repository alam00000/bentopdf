---
title: PowerPoint a PDF
description: Converteix presentacions de PowerPoint (PPT, PPTX) i fitxers ODP a PDF conservant el format de les diapositives.
---

# PowerPoint a PDF

Converteix fitxers de presentació a PDF. Cada diapositiva es converteix en una pàgina del document resultant, amb text, imatges, formes i transicions renderitzats mitjançant un motor LibreOffice que s'executa al navegador. Admet tant els formats moderns com els antics de PowerPoint, i també el format OpenDocument Presentation.

## Formats admesos

| Format                    | Extensions |
| :------------------------ | :--------- |
| PowerPoint (modern)       | `.pptx`    |
| PowerPoint (antic)        | `.ppt`     |
| OpenDocument Presentation | `.odp`     |

## Com funciona

1. Fes clic a l'àrea de càrrega o arrossega i deixa anar les presentacions.
2. Revisa la llista de fitxers. Afegeix-ne més o elimina'n els que no calguin.
3. Fes clic a **Converteix a PDF**. El motor LibreOffice es carrega la primera vegada que l'utilitzes i després converteix cada fitxer.
4. Un sol fitxer es descarrega directament com a PDF. Diversos fitxers s'empaqueten a `powerpoint-converted.zip`.

## Opcions

Aquesta eina no té cap configuració addicional. Les diapositives es renderitzen amb les dimensions originals.

## Resultat

| Nombre de fitxers | Resultat                                                     |
| :---------------- | :----------------------------------------------------------- |
| 1 fitxer          | Descàrrega d'un sol PDF (nom original amb extensió `.pdf`)   |
| 2 o més fitxers   | Arxiu ZIP (`powerpoint-converted.zip`) amb un PDF per fitxer |

## Casos d'ús

- Convertir una presentació a PDF abans de compartir-la amb un públic que potser no té PowerPoint
- Crear una versió imprimible d'una presentació com a material per a una conferència o un taller
- Arxivar presentacions en un format que es veu igual a tots els dispositius
- Convertir per lots una biblioteca de presentacions ODP de LibreOffice Impress a PDF
- Generar una versió PDF d'una presentació comercial per adjuntar-la a un correu

## Consells

- Les animacions i transicions de les diapositives no es representen al PDF. Cada diapositiva es captura com a pàgina estàtica.
- Els vídeos incrustats no apareixeran al resultat. Substitueix-los per una captura de pantalla o una imatge de marcador de posició si cal.
- Les notes de l'orador no s'inclouen a l'exportació a PDF per defecte. Si necessites les notes, considera exportar primer des de la vista nativa «Imprimeix notes» de PowerPoint.
- El motor LibreOffice es guarda a la memòria cau després de la primera càrrega, de manera que convertir una segona presentació a la mateixa sessió és molt més ràpid.

## Eines relacionades

- [Word a PDF](./word-to-pdf)
- [Excel a PDF](./excel-to-pdf)
- [Imatges a PDF](./image-to-pdf)
