---
title: Lớp PDF (OCG)
description: Xem, bật tắt, thêm và xóa các lớp Optional Content Group (OCG) trong tài liệu PDF.
---

# Lớp PDF (OCG)

Quản lý các Optional Content Group (OCG), thường gọi là "lớp", bên trong PDF. Bạn có thể bật tắt hiển thị lớp, thêm lớp mới (kể cả lớp con lồng nhau), xóa lớp và lưu PDF đã chỉnh sửa.

## Cách hoạt động

1. Tải lên một tệp PDF.
2. Nhấp nút xử lý để tải tài liệu bằng engine PyMuPDF.
3. Công cụ hiển thị tất cả lớp hiện có cùng trạng thái hiển thị, trạng thái khóa và cấp bậc lồng nhau.
4. Bật tắt các hộp kiểm để hiện hoặc ẩn lớp. Lớp bị khóa không thể bật tắt.
5. Thêm lớp cấp cao nhất mới bằng cách nhập tên và nhấp nút thêm, hoặc thêm lớp con dưới một lớp cha hiện có.
6. Xóa các lớp bạn không còn cần.
7. Nhấp **Lưu** để tải xuống PDF đã chỉnh sửa với các thay đổi về lớp.

## Tính năng

- Hiển thị cấu trúc phân cấp lớp với thụt lề phù hợp cho lớp lồng nhau
- Bật hoặc tắt hiển thị lớp
- Biểu tượng khóa giúp tránh thay đổi nhầm
- Thêm lớp cấp cao nhất hoặc lớp con với tên tùy chỉnh
- Xóa từng lớp riêng lẻ
- Lưu mọi thay đổi vào một tệp PDF mới

## Trường hợp sử dụng

- Bật tắt hiển thị các lớp ghi chú trong bản vẽ kiến trúc hoặc kỹ thuật
- Thêm lớp chú thích mới vào tài liệu thiết kế nhiều lớp
- Xóa các lớp lỗi thời khỏi mẫu trước khi phân phối
- Kiểm tra những lớp nào tồn tại trong một PDF phức tạp nhận từ bên thứ ba

## Mẹo

- Nếu PDF không có lớp nào, công cụ hiển thị trạng thái trống kèm gợi ý thêm lớp. Không phải PDF nào cũng dùng lớp OCG, chúng phổ biến nhất trong tệp xuất từ CAD và tệp thiết kế.
- Lớp con được thụt lề dưới lớp cha. Bạn có thể lồng lớp ở mọi cấp độ.
- Lớp bị khóa hiển thị với biểu tượng khóa và hộp kiểm bị vô hiệu hóa. Các khóa này do người tạo PDF thiết lập.

## Công cụ liên quan

- [Xem Metadata](./view-metadata)
- [Chỉnh sửa Metadata](./edit-metadata)
- [Nhân đôi & Sắp xếp](./organize-pdf)
