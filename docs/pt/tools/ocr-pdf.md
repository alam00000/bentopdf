---
title: OCR em PDF
description: Torne PDFs digitalizados pesquisáveis e copiáveis usando o Tesseract OCR, com suporte a vários idiomas e filtragem de caracteres.
---

# OCR em PDF

Transforme documentos digitalizados em PDFs pesquisáveis e copiáveis. A ferramenta usa o Tesseract OCR para reconhecer o texto nas imagens e sobrepõe uma camada de texto invisível sobre as páginas originais, preservando a aparência visual e tornando o conteúdo totalmente pesquisável.

## Como funciona

1. Envie um PDF digitalizado ou baseado em imagem.
2. Selecione um ou mais idiomas presentes no documento na lista de idiomas pesquisável.
3. Se quiser, ajuste as configurações avançadas (resolução, binarização, lista de permissão).
4. Clique em **Iniciar OCR** e acompanhe o progresso na barra de progresso em tempo real.
5. Ao terminar, revise o texto extraído e baixe o PDF pesquisável ou um arquivo `.txt` simples.

## Recursos

- OCR em vários idiomas com um seletor de idiomas pesquisável
- A camada de texto invisível preserva a aparência original do documento
- Barra de progresso em tempo real e saída de log durante o processamento
- Baixe os resultados como PDF pesquisável ou arquivo de texto simples
- Copie o texto extraído diretamente para a área de transferência
- Três níveis de resolução para equilibrar velocidade e precisão

## Opções

| Configuração                            | Valores                                                                                                     | Padrão    | Finalidade                                                                                       |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------ |
| **Resolução**                           | Padrão (192 DPI), Alta (288 DPI), Ultra (384 DPI)                                                           | Alta      | Resolução maior melhora a precisão em textos pequenos, mas leva mais tempo                       |
| **Binarizar imagem**                    | Ligado / Desligado                                                                                          | Desligado | Melhora o contraste em digitalizações limpas, convertendo para preto e branco                    |
| **Predefinição da lista de caracteres** | Nenhuma, Alfanumérica, Números + Moeda, Somente letras, Somente números, Fatura, Formulários, Personalizada | Nenhuma   | Restringe os caracteres reconhecidos para melhorar a precisão em tipos específicos de documentos |
| **Lista de caracteres permitidos**      | Texto livre                                                                                                 | Vazio     | Conjunto de caracteres manual quando a predefinição é Personalizada                              |

## Casos de uso

- Tornar contratos e faturas digitalizados pesquisáveis para usar Ctrl+F neles
- Extrair texto de documentos fotografados ou de registros antigos em papel
- Processar recibos com a predefinição Fatura para capturar com precisão valores e datas
- Criar PDFs acessíveis a partir de digitalizações somente de imagem para atender requisitos de conformidade
- Extrair em lote o conteúdo de texto de livros ou manuais digitalizados

## Dicas

- Selecione vários idiomas se o seu documento tiver conteúdo em idiomas mistos (por exemplo, títulos em inglês com corpo de texto em japonês).
- Use a opção de binarização em documentos com texto desbotado ou de baixo contraste: ela pode melhorar bastante a precisão do reconhecimento.
- As predefinições Fatura e Formulários reduzem drasticamente os falsos positivos em documentos estruturados, ignorando formas de caracteres irrelevantes.

## Ferramentas relacionadas

- [Extrair Tabelas](./extract-tables)
- [Mesclar PDF](./merge-pdf)
- [Comprimir PDF](./compress-pdf)
