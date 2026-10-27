---
title: Numeração Bates
description: Aplique números Bates a um ou vários PDFs com modelos, preenchimento, fontes e posicionamento personalizáveis.
---

# Numeração Bates

A numeração Bates carimba identificadores sequenciais em cada página dos seus PDFs. É o método padrão para rotular documentos em processos judiciais, auditorias e fluxos de conformidade. Esta ferramenta aceita vários arquivos, modelos personalizáveis e gera PDFs numerados individualmente ou um único arquivo ZIP.

## Como Funciona

1. Envie um ou mais arquivos PDF. Você pode arrastar vários arquivos de uma vez.
2. Escolha uma predefinição de estilo ou crie um modelo personalizado.
3. Configure a posição, a fonte, o tamanho, a cor e os números iniciais.
4. Clique em **Aplicar Números Bates** para processar.
5. Um único arquivo é baixado diretamente. Vários arquivos são baixados como um arquivo ZIP.

## Opções

- **Predefinição de Estilo**: escolha entre os formatos integrados:
  - Exhibit + Case + Bates + Page (por exemplo, "Exhibit 1 Case XYZ 000001 Page 1")
  - Exhibit + Case + Bates (sem número de página)
  - Case + Bates
  - Somente Número Bates (por exemplo, "000001")
  - Personalizado (escreva seu próprio modelo)
- **Personalizar Estilo**: uma string de modelo com marcadores: `[BATES]`, `[PAGE]`, `[FILE]`, `[FILENAME]`.
- **Preenchimento Bates**: número de dígitos (3 a 6) para números Bates preenchidos com zeros. Visível apenas no modo personalizado.
- **Posição**: Cabeçalho ou Rodapé, Esquerda, Centro ou Direita.
- **Bates Começa em**: o primeiro número Bates. O padrão é 1. A numeração continua entre os arquivos.
- **Contador de Arquivos Começa em**: o número inicial do marcador `[FILE]`.
- **Fonte**: Helvetica, Times New Roman ou Courier.
- **Tamanho da Fonte**: tamanho do texto carimbado.
- **Cor**: seletor de cores para o texto do número Bates.

## Recursos

- Visualização ao vivo mostrando como os números Bates aparecerão em todos os arquivos enviados
- Suporte a vários arquivos com numeração contínua entre os documentos
- Reordenação de arquivos por arrastar e soltar para controlar a sequência de numeração
- Seis opções de posição (cabeçalho/rodapé, esquerda/centro/direita)
- Cálculo adaptativo de margens que respeita tamanhos de página diferentes
- Saída em ZIP para lotes com vários arquivos
- Marcadores de modelo para máxima flexibilidade

## Casos de Uso

- Carimbar documentos de produção de provas em litígios com números sequenciais de exibição
- Numerar pacotes de evidências de auditoria que abrangem dezenas de arquivos
- Aplicar números de referência regulatórios em documentação de conformidade
- Rotular anexos de pedidos de patente com identificadores específicos de cada caso

## Dicas

- Arraste os arquivos na lista para reordená-los antes de processar. A sequência de numeração Bates segue essa ordem.
- Use o marcador `[FILENAME]` para incluir o nome do arquivo original no carimbo, o que ajuda a rastrear as páginas até os documentos de origem.
- A caixa de visualização é atualizada em tempo real conforme você altera as configurações, para que você confira o formato antes de processar.

## Ferramentas Relacionadas

- [Números de página](./page-numbers)
- [Adicionar rótulos de página](./add-page-labels)
- [Cabeçalho e rodapé](./header-footer)
