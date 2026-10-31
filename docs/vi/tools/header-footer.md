---
title: Đầu trang & Chân trang
description: Thêm văn bản đầu trang và chân trang tùy chỉnh vào các trang PDF với biến số trang động.
---

# Đầu trang & Chân trang

Thêm văn bản vào sáu vị trí trên các trang PDF: đầu trang trái, đầu trang giữa, đầu trang phải, chân trang trái, chân trang giữa và chân trang phải. Công cụ hỗ trợ biến động cho số trang và tổng số trang, nên bạn có thể tạo mẫu như "Trang 3 trên 10" tự động cập nhật theo từng trang.

## Cách hoạt động

1. Tải lên tệp PDF của bạn.
2. Bảng tùy chọn xuất hiện với các điều khiển định dạng và sáu ô nhập văn bản.
3. Nhập văn bản mong muốn vào bất kỳ vị trí đầu trang/chân trang nào.
4. Dùng các biến giữ chỗ `{page}` và `{total}` để đánh số trang động.
5. Điều chỉnh cỡ chữ, màu chữ và tùy chọn giới hạn trong một phạm vi trang cụ thể.
6. Nhấp **Thêm đầu trang & chân trang** để xử lý và tải xuống.

## Tùy chọn

- **Phạm vi trang**: Tùy chọn giới hạn các trang được thêm đầu trang và chân trang. Để trống để áp dụng cho mọi trang. Định dạng: "1-3, 5" (các phạm vi cách nhau bằng dấu phẩy).
- **Cỡ chữ**: Từ 6 đến 24 điểm. Mặc định là 10.
- **Màu chữ**: Chọn màu bất kỳ bằng bộ chọn màu.
- **Đầu trang Trái / Giữa / Phải**: Các ô văn bản cho phần trên cùng của mỗi trang.
- **Chân trang Trái / Giữa / Phải**: Các ô văn bản cho phần dưới cùng của mỗi trang.

## Tính năng

- Sáu vị trí văn bản độc lập trên mỗi trang
- Biến động `{page}` chèn số trang hiện tại
- Biến động `{total}` chèn tổng số trang
- Lọc theo phạm vi trang để nhắm đến các trang cụ thể
- Cỡ chữ và màu sắc tùy chỉnh
- Phông chữ Helvetica cho kết quả gọn gàng, chuyên nghiệp

## Trường hợp sử dụng

- Thêm "Trang {page} trên {total}" vào giữa chân trang của một báo cáo
- Đặt tên công ty ở đầu trang bên trái và ngày tài liệu ở đầu trang bên phải
- Thêm thông báo bảo mật vào chân trang của tài liệu pháp lý
- Đóng dấu số phiên bản tài liệu lên các phạm vi trang cụ thể

## Mẹo

- Kết hợp `{page}` và `{total}` trong một ô để có định dạng như "Trang {page} trên {total}" hoặc "{page}/{total}".
- Bạn có thể để trống hầu hết các ô và chỉ điền những vị trí cần dùng. Các ô trống sẽ bị bỏ qua.
- Với đầu trang phức tạp hơn có hình ảnh hoặc logo, hãy cân nhắc dùng công cụ [Thêm Watermark](./add-watermark) đặt ở đầu trang.

## Công cụ liên quan

- [Số trang](./page-numbers)
- [Thêm Watermark](./add-watermark)
- [Đánh số Bates](./bates-numbering)
