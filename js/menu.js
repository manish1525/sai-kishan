// ============================================================
//  Hotel New Kishan – Customer Menu Logic
// ============================================================

// API helpers loaded from js/api.js
let cart = [];
let currentType = 'veg';
let currentMode = null;
let fullMenu = [];
let trackingInterval = null;



// ── Init ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    // Load address and UPI from settings
    try {
        const s = await apiGet('/settings');
        if (s.hotel_address) document.getElementById('hotel-address-text').textContent = s.hotel_address;
        if (s.hotel_phone) document.getElementById('hotel-phone-text').textContent = s.hotel_phone;
        window._hotelUpiId = s.upi_id || 'example@ybl'; // Default fallback
        const upiEl = document.getElementById('hotel-upi-id');
        if (upiEl) upiEl.textContent = window._hotelUpiId;
    } catch (e) { 
        document.getElementById('hotel-address-text').textContent = '9665843401';
        window._hotelUpiId = 'example@ybl';
    }

    fullMenu = await apiGet('/menu');
    document.getElementById('mode-section').classList.remove('hidden');
});

// ── Mode ──────────────────────────────────────────────────────
function selectMode(mode) {
    currentMode = mode;
    if (mode === 'dinein') document.getElementById('table-modal').classList.remove('hidden');
    else document.getElementById('delivery-modal').classList.remove('hidden');
}

function confirmTable() {
    const v = document.getElementById('table-input').value.trim();
    if (!v) { showToast('Please enter table number!', 'error'); return; }
    window._tableNo = v;
    document.getElementById('table-modal').classList.add('hidden');
    loadMenuSection();
}

function confirmDelivery() {
    const name = document.getElementById('del-name').value.trim();
    const phone = document.getElementById('del-phone').value.trim();
    const address = document.getElementById('del-address').value.trim();
    if (!name || !address) { showToast('Name and address are required', 'error'); return; }
    window._deliveryInfo = { name, phone, address };
    document.getElementById('delivery-modal').classList.add('hidden');
    loadMenuSection();
}

function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

// ── Menu Section ──────────────────────────────────────────────
function loadMenuSection() {
    document.getElementById('mode-section').classList.add('hidden');
    document.getElementById('menu-section').classList.remove('hidden');
    document.getElementById('sticky-nav').classList.remove('hidden');
    document.getElementById('cart-section').classList.remove('hidden');

    const badge = document.getElementById('mode-badge');
    if (currentMode === 'dinein') {
        badge.textContent = '🍽️ Table ' + window._tableNo;
        badge.className = 'mode-badge dinein';
    } else {
        badge.textContent = '🛵 Delivery: ' + window._deliveryInfo.name;
        badge.className = 'mode-badge delivery';
    }
    renderMenu();
    updateCartUI();
}

function switchType(type) {
    currentType = type;
    document.getElementById('veg-btn').classList.toggle('active', type === 'veg');
    document.getElementById('nonveg-btn').classList.toggle('active', type === 'nonveg');
    updateBanner(type);
    renderMenu();
}

function updateBanner(type) {
    const img = document.getElementById('banner-img');
    const title = document.getElementById('banner-title');
    const desc = document.getElementById('banner-desc');
    if (type === 'veg') {
        img.src = `images/veg_food.png`; title.textContent = '🟢 Vegetarian Menu'; desc.textContent = 'Fresh, flavorful & 100% vegetarian dishes';
    } else {
        img.src = `images/chicken_dish.png`; title.textContent = '🔴 Non-Vegetarian Menu'; desc.textContent = 'Succulent, spicy and irresistible non-veg delights';
    }
}

function renderMenu() {
    const menu = fullMenu.filter(i => i.type === currentType);
    const cats = [...new Set(menu.map(i => i.category))];
    const container = document.getElementById('menu-container');
    container.innerHTML = '';
    if (!menu.length) {
        container.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:40px;">No items found.</p>';
        return;
    }
    cats.forEach(cat => {
        const items = menu.filter(i => i.category === cat);
        const sec = document.createElement('div');
        sec.className = 'category-section';
        sec.innerHTML = `
      <div class="category-header" onclick="toggleCat('c-${slug(cat)}')">
        <span>${getCatIcon(cat)} ${cat}</span>
        <span class="chevron" id="chev-${slug(cat)}">▼</span>
      </div>
      <div class="category-items" id="c-${slug(cat)}">
        ${items.map(renderCard).join('')}
      </div>`;
        container.appendChild(sec);
    });
}

function renderCard(item) {
    const inCart = cart.find(c => c.id === item.id);
    const qty = inCart ? inCart.qty : 0;
    const dot = item.type === 'veg'
        ? '<span class="veg-dot"><span></span></span>'
        : '<span class="nonveg-dot"><span></span></span>';
    const nameHi = item.nameHi ? `<span class="item-name-hi">${item.nameHi}</span>` : '';
    return `<div class="menu-card" id="card-${item.id}">
    <div class="menu-card-info">
      ${dot}
      <div style="flex:1;min-width:0;">
        <div class="menu-card-name">${item.emoji || '🍽️'} ${item.name}</div>
        ${nameHi}
        <div class="menu-card-desc">${item.desc || ''}</div>
        <div class="menu-card-price">₹${item.price}</div>
      </div>
    </div>
    <div class="menu-card-action">
      ${qty === 0
            ? `<button class="btn-add" onclick="addToCart('${item.id}')">+ ADD</button>`
            : `<div class="qty-control">
            <button onclick="changeQty('${item.id}',-1)">−</button>
            <span>${qty}</span>
            <button onclick="changeQty('${item.id}',1)">+</button>
           </div>`}
    </div>
  </div>`;
}

function toggleCat(id) {
    const el = document.getElementById(id);
    const ch = document.getElementById('chev-' + id.replace('c-', ''));
    el.classList.toggle('collapsed');
    ch.textContent = el.classList.contains('collapsed') ? '▶' : '▼';
}

function getCatIcon(cat) {
    const m = { 'Veg Starter': '🥗', 'Nashta / Snacks': '🫙', 'Veg Thali': '🍱', 'Veg Chinese': '🥢', 'Veg Main Course': '🍛', 'Papad': '🫓', 'Tea & Coffee': '☕', 'Roti / Bread': '🫓', 'Egg House': '🥚', 'Chicken Dish': '🍗', 'Mutton Dish': '🥩', 'Fish Dish': '🐟', 'Biryani': '🍚', 'Non-Veg Thali': '🍱', 'Non-Veg Chinese': '🥢' };
    return m[cat] || '🍽️';
}

function slug(s) { return s.toLowerCase().replace(/[^a-z0-9]/g, '-'); }

// ── Cart ──────────────────────────────────────────────────────
function addToCart(itemId) {
    const item = fullMenu.find(i => i.id === itemId);
    if (!item) return;
    cart.push({ ...item, qty: 1 });
    redrawCard(itemId);
    updateCartUI();
    showToast(`${item.name} added! 🎉`);
}

function changeQty(itemId, delta) {
    const idx = cart.findIndex(c => c.id === itemId);
    if (idx === -1) return;
    cart[idx].qty += delta;
    if (cart[idx].qty <= 0) cart.splice(idx, 1);
    redrawCard(itemId);
    updateCartUI();
}

function redrawCard(itemId) {
    const item = fullMenu.find(i => i.id === itemId);
    const card = document.getElementById('card-' + itemId);
    if (!card || !item) return;
    const tmp = document.createElement('div');
    tmp.innerHTML = renderCard(item);
    card.replaceWith(tmp.firstElementChild);
}

function updateCartUI() {
    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const count = cart.reduce((s, i) => s + i.qty, 0);
    document.getElementById('cart-count').textContent = count;
    document.getElementById('cart-total').textContent = '₹' + total;
    const list = document.getElementById('cart-items-list');
    if (list) {
        list.innerHTML = cart.length === 0 ? '<p class="empty-cart">Cart is empty</p>'
            : cart.map(i => `
          <div class="cart-item-row">
            <span>${i.emoji || '🍽️'} ${i.name} × ${i.qty}</span>
            <span>₹${i.price * i.qty}</span>
          </div>`).join('')
            + `<div class="cart-divider"></div>
           <div class="cart-item-row cart-total-row">
             <strong>Total</strong><strong>₹${total}</strong>
           </div>`;
    }
}

function toggleCartPanel() { document.getElementById('cart-panel').classList.toggle('open'); }

// ── Place Order ───────────────────────────────────────────────
function placeOrder() {
    if (cart.length === 0) { showToast('Cart is empty!', 'error'); return; }
    // Show payment modal instead of calculating API call directly
    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    document.getElementById('upi-amount').textContent = total;
    document.getElementById('payment-modal').classList.remove('hidden');
    
    // Reset modal state
    resetPaymentMode();
}

function selectPaymentMode(mode) {
    if (mode === 'cash') {
        confirmOrderWithPayment('cash');
    } else if (mode === 'online') {
        document.getElementById('payment-options').style.display = 'none';
        document.getElementById('upi-section').style.display = 'block';
        document.getElementById('upi-section').classList.remove('hidden');
        document.getElementById('payment-actions-cash').style.display = 'none';
        
        // Generate UPI QR Code URL
        const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
        // Using a public QR generator API that accepts UPI string
        const businessName = "Hotel New Kishan";
        const upiString = `upi://pay?pa=${window._hotelUpiId}&pn=${encodeURIComponent(businessName)}&am=${total}&cu=INR`;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiString)}`;
        document.getElementById('upi-qr').src = qrUrl;

        // Set Deep Links
        document.getElementById('pay-gpay').href = upiString;
        document.getElementById('pay-phonepe').href = `phonepe://pay?pa=${window._hotelUpiId}&pn=${encodeURIComponent(businessName)}&am=${total}&cu=INR`;
        document.getElementById('pay-paytm').href = `paytmmp://pay?pa=${window._hotelUpiId}&pn=${encodeURIComponent(businessName)}&am=${total}&cu=INR`;

    }
}

function resetPaymentMode() {
    document.getElementById('payment-options').style.display = 'flex';
    document.getElementById('upi-section').style.display = 'none';
    document.getElementById('upi-section').classList.add('hidden');
    document.getElementById('payment-actions-cash').style.display = 'block';
}

async function confirmOrderWithPayment(paymentMode) {
    document.getElementById('payment-modal').classList.add('hidden');
    
    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const items = cart.map(i => ({ name: i.name, nameHi: i.nameHi || '', qty: i.qty, price: i.price, emoji: i.emoji || '🍽️' }));

    let body = { items, total, payment_mode: paymentMode };
    if (currentMode === 'dinein') {
        body = { ...body, type: 'dinein', table: window._tableNo };
    } else {
        body = { ...body, type: 'delivery', ...window._deliveryInfo };
        sendWhatsApp(items, total, paymentMode);
    }

    const resp = await apiPost('/orders', body);
    if (resp.success) {
        cart = [];
        updateCartUI();
        document.getElementById('cart-panel').classList.remove('open');
        if (currentMode === 'delivery') {
            sendWhatsApp(items, total, paymentMode);
        }
        // Show tracker for BOTH dine-in and delivery
        showOrderTracker(resp.order);
    } else {
        showToast('Order failed, try again', 'error');
    }
}

// ── Order Status Tracker (Dine-In & Delivery) ─────────────────
function showOrderTracker(order) {
    document.getElementById('tr-order-id').textContent = order.id;
    const typeLabel = order.type === 'dinein'
        ? `🍽️ Dine-In (Table ${order.table})`
        : `🛵 Delivery – ${order.address || window._deliveryInfo?.address || ''}`;
    document.getElementById('tr-type').textContent = typeLabel;
    document.getElementById('tr-total').textContent = '₹' + order.total;
    document.getElementById('tr-items').textContent = order.items.map(i => `${i.name} ×${i.qty}`).join(', ');

    const overlay = document.getElementById('tracker-overlay');
    overlay.classList.remove('hidden');
    setTimeout(() => overlay.classList.add('show'), 10);

    updateTrackerUI('pending');
    if (trackingInterval) clearInterval(trackingInterval);
    trackingInterval = setInterval(() => pollOrderStatus(order.id), 8000);
}

async function pollOrderStatus(orderId) {
    try {
        const res = await apiGet('/orders/' + orderId);
        if (res && res.status) updateTrackerUI(res.status);
        if (res.status === 'done') {
            clearInterval(trackingInterval);
            trackingInterval = null;
        }
    } catch (e) { }
}

function updateTrackerUI(status) {
    const steps = ['pending', 'preparing', 'ready', 'done'];
    const msgs = {
        pending: '⏳ Order received! Our team is getting ready...',
        preparing: '👨‍🍳 Your food is being prepared right now!',
        ready: '🔔 Order is ready! Coming to your table...',
        done: '✅ Order delivered! Enjoy your meal! 😋',
    };

    // Update icons
    steps.forEach((s, i) => {
        const icon = document.getElementById('st-' + s);
        const label = document.getElementById('sl-' + s);
        const curr = steps.indexOf(status);
        if (i < curr) {
            icon.className = 'status-icon done';
            label.className = 'status-label done';
        } else if (i === curr) {
            icon.className = 'status-icon active';
            label.className = 'status-label active';
        } else {
            icon.className = 'status-icon waiting';
            label.className = 'status-label';
        }
    });

    document.getElementById('tr-status-msg').textContent = msgs[status] || 'Tracking order...';
}

function closeTracker() {
    if (trackingInterval) { clearInterval(trackingInterval); trackingInterval = null; }
    const overlay = document.getElementById('tracker-overlay');
    overlay.classList.remove('show');
    setTimeout(() => {
        overlay.classList.add('hidden');
        returnToMode();
    }, 400);
}

// ── Thank You (Delivery) ──────────────────────────────────────
function sendWhatsApp(items, total, paymentMode) {
    const info = window._deliveryInfo;
    const lines = items.map(i => `  • ${i.name} ×${i.qty} - ₹${i.price * i.qty}`).join('\n');
    const pMode = paymentMode === 'online' ? 'Online (UPI paid)' : 'Cash on Delivery';
    const msg = `🍽️ *Hotel New Kishan – New Order*\n👤 *Name:* ${info.name}\n📞 *Phone:* ${info.phone || 'N/A'}\n📍 *Address:* ${info.address}\n💳 *Payment:* ${pMode}\n\n📋 *Items:*\n${lines}\n\n💰 *Total: ₹${total}*\n⏰ ${new Date().toLocaleString('en-IN')}\n\n_Order placed via Hotel New Kishan App_`;
    setTimeout(() => window.open('https://wa.me/919665843401?text=' + encodeURIComponent(msg), '_blank'), 500);
}

function showThankYou(order) {
    document.getElementById('ty-order-id').textContent = order.id;
    document.getElementById('ty-detail').textContent = `Delivery to ${order.address || window._deliveryInfo?.address}`;
    document.getElementById('ty-total').textContent = '₹' + order.total;
    const overlay = document.getElementById('thankyou-overlay');
    overlay.classList.remove('hidden');
    setTimeout(() => overlay.classList.add('show'), 10);
    spawnConfetti();
}

function closeThankYou() {
    const overlay = document.getElementById('thankyou-overlay');
    overlay.classList.remove('show');
    setTimeout(() => { overlay.classList.add('hidden'); returnToMode(); }, 400);
}

function returnToMode() {
    document.getElementById('menu-section').classList.add('hidden');
    document.getElementById('sticky-nav').classList.add('hidden');
    document.getElementById('cart-section').classList.add('hidden');
    document.getElementById('mode-section').classList.remove('hidden');
    cart = [];
    updateCartUI();
}

function spawnConfetti() {
    const colors = ['#c8860a', '#e6ac2c', '#16a34a', '#dc2626', '#3b82f6', '#f59e0b'];
    for (let i = 0; i < 60; i++) {
        const dot = document.createElement('div');
        dot.className = 'confetti-dot';
        dot.style.cssText = `left:${Math.random() * 100}%;background:${colors[Math.floor(Math.random() * colors.length)]};animation-delay:${Math.random() * 0.8}s;width:${6 + Math.random() * 8}px;height:${6 + Math.random() * 8}px;`;
        document.getElementById('confetti-container').appendChild(dot);
    }
    setTimeout(() => { document.getElementById('confetti-container').innerHTML = ''; }, 3500);
}

// ── Toast ─────────────────────────────────────────────────────
function showToast(msg, type = 'success') {
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.classList.add('show'), 10);
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 2500);
}
