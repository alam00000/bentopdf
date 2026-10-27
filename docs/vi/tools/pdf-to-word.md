---
title: PDF sang Word
description: Chuyển đổi tệp PDF thành tài liệu Word (DOCX) có thể chỉnh sửa. Hỗ trợ chuyển đổi hàng loạt nhiều PDF cùng lúc.
---

# PDF sang Word

Chuyển tệp PDF thành tài liệu Word (`.docx`) có thể chỉnh sửa. Công cụ dùng PyMuPDF để dựng lại nội dung tài liệu, giữ nguyên văn bản, định dạng cơ bản và bố cục. Hỗ trợ chuyển đổi đơn lẻ và hàng loạt.

## Cách hoạt động

1. Tải lên một hoặc nhiều PDF bằng cách nhấp vào vùng thả hoặc kéo tệp vào đó. Bạn có thể thêm tệp hoặc xóa từng tệp khỏi danh sách.
2. Nhấp **Chuyển đổi** để bắt đầu xử lý.
3. Một tệp được tải xuống dưới dạng `filename.docx`. Nhiều tệp được đóng gói thành `converted-documents.zip`.

## Tùy chọn

Công cụ này không có tùy chọn cấu hình. Mỗi PDF được chuyển sang DOCX bằng engine chuyển đổi tích hợp của PyMuPDF.

## Định dạng đầu ra

- **Một tệp**: `filename.docx`
- **Nhiều tệp**: `converted-documents.zip` chứa một tệp `.docx` cho mỗi PDF đầu vào.

## Trường hợp sử dụng

- Chỉnh sửa văn bản trong PDF bạn nhận được và cần sửa đổi.
- Chuyển báo cáo PDF lưu trữ sang định dạng mà đồng nghiệp có thể chỉnh sửa trong Microsoft Word hoặc Google Docs.
- Đưa nội dung từ hợp đồng hoặc đề xuất PDF vào Word để chỉnh sửa có theo dõi.
- Di chuyển tài liệu PDF cũ sang định dạng có thể chỉnh sửa.

## Mẹo

- Bố cục phức tạp với văn bản nhiều cột, biểu mẫu nhúng hoặc nhiều đồ họa có thể không chuyển đổi hoàn hảo. Hãy xem lại đầu ra và chỉnh định dạng trong trình soạn thảo văn bản của bạn.
- PDF quét (chỉ có ảnh) sẽ tạo ra tệp DOCX trống hoặc rất ít nội dung. Hãy chạy chúng qua OCR trước để thêm lớp văn bản.
- Chế độ hàng loạt hiệu quả để chuyển cả thư mục PDF: tải lên tất cả cùng lúc.

## Công cụ liên quan

- [PDF sang Văn bản](./pdf-to-text)
- [PDF sang Markdown](./pdf-to-markdown)
- [Trình xây dựng quy trình PDF](./pdf-workflow)
