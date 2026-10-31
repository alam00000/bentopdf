---
title: ODT sang PDF
description: Chuyển đổi tệp OpenDocument Text (ODT) sang định dạng PDF ngay trong trình duyệt bằng công cụ chạy trên LibreOffice.
---

# ODT sang PDF

Chuyển đổi tệp OpenDocument Text sang PDF. ODT là định dạng gốc của LibreOffice Writer, Apache OpenOffice và các trình soạn thảo văn bản mã nguồn mở khác. Công cụ này dùng engine LibreOffice chạy trong trình duyệt để chuyển đổi chính xác, giữ nguyên định dạng, bảng, hình ảnh và kiểu dáng.

## Định dạng được hỗ trợ

| Định dạng         | Phần mở rộng |
| :---------------- | :----------- |
| OpenDocument Text | `.odt`       |

## Cách hoạt động

1. Nhấp vào vùng tải lên hoặc kéo và thả một hoặc nhiều tệp ODT.
2. Xem lại danh sách tệp. Thêm tệp hoặc xóa những tệp không cần.
3. Nhấp **Chuyển đổi sang PDF**. Engine LibreOffice khởi tạo (có chỉ báo tiến trình hiển thị trạng thái tải), sau đó từng tệp được chuyển đổi.
4. Một tệp được tải xuống trực tiếp dưới dạng PDF. Nhiều tệp được đóng gói thành `odt-converted.zip`.

## Tùy chọn

Công cụ này không có cấu hình bổ sung. Quá trình chuyển đổi giữ định dạng của tài liệu gốc sát nhất có thể.

## Kết quả đầu ra

| Số tệp đầu vào | Đầu ra                                                 |
| :------------- | :----------------------------------------------------- |
| 1 tệp          | Tải xuống một PDF (ví dụ: `document.pdf`)              |
| 2+ tệp         | Tệp ZIP (`odt-converted.zip`) chứa một PDF cho mỗi tệp |

## Trường hợp sử dụng

- Chuyển tài liệu LibreOffice Writer sang PDF để chia sẻ với người dùng Microsoft Office
- Tạo PDF sẵn sàng để in từ các bài báo học thuật viết ở định dạng OpenDocument
- Chuyển đổi hàng loạt một thư mục mẫu ODT thành PDF để phân phối
- Tạo PDF từ các tệp ODT do hệ thống tạo tài liệu tự động sinh ra

## Mẹo

- Engine LibreOffice tải trong lần dùng đầu tiên và được lưu đệm cho các lần chuyển đổi sau. Lần tải đầu mất vài giây; sau đó việc chuyển đổi rất nhanh.
- Tài liệu phức tạp có đối tượng OLE nhúng hoặc phông chữ lạ có thể hiển thị hơi khác so với LibreOffice trên máy tính. Hãy thử với một mẫu trước khi chuyển đổi hàng loạt.
- Với tài liệu Word (`.doc`, `.docx`), hãy dùng công cụ [Word sang PDF](./word-to-pdf), công cụ này cũng dùng engine LibreOffice nhưng nhận trực tiếp các định dạng của Microsoft.

## Công cụ liên quan

- [Word sang PDF](./word-to-pdf)
- [RTF sang PDF](./rtf-to-pdf)
- [Văn bản sang PDF](./txt-to-pdf)
