---
title: Text a PDF
description: Converteix fitxers de text pla o text escrit a PDF amb fonts, colors i mides de pàgina personalitzats.
---

# Text a PDF

Converteix text pla en un PDF amb format. Pots pujar fitxers `.txt` o escriure directament a l'editor de text integrat. L'eina admet diverses fonts, colors de text personalitzats i una àmplia gamma de mides de pàgina, des d'A0 fins a A10, a més de US Letter, Legal i Tabloid.

## Formats compatibles

| Entrada                 | Extensions                          |
| :---------------------- | :---------------------------------- |
| Fitxers de text pla     | `.txt`                              |
| Entrada de text directa | Escriu o enganxa el text a l'editor |

## Com funciona

1. Tria el mode d'entrada amb el commutador de la part superior: **Puja fitxers** o **Escriu text**.
2. Si puges fitxers, arrossega i deixa anar o fes clic per seleccionar un o més fitxers `.txt`. Si escrius, introdueix el text directament a l'àrea de text.
3. Configura les opcions de format: família tipogràfica, mida de lletra, color del text i mida de pàgina.
4. Fes clic a **Crea el PDF**. La sortida es baixa com a `text_to_pdf.pdf`.

Quan puges diversos fitxers, el seu contingut es concatena amb línies en blanc entre ells.

## Opcions

| Opció                   | Valors                                                                   | Per defecte     |
| :---------------------- | :----------------------------------------------------------------------- | :-------------- |
| **Família tipogràfica** | Helvetica (sans-serif), Tiro (serif), Courier (monospace), Times (serif) | Helvetica       |
| **Mida de lletra**      | 6-72 pt                                                                  | 12              |
| **Color del text**      | Qualsevol color amb el selector de color                                 | Negre (#000000) |
| **Mida de pàgina**      | ISO A0-A10, B0-B10, C0-C10, US Letter, Legal, Tabloid, Ledger, 11x17     | A4              |

Les llengües de dreta a esquerra (àrab, hebreu, persa, urdú) es detecten automàticament. Quan es troba text RTL, la direcció i l'alineació del text canvien en conseqüència.

## Casos d'ús

- Convertir fragments de codi o fitxers de registre en un PDF imprimible amb la font Courier
- Crear ràpidament un PDF a partir de notes de reunió escrites al moment
- Donar format a un manuscrit de text pla amb una font i una mida de pàgina concretes per enviar-lo
- Produir una versió PDF d'un README o d'un registre de canvis per distribuir-lo fora de línia

## Consells

- Utilitza el mode **Escriu text** quan vulguis convertir ràpidament el contingut del porta-retalls sense desar-lo abans com a fitxer.
- Courier (monospace) és la millor font per a codi, registres o qualsevol contingut on importi l'alineació de columnes.
- Els marges de la pàgina són fixos de 72 punts (1 polzada) a tots els costats.

## Eines relacionades

- [Markdown a PDF](./markdown-to-pdf)
- [CSV a PDF](./csv-to-pdf)
- [Word a PDF](./word-to-pdf)
