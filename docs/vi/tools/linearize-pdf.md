---
title: Tuyến tính hóa PDF
description: Tối ưu tệp PDF để xem web nhanh với tải dần. Còn được gọi là tối ưu "Fast Web View".
---

# Tuyến tính hóa PDF

Tuyến tính hóa sắp xếp lại cấu trúc PDF để trang đầu tiên có thể hiển thị trước khi toàn bộ tệp tải xong. Adobe gọi đây là "Fast Web View". Nếu bạn đăng PDF trên website hoặc phục vụ qua cổng tài liệu, tuyến tính hóa giúp chúng mở nhanh hơn đáng kể.

## Cách hoạt động

1. Tải lên một hoặc nhiều tệp PDF.
2. Nhấp **Tuyến tính hóa PDF**.
3. Tải kết quả xuống dưới dạng kho lưu trữ ZIP chứa mọi tệp đã tuyến tính hóa.

Không có cài đặt nào cần cấu hình. Công cụ dùng cờ `--linearize` của QPDF, sắp xếp lại cấu trúc nội bộ của PDF mà không thay đổi nội dung hiển thị.

## Tuyến tính hóa làm gì

- Sắp xếp lại các đối tượng PDF để dữ liệu của trang đầu nằm ở đầu tệp
- Thêm từ điển tuyến tính hóa và bảng gợi ý để trình xem biết nơi tìm từng trang
- Cho phép yêu cầu theo dải byte: trình duyệt có thể tải riêng trang đầu mà không cần tải cả tệp
- Dọn dẹp bảng tham chiếu chéo để truy cập ngẫu nhiên hiệu quả

## Tính năng

- Xử lý hàng loạt nhiều PDF trong một thao tác
- Đầu ra giữ nguyên mọi nội dung, phông chữ, hình ảnh và thành phần tương tác
- Dùng QPDF (WebAssembly) để tuyến tính hóa đáng tin cậy, đúng chuẩn
- Kết quả được đóng gói vào ZIP để tải xuống dễ dàng

## Trường hợp sử dụng

- Đăng báo cáo PDF trên website nơi người dùng mong đợi trang hiển thị tức thì
- Nhúng PDF vào ứng dụng web có trình xem trong trình duyệt
- Xuất bản catalog hoặc sách hướng dẫn PDF được truy cập qua kết nối di động chậm
- Chuẩn bị tài liệu cho mạng phân phối nội dung (CDN) hỗ trợ phục vụ theo dải byte

## Mẹo

- Hãy tuyến tính hóa sau khi mọi chỉnh sửa khác đã xong. Bất kỳ sửa đổi nào sau đó (gộp, thêm trang) sẽ phá vỡ tuyến tính hóa.
- Kết hợp với Nén PDF để có PDF nhỏ nhất và tải nhanh nhất.
- Tuyến tính hóa làm tăng một chút dung lượng tệp (thường dưới 1%).

## Công cụ liên quan

- [Nén PDF](./compress-pdf): giảm dung lượng tệp trước khi tuyến tính hóa
- [Sửa chữa PDF](./repair-pdf): sửa các vấn đề cấu trúc ngăn cản việc tuyến tính hóa
- [Xóa Metadata](./remove-metadata): loại bỏ metadata trước khi đăng trực tuyến
