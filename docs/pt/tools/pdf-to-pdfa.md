---
title: PDF para PDF/A
description: Converta PDFs comuns para o formato PDF/A para arquivamento de longo prazo. Suporta os níveis de conformidade PDF/A-1b, PDF/A-2b e PDF/A-3b.
---

# PDF para PDF/A

PDF/A é um subconjunto do PDF padronizado pela ISO e projetado para a preservação digital de longo prazo. Esta ferramenta converte seus PDFs comuns em documentos compatíveis com PDF/A usando o Ghostscript, executado diretamente no seu navegador.

## Como Funciona

1. Envie um ou mais arquivos PDF.
2. Selecione uma **Versão do PDF/A** na lista suspensa.
3. Se quiser, ative **Pré-achatar PDF** para arquivos complexos que falham na conversão normal.
4. Clique em **Converter para PDF/A**. Vários arquivos geram um arquivo ZIP.

## Versões do PDF/A

| Versão       | Restrições                                       | Ideal Para                                                       |
| ------------ | ------------------------------------------------ | ---------------------------------------------------------------- |
| **PDF/A-1b** | A mais rígida. Sem transparência, sem camadas.   | Máxima compatibilidade com sistemas de arquivamento mais antigos |
| **PDF/A-2b** | Permite transparência e JPEG2000.                | Arquivamento de uso geral (recomendado)                          |
| **PDF/A-3b** | Permite anexos incorporados de qualquer formato. | Arquivar documentos com arquivos de dados de origem              |

O PDF/A-2b vem selecionado por padrão e atende à grande maioria das necessidades de arquivamento.

## Opção de Pré-achatar

Alguns PDFs contêm recursos que impedem uma conversão limpa para PDF/A: codificações de fonte incomuns, pilhas de transparência complexas ou estruturas internas danificadas. Ativar **Pré-achatar** rasteriza o PDF a 300 DPI antes da conversão, o que garante a conformidade ao custo de tornar o texto não selecionável. Use-a como alternativa quando a conversão padrão gerar erros.

O pré-achatamento requer o mecanismo PyMuPDF WASM.

## Casos de Uso

- Atender a exigências de arquivamento governamentais ou jurídicas (muitas jurisdições exigem PDF/A em peças processuais)
- Enviar documentos a repositórios institucionais ou bibliotecas digitais
- Preservar registros empresariais cujo software original talvez não exista daqui a dez anos
- Preparar faturas para padrões de faturamento eletrônico que exigem PDF/A-3b com anexos XML

## Dicas

- Tente primeiro a conversão sem pré-achatar. Ative-a apenas se ocorrer um erro.
- O PDF/A incorpora todas as fontes, então os arquivos de saída costumam ser maiores que os originais.
- Valide a saída em um validador de PDF/A dedicado se o seu fluxo exigir conformidade estrita.

## Ferramentas Relacionadas

- [Comprimir PDF](./compress-pdf): reduza o tamanho do arquivo depois da conversão
- [Achatar PDF (Flatten)](./flatten-pdf): achate os formulários antes de converter para PDF/A
- [Remover Metadados](./remove-metadata): remova os metadados antes de arquivar
