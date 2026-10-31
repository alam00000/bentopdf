---
title: Elimina les restriccions
description: Elimina la protecció amb contrasenya, les restriccions d'impressió, els bloquejos d'edició i els límits de còpia dels fitxers PDF.
---

# Elimina les restriccions

Els PDF poden tenir dos tipus de contrasenya: una contrasenya d'usuari (necessària per obrir el fitxer) i una contrasenya de propietari (que controla què pots fer amb ell). Aquesta eina elimina totes dues, juntament amb totes les restriccions associades: bloquejos d'impressió, edició, còpia i anotació.

## Com funciona

1. Puja un fitxer PDF.
2. Si el PDF té una contrasenya de propietari, introdueix-la al camp **Contrasenya de propietari**. Deixa'l en blanc si el PDF només té restriccions d'ús sense contrasenya.
3. Fes clic a **Elimina les restriccions**.
4. Descarrega el PDF sense restriccions.

L'eina utilitza els indicadors `--decrypt` i `--remove-restrictions` de QPDF per produir una còpia neta i sense restriccions.

## Què s'elimina

- La protecció amb contrasenya (tant la d'usuari com la de propietari)
- Les restriccions d'impressió
- Les restriccions d'edició
- Les restriccions de còpia de text i imatges
- Les restriccions d'anotació i comentaris
- Qualsevol altra limitació de seguretat codificada al PDF

## Casos d'ús

- Desbloquejar un PDF teu del qual vas establir la contrasenya fa anys
- Eliminar les restriccions d'impressió d'un document al qual tens accés legítim
- Activar la còpia i enganxament en material de referència per prendre apunts
- Preparar PDF per a eines d'accessibilitat que no admeten documents restringits

## Consells

- Has de saber la contrasenya de propietari si n'hi ha una. Aquesta eina no desxifra ni força contrasenyes per força bruta.
- Si vols mantenir el fitxer xifrat però canviar permisos concrets, utilitza l'eina Canvia els permisos.
- El fitxer resultant no té cap xifratge: qualsevol persona que el rebi el pot obrir lliurement.

## Eines relacionades

- [Desxifra PDF](./unlock-pdf): desbloqueja un PDF quan coneixes la contrasenya d'usuari
- [Xifra PDF](./protect-pdf): torna a aplicar el xifratge amb una configuració nova
- [Canvia els permisos](./change-permissions): modifica de manera selectiva quines accions es permeten
