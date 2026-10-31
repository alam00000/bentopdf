---
title: Sửa chữa PDF
description: Khôi phục dữ liệu từ tệp PDF bị hỏng hoặc hư hại bằng engine sửa chữa của QPDF. Hỗ trợ xử lý hàng loạt.
---

# Sửa chữa PDF

Khi PDF không chịu mở, hiển thị nội dung lỗi hoặc gây lỗi trong trình xem của bạn, công cụ này sẽ cố gắng dựng lại cấu trúc nội bộ của nó. Công cụ dùng engine sửa chữa của QPDF, có thể khôi phục dữ liệu từ nhiều loại hỏng hóc: bảng tham chiếu chéo bị hỏng, luồng bị cắt cụt, tham chiếu đối tượng không hợp lệ, v.v.

## Cách hoạt động

1. Tải lên một hoặc nhiều tệp PDF bị hỏng.
2. Nhấp **Sửa chữa PDF**.
3. Một tệp đã sửa được tải xuống trực tiếp. Nhiều tệp tạo ra tệp nén ZIP.

Công cụ chuyển từng tệp qua QPDF với cờ `--decrypt`, buộc QPDF đọc và ghi lại toàn bộ cấu trúc PDF, sửa các vấn đề có thể khôi phục trong quá trình đó.

## Tính năng

- Sửa chữa hàng loạt nhiều PDF trong một thao tác
- Tự động phát hiện tệp có thể khôi phục và không thể khôi phục
- Báo cáo thành công/thất bại cho từng tệp khi xử lý nhiều tệp
- Dùng QPDF (WebAssembly), một thư viện biến đổi PDF đã được kiểm chứng

## Những gì có thể sửa

- Bảng tham chiếu chéo bị hỏng hoặc thiếu
- Phần cuối tệp bị cắt cụt do tải xuống không hoàn chỉnh
- Đánh số đối tượng và độ dài luồng không hợp lệ
- Các bất nhất nhỏ về cấu trúc do trình tạo PDF lỗi
- Lỗi mã hóa do các lần giải mã thất bại

## Những gì không thể sửa

- Tệp bị cắt cụt nghiêm trọng, thiếu phần lớn dữ liệu nội dung
- PDF được mã hóa bằng mật khẩu mà bạn không có
- Tệp thực chất không phải PDF (sai phần mở rộng)
- Hỏng hình ảnh bên trong PDF (cấu trúc được sửa nhưng dữ liệu điểm ảnh không được tạo lại)

## Trường hợp sử dụng

- Khôi phục PDF từ lần tải email bị lỗi
- Mở các tệp tạo bởi trình tạo PDF cũ hoặc không chuẩn
- Sửa PDF mở được ở trình xem này nhưng không mở được ở trình xem khác
- Chuẩn bị tài liệu lưu trữ bị hư hại cho việc bảo quản lâu dài

## Mẹo

- Nếu sửa chữa thất bại, hãy thử mở tệp trong trình duyệt trước: trình duyệt có logic khôi phục riêng và có thể hiển thị đủ nội dung để lưu lại.
- Với PDF được mã hóa mà sửa chữa thất bại, hãy thử Giải mã PDF trước, rồi sửa chữa đầu ra đã giải mã.

## Công cụ liên quan

- [Nén PDF](./compress-pdf): làm sạch thêm cấu trúc của PDF đã sửa
- [Tuyến tính hóa PDF](./linearize-pdf): tối ưu tệp đã sửa để phân phối qua web
- [Làm phẳng PDF](./flatten-pdf): làm phẳng các biểu mẫu có thể đã bị hỏng
