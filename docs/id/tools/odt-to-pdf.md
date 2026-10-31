---
title: ODT ke PDF
description: Konversi file OpenDocument Text (ODT) ke format PDF di browser Anda menggunakan engine berbasis LibreOffice.
---

# ODT ke PDF

Konversi file OpenDocument Text menjadi PDF. ODT adalah format asli LibreOffice Writer, Apache OpenOffice, dan pengolah kata sumber terbuka lainnya. Alat ini menggunakan engine LibreOffice berbasis browser untuk menghasilkan konversi akurat yang mempertahankan format, tabel, gambar, dan gaya.

## Format yang Didukung

| Format            | Ekstensi |
| :---------------- | :------- |
| OpenDocument Text | `.odt`   |

## Cara Kerja

1. Klik area unggah atau seret dan lepas satu atau beberapa file ODT.
2. Periksa daftar file. Tambahkan file lain atau hapus yang tidak diinginkan.
3. Klik **Konversi ke PDF**. Engine LibreOffice diinisialisasi (indikator kemajuan menampilkan status pemuatan), lalu setiap file dikonversi.
4. Satu file diunduh langsung sebagai PDF. Beberapa file dikemas menjadi `odt-converted.zip`.

## Opsi

Alat ini tidak memiliki konfigurasi tambahan. Konversi mempertahankan format dokumen asli sedekat mungkin.

## Hasil

| Jumlah Input | Hasil                                                    |
| :----------- | :------------------------------------------------------- |
| 1 file       | Satu PDF diunduh (mis., `document.pdf`)                  |
| 2+ file      | Arsip ZIP (`odt-converted.zip`) berisi satu PDF per file |

## Kasus Penggunaan

- Mengonversi dokumen LibreOffice Writer ke PDF untuk dibagikan kepada pengguna Microsoft Office
- Membuat PDF siap cetak dari makalah akademik yang ditulis dalam format OpenDocument
- Mengonversi massal satu folder templat ODT menjadi PDF untuk distribusi
- Membuat PDF dari file ODT yang dihasilkan oleh sistem pembuatan dokumen otomatis

## Tips

- Engine LibreOffice dimuat saat pertama digunakan dan disimpan dalam cache untuk konversi berikutnya. Pemuatan awal memakan waktu beberapa detik; setelah itu, konversi berjalan cepat.
- Dokumen kompleks dengan objek OLE tersemat atau font tidak umum dapat dirender sedikit berbeda dari LibreOffice desktop. Uji dengan sampel sebelum konversi massal.
- Untuk dokumen Word (`.doc`, `.docx`), gunakan alat [Word ke PDF](./word-to-pdf), yang juga memakai engine LibreOffice tetapi menerima format Microsoft secara langsung.

## Alat Terkait

- [Word ke PDF](./word-to-pdf)
- [RTF ke PDF](./rtf-to-pdf)
- [Teks ke PDF](./txt-to-pdf)
