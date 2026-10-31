---
title: RTF sang PDF
description: Chuyển đổi tệp Rich Text Format (RTF) sang PDF trong trình duyệt bằng engine chạy trên LibreOffice.
---

# RTF sang PDF

Chuyển đổi tài liệu Rich Text Format sang PDF. RTF là định dạng tài liệu đa nền tảng được hầu hết mọi trình xử lý văn bản hỗ trợ. Công cụ này dùng engine LibreOffice chạy trong trình duyệt để hiển thị tệp RTF với định dạng nguyên vẹn: chữ đậm, chữ nghiêng, bảng và hình ảnh nhúng đều được chuyển sang PDF.

## Định dạng được hỗ trợ

| Định dạng | Phần mở rộng | Kiểu MIME                     |
| :-------- | :----------- | :---------------------------- |
| RTF       | `.rtf`       | `text/rtf`, `application/rtf` |

## Cách hoạt động

1. Nhấp vào vùng tải lên hoặc kéo và thả một hoặc nhiều tệp RTF.
2. Xem lại danh sách tệp. Thêm hoặc xóa tệp nếu cần.
3. Nhấp **Chuyển đổi sang PDF**. Engine LibreOffice khởi tạo ở lần dùng đầu tiên, sau đó xử lý từng tệp.
4. Một tệp được tải xuống trực tiếp dưới dạng PDF. Nhiều tệp được cung cấp dưới dạng `rtf-converted.zip`.

## Tùy chọn

Công cụ này không có cài đặt bổ sung. Quá trình chuyển đổi giữ nguyên định dạng RTF gốc.

## Đầu ra

| Số tệp đầu vào | Đầu ra                                                 |
| :------------- | :----------------------------------------------------- |
| 1 tệp          | Tải xuống một PDF (ví dụ: `letter.pdf`)                |
| 2 tệp trở lên  | Tệp ZIP (`rtf-converted.zip`) chứa một PDF cho mỗi tệp |

## Trường hợp sử dụng

- Chuyển các tài liệu RTF cũ từ trình xử lý văn bản đời cũ sang PDF hiện đại
- Biến mẫu email RTF thành bản xem trước PDF
- Xử lý đầu ra RTF từ các hệ thống phần mềm pháp lý hoặc y tế
- Chuyển đổi hàng loạt tệp RTF từ hệ thống quản lý tài liệu sang PDF để lưu trữ

## Mẹo

- Engine LibreOffice được tải một lần và lưu đệm. Lần chuyển đổi đầu tiên trong phiên mất thêm vài giây, các lần sau nhanh hơn.
- Tệp RTF có đối tượng OLE nhúng có thể không hiển thị hoàn hảo mọi đối tượng. Văn bản thuần, hình ảnh và định dạng tiêu chuẩn được chuyển đổi đáng tin cậy.
- Nếu tệp RTF của bạn được tạo bằng Microsoft Word, bạn cũng có thể chuyển đổi trực tiếp bằng công cụ [Word sang PDF](./word-to-pdf), công cụ này nhận RTF cùng với DOC và DOCX.

## Công cụ liên quan

- [Word sang PDF](./word-to-pdf)
- [ODT sang PDF](./odt-to-pdf)
- [Văn bản sang PDF](./txt-to-pdf)
