---
title: XPS para PDF
description: Converta documentos XPS e OXPS em PDF no seu navegador. Sem upload, sem cadastro, totalmente privado.
---

# XPS para PDF

Converta documentos Microsoft XPS e OXPS em arquivos PDF padrão. O XPS (XML Paper Specification) foi a resposta da Microsoft ao PDF, mas o suporte a ele diminuiu em várias plataformas. Esta ferramenta torna esses documentos legíveis universalmente de novo.

## Formatos suportados

| Formato | Extensão | Observações                             |
| :------ | :------- | :-------------------------------------- |
| XPS     | `.xps`   | Formato XPS original da Microsoft       |
| OXPS    | `.oxps`  | Open XPS, a variante do padrão ECMA-388 |

## Como funciona

1. Clique na área de upload ou arraste e solte seus arquivos XPS/OXPS. Você pode selecionar vários arquivos de uma vez.
2. Revise a lista de arquivos. Remova arquivos individuais com o ícone de lixeira ou clique em **Adicionar Mais Arquivos** para acrescentar documentos.
3. Clique em **Converter para PDF**. O mecanismo PyMuPDF processa cada documento localmente no seu navegador.
4. Um único arquivo é baixado diretamente como PDF. Vários arquivos são reunidos em um arquivo ZIP chamado `xps-converted.zip`.

## Opções

Esta ferramenta faz uma conversão direta de formato, sem configuração adicional. A saída preserva as dimensões originais da página, os gráficos vetoriais, as fontes e as imagens da origem XPS.

## Casos de uso

- Abrir arquivos XPS recebidos de sistemas Windows mais antigos que usavam o driver de impressão XPS por padrão
- Converter documentos OXPS do Windows 10/11 para compartilhar com usuários de macOS ou Linux
- Arquivar arquivos XPS legados em um formato com suporte mais amplo
- Tornar documentos governamentais ou corporativos baseados em XPS acessíveis a destinatários externos

## Dicas

- As extensões `.xps` e `.oxps` são tratadas automaticamente: você pode misturá-las no mesmo lote.
- Se o arquivo XPS original foi criado com um driver de impressão de alta resolução, o PDF resultante mantém essa qualidade. Não há reamostragem.

## Ferramentas relacionadas

- [Word para PDF](./word-to-pdf)
- [XML para PDF](./xml-to-pdf)
