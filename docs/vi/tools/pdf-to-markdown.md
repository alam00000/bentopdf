---
title: PDF sang Markdown
description: Chuyển đổi tài liệu PDF sang định dạng Markdown với tùy chọn trích xuất hình ảnh. Hỗ trợ chuyển đổi hàng loạt nhiều tệp.
---

# PDF sang Markdown

Chuyển tệp PDF sang định dạng Markdown (`.md`), giữ nguyên tiêu đề, đoạn văn, danh sách và định dạng cơ bản. Có thể trích xuất và đưa vào các hình ảnh nhúng. Hỗ trợ chuyển đổi đơn lẻ và hàng loạt. Chạy bằng PyMuPDF.

## Cách hoạt động

1. Tải lên một hoặc nhiều PDF bằng cách nhấp vào vùng thả hoặc kéo tệp vào đó.
2. Tùy chọn bật **Bao gồm hình ảnh** để nhúng các hình ảnh đã trích xuất vào đầu ra Markdown.
3. Nhấp **Chuyển đổi** để bắt đầu xử lý.
4. Một tệp được tải xuống dưới dạng `filename.md`. Nhiều tệp tạo ra `markdown-files.zip`.

## Tùy chọn

- **Bao gồm hình ảnh**: khi được chọn, các hình ảnh nhúng trong PDF được trích xuất và tham chiếu trong đầu ra Markdown. Khi bỏ chọn, chỉ nội dung văn bản được chuyển đổi.

## Định dạng đầu ra

- **Một tệp**: `filename.md`
- **Nhiều tệp**: `markdown-files.zip` chứa một tệp `.md` cho mỗi PDF đầu vào.

## Trường hợp sử dụng

- Chuyển tài liệu PDF thành Markdown cho trình tạo trang tĩnh như VitePress, Hugo hoặc Jekyll.
- Biến các bài nghiên cứu PDF thành Markdown có thể chỉnh sửa cho ứng dụng ghi chú như Obsidian.
- Di chuyển kho kiến thức PDF cũ sang định dạng văn bản thân thiện với Git.
- Trích xuất nội dung có cấu trúc từ sách điện tử PDF để định dạng lại.

## Mẹo

- Tùy chọn Bao gồm hình ảnh hữu ích khi PDF chứa sơ đồ hoặc hình vẽ thiết yếu với nội dung. Hãy tắt nó với tài liệu nhiều chữ để giữ đầu ra gọn gàng.
- Bố cục phức tạp có thanh bên, chú thích cuối trang hoặc văn bản nhiều cột có thể cho Markdown chưa hoàn hảo. Hãy xem lại và chỉnh sửa đầu ra khi cần.
- Để lấy văn bản thô không có định dạng, hãy dùng [PDF sang Văn bản](./pdf-to-text).

## Công cụ liên quan

- [PDF sang Văn bản](./pdf-to-text)
- [PDF sang Word](./pdf-to-word)
- [Chuẩn bị PDF cho AI](./prepare-pdf-for-ai)
