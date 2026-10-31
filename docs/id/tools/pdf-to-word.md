---
title: PDF ke Word
description: Konversi file PDF ke dokumen Word (DOCX) yang dapat diedit. Mendukung konversi massal beberapa PDF sekaligus.
---

# PDF ke Word

Mengonversi file PDF menjadi dokumen Word (`.docx`) yang dapat diedit. Alat ini memakai PyMuPDF untuk merekonstruksi isi dokumen, mempertahankan teks, format dasar, dan tata letak. Mendukung konversi tunggal dan massal.

## Cara Kerja

1. Unggah satu atau beberapa PDF dengan mengklik zona lepas atau menyeret file ke dalamnya. Anda dapat menambah file lain atau menghapus file tertentu dari daftar.
2. Klik **Konversi** untuk mulai memproses.
3. Satu file diunduh sebagai `filename.docx`. Beberapa file dikemas menjadi `converted-documents.zip`.

## Opsi

Alat ini tidak memiliki opsi yang dapat diatur. Setiap PDF dikonversi ke DOCX menggunakan engine konversi bawaan PyMuPDF.

## Format Hasil

- **Satu file**: `filename.docx`
- **Beberapa file**: `converted-documents.zip` berisi satu `.docx` per PDF input.

## Kasus Penggunaan

- Mengedit teks pada PDF yang Anda terima dan perlu diubah.
- Mengonversi laporan PDF yang diarsipkan ke format yang bisa diedit rekan di Microsoft Word atau Google Docs.
- Mengambil konten dari kontrak atau proposal PDF ke Word untuk revisi.
- Memigrasikan dokumentasi PDF lama ke format yang dapat diedit.

## Tips

- Tata letak kompleks dengan teks multi-kolom, formulir tersemat, atau grafik berat mungkin tidak terkonversi dengan sempurna. Periksa hasilnya dan sesuaikan format di pengolah kata Anda.
- PDF hasil pindaian (hanya gambar) akan menghasilkan file DOCX kosong atau minimal. Jalankan melalui OCR terlebih dahulu untuk menambahkan lapisan teks.
- Mode massal efisien untuk mengonversi seluruh folder PDF, unggah semuanya sekaligus.

## Alat Terkait

- [PDF ke Teks](./pdf-to-text)
- [PDF ke Markdown](./pdf-to-markdown)
- [Pembangun Alur Kerja PDF](./pdf-workflow)
