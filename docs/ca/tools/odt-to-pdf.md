---
title: ODT a PDF
description: Converteix fitxers OpenDocument Text (ODT) a PDF al navegador amb un motor basat en LibreOffice.
---

# ODT a PDF

Converteix fitxers OpenDocument Text a PDF. ODT és el format natiu de LibreOffice Writer, Apache OpenOffice i altres processadors de textos de codi obert. Aquesta eina utilitza un motor LibreOffice al navegador per obtenir conversions precises que conserven el format, les taules, les imatges i els estils.

## Formats compatibles

| Format            | Extensions |
| :---------------- | :--------- |
| OpenDocument Text | `.odt`     |

## Com funciona

1. Fes clic a la zona de càrrega o arrossega-hi un o més fitxers ODT.
2. Revisa la llista de fitxers. Afegeix-ne més o elimina els que no vulguis.
3. Fes clic a **Converteix a PDF**. El motor de LibreOffice s'inicialitza (un indicador de progrés mostra l'estat de la càrrega) i després es converteix cada fitxer.
4. Un sol fitxer es baixa directament com a PDF. Si són diversos, s'empaqueten a `odt-converted.zip`.

## Opcions

Aquesta eina no té cap configuració addicional. La conversió conserva el format del document original tan fidelment com és possible.

## Sortida

| Nombre d'entrades | Sortida                                               |
| :---------------- | :---------------------------------------------------- |
| 1 fitxer          | Baixada d'un sol PDF (p. ex., `document.pdf`)         |
| 2 o més fitxers   | Arxiu ZIP (`odt-converted.zip`) amb un PDF per fitxer |

## Casos d'ús

- Convertir documents de LibreOffice Writer a PDF per compartir-los amb usuaris de Microsoft Office
- Generar PDF llestos per imprimir a partir de treballs acadèmics escrits en format OpenDocument
- Convertir en lot una carpeta de plantilles ODT a PDF per distribuir-les
- Generar PDF a partir de fitxers ODT creats per sistemes automàtics de generació de documents

## Consells

- El motor de LibreOffice es carrega en el primer ús i es desa a la memòria cau per a les conversions posteriors. La primera càrrega triga uns segons; després, les conversions són ràpides.
- Els documents complexos amb objectes OLE incrustats o tipus de lletra poc habituals poden renderitzar-se lleugerament diferent que a LibreOffice d'escriptori. Fes una prova amb un exemple abans de convertir en lot.
- Per als documents de Word (`.doc`, `.docx`), utilitza l'eina [Word a PDF](./word-to-pdf), que també fa servir el motor de LibreOffice però accepta directament els formats de Microsoft.

## Eines relacionades

- [Word a PDF](./word-to-pdf)
- [RTF a PDF](./rtf-to-pdf)
- [Text a PDF](./txt-to-pdf)
