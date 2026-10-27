---
title: Ret skæve sider
description: Ret automatisk skæve sider i skannede PDF'er med OpenCV-skævhedsregistrering. Justerbar tærskel og DPI.
---

# Ret skæve sider

Skannede dokumenter er sjældent helt lige. Selv en lille hældning gør OCR mindre præcis og udskrifter sjuskede. Dette værktøj bruger OpenCV's billedbehandlingsalgoritmer til at registrere hver sides skævhedsvinkel og dreje den tilbage, så den står lige.

## Sådan fungerer det

1. Upload en eller flere skannede PDF'er.
2. Angiv **skævhedstærsklen**: sider med registreret skævhed under denne værdi røres ikke.
3. Vælg en **behandlingskvalitet (DPI)**: højere DPI giver mere præcis registrering, men tager længere tid.
4. Klik på **Ret skæve sider**.
5. Efter behandlingen viser et resultatpanel hver sides registrerede vinkel, og om den blev rettet.

## Indstillinger

| Indstilling         | Værdier                   | Standard |
| ------------------- | ------------------------- | -------- |
| **Skævhedstærskel** | 0,1, 0,5, 1,0, 2,0 grader | 0,5      |
| **Behandlings-DPI** | 100, 150, 200, 300        | 150      |

## Sådan fungerer skævhedsregistrering

Værktøjet gengiver hver side som et billede ved den valgte DPI og bruger derefter OpenCV til at registrere de dominerende linjevinkler i indholdet. Hvis den registrerede skævhed overstiger tærsklen, drejes siden med den omvendte vinkel for at rette den. Sider under tærsklen sendes uændrede igennem.

## Anvendelser

- Ryd op i batchskannede kontrakter eller juridiske dokumenter
- Forbered skannede kvitteringer eller fakturaer til OCR-behandling
- Ret sider fra en flatbed-scanner, hvor papiret er lagt forskelligt
- Forbedr den visuelle kvalitet af digitaliseret arkivmateriale

## Tips

- Sæt tærsklen ned til 0,1 grader, hvis du har brug for pixelpræcis justering til OCR.
- 150 DPI er hurtigt og præcist til de fleste dokumenter. Brug 300 DPI til meget lille tekst eller sider med fine detaljer.
- Retning af skæve sider virker bedst på dokumenter med tydelige vandrette tekstlinjer. Det kan have svært ved sider, der mest består af billeder eller diagonale designelementer.

## Relaterede værktøjer

- [Rasterisér PDF](./rasterize-pdf): konvertér det rettede resultat til en flad, billedbaseret PDF
- [Komprimer PDF](./compress-pdf): reducer filstørrelsen efter retning
- [Reparér PDF](./repair-pdf): ret strukturelle problemer i skannede PDF'er
