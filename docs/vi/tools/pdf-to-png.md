---
title: PDF sang PNG
description: Chuyển đổi các trang PDF thành ảnh PNG không mất dữ liệu với tỷ lệ có thể điều chỉnh. Lý tưởng cho ảnh chụp chất lượng cao và nền trong suốt.
---

# PDF sang PNG

Chuyển mỗi trang của PDF thành một ảnh PNG. PNG dùng nén không mất dữ liệu, nên đầu ra giữ nguyên mọi chi tiết của trang gốc. PDF một trang được tải xuống dưới dạng tệp `.png`; PDF nhiều trang tạo ra ZIP.

## Cách hoạt động

1. Tải lên PDF bằng cách nhấp vào vùng thả hoặc kéo tệp vào đó.
2. Đặt thanh trượt **Tỷ lệ** để điều khiển độ phân giải đầu ra.
3. Nhấp **Chuyển đổi** để bắt đầu xử lý.
4. Một PNG hoặc một kho ZIP được tải xuống tự động.

## Tùy chọn

- **Tỷ lệ**: từ 1.0x đến 3.0x (mặc định 2.0x). Ở 2.0x, một trang cỡ letter tiêu chuẩn được kết xuất khoảng 1.224 x 1.584 điểm ảnh. Tỷ lệ cao hơn cho ảnh lớn và sắc nét hơn, đổi lại dung lượng tệp và thời gian xử lý tăng.

## Định dạng đầu ra

- **Một trang**: `filename.png`
- **Nhiều trang**: `filename_pngs.zip` chứa `page_1.png`, `page_2.png`, v.v.

## Trường hợp sử dụng

- Chụp ảnh các trang PDF với độ trung thực cao cho bài thuyết trình.
- Trích xuất biểu đồ hoặc sơ đồ cần cạnh sắc nét và không có lỗi nén.
- Chuẩn bị tài nguyên thiết kế web từ bản mockup PDF.
- Tạo ảnh trang không mất dữ liệu để tiền xử lý OCR.

## Mẹo

- Tệp PNG lớn hơn JPG đáng kể. Nếu dung lượng quan trọng hơn chất lượng hoàn hảo, hãy dùng [PDF sang JPG](./pdf-to-jpg) hoặc [PDF sang WebP](./pdf-to-webp).
- Ở tỷ lệ 1.0x, đầu ra khớp với độ phân giải gốc của PDF. Tăng lên 3.0x để xuất chất lượng in.

## Công cụ liên quan

- [PDF sang JPG](./pdf-to-jpg)
- [PDF sang WebP](./pdf-to-webp)
- [PDF sang SVG](./pdf-to-svg)
