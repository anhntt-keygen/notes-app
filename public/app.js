// ==========================================
// MOCK DATA BAN ĐẦU - PHỤC VỤ TRẢI NGHIỆM LIỀN MẠCH [TASK-01]
// ==========================================
const DEFAULT_MENU = [
  { id: 'm1', name: 'Cà Phê Muối Cozy', category: 'Coffee', basePrice: 29000, image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' },
  { id: 'm2', name: 'Bạc Sỉu Sữa Đặc', category: 'Coffee', basePrice: 25000, image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' },
  { id: 'm3', name: 'Trà Đào Hồng Đài', category: 'Tea', basePrice: 35000, image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' },
  { id: 'm4', name: 'Trà Oolong Sen Vàng', category: 'Tea', basePrice: 39000, image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' },
  { id: 'm5', name: 'Bánh Mousse Matcha', category: 'Cake', basePrice: 42000, image: 'https://images.unsplash.com/photo-1536680465769-2365207b035e?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' },
  { id: 'm6', name: 'Croissant Phô Mai', category: 'Cake', basePrice: 30000, image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' },
];

const DEFAULT_ORDERS = [
  {
    id: "CF-8924",
    items: [
      { id: "m1", name: "Cà Phê Muối Cozy", size: "M", sugar: "100%", ice: "100%", note: "Nhiều muối béo", quantity: 1, finalPrice: 35000 }
    ],
    totalPrice: 35000,
    status: "Completed",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString() // 2 tiếng trước
  },
  {
    id: "CF-3412",
    items: [
      { id: "m3", name: "Trà Đào Hồng Đài", size: "L", sugar: "70%", ice: "100%", note: "", quantity: 2, finalPrice: 90000 }
    ],
    totalPrice: 90000,
    status: "Pending",
    createdAt: new Date().toISOString()
  }
];

// STATE MANAGEMENT
let menu = [...DEFAULT_MENU];
let orders = [];
let cart = [];
let activeCategory = 'all';
let searchKeyword = '';
let orderFilter = 'all';
let currentSelectingItem = null;

// ==========================================
// KHỞI ĐỘNG HỆ THỐNG VÀ ĐỒNG BỘ LOCALSTORAGE [TASK-04]
// ==========================================
function initSystem() {
  const localOrders = localStorage.getItem('cafe_orders');
  if (localOrders) {
    orders = JSON.parse(localOrders);
  } else {
    orders = [...DEFAULT_ORDERS];
    saveOrdersToLocal();
  }
  
  bindEvents();
  renderMenu();
  renderCart();
  renderOrders();
  updateDashboard();
}

function saveOrdersToLocal() {
  localStorage.setItem('cafe_orders', JSON.stringify(orders));
}

// ==========================================
// RENDER GIAO DIỆN (VIEW RENDERING) [TASK-02]
// ==========================================

// Render danh sách món nước/bánh ngọt trong menu
function renderMenu() {
  const menuGrid = document.getElementById('menu-grid');
  menuGrid.innerHTML = '';

  const filteredMenu = menu.filter(item => {
    const matchCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchSearch = item.name.toLowerCase().includes(searchKeyword.toLowerCase());
    return matchCategory && matchSearch;
  });

  if (filteredMenu.length === 0) {
    menuGrid.innerHTML = `
      <div class="col-span-full bg-white p-12 text-center rounded-2xl border border-dashed border-gray-300">
        <i class="fa-solid fa-cookie-bite text-4xl text-gray-300 mb-2"></i>
        <p class="text-sm text-gray-500 font-medium">Không tìm thấy món uống nào phù hợp</p>
      </div>
    `;
    return;
  }

  filteredMenu.forEach(item => {
    const card = document.createElement('div');
    card.className = "bg-white rounded-2xl p-4 flex gap-4 border border-[#EFEBE9] hover:shadow-md transition-all duration-300";
    card.innerHTML = `
      <img src="${item.image}" alt="${item.name}" class="w-20 h-20 rounded-xl object-cover border border-[#EFEBE9] bg-[#FAF8F5]">
      <div class="flex-grow flex flex-col justify-between">
        <div>
          <span class="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${getCategoryBadgeColor(item.category)}">${getCategoryText(item.category)}</span>
          <h4 class="font-bold text-sm text-[#3E2723] mt-1 line-clamp-1">${item.name}</h4>
          <span class="text-xs font-bold text-[#8D6E63] mt-0.5 block">${formatPrice(item.basePrice)}</span>
        </div>
        <div class="flex justify-end">
          <button onclick="openCustomModal('${item.id}')" class="add-to-cart-trigger bg-[#FAF8F5] hover:bg-[#8D6E63] hover:text-white text-[#8D6E63] text-xs font-bold py-1.5 px-3 rounded-lg border border-[#8D6E63]/20 transition-all duration-200 flex items-center gap-1">
            <i class="fa-solid fa-plus text-[10px]"></i> Chọn món
          </button>
        </div>
      </div>
    `;
    menuGrid.appendChild(card);
  });
}

// Render giỏ hàng (Cart)
function renderCart() {
  const cartContainer = document.getElementById('cart-items');
  const cartCountBadge = document.getElementById('cart-count-badge');
  const cartTotalPrice = document.getElementById('cart-total-price');
  const btnCreateOrder = document.getElementById('btn-create-order');

  cartContainer.innerHTML = '';
  
  if (cart.length === 0) {
    cartContainer.innerHTML = `
      <div class="flex flex-col items-center justify-center py-12 text-center text-gray-400">
        <i class="fa-solid fa-mug-saucer text-4xl mb-3 text-gray-300"></i>
        <p class="text-sm font-medium">Giỏ hàng chưa có món nước nào.</p>
        <span class="text-xs text-gray-400 mt-1">Vui lòng chọn món ngon từ Menu để bắt đầu order</span>
      </div>
    `;
    cartCountBadge.textContent = '0 món';
    cartTotalPrice.textContent = '0đ';
    btnCreateOrder.disabled = true;
    return;
  }

  let totalSum = 0;
  let totalQuantity = 0;

  cart.forEach((item, index) => {
    totalSum += item.finalPrice * item.quantity;
    totalQuantity += item.quantity;

    const row = document.createElement('div');
    row.className = "bg-[#FAF8F5] p-3 rounded-xl border border-[#EFEBE9] flex justify-between items-center gap-2";
    row.innerHTML = `
      <div class="flex-grow">
        <div class="flex items-center gap-2">
          <span class="font-bold text-sm text-[#5D4037]">${item.name}</span>
          <span class="text-[10px] bg-[#8D6E63] text-white font-bold px-1.5 py-0.2 rounded">Size ${item.size}</span>
        </div>
        <p class="text-[11px] text-gray-500 mt-0.5">Đường: ${item.sugar} | Đá: ${item.ice} ${item.note ? ` | Note: ${item.note}` : ''}</p>
        <span class="text-xs font-bold text-[#8D6E63]">${formatPrice(item.finalPrice * item.quantity)}</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="flex items-center border border-[#E0D8D0] rounded-lg bg-white overflow-hidden">
          <button onclick="updateCartQty(${index}, -1)" class="px-2 py-1 hover:bg-gray-100 text-xs font-bold">-</button>
          <span class="px-2 text-xs font-bold min-w-[20px] text-center">${item.quantity}</span>
          <button onclick="updateCartQty(${index}, 1)" class="px-2 py-1 hover:bg-gray-100 text-xs font-bold">+</button>
        </div>
        <button onclick="removeFromCart(${index})" class="text-red-500 hover:text-red-700 p-1">
          <i class="fa-solid fa-trash-can text-sm"></i>
        </button>
      </div>
    `;
    cartContainer.appendChild(row);
  });

  cartCountBadge.textContent = `${totalQuantity} món`;
  cartTotalPrice.textContent = formatPrice(totalSum);
  btnCreateOrder.disabled = false;
}

// Render Board quản lý các trạng thái đơn hàng [SC-02]
function renderOrders() {
  const ordersListContainer = document.getElementById('orders-list');
  const ordersCountBadge = document.getElementById('orders-count');
  ordersListContainer.innerHTML = '';

  const filteredOrders = orders.filter(order => {
    if (orderFilter === 'all') return true;
    return order.status === orderFilter;
  });

  ordersCountBadge.textContent = `${filteredOrders.length} đơn`;

  if (filteredOrders.length === 0) {
    ordersListContainer.innerHTML = `
      <div class="flex flex-col items-center justify-center py-16 text-center text-gray-400">
        <i class="fa-solid fa-rectangle-list text-3xl mb-2 text-gray-300"></i>
        <p class="text-sm font-medium">Không có đơn hàng nào.</p>
      </div>
    `;
    return;
  }

  // Sắp xếp đơn hàng mới tạo lên đầu
  const sortedOrders = [...filteredOrders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  sortedOrders.forEach(order => {
    const card = document.createElement('div');
    card.className = `border rounded-xl p-4 transition-all duration-200 shadow-sm bg-white border-l-4 ${getStatusBorderColor(order.status)}`;
    
    // Tạo danh sách món hiển thị gọn nhẹ
    const itemsHtml = order.items.map(it => `
      <div class="text-xs text-gray-700 flex justify-between py-1 border-b border-[#FAF8F5]">
        <span><strong>${it.quantity}x</strong> ${it.name} <span class="text-gray-400 text-[10px]">(${it.size}, ${it.sugar} đường, ${it.ice} đá)</span></span>
        <span class="font-bold text-[#5D4037]">${formatPrice(it.finalPrice * it.quantity)}</span>
      </div>
    `).join('');

    card.innerHTML = `
      <div class="flex justify-between items-start mb-2">
        <div>
          <span class="text-xs font-bold text-gray-500">MÃ ĐƠN:</span>
          <span class="text-sm font-extrabold text-[#3E2723]">${order.id}</span>
        </div>
        <span class="text-[11px] font-bold px-2 py-0.5 rounded-full ${getStatusBadgeColor(order.status)}">
          ${getStatusText(order.status)}
        </span>
      </div>

      <div class="space-y-1 mb-3">
        ${itemsHtml}
      </div>

      <div class="flex justify-between items-center pt-2 border-t border-dashed border-[#EFEBE9] mb-3">
        <span class="text-xs text-gray-500">Tổng thanh toán:</span>
        <span class="text-sm font-extrabold text-[#5D4037]">${formatPrice(order.totalPrice)}</span>
      </div>

      <!-- Quick Action Change Status Buttons -->
      <div class="flex flex-wrap gap-1.5 justify-end">
        ${renderActionButtons(order)}
      </div>
    `;
    ordersListContainer.appendChild(card);
  });
}

// Render nút chuyển đổi trạng thái của từng đơn hàng
function renderActionButtons(order) {
  let buttons = '';
  if (order.status === 'Pending') {
    buttons += `
      <button onclick="updateOrderStatus('${order.id}', 'Preparing')" class="btn-prepare bg-blue-50 hover:bg-blue-100 text-blue-600 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-blue-200 transition-all">
        ☕ Nhận pha chế
      </button>
      <button onclick="updateOrderStatus('${order.id}', 'Cancelled')" class="btn-cancel bg-red-50 hover:bg-red-100 text-red-600 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-red-200 transition-all">
        🚫 Hủy đơn
      </button>
    `;
  } else if (order.status === 'Preparing') {
    buttons += `
      <button onclick="updateOrderStatus('${order.id}', 'Completed')" class="btn-complete bg-green-50 hover:bg-green-100 text-green-600 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-green-200 transition-all">
        ✅ Đã hoàn thành
      </button>
      <button onclick="updateOrderStatus('${order.id}', 'Cancelled')" class="btn-cancel bg-red-50 hover:bg-red-100 text-red-600 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-red-200 transition-all">
        🚫 Hủy đơn
      </button>
    `;
  } else {
    buttons += `
      <span class="text-[10px] text-gray-400 font-medium">Đơn hàng đã đóng</span>
    `;
  }
  return buttons;
}

// ==========================================
// THỐNG KÊ DOANH THU & DASHBOARD [SC-03]
// ==========================================
function updateDashboard() {
  const statTotalRevenue = document.getElementById('stat-total-revenue');
  const statCompletedOrders = document.getElementById('stat-completed-orders');
  const statCancelledOrders = document.getElementById('stat-cancelled-orders');
  const statBestseller = document.getElementById('stat-bestseller');

  // Tính doanh thu từ đơn hàng Completed
  const completedList = orders.filter(o => o.status === 'Completed');
  const totalRevenue = completedList.reduce((sum, o) => sum + o.totalPrice, 0);
  const totalCancelled = orders.filter(o => o.status === 'Cancelled').length;

  statTotalRevenue.textContent = formatPrice(totalRevenue);
  statCompletedOrders.textContent = `${completedList.length} đơn`;
  statCancelledOrders.textContent = `${totalCancelled} đơn`;

  // Tính toán món Best-seller
  const itemCounts = {};
  completedList.forEach(o => {
    o.items.forEach(it => {
      itemCounts[it.name] = (itemCounts[it.name] || 0) + it.quantity;
    });
  });

  let bestsellerName = "Chưa có";
  let maxQty = 0;
  for (const [name, qty] of Object.entries(itemCounts)) {
    if (qty > maxQty) {
      maxQty = qty;
      bestsellerName = `${name} (${qty} ly)`;
    }
  }
  statBestseller.textContent = bestsellerName;
}

// ==========================================
// CORE BUSINESS FUNCTIONS & EVENT BINDINGS [TASK-03]
// ==========================================
function bindEvents() {
  // Lọc Category Menu
  const catButtons = document.querySelectorAll('.cat-btn');
  catButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      catButtons.forEach(b => b.classList.replace('bg-[#8D6E63]', 'bg-[#F5F2EB]'));
      catButtons.forEach(b => b.classList.replace('text-white', 'text-[#5D4037]'));
      
      btn.classList.replace('bg-[#F5F2EB]', 'bg-[#8D6E63]');
      btn.classList.replace('text-[#5D4037]', 'text-white');

      activeCategory = btn.getAttribute('data-cat');
      renderMenu();
    });
  });

  // Tìm kiếm món
  document.getElementById('search-input').addEventListener('input', (e) => {
    searchKeyword = e.target.value;
    renderMenu();
  });

  // Lọc danh sách Order Dashboard
  const filterButtons = document.querySelectorAll('.order-filter-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => {
        b.classList.remove('bg-[#8D6E63]', 'text-white');
        b.classList.add('bg-[#F5F2EB]', 'text-gray-700');
      });
      btn.classList.add('bg-[#8D6E63]', 'text-white');
      
      orderFilter = btn.getAttribute('data-filter');
      renderOrders();
    });
  });

  // Đóng modal lựa chọn
  document.getElementById('btn-close-modal').addEventListener('click', closeModal);
  
  // Thay đổi option trong modal để tính giá realtime
  const sizeRadios = document.querySelectorAll('input[name="modal-size"]');
  sizeRadios.forEach(radio => {
    radio.addEventListener('change', updateModalCalculatedPrice);
  });

  // Xác nhận thêm món vào giỏ hàng
  document.getElementById('btn-add-to-cart-confirm').addEventListener('click', () => {
    if (!currentSelectingItem) return;

    const selectedSize = document.querySelector('input[name="modal-size"]:checked').value;
    const selectedSugar = document.querySelector('input[name="modal-sugar"]:checked').value;
    const selectedIce = document.querySelector('input[name="modal-ice"]:checked').value;
    const note = document.getElementById('modal-item-note').value.trim();
    const finalPrice = calculateFinalPrice(currentSelectingItem.basePrice, selectedSize);

    // Thêm vào giỏ
    const cartItem = {
      id: currentSelectingItem.id,
      name: currentSelectingItem.name,
      size: selectedSize,
      sugar: selectedSugar,
      ice: selectedIce,
      note: note,
      quantity: 1,
      finalPrice: finalPrice
    };

    cart.push(cartItem);
    renderCart();
    closeModal();
    showToast(`Đã thêm ${currentSelectingItem.name} vào giỏ hàng!`, 'success');
  });

  // Xác nhận tạo đơn hàng [SC-01]
  document.getElementById('btn-create-order').addEventListener('click', () => {
    if (cart.length === 0) return;

    const totalSum = cart.reduce((sum, item) => sum + item.finalPrice * item.quantity, 0);
    const newOrderId = `CF-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder = {
      id: newOrderId,
      items: [...cart],
      totalPrice: totalSum,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    orders.unshift(newOrder);
    saveOrdersToLocal();
    
    // Reset giỏ hàng
    cart = [];
    renderCart();
    renderOrders();
    updateDashboard();
    
    showToast(`Tạo đơn hàng ${newOrderId} thành công!`, 'success');
  });

  // Reset dữ liệu mẫu [SC-03]
  document.getElementById('btn-reset-demo').addEventListener('click', () => {
    localStorage.removeItem('cafe_orders');
    orders = [...DEFAULT_ORDERS];
    saveOrdersToLocal();
    cart = [];
    renderCart();
    renderOrders();
    updateDashboard();
    showToast("Đã khôi phục dữ liệu mẫu thành công!", "info");
  });
}

// ==========================================
// UTILS & HELPER FUNCTIONS
// ==========================================
function openCustomModal(itemId) {
  const item = menu.find(m => m.id === itemId);
  if (!item) return;

  currentSelectingItem = item;
  document.getElementById('modal-item-name').textContent = item.name;
  document.getElementById('modal-item-note').value = '';
  
  // Reset radios về default
  document.querySelector('input[name="modal-size"][value="S"]').checked = true;
  document.querySelector('input[name="modal-sugar"][value="100%"]').checked = true;
  document.querySelector('input[name="modal-ice"][value="100%"]').checked = true;

  updateModalCalculatedPrice();

  // Hiển thị modal
  document.getElementById('option-modal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('option-modal').classList.add('hidden');
  currentSelectingItem = null;
}

function updateModalCalculatedPrice() {
  if (!currentSelectingItem) return;
  const selectedSize = document.querySelector('input[name="modal-size"]:checked').value;
  const finalPrice = calculateFinalPrice(currentSelectingItem.basePrice, selectedSize);
  document.getElementById('modal-calculated-price').textContent = formatPrice(finalPrice);
}

function calculateFinalPrice(basePrice, size) {
  if (size === 'M') return basePrice + 6000;
  if (size === 'L') return basePrice + 10000;
  return basePrice;
}

function updateCartQty(index, offset) {
  if (cart[index]) {
    cart[index].quantity += offset;
    if (cart[index].quantity <= 0) {
      cart.splice(index, 1);
    }
    renderCart();
  }
}

function removeFromCart(index) {
  cart.splice(index, 1);
  renderCart();
  showToast("Đã xóa món khỏi giỏ hàng", "info");
}

function updateOrderStatus(orderId, nextStatus) {
  const orderIndex = orders.findIndex(o => o.id === orderId);
  if (orderIndex !== -1) {
    orders[orderIndex].status = nextStatus;
    saveOrdersToLocal();
    renderOrders();
    updateDashboard();
    showToast(`Đơn hàng ${orderId} đã chuyển sang: ${getStatusText(nextStatus)}`, 'success');
  }
}

function formatPrice(num) {
  return num.toLocaleString('vi-VN') + 'đ';
}

function getCategoryBadgeColor(cat) {
  if (cat === 'Coffee') return 'bg-amber-100 text-amber-800';
  if (cat === 'Tea') return 'bg-teal-100 text-teal-800';
  return 'bg-pink-100 text-pink-800';
}

function getCategoryText(cat) {
  if (cat === 'Coffee') return 'Cà phê';
  if (cat === 'Tea') return 'Trà nước';
  return 'Bánh ngọt';
}

function getStatusBorderColor(status) {
  if (status === 'Pending') return 'border-l-orange-500';
  if (status === 'Preparing') return 'border-l-blue-500';
  if (status === 'Completed') return 'border-l-green-500';
  return 'border-l-red-500';
}

function getStatusBadgeColor(status) {
  if (status === 'Pending') return 'bg-orange-100 text-orange-800';
  if (status === 'Preparing') return 'bg-blue-100 text-blue-800';
  if (status === 'Completed') return 'bg-green-100 text-green-800';
  return 'bg-red-100 text-red-800';
}

function getStatusText(status) {
  if (status === 'Pending') return 'Chờ xử lý';
  if (status === 'Preparing') return 'Đang pha chế';
  if (status === 'Completed') return 'Hoàn thành';
  return 'Đã hủy';
}

// Hiển thị thông báo Toast nhanh
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  
  const bgType = type === 'success' ? 'bg-[#5D4037]' : 'bg-[#8D6E63]';
  toast.className = `${bgType} text-white text-xs font-bold px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-zoom-in min-w-[200px]`;
  toast.innerHTML = `
    <i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-info'} text-white"></i>
    <span>${message}</span>
  `;
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// Khởi chạy
window.addEventListener('DOMContentLoaded', initSystem);
```

---