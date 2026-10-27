---
title: Siapkan PDF untuk AI
description: Ekstrak konten PDF menjadi JSON terstruktur yang dioptimalkan untuk LLM dan pipeline AI seperti LlamaIndex. Mendukung pemrosesan batch.
---

# Siapkan PDF untuk AI

Mengekstrak konten dari file PDF dan menyusunnya sebagai JSON yang dioptimalkan untuk dimasukkan ke large language model (LLM) dan kerangka kerja AI seperti LlamaIndex. Konten setiap halaman diekstrak dan diorganisasi dalam format terstruktur yang siap untuk pipeline RAG, chatbot, atau sistem pencarian semantik.

## Cara Kerja

1. Unggah satu atau beberapa PDF dengan mengklik area drop atau menyeret file ke dalamnya.
2. Klik **Ekstrak** untuk memulai pemrosesan.
3. Satu file diunduh sebagai `filename_llm.json`. Beberapa file menghasilkan arsip `pdf-for-ai.zip`.

Alat ini menggunakan integrasi LlamaIndex dari PyMuPDF untuk mengekstrak konten tingkat halaman beserta metadata, menghasilkan keluaran yang dapat langsung dimuat ke kerangka kerja AI.

## Opsi

Alat ini tidak memiliki opsi yang dapat diatur. Semua halaman diekstrak dengan teks lengkap dan metadata.

## Format Keluaran

- **Satu file**: `filename_llm.json`
- **Beberapa file**: `pdf-for-ai.zip` berisi satu `_llm.json` per PDF input.

Keluaran JSON mengikuti skema dokumen LlamaIndex dengan konten teks per halaman dan bidang metadata.

## Kasus Penggunaan

- Menyiapkan dokumen PDF untuk pipeline retrieval-augmented generation (RAG).
- Membangun basis pengetahuan yang dapat dicari dari arsip PDF untuk chatbot AI.
- Memasukkan laporan PDF ke alur kerja analisis berbasis LLM.
- Memproses awal makalah penelitian untuk sistem pencarian semantik dan tanya jawab.
- Membuat data pelatihan terstruktur dari kumpulan dokumen PDF.

## Tips

- Untuk ekstraksi teks biasa tanpa format khusus AI, gunakan [PDF ke Teks](./pdf-to-text).
- Untuk keluaran Markdown yang mempertahankan judul dan struktur, gunakan [PDF ke Markdown](./pdf-to-markdown).
- PDF hasil pindai akan menghasilkan keluaran kosong atau minimal. Jalankan OCR terlebih dahulu untuk menambahkan lapisan teks sebelum ekstraksi.

## Alat Terkait

- [PDF ke Teks](./pdf-to-text)
- [PDF ke Markdown](./pdf-to-markdown)
- [PDF ke JSON](./pdf-to-json)
