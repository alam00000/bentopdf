---
title: Email sang PDF
description: Chuyển đổi tệp email EML và MSG sang PDF ngay trong trình duyệt. Giữ nguyên tiêu đề, nội dung và danh sách tệp đính kèm.
---

# Email sang PDF

Chuyển các tệp email đã lưu thành PDF gọn gàng, có thể in. Công cụ phân tích tệp EML và MSG, trích xuất toàn bộ thư (tiêu đề, nội dung và metadata tệp đính kèm) và hiển thị tất cả thành một PDF có cấu trúc. Hữu ích cho thu thập chứng cứ pháp lý, lưu hồ sơ, hoặc đơn giản là in một email quan trọng.

## Định dạng được hỗ trợ

| Định dạng | Phần mở rộng | Ghi chú                                                     |
| :-------- | :----------- | :---------------------------------------------------------- |
| EML       | `.eml`       | Định dạng email MIME chuẩn (xuất từ hầu hết ứng dụng email) |
| MSG       | `.msg`       | Định dạng độc quyền của Microsoft Outlook                   |

## Cách hoạt động

1. Nhấp vào vùng tải lên hoặc kéo thả các tệp EML hoặc MSG. Bạn có thể trộn cả hai định dạng trong một lô.
2. Xem lại danh sách tệp. Xóa các mục không cần bằng biểu tượng thùng rác, hoặc nhấp **Thêm tệp** để thêm email.
3. Cấu hình các tùy chọn chuyển đổi (xem bên dưới).
4. Nhấp **Chuyển đổi sang PDF**. Công cụ phân tích từng email, hiển thị nội dung dưới dạng HTML có định dạng và chuyển sang PDF qua engine PyMuPDF.
5. Một email được tải xuống trực tiếp dưới dạng PDF. Nhiều email được đóng gói vào `emails-converted.zip`.

## Tùy chọn

| Tùy chọn                           | Mặc định | Mô tả                                                                                          |
| :--------------------------------- | :------- | :--------------------------------------------------------------------------------------------- |
| **Khổ giấy**                       | A4       | Chọn giữa kích thước A4, Letter hoặc Legal.                                                    |
| **Bao gồm CC và BCC**              | Bật      | Khi bật, danh sách người nhận CC và BCC xuất hiện trong phần tiêu đề email của PDF.            |
| **Bao gồm danh sách tệp đính kèm** | Bật      | Khi bật, danh sách các tệp đính kèm của email (kèm tên tệp và kích thước) xuất hiện trong PDF. |

## Trường hợp sử dụng

- Lưu trữ thư từ kinh doanh quan trọng dưới dạng PDF để tuân thủ hoặc kiểm toán
- In chuỗi email cho thủ tục pháp lý hoặc yêu cầu cung cấp chứng cứ
- Tạo hồ sơ vĩnh viễn cho xác nhận đơn hàng, biên lai hoặc hợp đồng nhận qua email
- Sao lưu tệp Outlook MSG ở định dạng không cần Outlook để đọc
- Ghi lại các tương tác hỗ trợ khách hàng từ các tệp EML đã xuất

## Mẹo

- Cả EML (dùng bởi Thunderbird, Apple Mail và hầu hết ứng dụng email) lẫn tệp Outlook MSG đều được hỗ trợ. Hãy xuất email từ ứng dụng email của bạn và thả thẳng vào công cụ.
- Email định dạng HTML giữ nguyên kiểu dáng trong PDF. Email văn bản thuần được hiển thị với định dạng gọn gàng, dễ đọc.
- Danh sách tệp đính kèm hiển thị tên tệp và kích thước nhưng không nhúng chính các tệp đính kèm vào PDF.

## Công cụ liên quan

- [XML sang PDF](./xml-to-pdf)
- [XPS sang PDF](./xps-to-pdf)
