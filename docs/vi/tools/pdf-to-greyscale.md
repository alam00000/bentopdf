---
title: PDF sang thang xám
description: Chuyển PDF màu thành phiên bản thang xám (đen trắng). Tạo PDF mới với toàn bộ màu sắc bị loại bỏ trên mọi trang.
---

# PDF sang thang xám

Chuyển PDF màu thành phiên bản thang xám. Mỗi trang được kết xuất, giảm bão hòa màu và nhúng lại dưới dạng ảnh JPEG trong một PDF mới. Đầu ra giữ nguyên kích thước trang gốc.

## Cách hoạt động

1. Tải lên PDF bằng cách nhấp vào vùng thả hoặc kéo tệp vào đó.
2. Nhấp **Chuyển đổi** để xử lý tệp.
3. Tệp `greyscale.pdf` mới được tải xuống với tất cả trang đã chuyển sang đen trắng.

Bên dưới, mỗi trang được kết xuất ở tỷ lệ 2x, dữ liệu điểm ảnh được đưa qua bộ lọc thang xám, sau đó mã hóa lại thành JPEG chất lượng 90% và đặt vào một tài liệu PDF mới.

## Tùy chọn

Công cụ này không có tùy chọn cấu hình. Việc chuyển sang thang xám dùng công thức độ sáng tiêu chuẩn và chất lượng JPEG cố định ở 90%.

## Định dạng đầu ra

- Một tệp `greyscale.pdf` duy nhất chứa tất cả trang dưới dạng ảnh JPEG thang xám.

## Trường hợp sử dụng

- Chuẩn bị tài liệu để in đen trắng nhằm tiết kiệm chi phí mực màu.
- Đáp ứng yêu cầu nộp hồ sơ pháp lý hoặc chính phủ bắt buộc dùng thang xám.
- Giảm dung lượng tệp của PDF nhiều màu (ảnh JPEG thang xám nhỏ hơn ảnh màu).
- Tạo phong cách hình ảnh nhất quán cho tài liệu có cả trang màu và đen trắng.

## Mẹo

- Vì mỗi trang được rasterize và nhúng lại dưới dạng JPEG, đầu ra dựa trên ảnh. Văn bản trong PDF gốc sẽ không còn chọn hay tìm kiếm được. Nếu cần văn bản có thể tìm kiếm sau đó, hãy chạy đầu ra qua công cụ OCR.
- Để kiểm soát chỉnh màu tốt hơn (độ sáng, độ tương phản, độ bão hòa), hãy xem công cụ Điều chỉnh màu sắc hoặc nút Greyscale trong [Trình xây dựng quy trình PDF](./pdf-workflow).

## Công cụ liên quan

- [PDF sang JPG](./pdf-to-jpg)
- [PDF sang PNG](./pdf-to-png)
- [Trình xây dựng quy trình PDF](./pdf-workflow)
