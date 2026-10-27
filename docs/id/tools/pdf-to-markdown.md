---
title: PDF ke Markdown
description: Konversi dokumen PDF ke format Markdown dengan ekstraksi gambar opsional. Mendukung konversi massal beberapa file.
---

# PDF ke Markdown

Mengonversi file PDF ke format Markdown (`.md`), mempertahankan judul, paragraf, daftar, dan format dasar. Secara opsional mengekstrak dan menyertakan gambar tersemat. Mendukung konversi tunggal dan massal. Ditenagai PyMuPDF.

## Cara Kerja

1. Unggah satu atau beberapa PDF dengan mengklik zona lepas atau menyeret file ke dalamnya.
2. Secara opsional aktifkan **Sertakan Gambar** untuk menyematkan gambar yang diekstrak ke hasil Markdown.
3. Klik **Konversi** untuk mulai memproses.
4. Satu file diunduh sebagai `filename.md`. Beberapa file menghasilkan `markdown-files.zip`.

## Opsi

- **Sertakan Gambar**: jika dicentang, gambar tersemat dari PDF diekstrak dan dirujuk di hasil Markdown. Jika tidak dicentang, hanya konten teks yang dikonversi.

## Format Hasil

- **Satu file**: `filename.md`
- **Beberapa file**: `markdown-files.zip` berisi satu `.md` per PDF input.

## Kasus Penggunaan

- Mengonversi dokumentasi PDF menjadi Markdown untuk generator situs statis seperti VitePress, Hugo, atau Jekyll.
- Mengubah makalah penelitian PDF menjadi Markdown yang dapat diedit untuk aplikasi catatan seperti Obsidian.
- Memigrasikan basis pengetahuan PDF lama ke format teks yang ramah Git.
- Mengekstrak konten terstruktur dari ebook PDF untuk diformat ulang.

## Tips

- Opsi Sertakan Gambar berguna saat PDF berisi diagram atau gambar yang penting bagi isinya. Nonaktifkan untuk dokumen yang didominasi teks agar hasilnya bersih.
- Tata letak kompleks dengan sidebar, catatan kaki, atau teks multi-kolom dapat menghasilkan Markdown yang kurang sempurna. Periksa dan sesuaikan hasilnya bila perlu.
- Untuk teks mentah tanpa format apa pun, gunakan [PDF ke Teks](./pdf-to-text).

## Alat Terkait

- [PDF ke Teks](./pdf-to-text)
- [PDF ke Word](./pdf-to-word)
- [Siapkan PDF untuk AI](./prepare-pdf-for-ai)
