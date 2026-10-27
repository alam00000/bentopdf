---
title: PDF sang Excel
description: Trích xuất bảng từ tài liệu PDF vào bảng tính Excel. Mỗi bảng có một trang tính riêng kèm tham chiếu trang.
---

# PDF sang Excel

Trích xuất bảng từ PDF và lưu thành bảng tính Excel (`.xlsx`). Mỗi bảng được phát hiện nằm trên một trang tính riêng, được gắn nhãn bằng số bảng và trang nguồn. Chạy bằng PyMuPDF để phát hiện bảng và thư viện SheetJS để tạo tệp Excel.

## Cách hoạt động

1. Tải lên PDF bằng cách nhấp vào vùng thả hoặc kéo tệp vào đó.
2. Nhấp **Chuyển đổi** để bắt đầu trích xuất bảng.
3. Công cụ quét mọi trang để tìm bảng, sau đó tạo sổ làm việc Excel.
4. Tệp `.xlsx` được tải xuống với mỗi bảng một trang tính.

## Tùy chọn

Công cụ này không có tùy chọn cấu hình. Mọi bảng được phát hiện đều được trích xuất tự động.

## Định dạng đầu ra

- Một tệp `filename.xlsx` duy nhất.
- **Một bảng**: một trang tính tên "Table".
- **Nhiều bảng**: các trang tính tên "Table 1 (Page 3)", "Table 2 (Page 5)", v.v. Tên trang tính bị cắt còn 31 ký tự (giới hạn của Excel).

## Trường hợp sử dụng

- Chuyển báo cáo tài chính PDF thành bảng tính có thể chỉnh sửa để phân tích thêm.
- Trích xuất bảng tồn kho hoặc đơn hàng từ PDF của nhà cung cấp.
- Đưa dữ liệu có cấu trúc từ biểu mẫu hoặc catalogue PDF vào Excel để sắp xếp và lọc.
- Lưu trữ dữ liệu bảng PDF ở định dạng mà đồng nghiệp không chuyên kỹ thuật có thể sử dụng.

## Mẹo

- Nếu công cụ báo "Không tìm thấy bảng", PDF có thể dùng bố cục văn bản tự do thay vì bảng có cấu trúc. Hãy thử [PDF sang Văn bản](./pdf-to-text) để lấy nội dung thô.
- Để có định dạng phẳng đơn giản hơn, hãy dùng [PDF sang CSV](./pdf-to-csv). Để tải từng bảng ở nhiều định dạng, hãy dùng [Trích xuất bảng PDF](./extract-tables).
- Xem tên trang tính để biết mỗi bảng đến từ trang nào.

## Công cụ liên quan

- [PDF sang CSV](./pdf-to-csv)
- [Trích xuất bảng PDF](./extract-tables)
- [PDF sang Văn bản](./pdf-to-text)
