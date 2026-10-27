---
title: Comprimir PDF
description: Reduza o tamanho do PDF em até 90% com o mecanismo Hyper Compress. Aceita tamanhos de arquivo alvo, processamento em lote e configurações de qualidade personalizadas.
---

# Comprimir PDF

Reduza o tamanho dos seus PDFs sem estragá-los. O Comprimir PDF usa o [Hyper Compress](https://www.bentopdf.com/hyper-compress), o mecanismo de compressão próprio do BentoPDF. Ele recomprime imagens, cria subconjuntos e mescla fontes, e remove peso morto, como miniaturas incorporadas e dados privados de aplicativos. O PDF continua totalmente funcional: o texto permanece selecionável, e links e campos de formulário continuam funcionando.

O Hyper Compress é compilado para WebAssembly e acompanha o BentoPDF, então a compressão funciona offline e em implantações isoladas da internet, sem configuração extra.

## Como funciona

1. Envie um ou mais PDFs clicando na área de soltar ou arrastando os arquivos.
2. Escolha um **Nível de compressão**: Baixo, Médio, Alto ou Sem perdas.
3. Se quiser, informe um **Tamanho de arquivo alvo** ou expanda as **Configurações personalizadas** para um controle mais detalhado, incluindo **Converter para tons de cinza**.
4. Clique em **Comprimir PDF**. Para vários arquivos, você recebe um único download em ZIP.

## Documentos especiais

- **PDFs assinados digitalmente** são devolvidos sem alterações, porque qualquer mudança invalidaria a assinatura. Ative **Ignorar proteção de conteúdo** nas Configurações personalizadas para remover as assinaturas e comprimi-los; a assinatura visível permanece na página, mas o arquivo deixa de estar assinado.
- **Arquivos PDF/A** perdem o selo PDF/A após a compressão, para que o arquivo nunca afirme uma conformidade que não cumpre mais. Ative **Preservar PDF/A** nas Configurações personalizadas para manter o arquivo em conformidade.
- **PDFs protegidos por senha** ganham um campo de senha no cartão do arquivo. Digite a senha ali e o Hyper Compress abre o arquivo por conta própria, sem uma etapa separada de desbloqueio. Com dois ou mais arquivos bloqueados, um único campo compartilhado desbloqueia todos os arquivos que usam a mesma senha. A cópia comprimida não tem senha; use [Criptografar PDF](./protect-pdf) para adicionar uma novamente.
- **Digitalizações sem camada de texto** podem encolher ainda mais com **Rasterizar páginas** nas Configurações personalizadas, que substitui cada página por uma imagem otimizada. A opção é ignorada em qualquer documento com texto selecionável, incluindo digitalizações com OCR, a menos que **Ignorar proteção de conteúdo** esteja ativado. Nesse caso, páginas com texto também viram imagens, então o texto deixa de ser selecionável e os links param de funcionar.

## Níveis de compressão

| Nível          | Qualidade da imagem | Resolução máxima | Ideal para                           |
| -------------- | ------------------- | ---------------- | ------------------------------------ |
| **Baixo**      | 80                  | 200 DPI          | Preservar a qualidade visual         |
| **Médio**      | 50                  | 150 DPI          | Documentos do dia a dia              |
| **Alto**       | 20                  | 72 DPI           | Anexos de e-mail, uploads para a web |
| **Sem perdas** | Imagens intactas    | Inalterada       | Cópias de arquivamento               |

O nível Alto também remove a incorporação das 14 fontes padrão do PDF, além de fontes semelhantes, como a Arial, quando isso é seguro.

## Tamanho de arquivo alvo

Informe um tamanho em KB ou MB e o Hyper Compress busca a melhor qualidade de imagem que ainda caiba, partindo do nível escolhido. Se o documento não puder ficar tão pequeno, você recebe a menor versão possível e uma mensagem avisando. As páginas dedicadas, como [Comprimir PDF para 1MB](https://www.bentopdf.com/compress-pdf-to-1mb), abrem com o alvo já preenchido.

## Configurações personalizadas

Expanda o painel de Configurações personalizadas para ajustar o Hyper Compress diretamente. Escolher um nível de compressão restaura esses valores para os do nível, e editar qualquer um deles muda o nível para Personalizado.

- **Ignorar proteção de conteúdo**: por padrão, o Hyper Compress não mexe em PDFs assinados e não rasteriza páginas que têm texto. Ativar esta opção ignora as duas regras. Ela continua ativada quando você muda o nível.

- **Imagens**: qualidade da imagem, resolução máxima, reamostragem forçada, redução de cores, recorte de áreas invisíveis de imagens, remoção de imagens alternativas, simplificação de perfis de cor, JPEG 2000 e modo sem perdas
- **Fontes**: criação de subconjuntos, mesclagem de duplicatas e remoção da incorporação de fontes padrão e suas semelhantes
- **Conteúdo**: achatar anotações, campos de formulário ou links
- **Limpeza**: remoção de miniaturas, dados de aplicativos, threads de artigos, informações de captura da web, árvore de estrutura ou intenções de saída
- **Rasterizar**: substituir páginas por imagens, para digitalizações somente de imagem; ignorado quando o documento tem texto selecionável
- **Saída**: Preservar PDF/A e compressão Brotli para leitores de PDF 2.0 que a suportam

## Casos de uso

- Fazer um relatório de 50 MB caber no limite de anexos de e-mail
- Colocar uma digitalização abaixo do limite rígido de upload de um portal usando um tamanho de arquivo alvo
- Otimizar PDFs de marketing para downloads mais rápidos no site
- Arquivar grandes conjuntos de documentos em que o custo de armazenamento importa
- Reduzir o uso de dados móveis ao compartilhar PDFs em aplicativos de mensagens

## Dicas

- Comece pelo Médio. Se o resultado ainda for grande demais, defina um tamanho de arquivo alvo ou suba para o Alto.
- Para uma digitalização sem camada de texto, ative Rasterizar páginas nas Configurações personalizadas.
- Converter para tons de cinza, nas Configurações personalizadas, pode reduzir o tamanho de documentos com muitas cores.

## Ferramentas relacionadas

- [Linearizar PDF](./linearize-pdf): otimize o PDF comprimido para visualização rápida na web
- [Rasterizar PDF](./rasterize-pdf): converta páginas em imagens com um DPI específico, inclusive páginas com texto
- [Reparar PDF](./repair-pdf): corrija um PDF que quebrou durante a compressão em outro lugar
- [Remover Metadados](./remove-metadata): elimine dados ocultos para maior privacidade
