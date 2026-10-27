---
title: PDF sang văn bản
description: Trích xuất nội dung văn bản thuần từ tệp PDF. Hỗ trợ trích xuất hàng loạt nhiều PDF với đầu ra là tệp TXT.
---

# PDF sang văn bản

Trích xuất toàn bộ nội dung văn bản từ tệp PDF và lưu thành tệp `.txt` thuần. Hỗ trợ xử lý hàng loạt: tải lên nhiều PDF và trích xuất văn bản của từng tệp trong một thao tác. Chạy bằng PyMuPDF.

## Cách hoạt động

1. Tải lên một hoặc nhiều PDF bằng cách nhấp vào vùng thả hoặc kéo tệp vào đó. Quản lý danh sách tệp bằng các nút Thêm tệp và Xóa hết.
2. Nhấp **Trích xuất** để bắt đầu xử lý.
3. Một tệp được tải xuống dưới dạng `filename.txt`. Nhiều tệp tạo ra kho `pdf-to-text.zip`.

## Tùy chọn

Công cụ này không có tùy chọn cấu hình. Toàn bộ nội dung văn bản được trích xuất từ mọi trang theo thứ tự đọc.

## Định dạng đầu ra

- **Một tệp**: `filename.txt`
- **Nhiều tệp**: `pdf-to-text.zip` chứa một tệp `.txt` cho mỗi PDF đầu vào.

## Trường hợp sử dụng

- Trích xuất nội dung chính từ báo cáo PDF để lập chỉ mục tìm kiếm toàn văn.
- Chuyển sách điện tử hoặc bài viết PDF sang văn bản thuần để đọc trên thiết bị e-ink.
- Lấy văn bản từ hợp đồng hoặc tài liệu pháp lý để phân tích từ khóa.
- Loại bỏ định dạng khỏi PDF để có văn bản sạch cho các script xử lý dữ liệu.
- Chuẩn bị kho ngữ liệu văn bản từ kho lưu trữ PDF cho xử lý ngôn ngữ tự nhiên.

## Mẹo

- PDF quét (chỉ có ảnh) sẽ tạo ra tệp văn bản trống vì không có lớp văn bản để trích xuất. Hãy chạy tài liệu quét qua OCR trước.
- Đầu ra giữ thứ tự đọc theo cách PyMuPDF diễn giải, thường là từ trái sang phải, từ trên xuống dưới. Bố cục nhiều cột có thể tạo ra văn bản bị xen kẽ.
- Để có đầu ra có cấu trúc với tiêu đề và định dạng, hãy thử [PDF sang Markdown](./pdf-to-markdown). Để có JSON có cấu trúc sẵn sàng cho AI, hãy dùng [Chuẩn bị PDF cho AI](./prepare-pdf-for-ai).

## Công cụ liên quan

- [PDF sang Markdown](./pdf-to-markdown)
- [Chuẩn bị PDF cho AI](./prepare-pdf-for-ai)
- [PDF sang Word](./pdf-to-word)
