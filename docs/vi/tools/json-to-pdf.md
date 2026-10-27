---
title: JSON sang PDF
description: Dựng lại tệp PDF từ định dạng JSON của BentoPDF. Chuyển các bản xuất JSON trở lại tài liệu PDF gốc.
---

# JSON sang PDF

Dựng lại tài liệu PDF từ các tệp JSON đã được tạo trước đó bởi công cụ **PDF sang JSON** của BentoPDF. Đây là công cụ chuyển đổi hai chiều: nó lấy biểu diễn JSON có cấu trúc của PDF và xây dựng lại tài liệu gốc.

::: warning
Công cụ này chỉ chấp nhận tệp JSON do bộ chuyển đổi PDF sang JSON của BentoPDF tạo ra. Tệp JSON thông thường từ API, cơ sở dữ liệu hoặc công cụ khác không được hỗ trợ.
:::

## Định dạng được hỗ trợ

| Đầu vào | Mô tả                                                     |
| :------ | :-------------------------------------------------------- |
| `.json` | Tệp JSON được xuất bởi công cụ PDF sang JSON của BentoPDF |

## Cách hoạt động

1. Nhấp vào vùng tải lên hoặc kéo và thả một hoặc nhiều tệp JSON.
2. Danh sách tệp hiển thị từng tệp đã chọn kèm dung lượng.
3. Nhấp **Chuyển sang PDF**. Công cụ xử lý mọi tệp bằng Web Worker và engine CPDF.
4. Kết quả được tải xuống dưới dạng `jsons-to-pdf.zip` chứa một PDF cho mỗi tệp JSON đầu vào.

Quá trình chuyển đổi chạy trong Web Worker nền, nên giao diện vẫn phản hồi mượt ngay cả với tệp lớn.

## Tùy chọn

Công cụ này không có tùy chọn cấu hình. Cấu trúc JSON quyết định hoàn toàn PDF đầu ra.

## Đầu ra

Khi chuyển đổi nhiều tệp JSON, kết quả được giao dưới dạng kho lưu trữ ZIP. Mỗi PDF được đặt tên theo tệp JSON nguồn (ví dụ `report.json` thành `report.pdf`).

## Trường hợp sử dụng

- Khôi phục PDF từ bản sao lưu hoặc pipeline lưu trữ dựa trên JSON
- Chuyển PDF qua JSON để kiểm tra rồi chuyển lại thành PDF
- Dựng lại tài liệu sau khi chỉnh sửa cấu trúc JSON bằng chương trình
- Xác minh bản xuất PDF sang JSON đã ghi lại toàn bộ nội dung tài liệu bằng cách chuyển ngược lại

## Mẹo

- Nếu bạn cần chuyển dữ liệu JSON tùy ý (như phản hồi API hoặc tệp cấu hình) thành PDF được định dạng, công cụ [Văn bản sang PDF](./txt-to-pdf) phù hợp hơn. Dán JSON dưới dạng văn bản và nó sẽ được hiển thị với định dạng đúng.
- Engine WebAssembly CPDF phải sẵn có để công cụ này hoạt động. Các bản tự lưu trữ cần cấu hình tệp CPDF WASM.

## Công cụ liên quan

- [Văn bản sang PDF](./txt-to-pdf)
- [Markdown sang PDF](./markdown-to-pdf)
- [CSV sang PDF](./csv-to-pdf)
