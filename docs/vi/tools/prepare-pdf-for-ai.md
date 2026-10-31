---
title: Chuẩn bị PDF cho AI
description: Trích xuất nội dung PDF thành JSON có cấu trúc, tối ưu cho LLM và các pipeline AI như LlamaIndex. Hỗ trợ xử lý hàng loạt.
---

# Chuẩn bị PDF cho AI

Trích xuất nội dung từ các tệp PDF và cấu trúc hóa thành JSON, tối ưu để đưa vào các mô hình ngôn ngữ lớn (LLM) và các framework AI như LlamaIndex. Nội dung của từng trang được trích xuất và sắp xếp theo định dạng có cấu trúc, sẵn sàng cho pipeline RAG, chatbot hoặc hệ thống tìm kiếm ngữ nghĩa.

## Cách hoạt động

1. Tải lên một hoặc nhiều PDF bằng cách nhấp vào vùng thả hoặc kéo tệp vào đó.
2. Nhấp **Trích xuất** để bắt đầu xử lý.
3. Một tệp được tải xuống dưới dạng `filename_llm.json`. Nhiều tệp tạo ra tệp nén `pdf-for-ai.zip`.

Công cụ dùng tích hợp LlamaIndex của PyMuPDF để trích xuất nội dung theo từng trang kèm metadata, tạo ra đầu ra có thể nạp trực tiếp vào các framework AI.

## Tùy chọn

Công cụ này không có tùy chọn cấu hình. Tất cả các trang được trích xuất với đầy đủ văn bản và metadata.

## Định dạng đầu ra

- **Một tệp**: `filename_llm.json`
- **Nhiều tệp**: `pdf-for-ai.zip` chứa một tệp `_llm.json` cho mỗi PDF đầu vào.

Đầu ra JSON tuân theo schema tài liệu của LlamaIndex với nội dung văn bản của từng trang và các trường metadata.

## Trường hợp sử dụng

- Chuẩn bị tài liệu PDF cho các pipeline retrieval-augmented generation (RAG).
- Xây dựng cơ sở tri thức có thể tìm kiếm từ kho PDF cho chatbot AI.
- Đưa các báo cáo PDF vào quy trình phân tích dựa trên LLM.
- Tiền xử lý bài báo nghiên cứu cho các hệ thống tìm kiếm ngữ nghĩa và hỏi đáp.
- Tạo dữ liệu huấn luyện có cấu trúc từ các bộ sưu tập tài liệu PDF.

## Mẹo

- Để trích xuất văn bản thuần không có định dạng dành riêng cho AI, hãy dùng [PDF sang Văn bản](./pdf-to-text).
- Để có đầu ra Markdown giữ nguyên tiêu đề và cấu trúc, hãy dùng [PDF sang Markdown](./pdf-to-markdown).
- PDF được quét sẽ cho đầu ra trống hoặc rất ít. Hãy chạy OCR trước để thêm lớp văn bản rồi mới trích xuất.

## Công cụ liên quan

- [PDF sang Văn bản](./pdf-to-text)
- [PDF sang Markdown](./pdf-to-markdown)
- [PDF sang JSON](./pdf-to-json)
