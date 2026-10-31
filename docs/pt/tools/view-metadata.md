---
title: Ver metadados
description: Inspecione todas as propriedades de metadados de um PDF, incluindo informações do documento, dados XMP e detalhes estruturais.
---

# Ver metadados

Examine as propriedades ocultas incorporadas em um arquivo PDF. A ferramenta exibe as informações do documento (título, autor, datas), metadados XMP, dimensões das páginas e outros dados estruturais em um formato legível.

## Como funciona

1. Envie um arquivo PDF.
2. A ferramenta analisa o arquivo imediatamente e exibe todos os metadados disponíveis em seções organizadas.
3. Revise o dicionário de informações do documento, a árvore de metadados XMP e as propriedades estruturais.
4. Nenhuma etapa de processamento é necessária: os metadados são exibidos assim que o arquivo é carregado.

## Recursos

- Exibe os campos padrão de informações do documento: Title, Author, Subject, Keywords, Creator, Producer
- Mostra as datas de criação e modificação em formato legível
- Analisa e renderiza a árvore completa de metadados XMP com namespaces aninhados
- Converte o formato de data do PDF (`D:20240101120000Z`) em datas legíveis
- Organizado em seções recolhíveis para facilitar a navegação

## Seções de metadados

| Seção                         | Conteúdo                                                                                          |
| ----------------------------- | ------------------------------------------------------------------------------------------------- |
| **Informações do Documento**  | Title, Author, Subject, Keywords, Creator, Producer, Creation Date, Modification Date             |
| **Metadados XMP**             | Árvore completa de metadados baseada em XML com Dublin Core, XAP, PDF e namespaces personalizados |
| **Propriedades do Documento** | Número de páginas, versão do PDF, tamanho do arquivo, status de criptografia                      |

## Casos de uso

- Verificar quem criou um PDF e quando foi modificado pela última vez
- Confirmar que os metadados foram definidos corretamente antes de publicar um documento
- Auditar PDFs quanto à privacidade, verificando quais informações pessoais estão incorporadas
- Investigar o software usado para criar ou modificar um PDF (pelo campo Producer)
- Revisar metadados XMP para conformidade na gestão de ativos digitais

## Dicas

- Strings de data do PDF que começam com `D:` são convertidas automaticamente para o formato do seu fuso horário local.
- Se campos de metadados aparecem vazios, o criador do PDF simplesmente não os definiu. Nem todos os PDFs contêm metadados completos.
- Para modificar os metadados depois de inspecioná-los, use [Editar Metadados](./edit-metadata). Para removê-los por completo, use Remover Metadados.

## Ferramentas relacionadas

- [Editar Metadados](./edit-metadata)
- [Camadas OCG do PDF](./pdf-layers)
- [Comparar PDFs](./compare-pdfs)
