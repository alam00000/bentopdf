---
title: PDF sang JPG
description: Chuyển đổi các trang PDF thành ảnh JPG với chất lượng có thể điều chỉnh. PDF một trang tải xuống trực tiếp; PDF nhiều trang xuất thành ZIP.
---

# PDF sang JPG

Chuyển mỗi trang của PDF thành một ảnh JPG. Tài liệu một trang được tải xuống dưới dạng tệp `.jpg` riêng. PDF nhiều trang tạo ra kho ZIP chứa một JPG cho mỗi trang.

## Cách hoạt động

1. Tải lên PDF bằng cách nhấp vào vùng thả hoặc kéo tệp vào đó. Công cụ hiển thị tên tệp, dung lượng và số trang.
2. Điều chỉnh thanh trượt **Chất lượng** để kiểm soát mức nén JPG.
3. Nhấp **Chuyển đổi** để bắt đầu xử lý.
4. Kết quả được tải xuống tự động: một JPG cho PDF một trang, hoặc tệp ZIP cho tài liệu nhiều trang.

## Tùy chọn

- **Chất lượng**: thanh trượt từ 0% đến 100% (mặc định 90%). Giá trị cao hơn cho ảnh sắc nét hơn với dung lượng lớn hơn. Giá trị thấp hơn nén mạnh hơn.

Các trang được kết xuất nội bộ ở tỷ lệ 2x, nên độ phân giải đầu ra gấp đôi kích thước trang PDF. Một trang cỡ letter tiêu chuẩn tạo ra ảnh khoảng 1.224 x 1.584 điểm ảnh.

## Định dạng đầu ra

- **Một trang**: `filename.jpg`
- **Nhiều trang**: `filename_jpgs.zip` chứa `page_1.jpg`, `page_2.jpg`, v.v.

## Trường hợp sử dụng

- Tạo hình thu nhỏ xem trước cho hệ thống quản lý tài liệu.
- Chia sẻ một trang của báo cáo trong chat hoặc email không hỗ trợ PDF.
- Tạo tài nguyên hình ảnh từ sơ đồ hoặc minh họa trong PDF.
- Lưu trữ tài liệu quét dưới dạng từng ảnh riêng.

## Mẹo

- Để có đầu ra không mất dữ liệu, hãy dùng [PDF sang PNG](./pdf-to-png).
- Mức chất lượng 80-90% cân bằng tốt giữa dung lượng tệp và độ trung thực hình ảnh.
- Nếu bạn cần định dạng riêng cho từng trang, hãy cân nhắc [Trình xây dựng quy trình PDF](./pdf-workflow) có nút đầu ra PDF sang hình ảnh.

## Công cụ liên quan

- [PDF sang PNG](./pdf-to-png)
- [PDF sang WebP](./pdf-to-webp)
- [PDF sang BMP](./pdf-to-bmp)
- [PDF sang TIFF](./pdf-to-tiff)
