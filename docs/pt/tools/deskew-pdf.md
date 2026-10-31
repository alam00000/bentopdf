---
title: Desinclinar PDF
description: Endireite automaticamente páginas inclinadas em PDFs digitalizados usando a detecção de inclinação do OpenCV. Limite e DPI ajustáveis.
---

# Desinclinar PDF

Documentos digitalizados raramente ficam perfeitamente retos. Mesmo uma leve inclinação deixa o OCR menos preciso e a impressão com aspecto desleixado. Esta ferramenta usa os algoritmos de processamento de imagem do OpenCV para detectar o ângulo de inclinação de cada página e girá-la de volta ao nível.

## Como funciona

1. Envie um ou mais PDFs digitalizados.
2. Defina o **Limite de inclinação**: páginas com inclinação detectada abaixo desse valor não são alteradas.
3. Escolha a **Qualidade de processamento (DPI)**: um DPI maior melhora a precisão da detecção, mas demora mais.
4. Clique em **Desinclinar PDF**.
5. Após o processamento, um painel de resultados mostra o ângulo detectado em cada página e se ela foi corrigida.

## Opções

| Configuração             | Valores                  | Padrão |
| ------------------------ | ------------------------ | ------ |
| **Limite de inclinação** | 0,1, 0,5, 1,0, 2,0 graus | 0,5    |
| **DPI de processamento** | 100, 150, 200, 300       | 150    |

## Como funciona a detecção de inclinação

A ferramenta renderiza cada página como imagem no DPI selecionado e usa o OpenCV para detectar os ângulos dominantes das linhas no conteúdo. Se a inclinação detectada exceder o limite, a página é girada no ângulo inverso para ficar reta. Páginas abaixo do limite passam sem alterações.

## Casos de uso

- Limpar contratos ou documentos jurídicos digitalizados em lote
- Preparar recibos ou notas fiscais digitalizados para o processamento de OCR
- Endireitar páginas de um scanner de mesa com posicionamento irregular do papel
- Melhorar a qualidade visual de materiais de arquivo digitalizados

## Dicas

- Reduza o limite para 0,1 grau se precisar de alinhamento perfeito ao pixel para o OCR.
- 150 DPI é rápido e preciso para a maioria dos documentos. Use 300 DPI para textos muito pequenos ou páginas com detalhes finos.
- O desinclinar funciona melhor em documentos com linhas de texto horizontais nítidas. Pode ter dificuldade com páginas que são majoritariamente imagens ou elementos de design diagonais.

## Ferramentas relacionadas

- [Rasterizar PDF](./rasterize-pdf): converta a saída desinclinada em um PDF plano baseado em imagens
- [Comprimir PDF](./compress-pdf): reduza o tamanho do arquivo após desinclinar
- [Reparar PDF](./repair-pdf): corrija problemas estruturais em PDFs digitalizados
