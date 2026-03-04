"""
Hotel New Kishan - Flask Backend Server
Owner: Mr. Kuldip Khairnar
"""
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import json, os, time, shutil
from datetime import datetime

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)

BASE_DIR    = os.path.dirname(os.path.abspath(__file__))

# On Render, filesystem is read-only except /tmp/
# We copy db files to /tmp/ on first run so they are writable
IS_RENDER = os.environ.get('RENDER', False)
WRITE_DIR = '/tmp/sai_kisan_db' if IS_RENDER else os.path.join(BASE_DIR, 'db')

def init_db():
    """Copy db files to writable /tmp dir on Render (only first time)"""
    if not IS_RENDER:
        return
    os.makedirs(WRITE_DIR, exist_ok=True)
    for fname in ['menu.json', 'orders.json', 'settings.json']:
        src = os.path.join(BASE_DIR, 'db', fname)
        dst = os.path.join(WRITE_DIR, fname)
        if not os.path.exists(dst):
            shutil.copy2(src, dst)

init_db()

MENU_FILE     = os.path.join(WRITE_DIR, 'menu.json')
ORDERS_FILE   = os.path.join(WRITE_DIR, 'orders.json')
SETTINGS_FILE = os.path.join(WRITE_DIR, 'settings.json')

# ── DB helpers ────────────────────────────────────────────────
def read_json(path):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def write_json(path, data):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def get_settings():
    return read_json(SETTINGS_FILE)

# ── Serve Frontend ────────────────────────────────────────────
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/admin')
def admin():
    return send_from_directory('.', 'admin.html')

# ── SETTINGS API ──────────────────────────────────────────────
@app.route('/api/settings', methods=['GET'])
def get_settings_api():
    s = get_settings()
    return jsonify({
        'owner_name':    s.get('owner_name',    'Mr. Kuldip Khairnar'),
        'hotel_address': s.get('hotel_address', ''),
        'hotel_phone':   s.get('hotel_phone',   '9665843401'),
    })

@app.route('/api/settings/password', methods=['PUT'])
def change_password():
    data = request.json
    s = get_settings()
    if data.get('current') != s.get('admin_password'):
        return jsonify({'error': 'Current password is incorrect'}), 400
    if not data.get('new') or len(data['new']) < 6:
        return jsonify({'error': 'New password must be at least 6 characters'}), 400
    s['admin_password'] = data['new']
    write_json(SETTINGS_FILE, s)
    return jsonify({'success': True})

@app.route('/api/settings/owner', methods=['PUT'])
def update_owner():
    data = request.json
    s = get_settings()
    if data.get('name'):           s['owner_name']    = data['name']
    if data.get('hotel_address'):  s['hotel_address'] = data['hotel_address']
    if data.get('hotel_phone'):    s['hotel_phone']   = data['hotel_phone']
    write_json(SETTINGS_FILE, s)
    return jsonify({'success': True, 'owner_name': s['owner_name']})

# ── AUTH ──────────────────────────────────────────────────────
@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    s = get_settings()
    if data.get('password') == s.get('admin_password'):
        return jsonify({'success': True, 'owner_name': s.get('owner_name', 'Mr. Kuldip Khairnar')})
    return jsonify({'error': 'Invalid password'}), 401

# ── MENU API ──────────────────────────────────────────────────
@app.route('/api/menu', methods=['GET'])
def get_menu():
    menu = read_json(MENU_FILE)
    type_filter = request.args.get('type')
    cat_filter  = request.args.get('category')
    if type_filter:
        menu = [i for i in menu if i['type'] == type_filter]
    if cat_filter:
        menu = [i for i in menu if i['category'] == cat_filter]
    return jsonify(menu)

@app.route('/api/menu', methods=['POST'])
def add_menu_item():
    data = request.json
    menu = read_json(MENU_FILE)
    data['id'] = data.get('type', 'v')[0] + str(int(time.time()))
    menu.append(data)
    write_json(MENU_FILE, menu)
    return jsonify({'success': True, 'item': data}), 201

@app.route('/api/menu/<item_id>', methods=['PUT'])
def update_menu_item(item_id):
    data = request.json
    menu = read_json(MENU_FILE)
    for i, item in enumerate(menu):
        if item['id'] == item_id:
            menu[i] = {**item, **data, 'id': item_id}
            write_json(MENU_FILE, menu)
            return jsonify({'success': True, 'item': menu[i]})
    return jsonify({'error': 'Item not found'}), 404

@app.route('/api/menu/<item_id>', methods=['DELETE'])
def delete_menu_item(item_id):
    menu = read_json(MENU_FILE)
    new_menu = [i for i in menu if i['id'] != item_id]
    write_json(MENU_FILE, new_menu)
    return jsonify({'success': True})

@app.route('/api/menu/categories', methods=['GET'])
def get_categories():
    menu = read_json(MENU_FILE)
    type_filter = request.args.get('type')
    if type_filter:
        menu = [i for i in menu if i['type'] == type_filter]
    cats = list(dict.fromkeys(i['category'] for i in menu))
    return jsonify(cats)

# ── ORDERS API ────────────────────────────────────────────────
@app.route('/api/orders', methods=['GET'])
def get_orders():
    orders = read_json(ORDERS_FILE)
    status = request.args.get('status')
    if status:
        orders = [o for o in orders if o.get('status') == status]
    return jsonify(orders)

@app.route('/api/orders/<order_id>', methods=['GET'])
def get_order(order_id):
    orders = read_json(ORDERS_FILE)
    order = next((o for o in orders if o['id'] == order_id), None)
    if not order:
        return jsonify({'error': 'Order not found'}), 404
    return jsonify(order)

@app.route('/api/orders', methods=['POST'])
def place_order():
    data = request.json
    orders = read_json(ORDERS_FILE)
    order_id = 'ORD-' + str(int(time.time() * 1000))[-8:]
    now = datetime.now()
    order = {
        'id': order_id,
        'status': 'pending',
        'timestamp': now.isoformat(),
        'dateStr': now.strftime('%d %b %Y, %I:%M %p'),
        **data
    }
    orders.insert(0, order)
    write_json(ORDERS_FILE, orders)
    return jsonify({'success': True, 'order': order}), 201

@app.route('/api/orders/<order_id>/status', methods=['PUT'])
def update_order_status(order_id):
    data = request.json
    orders = read_json(ORDERS_FILE)
    for o in orders:
        if o['id'] == order_id:
            o['status'] = data.get('status', o['status'])
            write_json(ORDERS_FILE, orders)
            return jsonify({'success': True, 'order': o})
    return jsonify({'error': 'Order not found'}), 404

@app.route('/api/orders/<order_id>', methods=['DELETE'])
def delete_order(order_id):
    orders = read_json(ORDERS_FILE)
    write_json(ORDERS_FILE, [o for o in orders if o['id'] != order_id])
    return jsonify({'success': True})

@app.route('/api/stats', methods=['GET'])
def get_stats():
    orders = read_json(ORDERS_FILE)
    today = datetime.now().strftime('%Y-%m-%d')
    pending  = [o for o in orders if o.get('status') == 'pending']
    preparing= [o for o in orders if o.get('status') == 'preparing']
    done_today=[o for o in orders if o.get('status') == 'done' and o.get('timestamp','').startswith(today)]
    revenue  = sum(o.get('total', 0) for o in done_today)
    return jsonify({
        'pending': len(pending),
        'preparing': len(preparing),
        'done_today': len(done_today),
        'revenue_today': revenue
    })

if __name__ == '__main__':
    s = get_settings()
    print("=" * 55)
    print(f"  Hotel New Kishan - Server Starting...")
    print(f"  Owner: {s.get('owner_name', 'Mr. Kuldip Khairnar')}")
    print(f"  Customer : http://127.0.0.1:5000/")
    print(f"  Admin    : http://127.0.0.1:5000/admin")
    print("=" * 55)
    app.run(debug=True, port=5000, host='0.0.0.0')
