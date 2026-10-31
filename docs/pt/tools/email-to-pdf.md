---
title: E-mail para PDF
description: Converta arquivos de e-mail EML e MSG em PDF no seu navegador. Preserva cabeçalhos, corpo e lista de anexos.
---

# E-mail para PDF

Converta e-mails salvos em PDFs limpos e imprimíveis. A ferramenta analisa arquivos EML e MSG, extrai a mensagem completa (cabeçalhos, conteúdo do corpo e metadados dos anexos) e renderiza tudo em um PDF estruturado. Útil para descoberta jurídica, arquivamento de registros ou simplesmente para imprimir um e-mail importante.

## Formatos compatíveis

| Formato | Extensão | Observações                                                                   |
| :------ | :------- | :---------------------------------------------------------------------------- |
| EML     | `.eml`   | Formato MIME padrão de e-mail (exportado pela maioria dos clientes de e-mail) |
| MSG     | `.msg`   | Formato proprietário do Microsoft Outlook                                     |

## Como funciona

1. Clique na área de upload ou arraste e solte seus arquivos EML ou MSG. Você pode misturar os dois formatos em um único lote.
2. Revise a lista de arquivos. Remova entradas indesejadas com o ícone de lixeira ou clique em **Adicionar mais arquivos** para incluir mais e-mails.
3. Configure as opções de conversão (veja abaixo).
4. Clique em **Converter para PDF**. A ferramenta analisa cada e-mail, renderiza o conteúdo como HTML estilizado e o converte em PDF pelo mecanismo PyMuPDF.
5. Um único e-mail é baixado diretamente como PDF. Vários e-mails são empacotados em `emails-converted.zip`.

## Opções

| Opção                       | Padrão  | Descrição                                                                                               |
| :-------------------------- | :------ | :------------------------------------------------------------------------------------------------------ |
| **Tamanho da página**       | A4      | Escolha entre as dimensões de página A4, Carta (Letter) ou Ofício (Legal).                              |
| **Incluir Cc e Cco**        | Ativado | Quando ativado, as listas de destinatários em Cc e Cco aparecem na seção de cabeçalho do e-mail no PDF. |
| **Incluir lista de anexos** | Ativado | Quando ativado, uma lista dos arquivos anexados ao e-mail (com nomes e tamanhos) aparece no PDF.        |

## Casos de uso

- Arquivar correspondências comerciais importantes em PDF para conformidade ou auditoria
- Imprimir cadeias de e-mails para processos judiciais ou pedidos de descoberta
- Criar um registro permanente de confirmações de pedido, recibos ou contratos recebidos por e-mail
- Fazer backup de arquivos MSG do Outlook em um formato que não exige o Outlook para ser lido
- Documentar interações de suporte ao cliente a partir de arquivos EML exportados

## Dicas

- Tanto arquivos EML (usados pelo Thunderbird, Apple Mail e a maioria dos clientes de e-mail) quanto arquivos MSG do Outlook são compatíveis. Exporte os e-mails do seu cliente de e-mail e solte-os diretamente na ferramenta.
- E-mails em formato HTML mantêm o estilo no PDF. E-mails em texto simples são renderizados com uma formatação limpa e legível.
- A lista de anexos mostra nomes e tamanhos de arquivos, mas não incorpora os arquivos anexados no PDF.

## Ferramentas relacionadas

- [XML para PDF](./xml-to-pdf)
- [XPS para PDF](./xps-to-pdf)
