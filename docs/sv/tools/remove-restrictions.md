---
title: Ta bort begränsningar
description: Ta bort lösenordsskydd, utskriftsbegränsningar, redigeringslås och kopieringsbegränsningar från PDF-filer.
---

# Ta bort begränsningar

PDF-filer kan ha två typer av lösenord: ett användarlösenord (krävs för att öppna filen) och ett ägarlösenord (styr vad du kan göra med den). Det här verktyget tar bort båda, tillsammans med alla tillhörande begränsningar: lås för utskrift, redigering, kopiering och anteckningar.

## Så fungerar det

1. Ladda upp en PDF-fil.
2. Om PDF-filen har ett ägarlösenord, ange det i fältet **Ägarlösenord**. Lämna det tomt om PDF-filen bara har användningsbegränsningar utan lösenord.
3. Klicka på **Ta bort begränsningar**.
4. Ladda ned den obegränsade PDF-filen.

Verktyget använder QPDF:s flaggor `--decrypt` och `--remove-restrictions` för att skapa en ren, obegränsad kopia.

## Vad som tas bort

- Lösenordsskydd (både användar- och ägarlösenord)
- Utskriftsbegränsningar
- Redigeringsbegränsningar
- Begränsningar för kopiering av text och bilder
- Begränsningar för anteckningar och kommentarer
- Alla andra säkerhetsbegränsningar som är kodade i PDF-filen

## Användningsområden

- Låsa upp en PDF som du äger men vars lösenord du satte för flera år sedan
- Ta bort utskriftsbegränsningar från ett dokument du har legitim åtkomst till
- Aktivera kopiera och klistra in i referensmaterial för anteckningar
- Förbereda PDF-filer för tillgänglighetsverktyg som inte klarar begränsade dokument

## Tips

- Du måste känna till ägarlösenordet om ett sådant är angivet. Verktyget knäcker eller brute-forcar inte lösenord.
- Om du vill behålla krypteringen men ändra specifika behörigheter, använd verktyget Ändra behörigheter i stället.
- Utdatafilen har ingen kryptering alls, så vem som helst som tar emot den kan öppna den fritt.

## Relaterade verktyg

- [Lås upp PDF](./unlock-pdf): lås upp en PDF när du känner till användarlösenordet
- [Skydda PDF](./protect-pdf): tillämpa kryptering igen med nya inställningar
- [Ändra behörigheter](./change-permissions): ändra selektivt vilka åtgärder som är tillåtna
