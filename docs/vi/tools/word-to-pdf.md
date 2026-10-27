---
title: Word sang PDF
description: Chuyển đổi tài liệu Word (DOC, DOCX), ODT và RTF sang PDF ngay trong trình duyệt, giữ nguyên định dạng.
---

# Word sang PDF

Chuyển đổi tài liệu Microsoft Word và các định dạng tương thích sang PDF. Công cụ dùng engine LibreOffice chạy trong trình duyệt, xử lý các tệp DOC, DOCX, ODT và RTF, giữ nguyên định dạng, bảng, ảnh, đầu trang, chân trang và kiểu dáng ở đầu ra.

## Định dạng được hỗ trợ

| Định dạng         | Phần mở rộng |
| :---------------- | :----------- |
| Word (hiện đại)   | `.docx`      |
| Word (cũ)         | `.doc`       |
| OpenDocument Text | `.odt`       |
| Rich Text Format  | `.rtf`       |

## Cách hoạt động

1. Nhấp vào khu vực tải lên hoặc kéo và thả các tài liệu Word của bạn. Có thể chọn nhiều tệp cùng lúc.
2. Xem lại và quản lý danh sách tệp.
3. Nhấp **Chuyển sang PDF**. Engine LibreOffice được tải ở lần dùng đầu tiên (một chỉ báo tiến trình cho biết trạng thái khởi tạo), sau đó từng tệp được chuyển đổi.
4. Một tệp sẽ được tải xuống trực tiếp dưới dạng PDF. Nhiều tệp được đóng gói vào `word-converted.zip`.

## Tùy chọn

Công cụ này không có cài đặt bổ sung. Engine LibreOffice tạo đầu ra bằng hồ sơ xuất PDF mặc định.

## Đầu ra

| Số tệp đầu vào | Đầu ra                                                  |
| :------------- | :------------------------------------------------------ |
| 1 tệp          | Tải xuống một PDF (tên tệp gốc với phần mở rộng `.pdf`) |
| 2 tệp trở lên  | Tệp ZIP (`word-converted.zip`) chứa một PDF cho mỗi tệp |

## Trường hợp sử dụng

- Chuyển sơ yếu lý lịch hoặc thư xin việc từ DOCX sang PDF trước khi nộp đơn
- Chuyển hàng loạt một bộ hợp đồng hoặc đề xuất sang PDF để giao cho khách hàng
- Biến các tệp `.doc` cũ thành PDF hiện đại để lưu trữ lâu dài
- Chuyển các tài liệu cộng tác từ Google Docs (xuất dạng DOCX) sang PDF
- Tạo PDF sẵn sàng để in từ các mẫu Word dùng trong việc tạo tài liệu tự động

## Mẹo

- Engine LibreOffice được tải một lần mỗi phiên và được lưu đệm. Lần chuyển đổi đầu tiên mất vài giây để tải, các lần sau nhanh hơn nhiều.
- Định dạng phức tạp (macro, điều khiển ActiveX, SmartArt nâng cao) có thể không được chuyển đổi hoàn hảo. Các thành phần tài liệu tiêu chuẩn như văn bản, bảng, ảnh, đầu trang, chú thích cuối trang được chuyển đổi đáng tin cậy.
- Vì công cụ này cũng nhận ODT và RTF, bạn có thể dùng nó làm công cụ chuyển đổi tất cả trong một cho mọi định dạng soạn thảo văn bản.

## Công cụ liên quan

- [ODT sang PDF](./odt-to-pdf)
- [RTF sang PDF](./rtf-to-pdf)
- [Excel sang PDF](./excel-to-pdf)
- [PowerPoint sang PDF](./powerpoint-to-pdf)
