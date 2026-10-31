---
title: PDF sang JSON
description: Chuyển đổi tệp PDF sang định dạng JSON có cấu trúc bằng CPDF. Xuất cấu trúc nội bộ của PDF thành dữ liệu JSON mà máy có thể đọc.
---

# PDF sang JSON

Chuyển một hoặc nhiều tệp PDF sang định dạng JSON. Công cụ dùng CPDF (Coherent PDF) để tuần tự hóa cấu trúc nội bộ của từng PDF thành biểu diễn JSON mà máy có thể đọc. Đầu ra luôn được giao dưới dạng kho ZIP.

## Cách hoạt động

1. Chọn một hoặc nhiều tệp PDF bằng bộ chọn tệp.
2. Nhấp **Chuyển đổi** để bắt đầu xử lý. Việc chuyển đổi chạy trong web worker nền.
3. Kho ZIP được tải xuống chứa một tệp JSON cho mỗi PDF đầu vào.

Thanh trạng thái hiển thị tiến trình qua các giai đoạn chuyển đổi và tạo ZIP.

## Tùy chọn

Công cụ này không có tùy chọn cấu hình. Mỗi PDF được chuyển thành biểu diễn JSON đầy đủ.

## Định dạng đầu ra

- Tệp `pdfs-to-json.zip` chứa `filename.json` cho mỗi PDF đầu vào.

Đầu ra JSON biểu diễn cấu trúc đối tượng nội bộ của PDF, bao gồm cây trang, tham chiếu phông chữ, metadata và luồng nội dung.

## Trường hợp sử dụng

- Kiểm tra cấu trúc nội bộ của PDF để gỡ lỗi hoặc xác thực.
- Trích xuất metadata và thuộc tính trang có cấu trúc bằng lập trình.
- Đưa dữ liệu cấu trúc PDF vào các quy trình xử lý tùy chỉnh.
- Kiểm tra tuân thủ tài liệu PDF bằng cách phân tích cây đối tượng của chúng.

## Mẹo

- Công cụ này xuất cấu trúc đối tượng PDF thô, không phải nội dung văn bản đã trích xuất. Nếu cần văn bản trang ở định dạng JSON, hãy dùng [Chuẩn bị PDF cho AI](./prepare-pdf-for-ai).
- Để trích xuất văn bản thuần, [PDF sang Văn bản](./pdf-to-text) đơn giản hơn.
- PDF lớn có cấu trúc phức tạp tạo ra các tệp JSON rất lớn.

## Công cụ liên quan

- [PDF sang Văn bản](./pdf-to-text)
- [Chuẩn bị PDF cho AI](./prepare-pdf-for-ai)
- [Trích xuất bảng PDF](./extract-tables)
