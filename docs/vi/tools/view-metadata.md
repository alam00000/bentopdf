---
title: Xem Metadata
description: Kiểm tra mọi thuộc tính metadata của PDF, gồm thông tin tài liệu, dữ liệu XMP và chi tiết cấu trúc.
---

# Xem Metadata

Xem các thuộc tính ẩn được nhúng trong tệp PDF. Công cụ hiển thị thông tin tài liệu (tiêu đề, tác giả, ngày tháng), metadata XMP, kích thước trang và các dữ liệu cấu trúc khác ở định dạng dễ đọc.

## Cách hoạt động

1. Tải lên một tệp PDF.
2. Công cụ phân tích tệp ngay lập tức và hiển thị toàn bộ metadata có sẵn trong các phần được sắp xếp gọn gàng.
3. Xem lại từ điển thông tin tài liệu, cây metadata XMP và các thuộc tính cấu trúc.
4. Không cần bước xử lý: metadata được hiển thị ngay khi tệp được tải.

## Tính năng

- Hiển thị các trường thông tin tài liệu chuẩn: Title, Author, Subject, Keywords, Creator, Producer
- Hiển thị ngày tạo và ngày sửa đổi ở dạng dễ đọc
- Phân tích và hiển thị toàn bộ cây metadata XMP với các namespace lồng nhau
- Chuyển đổi định dạng ngày PDF (`D:20240101120000Z`) sang ngày dễ đọc
- Được chia thành các phần có thể thu gọn để dễ điều hướng

## Các phần metadata

| Phần                    | Nội dung                                                                              |
| ----------------------- | ------------------------------------------------------------------------------------- |
| **Thông tin tài liệu**  | Title, Author, Subject, Keywords, Creator, Producer, Creation Date, Modification Date |
| **Metadata XMP**        | Cây metadata dựa trên XML đầy đủ với Dublin Core, XAP, PDF và các namespace tùy chỉnh |
| **Thuộc tính tài liệu** | Số trang, phiên bản PDF, kích thước tệp, trạng thái mã hóa                            |

## Trường hợp sử dụng

- Kiểm tra ai là tác giả của PDF và lần sửa đổi gần nhất
- Xác nhận metadata đã được đặt đúng trước khi xuất bản tài liệu
- Kiểm tra quyền riêng tư của PDF bằng cách xem thông tin cá nhân nào được nhúng
- Tìm hiểu phần mềm đã dùng để tạo hoặc sửa đổi PDF (qua trường Producer)
- Xem lại metadata XMP để tuân thủ quản lý tài sản số

## Mẹo

- Chuỗi ngày PDF bắt đầu bằng `D:` được tự động chuyển sang định dạng múi giờ cục bộ của bạn.
- Nếu các trường metadata trống, nghĩa là người tạo PDF chưa đặt chúng. Không phải PDF nào cũng chứa metadata phong phú.
- Để sửa metadata sau khi kiểm tra, hãy dùng [Chỉnh sửa Metadata](./edit-metadata). Để xóa hoàn toàn, hãy dùng Xóa Metadata.

## Công cụ liên quan

- [Chỉnh sửa Metadata](./edit-metadata)
- [Lớp PDF (OCG)](./pdf-layers)
- [So sánh PDF](./compare-pdfs)
