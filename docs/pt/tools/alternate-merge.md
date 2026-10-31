---
title: Alternar e misturar páginas
description: Mescle PDFs intercalando as páginas de cada arquivo em ordem alternada, com preservação dos marcadores.
---

# Alternar e misturar páginas

Intercale as páginas de vários arquivos PDF para que as páginas se alternem entre os documentos. Esta é a ferramenta certa quando uma mesclagem comum apenas juntaria os arquivos um após o outro, mas você precisa da página 1 do Arquivo A, depois da página 1 do Arquivo B, depois da página 2 do Arquivo A, e assim por diante.

## Como Funciona

1. Envie pelo menos dois arquivos PDF usando a área de soltar.
2. A ferramenta exibe cada arquivo com seu número de páginas e tamanho.
3. Arraste as alças para reordenar qual arquivo tem as páginas primeiro na sequência de intercalação.
4. Clique em **Misturar Páginas** para gerar a saída intercalada.
5. O resultado é baixado como `alternated-mixed.pdf`.

## Recursos

- Intercala páginas de qualquer número de PDFs (mínimo de dois)
- Reordenação dos arquivos por arrastar e soltar para controlar a prioridade da intercalação
- Preserva os marcadores dos documentos de origem
- Exibe o número de páginas e o tamanho de cada arquivo enviado
- Processa em um web worker dedicado para manter a interface responsiva

## Casos de Uso

- Remontar digitalizações frente e verso em que as páginas ímpares e pares foram digitalizadas separadamente
- Combinar folhas de perguntas com gabaritos, para que cada pergunta seja seguida da sua resposta
- Mesclar documentos em dois idiomas página a página (por exemplo, inglês de um lado e a tradução no seguinte)
- Intercalar digitalizações de frente e verso feitas em um scanner de face única

## Dicas

- Se os PDFs de origem tiverem números de páginas diferentes, as páginas do documento mais curto acabam primeiro e as páginas restantes do documento mais longo aparecem no final.
- A ordem dos arquivos importa: o primeiro arquivo da lista fornece a primeira página da saída. Arraste para reorganizar, se necessário.

## Ferramentas Relacionadas

- [Mesclar PDF](./merge-pdf)
- [Organize & Duplicate](./organize-pdf)
- [Dividir PDF](./split-pdf)
