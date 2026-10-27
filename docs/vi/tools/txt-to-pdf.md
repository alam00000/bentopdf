---
title: Văn bản sang PDF
description: Chuyển đổi tệp văn bản thuần hoặc văn bản gõ trực tiếp sang PDF với phông chữ, màu sắc và kích thước trang tùy chỉnh.
---

# Văn bản sang PDF

Chuyển đổi văn bản thuần thành PDF được định dạng. Bạn có thể tải lên tệp `.txt` hoặc gõ trực tiếp vào trình soạn thảo văn bản tích hợp. Công cụ hỗ trợ nhiều phông chữ, màu văn bản tùy chỉnh và nhiều kích thước trang, từ A0 đến A10, cùng US Letter, Legal và Tabloid.

## Định dạng được hỗ trợ

| Đầu vào                | Phần mở rộng                    |
| :--------------------- | :------------------------------ |
| Tệp văn bản thuần      | `.txt`                          |
| Nhập văn bản trực tiếp | Gõ hoặc dán vào trình soạn thảo |

## Cách hoạt động

1. Chọn chế độ đầu vào bằng công tắc ở trên cùng: **Tải tệp lên** hoặc **Gõ văn bản**.
2. Nếu tải lên, kéo và thả hoặc nhấp để chọn một hoặc nhiều tệp `.txt`. Nếu gõ, hãy nhập văn bản trực tiếp vào ô văn bản.
3. Cấu hình các tùy chọn định dạng: họ phông chữ, cỡ chữ, màu văn bản và kích thước trang.
4. Nhấp **Tạo PDF**. Đầu ra được tải xuống dưới dạng `text_to_pdf.pdf`.

Khi tải lên nhiều tệp, nội dung của chúng được nối với nhau bằng các dòng trống ở giữa.

## Tùy chọn

| Tùy chọn             | Giá trị                                                                  | Mặc định      |
| :------------------- | :----------------------------------------------------------------------- | :------------ |
| **Họ phông chữ**     | Helvetica (sans-serif), Tiro (serif), Courier (monospace), Times (serif) | Helvetica     |
| **Cỡ chữ**           | 6 - 72 pt                                                                | 12            |
| **Màu văn bản**      | Bất kỳ màu nào qua bộ chọn màu                                           | Đen (#000000) |
| **Kích thước trang** | ISO A0-A10, B0-B10, C0-C10, US Letter, Legal, Tabloid, Ledger, 11x17     | A4            |

Các ngôn ngữ viết từ phải sang trái (Ả Rập, Do Thái, Ba Tư, Urdu) được tự động phát hiện. Khi tìm thấy văn bản RTL, hướng văn bản và căn lề sẽ chuyển đổi tương ứng.

## Trường hợp sử dụng

- Chuyển đoạn mã hoặc tệp nhật ký thành PDF in được với phông chữ Courier
- Tạo nhanh PDF từ ghi chú cuộc họp gõ tại chỗ
- Định dạng bản thảo văn bản thuần với phông chữ và kích thước trang cụ thể để nộp
- Tạo phiên bản PDF của README hoặc changelog để phân phối ngoại tuyến

## Mẹo

- Dùng chế độ **Gõ văn bản** khi bạn muốn chuyển nhanh nội dung từ clipboard mà không cần lưu thành tệp trước.
- Courier (monospace) là lựa chọn phông chữ tốt nhất cho mã, nhật ký hoặc bất kỳ nội dung nào cần căn cột.
- Lề trang được cố định ở 72 point (1 inch) ở mọi cạnh.

## Công cụ liên quan

- [Markdown sang PDF](./markdown-to-pdf)
- [CSV sang PDF](./csv-to-pdf)
- [Word sang PDF](./word-to-pdf)
