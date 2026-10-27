---
title: PDF sang PDF/A
description: Chuyển PDF tiêu chuẩn sang định dạng PDF/A để lưu trữ lâu dài. Hỗ trợ các mức tuân thủ PDF/A-1b, PDF/A-2b và PDF/A-3b.
---

# PDF sang PDF/A

PDF/A là tập con của PDF được tiêu chuẩn hóa theo ISO, thiết kế cho việc bảo quản kỹ thuật số lâu dài. Công cụ này chuyển PDF tiêu chuẩn của bạn thành tài liệu tuân thủ PDF/A bằng Ghostscript chạy trực tiếp trong trình duyệt.

## Cách hoạt động

1. Tải lên một hoặc nhiều tệp PDF.
2. Chọn **Phiên bản PDF/A** từ danh sách thả xuống.
3. Tùy chọn bật **Làm phẳng PDF trước** cho các tệp phức tạp không chuyển đổi được theo cách thông thường.
4. Nhấp **Chuyển đổi sang PDF/A**. Nhiều tệp sẽ tạo ra kho ZIP.

## Các phiên bản PDF/A

| Phiên bản    | Hạn chế                                         | Phù hợp nhất cho                           |
| ------------ | ----------------------------------------------- | ------------------------------------------ |
| **PDF/A-1b** | Nghiêm ngặt nhất. Không trong suốt, không lớp.  | Tương thích tối đa với hệ thống lưu trữ cũ |
| **PDF/A-2b** | Cho phép trong suốt và JPEG2000.                | Lưu trữ đa dụng (khuyến nghị)              |
| **PDF/A-3b** | Cho phép tệp đính kèm nhúng ở bất kỳ định dạng. | Lưu trữ tài liệu kèm tệp dữ liệu nguồn     |

PDF/A-2b được chọn mặc định và phù hợp với đại đa số nhu cầu lưu trữ.

## Tùy chọn làm phẳng trước

Một số PDF chứa tính năng ngăn việc chuyển sang PDF/A suôn sẻ: mã hóa phông chữ bất thường, chồng trong suốt phức tạp hoặc cấu trúc nội bộ bị hỏng. Bật **Làm phẳng trước** sẽ rasterize PDF ở 300 DPI trước khi chuyển đổi, đảm bảo tuân thủ nhưng đổi lại văn bản không còn chọn được. Hãy dùng nó như phương án dự phòng khi chuyển đổi thông thường báo lỗi.

Làm phẳng trước yêu cầu engine PyMuPDF WASM.

## Trường hợp sử dụng

- Đáp ứng yêu cầu lưu trữ của chính phủ hoặc pháp lý (nhiều khu vực pháp lý bắt buộc PDF/A cho hồ sơ tòa án)
- Nộp tài liệu cho kho lưu trữ của tổ chức hoặc thư viện số
- Bảo quản hồ sơ doanh nghiệp khi phần mềm gốc có thể không còn tồn tại sau mười năm
- Chuẩn bị hóa đơn cho các tiêu chuẩn hóa đơn điện tử yêu cầu PDF/A-3b kèm tệp XML đính kèm

## Mẹo

- Hãy thử chuyển đổi không làm phẳng trước. Chỉ bật khi gặp lỗi.
- PDF/A nhúng tất cả phông chữ, nên tệp đầu ra thường lớn hơn bản gốc.
- Hãy xác thực đầu ra bằng công cụ xác thực PDF/A chuyên dụng nếu quy trình của bạn yêu cầu tuân thủ nghiêm ngặt.

## Công cụ liên quan

- [Nén PDF](./compress-pdf): giảm dung lượng tệp sau khi chuyển đổi
- [Làm phẳng PDF](./flatten-pdf): làm phẳng biểu mẫu trước khi chuyển sang PDF/A
- [Xóa Metadata](./remove-metadata): loại bỏ metadata trước khi lưu trữ
