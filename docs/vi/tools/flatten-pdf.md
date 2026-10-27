---
title: Làm phẳng PDF
description: Làm phẳng form tương tác và ghi chú thành nội dung tĩnh. Khiến trường form không thể chỉnh sửa và gộp ghi chú vào trang.
---

# Làm phẳng PDF

Làm phẳng là gộp các thành phần tương tác (trường form, danh sách thả xuống, hộp kiểm, ghi chú, đánh dấu, ghi chú dán) trực tiếp vào nội dung trang. Hình thức hiển thị giữ nguyên, nhưng không còn gì có thể chỉnh sửa hay trích xuất. Nó giống như in một form đã điền rồi quét lại, chỉ khác là chất lượng vẫn hoàn hảo.

## Cách hoạt động

1. Tải lên một hoặc nhiều tệp PDF.
2. Nhấp **Làm phẳng PDF**.
3. Một tệp sẽ được tải xuống trực tiếp. Nhiều tệp sẽ tạo thành một tệp ZIP.

Công cụ dùng pdf-lib để làm phẳng trường form (qua `form.flatten()`) và một bộ làm phẳng ghi chú riêng để gộp ghi chú vào luồng nội dung của trang. Cả hai thao tác diễn ra trong một lượt.

## Những gì được làm phẳng

- **Trường form**: Ô nhập văn bản, hộp kiểm, nút radio, danh sách thả xuống, trường chữ ký
- **Ghi chú**: Bình luận, đánh dấu, gạch ngang chữ, gạch chân, ghi chú dán, tem, ghi chú nét vẽ
- **Thành phần tương tác**: Nút, trình kích hoạt hành động

## Những gì giữ nguyên

- Nội dung văn bản (vẫn chọn và tìm kiếm được)
- Hình ảnh và đồ họa
- Bố cục và kích thước trang
- Bookmark và mục lục
- Siêu liên kết (trừ khi chúng dựa trên ghi chú)

## Trường hợp sử dụng

- Khóa một form đã hoàn thành để người nhận không thể thay đổi các câu trả lời đã gửi
- Chuẩn bị PDF để lưu trữ khi không cần các thành phần tương tác
- Khắc phục lỗi hiển thị do ghi chú được hiển thị khác nhau giữa các trình xem
- Đảm bảo tài liệu đã ký không thể bị sửa đổi sau khi áp dụng chữ ký
- Giảm dung lượng tệp bằng cách loại bỏ định nghĩa trường form và đối tượng ghi chú

## Mẹo

- Hãy làm phẳng sau khi mọi chỉnh sửa đã hoàn tất. Không có cách nào để hoàn tác việc làm phẳng PDF.
- Nếu bạn cần làm phẳng đồng thời xóa metadata, JavaScript và tệp đính kèm, hãy dùng công cụ Làm sạch PDF, vì nó có làm phẳng như một trong các tùy chọn.
- Một số PDF báo "không tìm thấy form". Điều này bình thường nếu tài liệu chỉ có ghi chú mà không có trường form.

## Công cụ liên quan

- [Làm sạch PDF](./sanitize-pdf): làm phẳng form đồng thời xóa metadata, script và nhiều thứ khác
- [Raster hóa PDF](./rasterize-pdf): chuyển thành PDF dạng ảnh để làm phẳng triệt để nhất
- [Phông chữ thành đường viền](./font-to-outline): làm phẳng phông chữ thành đường vector
- [Mã hóa PDF](./protect-pdf): khóa PDF đã làm phẳng bằng mật khẩu
