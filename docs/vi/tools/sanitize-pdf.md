---
title: Làm sạch PDF
description: Loại bỏ nội dung ẩn và có thể nguy hiểm khỏi PDF, gồm metadata, JavaScript, tệp nhúng, ghi chú và layer.
---

# Làm sạch PDF

PDF có thể mang nhiều hơn rất nhiều so với những gì bạn thấy trên màn hình. Metadata ẩn, JavaScript nhúng, tệp đính kèm, dữ liệu biểu mẫu và thông tin layer có thể làm lộ dữ liệu nhạy cảm hoặc gây rủi ro bảo mật. Làm sạch sẽ loại bỏ tất cả, để lại cho bạn một tài liệu sạch, an toàn để chia sẻ công khai.

## Cách hoạt động

1. Tải lên một tệp PDF.
2. Chọn các thành phần cần xóa từ danh sách kiểm.
3. Nhấp **Làm sạch PDF**.
4. Tải xuống tệp đã làm sạch.

## Tùy chọn làm sạch

Tất cả tùy chọn được bật theo mặc định. Bỏ chọn những mục bạn muốn giữ lại.

| Tùy chọn               | Những gì bị xóa                                                       |
| ---------------------- | --------------------------------------------------------------------- |
| **Làm phẳng biểu mẫu** | Chuyển các trường biểu mẫu tương tác thành nội dung tĩnh              |
| **Xóa Metadata**       | Loại bỏ tác giả, tiêu đề, ngày tạo, thông tin phần mềm và dữ liệu XMP |
| **Xóa ghi chú**        | Xóa bình luận, đánh dấu, ghi chú dán và markup                        |
| **Xóa JavaScript**     | Loại bỏ các script nhúng có thể chạy khi mở tệp                       |
| **Xóa tệp nhúng**      | Loại bỏ các tệp đính kèm được nhúng trong PDF                         |
| **Xóa layer (OCG)**    | Làm phẳng các nhóm nội dung tùy chọn thành một layer duy nhất         |
| **Xóa liên kết**       | Loại bỏ siêu liên kết và tham chiếu URL                               |
| **Xóa cây cấu trúc**   | Xóa cấu trúc tài liệu dùng cho việc gắn thẻ hỗ trợ tiếp cận           |
| **Xóa MarkInfo**       | Loại bỏ thông tin nội dung được đánh dấu                              |
| **Xóa phông chữ**      | Xóa dữ liệu phông chữ nhúng (dùng thận trọng)                         |

## Trường hợp sử dụng

- Chuẩn bị PDF để phát hành công khai bằng cách loại bỏ metadata nội bộ (tên tác giả, phiên bản phần mềm, lịch sử chỉnh sửa)
- Xóa JavaScript khỏi PDF nhận từ nguồn không tin cậy trước khi mở
- Làm sạch PDF trước khi gửi cho khách hàng không nên thấy bình luận nhúng hoặc tên trường biểu mẫu
- Loại bỏ các layer ẩn khỏi bản vẽ kiến trúc trước khi chia sẻ bản cuối
- Tuân thủ các yêu cầu tối thiểu hóa dữ liệu theo quy định về quyền riêng tư

## Mẹo

- Đừng chọn "Xóa phông chữ" trừ khi bạn chắc chắn PDF vẫn hiển thị đúng. Việc xóa phông chữ có thể khiến văn bản không hiển thị trong một số trình xem.
- Nếu bạn chỉ cần loại bỏ metadata, công cụ Xóa Metadata chuyên dụng nhanh hơn và tập trung hơn.
- Làm sạch là không thể hoàn tác. Hãy giữ tệp gốc của bạn.

## Công cụ liên quan

- [Xóa Metadata](./remove-metadata): chỉ loại bỏ metadata mà không đụng đến nội dung khác
- [Làm phẳng PDF](./flatten-pdf): làm phẳng riêng biểu mẫu và ghi chú
- [Mã hóa PDF](./protect-pdf): thêm bảo vệ bằng mật khẩu sau khi làm sạch
- [Raster hóa PDF](./rasterize-pdf): giải pháp triệt để, chuyển thành hình ảnh để loại bỏ mọi nội dung ẩn
