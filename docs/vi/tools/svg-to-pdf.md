---
title: SVG sang PDF
description: Chuyển đổi đồ họa vector SVG sang PDF với kiểm soát chất lượng, hoàn toàn trong trình duyệt của bạn.
---

# SVG sang PDF

Chuyển đổi tệp Scalable Vector Graphics (SVG) sang PDF. Công cụ rasterize từng SVG qua engine hiển thị của trình duyệt, rồi nhúng kết quả ở độ phân giải gốc. Hữu ích để biến biểu tượng vector, sơ đồ và hình minh họa thành tài liệu di động.

## Định dạng được hỗ trợ

| Định dạng | Phần mở rộng |
| :-------- | :----------- |
| SVG       | `.svg`       |

## Cách hoạt động

1. Nhấp vào vùng tải lên hoặc kéo và thả một hoặc nhiều tệp SVG.
2. Xem lại và quản lý danh sách tệp.
3. Chọn mức **Chất lượng PDF**.
4. Nhấp **Chuyển đổi sang PDF**. Kết quả được tải xuống dưới dạng `from_svgs.pdf`.

Mỗi SVG được đọc dưới dạng văn bản, hiển thị lên canvas theo chiều rộng và chiều cao vốn có (mặc định 800x600 nếu không chỉ định kích thước), rồi xuất thành PNG. PNG đó sau đó được nhúng vào PDF bằng pdf-lib. Các vùng trong suốt được tô nền trắng.

## Tùy chọn

**Chất lượng PDF** kiểm soát việc nén sau khi rasterize:

- **Chất lượng cao**: gần nhất với bản hiển thị gốc.
- **Chất lượng trung bình** (mặc định): cân bằng tốt.
- **Chất lượng thấp**: tệp nhỏ nhất, mất một ít chi tiết.

## Trường hợp sử dụng

- Chuyển sơ đồ kiến trúc hoặc kỹ thuật từ SVG sang PDF sẵn sàng để in
- Đóng gói bộ biểu tượng thành PDF tham chiếu cho một hệ thống thiết kế
- Biến trực quan hóa dữ liệu (D3.js, xuất từ thư viện biểu đồ) thành PDF sẵn sàng cho báo cáo
- Tạo phiên bản in được của infographic dựa trên SVG

## Mẹo

- Tệp SVG không có thuộc tính `width` và `height` rõ ràng được hiển thị ở 800x600 điểm ảnh. Để có kết quả tốt nhất, hãy đặt kích thước trong mã nguồn SVG trước khi chuyển đổi.
- SVG phức tạp có tham chiếu phông chữ ngoài hoặc hình ảnh liên kết có thể không hiển thị hoàn hảo. Hãy nhúng mọi tài nguyên vào trong SVG để có đầu ra đáng tin cậy.
- Vì SVG được rasterize, PDF sẽ chứa ảnh bitmap thay vì đường vector. Để có đầu ra PDF vector thực sự, cần một công cụ vector chuyên dụng.

## Công cụ liên quan

- [Hình ảnh sang PDF](./image-to-pdf)
- [PNG sang PDF](./png-to-pdf)
- [BMP sang PDF](./bmp-to-pdf)
