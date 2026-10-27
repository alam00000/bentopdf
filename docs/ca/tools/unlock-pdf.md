---
title: Desbloqueja PDF
description: Elimina la protecció amb contrasenya dels PDF xifrats. Admet el desxifratge per lots amb una sola contrasenya per a diversos fitxers.
---

# Desbloqueja PDF

Si tens la contrasenya d'un PDF xifrat, aquesta eina n'elimina el xifratge per complet i genera una còpia desbloquejada que qualsevol pot obrir sense credencials. Admet el desxifratge per lots quan diversos PDF comparteixen la mateixa contrasenya.

## Com funciona

1. Puja un o més fitxers PDF xifrats.
2. Introdueix la **contrasenya** utilitzada per protegir els fitxers.
3. Fes clic a **Desxifra PDF**.
4. Un sol fitxer es descarrega directament. Diversos fitxers generen un arxiu ZIP amb tots els PDF desbloquejats.

## Característiques

- Desxifratge d'un sol fitxer i per lots
- Admet tant contrasenyes d'usuari com de propietari
- Genera una sortida completament sense xifrar i sense cap restricció residual
- Informes d'error clars per a contrasenyes incorrectes o fitxers malmesos
- Seguiment per fitxer de l'èxit o l'error en mode per lots

## En què es diferencia d'Elimina les restriccions

**Desxifra PDF** requereix la contrasenya i elimina tot el xifratge. **Elimina les restriccions** actua sobre les restriccions d'ús (impressió, còpia, edició) i pot no requerir contrasenya si només s'havia definit una contrasenya de propietari. Utilitza Desxifra quan el PDF no s'obre de cap manera sense contrasenya.

## Casos d'ús

- Desbloquejar de manera permanent PDF que vas xifrar abans quan ja no cal la contrasenya
- Eliminar el xifratge d'un lot de documents arxivats per facilitar-ne l'accés a llarg termini
- Preparar PDF protegits amb contrasenya per a un sistema de gestió documental que no admet fitxers xifrats
- Desbloquejar PDF abans de combinar-los amb altres documents (moltes eines de combinació no poden processar fitxers xifrats)

## Consells

- El camp de la contrasenya s'aplica a tots els fitxers pujats. Si els teus PDF tenen contrasenyes diferents, processa'ls en lots separats.
- Si obtens l'error «Contrasenya incorrecta», comprova que no hi hagi espais al final ni les majúscules activades.
- Després del desxifratge, la sortida no té cap seguretat. Torna-la a xifrar amb Xifra PDF si vols aplicar una contrasenya nova.

## Eines relacionades

- [Xifra PDF](./protect-pdf): torna a aplicar el xifratge amb una contrasenya nova
- [Elimina les restriccions](./remove-restrictions): elimina les restriccions d'ús sense desxifrar-ho tot
- [Canvia els permisos](./change-permissions): modifica permisos concrets d'un PDF xifrat
