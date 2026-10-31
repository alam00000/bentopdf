---
title: Construtor de fluxo de trabalho PDF
description: Crie pipelines personalizados de processamento de PDF de forma visual, conectando nós em um canvas. Encadeie operações como mesclar, comprimir, marca d'água e exportar.
---

# Construtor de fluxo de trabalho PDF

O Construtor de fluxo de trabalho permite encadear várias operações de PDF em um único pipeline automatizado. Em vez de executar as ferramentas uma de cada vez, você monta um grafo visual de nós (entrada, processamento, saída) e executa tudo com um clique. Seus arquivos nunca saem do navegador.

## Como Funciona

A interface é dividida em três painéis: uma **caixa de nós** à esquerda, o **canvas** no centro e um **painel de configurações** à direita, que aparece ao selecionar um nó.

1. **Adicione nós** clicando neles na barra lateral esquerda ou arrastando-os diretamente para o canvas. Use a barra de pesquisa no topo da caixa de nós para filtrar por nome.
2. **Conecte os nós** arrastando de um soquete de saída (parte de baixo de um nó) até um soquete de entrada (parte de cima de outro nó). As conexões fluem de cima para baixo.
3. **Defina as configurações** clicando em um nó para abrir seu painel de configurações à direita. Cada tipo de nó tem suas próprias opções (intervalos de páginas, controles de qualidade, senhas etc.).
4. **Execute o fluxo de trabalho** clicando no botão **Executar** na barra de ferramentas. O mecanismo executa os nós em ordem topológica, processando um de cada vez em sequência. Uma barra de status na parte inferior acompanha o progresso.
5. **Baixe os resultados**: o nó Download, no final, salva o PDF final (ou um ZIP, se vários arquivos forem produzidos).

## Categorias de Nós

Os nós são organizados em seis categorias, cada uma com uma cor no canvas:

- **Entrada** (azul): Entrada PDF, Entrada de imagem, Word/Excel/PowerPoint para PDF e mais de 15 outros conversores de formato que alimentam o pipeline com arquivos.
- **Editar e Anotar** (índigo): Recortar, Tons de Cinza, Inverter Cores, Marca d'água, Números de Página, Cabeçalho e Rodapé, Efeito de Scanner, Ajustar Cores, Cor de Fundo, Remover Páginas em Branco, Remover Anotações.
- **Organizar e Gerenciar** (violeta): Mesclar, Dividir, Extrair Páginas, Girar, Excluir Páginas, Inverter, Adicionar Página em Branco, Dividir Páginas, N-Up, Ajustar Tamanho da Página, Combinar em Página Única, Livreto, Posterizar, Editar Metadados, Índice, OCR.
- **Otimizar e Reparar** (âmbar): Comprimir, Rasterizar, Linearizar, Desinclinar, PDF para PDF/A, Fonte em Contorno, Reparar.
- **Proteger PDF** (rosa): Criptografar, Descriptografar, Higienizar, Achatar, Assinar Digitalmente, Redigir.
- **Saída** (verde-azulado): Download (detecta automaticamente PDF único ou ZIP), PDF para Imagens, PDF para Texto, PDF para DOCX, PDF para XLSX, PDF para CSV, PDF para SVG, PDF para Markdown, Extrair Imagens.

## Salvando e Carregando Fluxos de Trabalho

A barra de ferramentas oferece quatro opções de persistência:

- **Salvar**: armazena o fluxo de trabalho atual como um modelo nomeado no armazenamento local do navegador. Você pode salvar vários modelos.
- **Carregar**: abre uma janela com todos os modelos salvos. Clique em Carregar para restaurar um deles ou exclua os modelos de que não precisa mais.
- **Exportar**: baixa o fluxo de trabalho como um arquivo `.json` para você compartilhá-lo ou fazer um backup.
- **Importar**: carrega um arquivo de fluxo de trabalho `.json` do disco, restaurando todos os nós, posições e conexões.

Os modelos persistem entre sessões no armazenamento local. Os arquivos JSON exportados são portáteis entre navegadores e máquinas.

## Modelo de Execução

O mecanismo cria um grafo de dependências a partir das suas conexões e executa os nós em ordem topológica. Se algum nó falhar, a execução é interrompida e o nó com falha é marcado em vermelho. Algumas regras a ter em mente:

- Todo fluxo de trabalho precisa de pelo menos um nó de **Entrada** e um nó de **Saída**.
- O mecanismo detecta dependências circulares e bloqueia a execução com um erro.
- O nó **Criptografar** deve ser a última etapa de processamento antes do nó de saída. Colocá-lo antes dispara um aviso de validação, pois os nós seguintes não conseguem operar com dados criptografados.
- PDFs protegidos por senha pedem a senha durante a execução.
- Entradas com vários PDFs são suportadas: o nó Mesclar pode combiná-los, ou os nós de processamento em lote processarão cada PDF individualmente.

## Tipos de Soquete

As conexões usam soquetes tipados para evitar ligações inválidas:

- **PDF** (índigo): um único documento PDF.
- **MultiPDF** (âmbar): vários documentos PDF agrupados.
- **Image** (verde): um blob de imagem.

## Opções

Cada nó tem sua própria configuração, acessível pelo painel de configurações à direita. Alguns padrões comuns:

- **Intervalos de páginas** nos nós Dividir, Extrair Páginas e Excluir Páginas
- **Controles de qualidade** nos nós de saída de conversão para imagem
- **Campos de senha** nos nós Criptografar e Descriptografar
- **Campos de texto** para Marca d'água, Cabeçalho e Rodapé e Editar Metadados
- **Ângulos de rotação** no nó Girar
- **Nível de compressão** no nó Comprimir
- **Seleção de idioma do OCR** no nó OCR

## Casos de Uso

- **Pipeline de processamento de faturas**: Entrada PDF -> OCR -> Extrair Tabelas -> Download como CSV.
- **Padronização de relatórios**: Word para PDF -> Ajustar Tamanho da Página -> Adicionar Números de Página -> Marca d'água -> Comprimir -> Download.
- **Preparação para arquivamento**: Entrada PDF -> Reparar -> Achatar -> Higienizar -> PDF para PDF/A -> Download.
- **Extração de imagens em lote**: Entrada PDF (vários arquivos) -> Extrair Imagens -> Download do ZIP.
- **Livretos prontos para impressão**: Entrada PDF -> Livreto -> Recortar -> Comprimir -> Download.
- **Distribuição segura**: Entrada PDF -> Redigir -> Remover Anotações -> Criptografar -> Download.

## Dicas

- Use **Delete** ou **Backspace** para remover do canvas o nó selecionado.
- Clique no botão **X** na barra de status de um nó para excluí-lo diretamente.
- Mova o canvas clicando e arrastando em um espaço vazio. O cursor muda para um ícone de mão enquanto você move.
- No celular, use o botão **+** na barra de ferramentas para alternar a caixa de nós.
- Se o fluxo de trabalho produzir vários arquivos de saída, o nó Download os agrupa automaticamente em um ZIP.
- Comece de forma simples: monte e teste um pipeline de dois nós antes de aumentar a complexidade.

## Ferramentas Relacionadas

- [PDF para Texto](./pdf-to-text)
- [PDF para Excel](./pdf-to-excel)
- [Extrair Imagens](./extract-images)
- [PDF para Markdown](./pdf-to-markdown)
