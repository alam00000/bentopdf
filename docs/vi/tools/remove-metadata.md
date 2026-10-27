---
title: Xóa Metadata
description: Loại bỏ toàn bộ metadata ẩn khỏi tệp PDF, gồm tác giả, tiêu đề, ngày tạo, producer, dữ liệu XMP và ID tài liệu.
---

# Xóa Metadata

Mọi PDF đều mang metadata có thể tiết lộ ai đã tạo nó, đã dùng phần mềm nào, được sửa lần cuối khi nào, v.v. Công cụ này loại bỏ tất cả: info dictionary, luồng metadata XMP, ID tài liệu và dữ liệu riêng của ứng dụng, để lại một tài liệu sạch không còn dấu vết nguồn gốc.

## Cách hoạt động

1. Tải lên một tệp PDF.
2. Nhấp **Xóa Metadata**.
3. Tải xuống tệp đã làm sạch.

Không có tùy chọn nào cần cấu hình. Công cụ được thiết kế để làm triệt để: nó xóa mọi thứ.

## Những gì bị xóa

- **Các trường info dictionary**: Title, Author, Subject, Keywords, Creator, Producer, ngày tạo, ngày sửa đổi
- **Luồng metadata XMP**: Khối metadata dựa trên XML lưu trong danh mục tài liệu
- **ID tài liệu**: Mã định danh duy nhất trong trailer của PDF có thể dùng để theo dõi tài liệu giữa các hệ thống
- **PieceInfo**: Metadata riêng của ứng dụng do các chương trình như Illustrator hoặc InDesign thêm vào

## Những gì được giữ lại

- Toàn bộ nội dung trang hiển thị (văn bản, hình ảnh, đồ họa)
- Trường biểu mẫu và ghi chú
- Bookmark và liên kết
- Chính cấu trúc tài liệu

## Trường hợp sử dụng

- Xóa tên và tổ chức của bạn khỏi tài liệu trước khi xuất bản ẩn danh
- Loại bỏ dấu thời gian tạo cho thấy tài liệu được chuẩn bị khi nào
- Làm sạch chuỗi producer cho biết bộ phần mềm PDF của bạn
- Chuẩn bị tài liệu cho các hồ sơ pháp quy yêu cầu PDF không có metadata
- Xóa dấu vết lịch sử chỉnh sửa trước khi chia sẻ tài liệu ra bên ngoài

## Mẹo

- Hãy dùng công cụ Xem Metadata trước để biết chính xác PDF của bạn chứa metadata nào trước khi xóa.
- Nếu bạn cần xóa metadata _và_ JavaScript, ghi chú và tệp nhúng, hãy dùng Làm sạch PDF để làm sạch triệt để hơn.
- Việc xóa metadata là vĩnh viễn. Hãy giữ bản gốc nếu sau này bạn có thể cần dữ liệu đó.

## Công cụ liên quan

- [Làm sạch PDF](./sanitize-pdf): xóa metadata cùng script, tệp đính kèm và nhiều thứ khác
- [Mã hóa PDF](./protect-pdf): bảo vệ PDF đã làm sạch bằng mật khẩu
- [Nén PDF](./compress-pdf): xóa metadata có thể giảm nhẹ kích thước tệp; hãy nén để tiết kiệm thêm
