// ============================================================
//  Hotel New Kishan – Admin Dashboard JS
// ============================================================

let adminTab = 'orders';
let editingId = null;
let menuCache = [];

document.addEventListener('DOMContentLoaded', () => {
    if (sessionStorage.getItem('nkAdmin')) showDashboard();
    else showLogin();
    document.getElementById('admin-pwd')?.addEventListener('keydown', e => { if (e.key === 'Enter') adminLogin(); });
});

// ── Auth ──────────────────────────────────────────────────────
function showLogin() {
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('dashboard').classList.add('hidden');
}

async function showDashboard() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');

    // Load owner name from settings
    try {
        const s = await apiGet('/settings');
        if (s.owner_name) document.getElementById('owner-name-display').textContent = 'Owner: ' + s.owner_name;
        if (s.hotel_address) document.getElementById('set-address').value = s.hotel_address;
        if (s.hotel_phone) document.getElementById('set-phone').value = s.hotel_phone;
        if (s.owner_name) document.getElementById('set-owner').value = s.owner_name;
    } catch (e) { }

    loadTab('orders');
    setInterval(() => { if (adminTab === 'orders') { renderOrders(); updateBadge(); } }, 8000);
    updateBadge();
}

async function adminLogin() {
    const pwd = document.getElementById('admin-pwd').value;
    try {
        const res = await apiPost('/auth/login', { password: pwd });
        if (res.success) {
            sessionStorage.setItem('nkAdmin', '1');
            showDashboard();
        }
    } catch (e) {
        document.getElementById('login-error').textContent = '❌ Wrong password!';
    }
}

function adminLogout() {
    sessionStorage.removeItem('nkAdmin');
    showLogin();
}

// ── Tabs ──────────────────────────────────────────────────────
function loadTab(tab) {
    adminTab = tab;
    ['orders', 'history', 'menu', 'settings'].forEach(t => {
        document.getElementById('tab-' + t).classList.toggle('active', t === tab);
        document.getElementById('panel-' + t).classList.toggle('hidden', t !== tab);
    });
    if (tab === 'orders') renderOrders();
    if (tab === 'history') renderHistory();
    if (tab === 'menu') renderMenuManager();
    if (tab === 'settings') loadSettings();
}

// ── Stats ─────────────────────────────────────────────────────
async function updateStats() {
    const s = await apiGet('/stats');
    document.getElementById('stat-pending').textContent = s.pending;
    document.getElementById('stat-preparing').textContent = s.preparing;
    document.getElementById('stat-done').textContent = s.done_today;
    document.getElementById('stat-revenue').textContent = '₹' + s.revenue_today;
}

async function updateBadge() {
    const s = await apiGet('/stats');
    const badge = document.getElementById('orders-badge');
    if (s.pending > 0) { badge.textContent = s.pending; badge.style.display = 'inline-flex'; }
    else { badge.style.display = 'none'; }
}

// ── Live Orders ───────────────────────────────────────────────
async function renderOrders() {
    updateStats();
    // Fetch all active orders (pending + preparing + ready)
    const [pending, preparing, ready] = await Promise.all([
        apiGet('/orders?status=pending'),
        apiGet('/orders?status=preparing'),
        apiGet('/orders?status=ready'),
    ]);
    const orders = [...pending, ...preparing, ...ready]
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    const container = document.getElementById('orders-container');
    if (!orders.length) {
        container.innerHTML = `<div class="empty-state"><div class="empty-icon">✅</div><p>No pending orders right now</p></div>`;
        return;
    }

    const statusInfo = {
        pending: { label: '⏳ Received', cls: 'tag-pending', color: '#f39c12' },
        preparing: { label: '👨‍🍳 Preparing', cls: 'tag-preparing', color: '#2980b9' },
        ready: { label: '🔔 Ready', cls: 'tag-ready', color: '#27ae60' },
    };

    container.innerHTML = orders.map(o => {
        const tag = o.type === 'dinein'
            ? `<span class="tag tag-dinein">🍽️ Table ${o.table}</span>`
            : `<span class="tag tag-delivery">🛵 Delivery</span>`;
        const custInfo = o.type === 'delivery'
            ? `<div class="order-customer">👤 ${o.name || ''} &nbsp;|&nbsp; 📍 ${o.address || ''}</div>` : '';
        const items = (o.items || []).map(i => `<span class="order-item">${i.emoji || '🍽️'} ${i.name} ×${i.qty}</span>`).join('');

        const si = statusInfo[o.status] || statusInfo.pending;
        const statusBadge = `<span class="tag" style="background:${si.color}22;color:${si.color};border:1px solid ${si.color}44;">${si.label}</span>`;

        // Smart next-step buttons based on current status
        let actionBtns = '';
        if (o.status === 'pending') {
            actionBtns = `<button class="btn-preparing" onclick="markStatus('${o.id}','preparing')">👨‍🍳 Start Preparing</button>`;
        } else if (o.status === 'preparing') {
            actionBtns = `<button class="btn-ready" onclick="markStatus('${o.id}','ready')" style="background:#27ae60;color:#fff;border:none;padding:8px 16px;border-radius:8px;cursor:pointer;font-weight:600;">🔔 Mark Ready</button>`;
        } else if (o.status === 'ready') {
            actionBtns = `<button class="btn-done" onclick="markStatus('${o.id}','done')">✅ Done / Delivered</button>`;
        }

        return `<div class="order-card" id="ocard-${o.id}">
      <div class="order-card-header">
        ${tag} ${statusBadge} <span class="order-id">${o.id}</span>
        <span class="order-time">🕐 ${o.dateStr || ''}</span>
      </div>
      ${custInfo}
      <div class="order-items-wrap">${items}</div>
      <div class="order-card-footer">
        <span class="order-total">₹${o.total}</span>
        <div style="display:flex;gap:8px;align-items:center;">
          ${actionBtns}
          <button class="btn-del-order" onclick="deleteOrder('${o.id}')">🗑️</button>
        </div>
      </div>
    </div>`;
    }).join('');
}

async function markStatus(id, status) {
    await apiPut('/orders/' + id + '/status', { status });
    if (status === 'done') {
        document.getElementById('ocard-' + id)?.remove();
        const c = document.getElementById('orders-container');
        if (!c.querySelector('.order-card'))
            c.innerHTML = `<div class="empty-state"><div class="empty-icon">✅</div><p>All done!</p></div>`;
    } else {
        renderOrders();
    }
    updateStats(); updateBadge();
    const msgs = { preparing: '👨‍🍳 Preparing started!', ready: '🔔 Order marked Ready!', done: '✅ Order Done! Revenue updated.' };
    showAdminToast(msgs[status] || 'Status updated!');
}


async function deleteOrder(id) {
    if (!confirm('Delete this order?')) return;
    await apiDelete('/orders/' + id);
    renderOrders();
}

// ── History ───────────────────────────────────────────────────
async function renderHistory() {
    const orders = await apiGet('/orders?status=done');
    const c = document.getElementById('history-container');
    if (!orders.length) {
        c.innerHTML = `<div class="empty-state"><div class="empty-icon">📋</div><p>No completed orders yet</p></div>`;
        return;
    }
    c.innerHTML = orders.map(o => {
        const tag = o.type === 'dinein'
            ? `<span class="tag tag-dinein">🍽️ Table ${o.table}</span>`
            : `<span class="tag tag-delivery">🛵 ${o.name || 'Delivery'}</span>`;
        const items = (o.items || []).map(i => `${i.emoji || '🍽️'} ${i.name} ×${i.qty}`).join(', ');
        return `<div class="history-row">
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:6px;">
        ${tag} <span style="font-size:12px;color:var(--text-muted);">${o.id}</span>
        <span class="tag tag-done" style="margin-left:auto;">✅ Done</span>
      </div>
      <div class="history-items">${items}</div>
      <div class="history-meta"><span>₹${o.total}</span><span>${o.dateStr || ''}</span></div>
    </div>`;
    }).join('');
}

async function clearHistory() {
    if (!confirm('Clear all completed order history?')) return;
    const orders = await apiGet('/orders?status=done');
    for (const o of orders) await apiDelete('/orders/' + o.id);
    renderHistory();
    showAdminToast('History cleared');
}

// ── Menu Manager ──────────────────────────────────────────────
async function renderMenuManager() {
    menuCache = await apiGet('/menu');
    renderMenuSection('veg', 'veg-menu-container');
    renderMenuSection('nonveg', 'nonveg-menu-container');
}

function renderMenuSection(type, containerId) {
    const items = menuCache.filter(i => i.type === type);
    const cats = [...new Set(items.map(i => i.category))];
    const c = document.getElementById(containerId);
    c.innerHTML = '';
    cats.forEach(cat => {
        const catItems = items.filter(i => i.category === cat);
        const div = document.createElement('div');
        div.className = 'admin-category';
        div.innerHTML = `
      <div class="admin-cat-header">
        <span>${cat} <small style="color:var(--text-muted);font-weight:400;">(${catItems.length} items)</small></span>
        <button class="btn-del-cat" onclick="deleteCat('${type}','${cat}')">🗑️ Delete Category</button>
      </div>
      <div class="admin-items-grid">${catItems.map(adminCard).join('')}</div>`;
        c.appendChild(div);
    });
}

function adminCard(item) {
    return `<div class="admin-item-card" id="acard-${item.id}">
    <div class="admin-item-header">
      <span class="admin-item-name">${item.emoji || '🍽️'} ${item.name}</span>
      <div class="admin-item-actions">
        <button class="btn-edit-item" onclick="openEdit('${item.id}')">✏️</button>
        <button class="btn-del-item"  onclick="delItem('${item.id}')">🗑️</button>
      </div>
    </div>
    ${item.nameHi ? `<div style="font-size:12px;color:var(--gold);margin-bottom:6px;">${item.nameHi}</div>` : ''}
    <div class="admin-item-meta">
      <span class="admin-item-price">₹${item.price}</span>
      <span class="admin-item-cat">${item.category}</span>
    </div>
    <div class="admin-item-desc">${item.desc || ''}</div>
  </div>`;
}

function switchMenuType(type) {
    document.getElementById('menu-veg-btn').classList.toggle('active', type === 'veg');
    document.getElementById('menu-nonveg-btn').classList.toggle('active', type === 'nonveg');
    document.getElementById('veg-menu-section').classList.toggle('hidden', type !== 'veg');
    document.getElementById('nonveg-menu-section').classList.toggle('hidden', type !== 'nonveg');
}

function openAddItem(type) {
    editingId = null;
    document.getElementById('item-modal-title').textContent = '+ New Item';
    document.getElementById('item-type').value = type;
    clearForm();
    document.getElementById('item-modal').classList.remove('hidden');
}

function openEdit(id) {
    const item = menuCache.find(i => i.id === id);
    if (!item) return;
    editingId = id;
    document.getElementById('item-modal-title').textContent = 'Edit Item';
    document.getElementById('item-type').value = item.type;
    document.getElementById('item-name').value = item.name;
    document.getElementById('item-namehi').value = item.nameHi || '';
    document.getElementById('item-price').value = item.price;
    document.getElementById('item-emoji').value = item.emoji || '';
    document.getElementById('item-category').value = item.category;
    document.getElementById('item-desc').value = item.desc || '';
    document.getElementById('item-modal').classList.remove('hidden');
}

async function saveItem() {
    const name = document.getElementById('item-name').value.trim();
    const nameHi = document.getElementById('item-namehi').value.trim();
    const price = parseInt(document.getElementById('item-price').value);
    const category = document.getElementById('item-category').value.trim();
    const emoji = document.getElementById('item-emoji').value.trim() || '🍽️';
    const desc = document.getElementById('item-desc').value.trim();
    const type = document.getElementById('item-type').value;
    if (!name || !price || !category) { showAdminToast('Name, price & category required', 'error'); return; }
    const body = { name, nameHi, price, category, emoji, desc, type };
    if (editingId) { await apiPut('/menu/' + editingId, body); showAdminToast('Item updated!'); }
    else { await apiPost('/menu', body); showAdminToast('Item added!'); }
    document.getElementById('item-modal').classList.add('hidden');
    renderMenuManager();
}

async function delItem(id) {
    if (!confirm('Delete this item?')) return;
    await apiDelete('/menu/' + id);
    renderMenuManager();
    showAdminToast('Item deleted');
}

async function deleteCat(type, cat) {
    if (!confirm(`Delete entire "${cat}" category?`)) return;
    const items = menuCache.filter(i => i.type === type && i.category === cat);
    for (const i of items) await apiDelete('/menu/' + i.id);
    renderMenuManager();
    showAdminToast('Category deleted');
}

function clearForm() {
    ['item-name', 'item-namehi', 'item-price', 'item-emoji', 'item-category', 'item-desc'].forEach(id => { document.getElementById(id).value = ''; });
}
function closeItemModal() { document.getElementById('item-modal').classList.add('hidden'); }

// ── Settings ──────────────────────────────────────────────────
async function loadSettings() {
    const s = await apiGet('/settings');
    if (s.hotel_address) document.getElementById('set-address').value = s.hotel_address;
    if (s.hotel_phone) document.getElementById('set-phone').value = s.hotel_phone;
    if (s.owner_name) document.getElementById('set-owner').value = s.owner_name;
}

async function saveHotelInfo() {
    const address = document.getElementById('set-address').value.trim();
    const phone = document.getElementById('set-phone').value.trim();
    const name = document.getElementById('set-owner').value.trim();
    try {
        await apiPut('/settings/owner', { name, hotel_address: address, hotel_phone: phone });
        if (name) document.getElementById('owner-name-display').textContent = 'Owner: ' + name;
        showAdminToast('Hotel info saved! ✅');
    } catch (e) { showAdminToast('Save failed', 'error'); }
}

async function changePassword() {
    const current = document.getElementById('pwd-current').value;
    const newPwd = document.getElementById('pwd-new').value;
    const confirm = document.getElementById('pwd-confirm').value;
    const msgEl = document.getElementById('pwd-msg');

    if (newPwd !== confirm) { msgEl.style.color = 'var(--danger)'; msgEl.textContent = 'Passwords do not match!'; return; }
    if (newPwd.length < 6) { msgEl.style.color = 'var(--danger)'; msgEl.textContent = 'Password must be at least 6 characters!'; return; }

    try {
        const res = await apiPut('/settings/password', { current, new: newPwd });
        if (res.success) {
            msgEl.style.color = 'var(--veg)';
            msgEl.textContent = '✅ Password changed successfully!';
            document.getElementById('pwd-current').value = '';
            document.getElementById('pwd-new').value = '';
            document.getElementById('pwd-confirm').value = '';
            showAdminToast('Password updated!');
        }
    } catch (e) {
        msgEl.style.color = 'var(--danger)';
        msgEl.textContent = '❌ ' + (e.message || 'Current password is wrong');
    }
}

// ── API ───────────────────────────────────────────────────────
async function apiGet(p) { const r = await fetch('/api' + p); return r.json(); }
async function apiPost(p, b) { const r = await fetch('/api' + p, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) }); if (!r.ok) { const e = await r.json(); throw new Error(e.error); } return r.json(); }
async function apiPut(p, b) { const r = await fetch('/api' + p, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) }); if (!r.ok) { const e = await r.json(); throw new Error(e.error); } return r.json(); }
async function apiDelete(p) { const r = await fetch('/api' + p, { method: 'DELETE' }); return r.json(); }

// ── Toast ─────────────────────────────────────────────────────
function showAdminToast(msg, type = 'success') {
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.classList.add('show'), 10);
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 2500);
}
