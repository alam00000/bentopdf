---
title: Prepare PDF for AI
description: Extract PDF content into structured JSON optimized for LLMs and AI pipelines like LlamaIndex. Supports batch processing.
---

# Prepare PDF for AI

Extracts content from PDF files and structures it as JSON optimized for ingestion by large language models (LLMs) and AI frameworks like LlamaIndex. Each page's content is extracted and organized into a structured format ready for RAG pipelines, chatbots, or semantic search systems.

## How It Works

1. Upload one or more PDFs by clicking the drop zone or dragging files onto it.
2. Click **Extract** to start processing.
3. A single file downloads as `filename_llm.json`. Multiple files produce a `pdf-for-ai.zip` archive.

The tool uses PyMuPDF's LlamaIndex integration to extract page-level content with metadata, producing output that can be directly loaded into AI frameworks.

## Options

This tool has no configurable options. All pages are extracted with full text and metadata.

## Output Format

- **Single file**: `filename_llm.json`
- **Multiple files**: `pdf-for-ai.zip` containing one `_llm.json` per input PDF.

The JSON output follows the LlamaIndex document schema with per-page text content and metadata fields.

## Use Cases

- Preparing PDF documents for retrieval-augmented generation (RAG) pipelines.
- Building a searchable knowledge base from PDF archives for an AI chatbot.
- Feeding PDF reports into LLM-based analysis workflows.
- Pre-processing research papers for semantic search and question-answering systems.
- Creating structured training data from PDF document collections.

## Tips

- For plain text extraction without AI-specific formatting, use [PDF to Text](./pdf-to-text).
- For Markdown output that preserves headings and structure, use [PDF to Markdown](./pdf-to-markdown).
- Scanned PDFs will produce empty or minimal output. Run them through OCR first to add a text layer before extraction.

## Related Tools

- [PDF to Text](./pdf-to-text)
- [PDF to Markdown](./pdf-to-markdown)
- [PDF to JSON](./pdf-to-json)
