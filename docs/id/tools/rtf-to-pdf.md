---
title: RTF ke PDF
description: Konversi file Rich Text Format (RTF) ke PDF di browser Anda menggunakan mesin berbasis LibreOffice.
---

# RTF ke PDF

Konversi dokumen Rich Text Format ke PDF. RTF adalah format dokumen lintas platform yang didukung hampir semua pengolah kata. Alat ini menggunakan mesin LibreOffice berbasis browser untuk merender file RTF dengan format yang tetap utuh: tebal, miring, tabel, dan gambar tertanam semuanya terbawa ke PDF.

## Format yang Didukung

| Format | Ekstensi | Tipe MIME                     |
| :----- | :------- | :---------------------------- |
| RTF    | `.rtf`   | `text/rtf`, `application/rtf` |

## Cara Kerja

1. Klik area unggah atau seret dan lepas satu atau beberapa file RTF.
2. Periksa daftar file. Tambahkan atau hapus file sesuai kebutuhan.
3. Klik **Konversi ke PDF**. Mesin LibreOffice diinisialisasi saat pertama kali digunakan, lalu memproses setiap file.
4. Satu file diunduh langsung sebagai PDF. Beberapa file dikirim sebagai `rtf-converted.zip`.

## Opsi

Alat ini tidak memiliki pengaturan tambahan. Konversi mempertahankan format RTF asli.

## Hasil

| Jumlah Input | Hasil                                                    |
| :----------- | :------------------------------------------------------- |
| 1 file       | Unduhan satu PDF (misalnya, `letter.pdf`)                |
| 2+ file      | Arsip ZIP (`rtf-converted.zip`) berisi satu PDF per file |

## Kasus Penggunaan

- Mengonversi dokumen RTF lama dari pengolah kata lawas ke PDF modern
- Mengubah templat email RTF menjadi pratinjau PDF
- Memproses keluaran RTF dari sistem perangkat lunak hukum atau medis
- Mengonversi sekaligus file RTF dari sistem manajemen dokumen ke PDF untuk arsip

## Tips

- Mesin LibreOffice dimuat sekali dan disimpan di cache. Konversi pertama dalam sesi memakan beberapa detik lebih lama, konversi berikutnya lebih cepat.
- File RTF dengan objek OLE tertanam mungkin tidak merender semua objek dengan sempurna. Teks biasa, gambar, dan format standar dikonversi dengan andal.
- Jika file RTF Anda dibuat oleh Microsoft Word, Anda juga dapat mengonversinya langsung dengan alat [Word ke PDF](./word-to-pdf), yang menerima RTF selain DOC dan DOCX.

## Alat Terkait

- [Word ke PDF](./word-to-pdf)
- [ODT ke PDF](./odt-to-pdf)
- [Teks ke PDF](./txt-to-pdf)
