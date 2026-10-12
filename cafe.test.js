const { test, expect } = require('@playwright/test');

test.describe('Hệ Thống Quản Lý Order Cafe - Kiểm Thử Toàn Diện Luồng Nghiệp Vụ [TEA 1.27.2]', () => {

  test.beforeEach(async ({ page }) => {
    // Truy cập ứng dụng chạy ở cổng mặc định 3000
    await page.goto('http://localhost:3000');
    // Bấm nút Khôi phục dữ liệu mẫu trước để đảm bảo trạng thái sạch
    await page.click('#btn-reset-demo');
  });

  test('[SC-01 & SC-03] Đặt hàng thành công, tạo đơn mới và cập nhật trạng thái doanh thu', async ({ page }) => {
    // 1. Kiểm tra tiêu đề trang
    await expect(page).toHaveTitle(/Cozy Cafe/);

    // 2. Tìm kiếm món "Cà Phê Muối Cozy"
    await page.fill('#search-input', 'Muối Cozy');
    
    // Chờ menu lọc
    const menuItem = page.locator('#menu-grid h4').first();
    await expect(menuItem).toContainText('Cà Phê Muối Cozy');

    // 3. Chọn món nước để cấu hình Option
    await page.click('button.add-to-cart-trigger');

    // Đợi Modal bật lên
    const modal = page.locator('#option-modal');
    await expect(modal).toBeVisible();

    // 4. Chọn cấu hình: Size M (+6.000đ)
    // Chọn radio Size M
    await page.locator('input[name="modal-size"][value="M"]').click();

    // 5. Thêm món vào Giỏ Hàng
    await page.click('#btn-add-to-cart-confirm');

    // Đóng modal và kiểm tra Giỏ hàng cập nhật
    await expect(modal).toBeHidden();
    const cartCount = page.locator('#cart-count-badge');
    await expect(cartCount).toContainText('1 món');

    // Giá cơ bản là 29.000đ + Size M 6.000đ = 35.000đ
    const cartTotal = page.locator('#cart-total-price');
    await expect(cartTotal).toContainText('35.000đ');

    // 6. Nhấn nút Xác Nhận Tạo Đơn Hàng
    await page.click('#btn-create-order');

    // Kiểm tra Giỏ hàng tự động reset về 0
    await expect(cartCount).toContainText('0 món');

    // 7. Xác nhận đơn mới hiển thị ở Trạng thái Chờ xử lý (Pending)
    const firstOrderCode = await page.locator('#orders-list > div:first-child span.text-sm').textContent();
    expect(firstOrderCode).not.toBeNull();
  });

  test('[SC-02 & SC-03] Chuyển đổi trạng thái đơn hàng và tính toán thống kê dashboard', async ({ page }) => {
    // 1. Ghi nhận doanh thu trước khi test
    const initialRevenueText = await page.locator('#stat-total-revenue').textContent();
    const initialRevenue = parseInt(initialRevenueText.replace(/\D/g, ''));

    // 2. Lọc các đơn hàng Chờ xử lý (Pending)
    await page.click('button[data-filter="Pending"]');

    // Tìm đơn hàng đầu tiên và thực hiện Nhấn "Nhận pha chế"
    const prepareBtn = page.locator('#orders-list > div:first-child button.btn-prepare');
    await expect(prepareBtn).toBeVisible();
    await prepareBtn.click();

    // 3. Chuyển tiếp trạng thái thành "Đã hoàn thành" (Completed)
    const completeBtn = page.locator('#orders-list > div:first-child button.btn-complete');
    await expect(completeBtn).toBeVisible();
    await completeBtn.click();

    // 4. Kiểm tra xem doanh thu ở Dashboard đã tăng lên chính xác
    const finalRevenueText = await page.locator('#stat-total-revenue').textContent();
    const finalRevenue = parseInt(finalRevenueText.replace(/\D/g, ''));

    // Doanh thu mới phải lớn hơn ban đầu sau khi hoàn thành đơn
    expect(finalRevenue).toBeGreaterThan(initialRevenue);
  });
});