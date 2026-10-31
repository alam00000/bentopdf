---
title: Chữ ký số
description: Thêm chữ ký số mật mã vào PDF bằng chứng chỉ X.509. Hỗ trợ định dạng PKCS#12 và PEM với tùy chọn chữ ký hiển thị.
---

# Chữ ký số

Chữ ký số là bằng chứng mật mã cho thấy một người cụ thể đã ký tài liệu và tài liệu không bị thay đổi kể từ đó. Khác với chữ ký vẽ tay (chỉ là một hình ảnh), chữ ký số dùng chứng chỉ X.509 và chuẩn PKCS#7 để cung cấp tính xác thực và toàn vẹn có thể kiểm chứng.

BentoPDF áp dụng chữ ký số hoàn toàn trong trình duyệt của bạn. Khóa riêng của bạn không bao giờ rời khỏi thiết bị.

## Cách hoạt động

1. Tải lên một tệp PDF.
2. Tải lên tệp chứng chỉ của bạn (.pfx, .p12 hoặc .pem).
3. Nhập mật khẩu chứng chỉ để mở khóa. Công cụ hiển thị chủ thể, nhà phát hành và thời hạn hiệu lực của chứng chỉ.
4. Có thể cấu hình metadata chữ ký (lý do, địa điểm, thông tin liên hệ).
5. Có thể bật **chữ ký hiển thị** với tùy chỉnh vị trí, kích thước, hình ảnh và văn bản.
6. Nhấp **Ký PDF**.

## Định dạng chứng chỉ được hỗ trợ

| Định dạng   | Phần mở rộng | Mô tả                                                                                                 |
| ----------- | ------------ | ----------------------------------------------------------------------------------------------------- |
| **PKCS#12** | .pfx, .p12   | Gói chuẩn công nghiệp chứa khóa riêng và chuỗi chứng chỉ. Định dạng phổ biến nhất.                    |
| **PEM**     | .pem         | Định dạng văn bản. Phải chứa cả chứng chỉ và khóa riêng trong một tệp. Hỗ trợ khóa riêng được mã hóa. |

## Tùy chọn chữ ký hiển thị

Khi bật, một khối chữ ký hiển thị được vẽ trên trang PDF:

- **Vị trí**: Tọa độ X/Y và chiều rộng/chiều cao tính bằng point
- **Trang**: Trang đầu, trang cuối, tất cả các trang hoặc một số trang cụ thể
- **Hình ảnh**: Tải lên ảnh PNG, JPG hoặc WebP (chữ ký tay, con dấu công ty, v.v.)
- **Văn bản**: Văn bản tùy chỉnh với màu và cỡ chữ có thể cấu hình. Nếu không có hình ảnh hoặc văn bản, công cụ tự tạo văn bản từ tên chung (common name) của chứng chỉ và ngày hiện tại.

## Metadata chữ ký

- **Lý do**: Vì sao tài liệu được ký (ví dụ: "Đã phê duyệt", "Đã xem xét")
- **Địa điểm**: Nơi việc ký diễn ra (ví dụ: "New York, NY")
- **Thông tin liên hệ**: Cách liên lạc với người ký (ví dụ: địa chỉ email)

## Lưu ý về kết nối Internet

Việc ký có thể cần kết nối Internet. Thư viện ký tải chuỗi chứng chỉ từ các URL nhúng trong phần mở rộng Authority Information Access (AIA) của chứng chỉ. Nếu không truy cập được các máy chủ đó, việc ký sẽ thất bại với các chứng chỉ cần xác thực chuỗi.

## Trường hợp sử dụng

- Ký hợp đồng, đề xuất và thỏa thuận bằng chữ ký số có giá trị pháp lý
- Chứng thực tài liệu chính thức trong quy trình yêu cầu xác thực dựa trên PKI
- Ký hóa đơn PDF để tuân thủ quy định (nhiều nước EU yêu cầu hóa đơn điện tử có chữ ký số)
- Thêm phê duyệt của tổ chức vào bản vẽ kỹ thuật hoặc tài liệu chất lượng

## Mẹo

- Chứng chỉ tự ký dùng được để thử nghiệm nhưng sẽ hiện cảnh báo trong Adobe Reader. Hãy dùng chứng chỉ từ một Tổ chức cấp chứng chỉ (CA) đáng tin cậy cho tài liệu chính thức.
- Chữ ký hiển thị chỉ mang tính trực quan. Chữ ký mật mã luôn được nhúng dù khối hiển thị có được bật hay không.
- Hãy xác minh PDF đã ký bằng công cụ Xác thực chữ ký để chắc chắn chữ ký còn nguyên vẹn.

## Công cụ liên quan

- [Xác thực chữ ký](./validate-signature-pdf): xác minh chữ ký số trong PDF đã ký
- [Làm phẳng PDF](./flatten-pdf): làm phẳng biểu mẫu trước khi ký để ngăn chỉnh sửa
- [Mã hóa PDF](./protect-pdf): thêm bảo vệ bằng mật khẩu lên trên chữ ký số
- [Xóa metadata](./remove-metadata): loại bỏ metadata trước khi ký
