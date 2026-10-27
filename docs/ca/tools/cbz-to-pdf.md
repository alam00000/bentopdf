---
title: CBZ a PDF
description: Converteix arxius de còmics CBZ i CBR a PDF al navegador. Gratuït, privat i sense càrrega de fitxers.
---

# CBZ a PDF

Converteix arxius de còmics en PDF. CBZ i CBR són els formats estàndard dels còmics digitals: simplement són arxius ZIP o RAR plens d'imatges. Aquesta eina extreu cada pàgina, conserva l'ordre de lectura i genera un PDF net on cada imatge es converteix en una pàgina a mida completa.

## Formats compatibles

| Format | Extensió | Notes                                                         |
| :----- | :------- | :------------------------------------------------------------ |
| CBZ    | `.cbz`   | Arxiu de còmic basat en ZIP (processat localment amb pdf-lib) |
| CBR    | `.cbr`   | Arxiu de còmic basat en RAR (processat amb el motor PyMuPDF)  |

El convertidor de CBZ reconeix imatges JPEG, PNG, GIF, BMP, WebP, AVIF, TIFF, HEIC i JXL dins de l'arxiu. Els formats no estàndard es converteixen automàticament a PNG abans d'incrustar-los.

## Com funciona

1. Fes clic a la zona de càrrega o arrossega i deixa anar els fitxers CBZ o CBR. Pots barrejar tots dos formats en un mateix lot.
2. Revisa els fitxers de la llista. Elimina els que no necessitis o fes clic a **Afegeix més fitxers** per afegir-ne més.
3. Fes clic a **Converteix a PDF**. Als fitxers CBZ, l'eina descomprimeix l'arxiu, ordena les imatges pel nom en ordre natural, detecta el format real de cada imatge i les incrusta en un PDF amb pdf-lib. Els fitxers CBR passen pel motor PyMuPDF.
4. Un sol fitxer es baixa com a PDF. Si en són diversos, es genera un arxiu ZIP anomenat `comic-converted.zip`.

## Opcions

No cal cap configuració. Cada imatge es converteix en una pàgina amb les mateixes dimensions que l'original, de manera que les pàgines dobles continuen sent amples i les pàgines senzilles continuen sent estretes.

## Casos d'ús

- Llegir còmics en una tauleta o una aplicació mòbil que admet PDF però no CBZ/CBR
- Imprimir pàgines concretes d'un còmic digital
- Arxivar una col·lecció de còmics en un format que qualsevol visor de fitxers pugui obrir
- Compartir un còmic amb algú que no té un lector de còmics específic

## Consells

- Les imatges de l'arxiu s'ordenen amb ordre natural (de manera que `page2.jpg` va abans de `page10.jpg`). Posa als fitxers una numeració coherent perquè la seqüència de pàgines sigui correcta.
- El convertidor detecta el format de les imatges per les seves signatures binàries, no per l'extensió. Un PNG anomenat per error `.jpg` s'incrustarà correctament igualment.
- Els fitxers CBZ es processen íntegrament al navegador sense carregar el motor PyMuPDF, de manera que es converteixen més de pressa que els CBR.

## Eines relacionades

- [EPUB a PDF](./epub-to-pdf)
- [MOBI a PDF](./mobi-to-pdf)
- [Imatges a PDF](./image-to-pdf)
