---
title: PDF sang CSV
description: Trích xuất bảng từ tài liệu PDF và xuất thành một tệp CSV duy nhất. Xử lý PDF nhiều trang với khả năng tự động phát hiện bảng.
---

# PDF sang CSV

Trích xuất bảng từ PDF và xuất thành tệp CSV. Công cụ quét từng trang để tìm dữ liệu dạng bảng bằng engine phát hiện bảng của PyMuPDF, rồi ghi mọi hàng tìm được vào một đầu ra duy nhất phân tách bằng dấu phẩy.

## Cách hoạt động

1. Tải lên PDF bằng cách nhấp vào vùng thả hoặc kéo tệp vào đó.
2. Nhấp **Chuyển đổi** để bắt đầu trích xuất bảng.
3. Công cụ quét từng trang và tự động nhận diện bảng.
4. Tệp `.csv` được tải xuống với toàn bộ dữ liệu bảng đã trích xuất.

Các bảng từ những trang khác nhau được ngăn cách bằng hàng trống trong đầu ra. Các ô chứa dấu phẩy, dấu ngoặc kép hoặc xuống dòng được thoát đúng theo RFC 4180.

## Tùy chọn

Công cụ này không có tùy chọn cấu hình. Mọi bảng tìm thấy trong tài liệu đều được trích xuất và gộp vào một CSV duy nhất.

## Định dạng đầu ra

- Một tệp `filename.csv` duy nhất chứa tất cả bảng được phát hiện.

## Trường hợp sử dụng

- Lấy dữ liệu tài chính từ sao kê ngân hàng hoặc hóa đơn PDF vào bảng tính.
- Trích xuất bảng giá từ báo giá của nhà cung cấp để so sánh.
- Chuyển dữ liệu nghiên cứu dạng bảng từ bài báo PDF sang định dạng phù hợp với công cụ phân tích.
- Di chuyển dữ liệu từ báo cáo PDF cũ vào cơ sở dữ liệu.

## Mẹo

- Nếu không tìm thấy bảng nào, công cụ hiển thị thông báo "Không tìm thấy bảng". Điều này thường có nghĩa là PDF dùng bố cục văn bản trông giống bảng nhưng không được cấu trúc như một bảng thực sự.
- Để kiểm soát từng bảng tốt hơn, hãy dùng [Trích xuất bảng PDF](./extract-tables), cho phép chọn giữa đầu ra CSV, JSON và Markdown.
- Nếu bạn cần dữ liệu ở định dạng Excel với các trang tính riêng cho từng bảng, hãy dùng [PDF sang Excel](./pdf-to-excel).

## Công cụ liên quan

- [PDF sang Excel](./pdf-to-excel)
- [Trích xuất bảng PDF](./extract-tables)
- [PDF sang Văn bản](./pdf-to-text)
