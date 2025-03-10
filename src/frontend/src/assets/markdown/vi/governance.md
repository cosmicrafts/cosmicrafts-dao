# Quản Trị
![Governance](govbanner.webp)

## Giới Thiệu

Cosmicrafts DAO đặt cộng đồng vào trung tâm, cho phép các Bên Liên Quan có tiếng nói thực sự trong việc phát triển dự án. Được xây dựng trên công nghệ đã được kiểm chứng, DAO sử dụng tính công bằng, minh bạch và ra quyết định dựa trên cộng đồng để đảm bảo Cosmicrafts luôn trung thành với tầm nhìn của mình.

::: info Hướng Dẫn Đọc
Tài liệu này phác thảo khung quản trị của Cosmicrafts DAO, tập trung vào quy trình ra quyết định, hệ thống đề xuất và sự tham gia của cộng đồng. Nó bổ sung cho tài liệu [Kinh Tế Token](/tokenomics), bao gồm các khía cạnh kinh tế.

- **Trọng Tâm Chính**: Quy trình quản trị, bỏ phiếu và ra quyết định cộng đồng
- **Tài Liệu Liên Quan**: [Kinh Tế Token](/tokenomics) cho kinh tế và tiện ích token
- **Tham Chiếu Chéo**: Tìm các hộp gợi ý liên kết đến các phần kinh tế token liên quan
:::

## Nguyên Tắc Cốt Lõi DAO

| Nguyên Tắc | Mô Tả |
|-----------|-------------|
| **Chủ Quyền Cộng Đồng** | • Quyền ra quyết định tập thể<br>• Quy trình quản trị minh bạch<br>• Bỏ phiếu trên chuỗi và thực thi tự động<br>|
| **Tăng Trưởng Bền Vững** | • Tạo giá trị dài hạn<br>• Phát triển hệ sinh thái cân bằng<br>• Quản lý kho bạc dựa trên cộng đồng<br>• Hệ thống đánh giá dựa trên dữ liệu |
| **Tham Gia Mở** | • Cấu trúc quản trị bao trùm<br>• Rào cản tham gia thấp<br>• Mở rộng dựa trên cộng đồng<br>• Khả năng truy cập đa chuỗi |

## Phân Phối Quyền Biểu Quyết

<div class="tokenomics-diagram">
  <img src="src/assets/icons/votingpower.svg" alt="Phân Bổ Token SPIRAL" />
</div>

<style>
.tokenomics-diagram {
  text-align: center;
  width: 100%;
  margin: 4rem auto;
}

.tokenomics-diagram img {
  width: 65%;
  max-width: 800px;
  height: auto;
  filter: none;
  box-shadow: none;
  background: transparent;
  margin: 0 auto;
  display: block;
}

@media (max-width: 768px) {
  .tokenomics-diagram img {
    width: 100%;
    max-width: 100%;
  }
}
</style>

::: info Quyền Biểu Quyết Động
Phân phối quyền biểu quyết thực tế sẽ dao động dựa trên quyết định của các bên liên quan về:
- Số lượng token được stake trong các nơ-ron
- Độ dài thời gian giải phóng được chọn
- Tuổi của nơ-ron tích lũy
Các yếu tố này có thể thay đổi đáng kể ảnh hưởng tương đối của các nhóm bên liên quan theo thời gian.
:::

| Nhóm Bên Liên Quan | Tỷ Lệ Biểu Quyết | Token Cơ Bản | Mục Đích |
|-------------------|--------------|-------------|----------|
| **Người Tham Gia SNS** | 50% | 120M | - Khối biểu quyết lớn nhất<br>- Quản trị dựa trên cộng đồng<br>- Tiềm năng tăng ảnh hưởng thông qua tham gia |
| **Đội Ngũ Phát Triển** | 33.3% | 80M | - Ra quyết định chiến lược<br>- Giải phóng 8 năm với hạn chế 1 năm<br>- Giảm dần ảnh hưởng |
| **Genesis/Seed** | 16.7% | 40M | - Đại diện người ủng hộ sớm<br>- Giải phóng theo giai đoạn (0-7 năm)<br>- Ảnh hưởng ban đầu cân bằng |

### Hệ Số Nhân Quyền Lực

| Yếu Tố | Bonus Tối Đa | Thời Gian Đạt Được |
|--------|---------------|-----------------|
| **Độ Trễ Giải Phóng** | +100% | 8 năm |
| **Tuổi Nơ-ron** | +100% | 1 năm |
| **Độ Trễ Giải Phóng Tối Thiểu** | N/A | 1 tháng |
| **Giới Hạn Kết Hợp** | 3x quyền lực cơ bản | N/A |

## Tích Hợp SNS

Cosmicrafts DAO tận dụng [Service Nervous System (SNS)](https://internetcomputer.org/docs/building-apps/governing-apps/overview) của Internet Computer cho cơ sở hạ tầng quản trị. Điều này cung cấp một khung quyết định phi tập trung an toàn và đã được kiểm chứng.

### Tính Năng Chính

- **Bỏ Phiếu Dựa Trên Nơ-ron**: Stake token SPIRAL để tạo nơ-ron và tham gia quản trị
- **Bonus Độ Trễ Giải Phóng**: Thời gian khóa dài hơn tăng quyền biểu quyết
- **Bonus Tuổi**: Nơ-ron tích lũy thêm quyền biểu quyết theo thời gian
- **Hệ Thống Đề Xuất**: Khung đề xuất SNS tiêu chuẩn cho mọi hành động quản trị

::: info Cấu Hình SNS
Để biết các thông số kỹ thuật chi tiết về thiết lập SNS của chúng tôi, bao gồm stake tối thiểu, thời gian bỏ phiếu và tỷ lệ phần thưởng, hãy tham khảo các thông số khởi tạo SNS trong tài liệu của chúng tôi.
:::

### Thông Số Quản Trị

| Thông Số | Giá Trị | Mục Đích |
|-----------|--------|---------|
| **Phí Từ Chối** | 1000 SPIRAL | Ngăn chặn đề xuất spam |
| **Thời Gian Bỏ Phiếu Ban Đầu** | 7 ngày | Thời gian thảo luận tiêu chuẩn |
| **Gia Hạn Thời Hạn Tối Đa** | 1 ngày | Cho phép tham gia muộn |
| **Stake Tối Thiểu Tạo Nơ-ron** | 1000 SPIRAL | Ngưỡng tham gia cơ bản |

## Cơ Chế Stake Nơ-ron

### Yêu Cầu Cơ Bản

| Thông Số | Giá Trị | Mô Tả |
|-----------|--------|-------------|
| **Stake Tối Thiểu** | 1,000 SPIRAL | Số lượng cơ bản để tạo nơ-ron |
| **Thời Gian Khóa Tối Thiểu** | 30 ngày | Độ trễ giải phóng ngắn nhất được phép |
| **Thời Gian Khóa Tối Đa** | 8 năm | Độ trễ giải phóng dài nhất có thể |
| **Phí Giao Dịch** | 0.01 SPIRAL | Chi phí vận hành mạng |

### Lịch Trình Trưởng Thành

| Thời Gian Khóa | Hệ Số Bonus | Quyền Lực Hiệu Quả |
|-------------|------------------|-----------------|
| 30 ngày | 1.0x | Quyền Lực Cơ Bản |
| 6 tháng | 1.25x | +25% |
| 1 năm | 1.5x | +50% |
| 2 năm | 1.75x | +75% |
| 4 năm | 1.85x | +85% |
| 8 năm | 2.0x | +100% |

## Khung Ra Quyết Định

### Lĩnh Vực Quản Trị

1. **Quản Lý Kho Bạc**
   - Chiến Dịch Tiếp Thị
   - Tài Trợ Phát Triển
   - Đối Tác Chiến Lược

2. **Chính Sách Kinh Tế**
   - Điều Chỉnh Kinh Tế Token
   - Tỷ Lệ Stake
   - Cấu Trúc Phí

3. **Lộ Trình Phát Triển**
   - Ưu Tiên Tính Năng
   - Mở Rộng Trò Chơi
   - Cải Tiến Kỹ Thuật

### Hệ Thống Đề Xuất

| Giai Đoạn | Thời Gian | Yêu Cầu |
|-------|----------|--------------|
| **Gửi** | N/A | 1,000 SPIRAL stake |
| **Đánh Giá** | 24 giờ | Phản hồi cộng đồng |
| **Bỏ Phiếu** | 7 ngày | Yêu cầu nơ-ron hoạt động |
| **Thực Thi** | Thay đổi | Tự động nếu được phê duyệt |

::: info Triển Khai Cộng Đồng
Để biết chi tiết thực tế về quản lý kho bạc, chương trình cộng đồng và sáng kiến phát triển hệ sinh thái, xem khung [Cộng Đồng](/community) của chúng tôi.
:::

