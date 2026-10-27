---
title: Preenchimento de formulário PDF
description: Preencha formulários PDF, incluindo formulários XFA, diretamente no navegador com um visualizador incorporado.
---

# Preenchimento de formulário PDF

Abra um PDF com campos de formulário e preencha-o diretamente em um visualizador incorporado. A ferramenta suporta tanto campos AcroForm padrão quanto formulários XFA (XML Forms Architecture) legados. Depois de concluir o formulário, baixe a versão preenchida com um único clique.

## Como funciona

1. Envie um PDF que contenha campos de formulário.
2. O documento abre em um visualizador de PDF integrado que renderiza os campos como entradas interativas.
3. Clique nos campos de texto, caixas de seleção, listas suspensas e botões de opção para preenchê-los.
4. Clique em **Salvar e Baixar Formulário Preenchido** para obter o PDF concluído.

## Recursos

- Visualizador PDF.js incorporado com interação completa com os campos do formulário
- Suporte a campos AcroForm padrão (campos de texto, caixas de seleção, listas suspensas, botões de opção)
- Suporte a formulários XFA para formulários legados baseados em XML
- Dimensionamento automático do visualizador com base nas dimensões da página
- Exibição do arquivo com nome e tamanho

## Opções

Não há opções de configuração adicionais. Envie o formulário, preencha e baixe.

## Casos de uso

- Preencher declarações de impostos, pedidos de seguro ou documentos governamentais
- Preencher formulários de candidatura a vagas recebidos como anexos PDF
- Preencher formulários de cadastro de fornecedores ou questionários de fornecedores
- Aprovar checklists de conformidade com campos de caixa de seleção
- Preencher fichas médicas antes de uma consulta

## Dicas

- Formulários XFA são um formato legado suportado apenas por alguns visualizadores de PDF. Se você abrir um PDF XFA no Chrome ou na maioria das outras ferramentas e vir páginas em branco, é porque esses visualizadores não têm suporte a XFA. O Preenchedor de Formulários do BentoPDF e o Firefox tratam XFA corretamente.
- Para PDFs sem campos de formulário, use a ferramenta [Criar Formulário PDF](./form-creator) para adicionar campos primeiro e depois preenchê-los aqui.
- O visualizador ajusta automaticamente seu tamanho às dimensões das páginas do PDF.

## Ferramentas relacionadas

- [Criar Formulário PDF](./form-creator)
- [Assinar PDF](./sign-pdf)
- [Editor de PDF](./edit-pdf)
