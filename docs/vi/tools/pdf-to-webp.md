---
title: PDF sang WebP
description: Chuyển đổi các trang PDF thành ảnh WebP với chất lượng có thể điều chỉnh. Dung lượng nhỏ hơn JPG ở chất lượng hình ảnh tương đương.
---

# PDF sang WebP

Chuyển mỗi trang của PDF thành một ảnh WebP. WebP thường tạo ra tệp nhỏ hơn JPG 25-35% ở cùng chất lượng cảm nhận, là lựa chọn tốt cho web.

## Cách hoạt động

1. Tải lên PDF bằng cách nhấp vào vùng thả hoặc kéo tệp vào đó.
2. Điều chỉnh thanh trượt **Chất lượng**.
3. Nhấp **Chuyển đổi** để xử lý tệp.
4. Một tệp `.webp` hoặc một kho ZIP được tải xuống tự động.

## Tùy chọn

- **Chất lượng**: thanh trượt từ 0% đến 100% (mặc định 85%). Điều khiển mức nén có mất dữ liệu. Giá trị cao hơn giữ nhiều chi tiết hơn.

Các trang được kết xuất nội bộ ở tỷ lệ 2x, tạo ra ảnh có kích thước khoảng gấp đôi kích thước gốc của PDF.

## Định dạng đầu ra

- **Một trang**: `filename.webp`
- **Nhiều trang**: `filename_webps.zip` chứa `page_1.webp`, `page_2.webp`, v.v.

## Trường hợp sử dụng

- Chuẩn bị bản xem trước trang cho các website cần tiết kiệm băng thông.
- Tạo phiên bản ảnh nhẹ của tờ rơi hoặc brochure cho mạng xã hội.
- Chuyển hàng loạt tài liệu nhiều trang thành bộ ảnh tối ưu cho web.

## Mẹo

- WebP được hỗ trợ trên mọi trình duyệt hiện đại. Để tương thích với hệ thống cũ, hãy dùng [PDF sang JPG](./pdf-to-jpg).
- Chất lượng 80-85% thường không thể phân biệt với bản gốc trên màn hình mà vẫn giữ dung lượng nhỏ.

## Công cụ liên quan

- [PDF sang JPG](./pdf-to-jpg)
- [PDF sang PNG](./pdf-to-png)
- [PDF sang BMP](./pdf-to-bmp)
