---
title: Email ke PDF
description: Konversi file email EML dan MSG ke PDF di browser Anda. Mempertahankan header, isi, dan daftar lampiran.
---

# Email ke PDF

Ubah file email tersimpan menjadi PDF yang rapi dan siap cetak. Alat ini mengurai file EML dan MSG, mengekstrak pesan secara utuh (header, isi, dan metadata lampiran), lalu merender semuanya ke PDF terstruktur. Berguna untuk discovery hukum, pencatatan arsip, atau sekadar mencetak email penting.

## Format yang Didukung

| Format | Ekstensi | Catatan                                                              |
| :----- | :------- | :------------------------------------------------------------------- |
| EML    | `.eml`   | Format email MIME standar (diekspor dari sebagian besar klien email) |
| MSG    | `.msg`   | Format proprietari Microsoft Outlook                                 |

## Cara Kerja

1. Klik area unggah atau seret dan lepas file EML atau MSG Anda. Anda dapat mencampur kedua format dalam satu batch.
2. Tinjau daftar file. Hapus entri yang tidak diinginkan dengan ikon tempat sampah, atau klik **Tambah Lebih Banyak File** untuk menambah email.
3. Atur opsi konversi (lihat di bawah).
4. Klik **Konversi ke PDF**. Alat mengurai setiap email, merender konten sebagai HTML bergaya, dan mengonversinya ke PDF melalui mesin PyMuPDF.
5. Satu email diunduh langsung sebagai PDF. Beberapa email dikemas menjadi `emails-converted.zip`.

## Opsi

| Opsi                                       | Default | Deskripsi                                                                            |
| :----------------------------------------- | :------ | :----------------------------------------------------------------------------------- |
| **Ukuran Halaman**                         | A4      | Pilih antara dimensi halaman A4, Letter, atau Legal.                                 |
| **Sertakan penerima CC dan BCC di header** | On      | Jika aktif, daftar penerima CC dan BCC muncul di bagian header email pada PDF.       |
| **Sertakan daftar lampiran email**         | On      | Jika aktif, daftar lampiran file email (beserta nama file dan ukuran) muncul di PDF. |

## Kasus Penggunaan

- Mengarsipkan korespondensi bisnis penting sebagai PDF untuk kepatuhan atau audit
- Mencetak rangkaian email untuk proses hukum atau permintaan discovery
- Membuat catatan permanen konfirmasi pesanan, tanda terima, atau kontrak yang diterima lewat email
- Mencadangkan file MSG Outlook dalam format yang tidak memerlukan Outlook untuk membacanya
- Mendokumentasikan interaksi dukungan pelanggan dari file EML hasil ekspor

## Tips

- EML (dipakai Thunderbird, Apple Mail, dan sebagian besar klien email) maupun file MSG Outlook didukung. Ekspor email dari klien email Anda dan jatuhkan langsung ke alat ini.
- Email berformat HTML mempertahankan gayanya di PDF. Email teks biasa dirender dengan format yang bersih dan mudah dibaca.
- Daftar lampiran menampilkan nama file dan ukuran tetapi tidak menyematkan file lampiran sebenarnya ke dalam PDF.

## Alat Terkait

- [XML ke PDF](./xml-to-pdf)
- [XPS ke PDF](./xps-to-pdf)
