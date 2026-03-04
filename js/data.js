// ============================================================
//  Hotel New Kishan – Data Layer (localStorage)
// ============================================================

const DEFAULT_MENU = [
  // ── VEG ──────────────────────────────────────────────────
  // Starters
  { id: 'v1', type: 'veg', category: 'Starters', name: 'Veg Spring Roll', price: 120, desc: 'Crispy golden rolls stuffed with spiced vegetables', emoji: '🥢' },
  { id: 'v2', type: 'veg', category: 'Starters', name: 'Paneer Tikka', price: 200, desc: 'Soft cottage cheese marinated in spices, grilled to perfection', emoji: '🧆' },
  { id: 'v3', type: 'veg', category: 'Starters', name: 'Hara Bhara Kebab', price: 150, desc: 'Patties made from spinach, peas and potatoes', emoji: '🍃' },
  { id: 'v4', type: 'veg', category: 'Starters', name: 'Dahi Ke Sholay', price: 130, desc: 'Crispy bread filled with hung curd and spices', emoji: '🧀' },

  // Main Course
  { id: 'v5', type: 'veg', category: 'Main Course', name: 'Paneer Butter Masala', price: 220, desc: 'Rich tomato-cream gravy with cottage cheese cubes', emoji: '🍛' },
  { id: 'v6', type: 'veg', category: 'Main Course', name: 'Dal Makhani', price: 180, desc: 'Slow-cooked black lentils in buttery tomato gravy', emoji: '🫘' },
  { id: 'v7', type: 'veg', category: 'Main Course', name: 'Palak Paneer', price: 200, desc: 'Creamy spinach curry with soft paneer cubes', emoji: '🥬' },
  { id: 'v8', type: 'veg', category: 'Main Course', name: 'Mixed Veg Curry', price: 170, desc: 'Seasonal vegetables in a flavorful masala gravy', emoji: '🥕' },
  { id: 'v9', type: 'veg', category: 'Main Course', name: 'Shahi Paneer', price: 240, desc: 'Paneer in rich cashew-cream sauce with aromatic spices', emoji: '👑' },
  { id: 'v10', type: 'veg', category: 'Main Course', name: 'Aloo Gobi Masala', price: 150, desc: 'Classic potato and cauliflower dry curry', emoji: '🥔' },

  // Rice & Biryani
  { id: 'v11', type: 'veg', category: 'Rice & Biryani', name: 'Veg Biryani', price: 200, desc: 'Fragrant basmati rice layered with vegetables and saffron', emoji: '🍚' },
  { id: 'v12', type: 'veg', category: 'Rice & Biryani', name: 'Jeera Rice', price: 120, desc: 'Basmati rice tempered with cumin and ghee', emoji: '🍙' },
  { id: 'v13', type: 'veg', category: 'Rice & Biryani', name: 'Paneer Biryani', price: 240, desc: 'Aromatic biryani loaded with marinated paneer', emoji: '🍲' },

  // Breads
  { id: 'v14', type: 'veg', category: 'Breads', name: 'Butter Naan', price: 40, desc: 'Soft leavened bread baked fresh in tandoor with butter', emoji: '🫓' },
  { id: 'v15', type: 'veg', category: 'Breads', name: 'Garlic Naan', price: 50, desc: 'Naan topped with fresh garlic and coriander', emoji: '🧄' },
  { id: 'v16', type: 'veg', category: 'Breads', name: 'Tandoori Roti', price: 25, desc: 'Whole wheat bread baked in clay oven', emoji: '🫓' },
  { id: 'v17', type: 'veg', category: 'Breads', name: 'Puri', price: 30, desc: 'Deep-fried soft puffy wheat bread (3 pcs)', emoji: '🫓' },

  // Desserts
  { id: 'v18', type: 'veg', category: 'Desserts', name: 'Gulab Jamun', price: 80, desc: 'Soft milk-solid balls soaked in rose syrup (2 pcs)', emoji: '🍮' },
  { id: 'v19', type: 'veg', category: 'Desserts', name: 'Kheer', price: 90, desc: 'Creamy rice pudding with cardamom and dry fruits', emoji: '🍨' },
  { id: 'v20', type: 'veg', category: 'Desserts', name: 'Rasgulla', price: 80, desc: 'Spongy cottage cheese balls in light syrup (2 pcs)', emoji: '⚪' },

  // Drinks
  { id: 'v21', type: 'veg', category: 'Drinks', name: 'Lassi (Sweet)', price: 60, desc: 'Thick chilled yogurt drink blended with sugar and cream', emoji: '🥛' },
  { id: 'v22', type: 'veg', category: 'Drinks', name: 'Mango Shake', price: 90, desc: 'Fresh mango blended with cold milk and sugar', emoji: '🥭' },
  { id: 'v23', type: 'veg', category: 'Drinks', name: 'Masala Chaas', price: 40, desc: 'Spiced buttermilk with roasted cumin and coriander', emoji: '🫗' },
  { id: 'v24', type: 'veg', category: 'Drinks', name: 'Fresh Lime Soda', price: 50, desc: 'Refreshing lime with sparkling water', emoji: '🍋' },

  // ── NON-VEG ──────────────────────────────────────────────
  // Starters
  { id: 'n1', type: 'nonveg', category: 'Starters', name: 'Chicken Tikka', price: 280, desc: 'Juicy chicken chunks marinated in yogurt and spices, tandoor grilled', emoji: '🍗' },
  { id: 'n2', type: 'nonveg', category: 'Starters', name: 'Seekh Kebab', price: 260, desc: 'Spiced minced meat skewers grilled on charcoal', emoji: '🥩' },
  { id: 'n3', type: 'nonveg', category: 'Starters', name: 'Chicken Lollipop', price: 300, desc: 'Crispy fried chicken wings tossed in spicy sauce (6 pcs)', emoji: '🍖' },
  { id: 'n4', type: 'nonveg', category: 'Starters', name: 'Fish Fry', price: 320, desc: 'Crispy battered fish fillets with green chutney', emoji: '🐟' },
  { id: 'n5', type: 'nonveg', category: 'Starters', name: 'Egg Bhurji', price: 140, desc: 'Spiced scrambled eggs with onion, tomato and green chilli', emoji: '🍳' },

  // Main Course
  { id: 'n6', type: 'nonveg', category: 'Main Course', name: 'Butter Chicken', price: 320, desc: 'Tender chicken in velvety tomato-butter-cream gravy', emoji: '🍛' },
  { id: 'n7', type: 'nonveg', category: 'Main Course', name: 'Chicken Kadai', price: 300, desc: 'Chicken cooked with bell peppers in spicy kadai masala', emoji: '🫕' },
  { id: 'n8', type: 'nonveg', category: 'Main Course', name: 'Mutton Curry', price: 380, desc: 'Slow-cooked mutton in aromatic onion-tomato gravy', emoji: '🍲' },
  { id: 'n9', type: 'nonveg', category: 'Main Course', name: 'Egg Curry', price: 180, desc: 'Boiled eggs simmered in spiced tomato-onion gravy', emoji: '🥚' },
  { id: 'n10', type: 'nonveg', category: 'Main Course', name: 'Fish Curry', price: 340, desc: 'Fresh fish in tangy coconut-tomato masala', emoji: '🐠' },
  { id: 'n11', type: 'nonveg', category: 'Main Course', name: 'Chicken Handi', price: 350, desc: 'Marinated chicken slow-cooked in a clay pot', emoji: '🏺' },

  // Rice & Biryani
  { id: 'n12', type: 'nonveg', category: 'Rice & Biryani', name: 'Chicken Biryani', price: 280, desc: 'Dum-cooked saffron rice with succulent chicken pieces', emoji: '🍚' },
  { id: 'n13', type: 'nonveg', category: 'Rice & Biryani', name: 'Mutton Biryani', price: 350, desc: 'Aromatic dum biryani loaded with tender mutton', emoji: '🍲' },
  { id: 'n14', type: 'nonveg', category: 'Rice & Biryani', name: 'Egg Biryani', price: 220, desc: 'Flavorful basmati rice with spiced boiled eggs', emoji: '🥚' },

  // Breads
  { id: 'n15', type: 'nonveg', category: 'Breads', name: 'Butter Naan', price: 40, desc: 'Soft leavened bread baked fresh in tandoor with butter', emoji: '🫓' },
  { id: 'n16', type: 'nonveg', category: 'Breads', name: 'Garlic Naan', price: 50, desc: 'Naan topped with fresh garlic and coriander', emoji: '🧄' },
  { id: 'n17', type: 'nonveg', category: 'Breads', name: 'Tandoori Roti', price: 25, desc: 'Whole wheat bread baked in clay oven', emoji: '🫓' },
];

// ── Storage Helpers ──────────────────────────────────────────
function getMenu() {
  const stored = localStorage.getItem('nkMenu');
  if (stored) return JSON.parse(stored);
  saveMenu(DEFAULT_MENU);
  return DEFAULT_MENU;
}

function saveMenu(menu) {
  localStorage.setItem('nkMenu', JSON.stringify(menu));
}

function getOrders() {
  const stored = localStorage.getItem('nkOrders');
  return stored ? JSON.parse(stored) : [];
}

function saveOrders(orders) {
  localStorage.setItem('nkOrders', JSON.stringify(orders));
}

function addOrder(order) {
  const orders = getOrders();
  order.id = 'ORD-' + Date.now();
  order.timestamp = new Date().toISOString();
  order.status = 'pending';
  orders.unshift(order);
  saveOrders(orders);
  return order;
}

function updateOrderStatus(orderId, status) {
  const orders = getOrders();
  const idx = orders.findIndex(o => o.id === orderId);
  if (idx !== -1) { orders[idx].status = status; saveOrders(orders); }
}

function getCategories(type) {
  const menu = getMenu();
  return [...new Set(menu.filter(i => i.type === type).map(i => i.category))];
}

function generateId() {
  return (Math.random().toString(36).substr(2, 9));
}
