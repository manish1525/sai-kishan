"""
Hotel New Kishan - Flask Backend Server
Owner: Mr. Kuldip Khairnar
"""
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import json, os, time, shutil, uuid
from datetime import datetime

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Detect Render environment correctly
IS_RENDER = os.environ.get('RENDER_EXTERNAL_URL') is not None
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
        'upi_id':        s.get('upi_id',        ''),
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

    if data.get('name'):
        s['owner_name'] = data['name']

    if data.get('hotel_address') is not None:
        s['hotel_address'] = data['hotel_address']

    if data.get('hotel_phone') is not None:
        s['hotel_phone'] = data['hotel_phone']

    if data.get('upi_id') is not None:
        s['upi_id'] = data['upi_id']

    write_json(SETTINGS_FILE, s)

    return jsonify({'success': True, 'owner_name': s['owner_name']})


# ── AUTH ──────────────────────────────────────────────────────
@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    s = get_settings()

    if data.get('password') == s.get('admin_password'):
        return jsonify({
            'success': True,
            'owner_name': s.get('owner_name', 'Mr. Kuldip Khairnar')
        })

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

    new_item = {
        'id':       'item-' + uuid.uuid4().hex[:8],
        'name':     data.get('name', ''),
        'nameHi':   data.get('nameHi', ''),
        'price':    int(data.get('price', 0)),
        'category': data.get('category', ''),
        'type':     data.get('type', 'veg'),
        'emoji':    data.get('emoji', '🍽️'),
        'desc':     data.get('desc', ''),
    }

    menu.append(new_item)
    write_json(MENU_FILE, menu)

    return jsonify({'success': True, 'item': new_item}), 201


@app.route('/api/menu/<item_id>', methods=['PUT'])
def update_menu_item(item_id):
    data = request.json
    menu = read_json(MENU_FILE)

    idx = next((i for i, x in enumerate(menu) if x['id'] == item_id), None)
    if idx is None:
        return jsonify({'error': 'Item not found'}), 404

    for key in ['name', 'nameHi', 'category', 'emoji', 'desc', 'type']:
        if key in data:
            menu[idx][key] = data[key]
    if 'price' in data:
        menu[idx]['price'] = int(data['price'])

    write_json(MENU_FILE, menu)
    return jsonify({'success': True, 'item': menu[idx]})


@app.route('/api/menu/<item_id>', methods=['DELETE'])
def delete_menu_item(item_id):
    menu = read_json(MENU_FILE)
    new_menu = [i for i in menu if i['id'] != item_id]

    if len(new_menu) == len(menu):
        return jsonify({'error': 'Item not found'}), 404

    write_json(MENU_FILE, new_menu)
    return jsonify({'success': True})


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

    if order is None:
        return jsonify({'error': 'Order not found'}), 404

    return jsonify(order)


@app.route('/api/orders', methods=['POST'])
def place_order():
    data = request.json

    orders = read_json(ORDERS_FILE)

    order_id = 'ORD-' + str(int(time.time() * 1000))[-8:]

    now = datetime.now()

    order = {
        'id':        order_id,
        'status':    'pending',
        'timestamp': now.isoformat(),
        'dateStr':   now.strftime('%d %b %Y, %I:%M %p'),
        **data
    }

    orders.insert(0, order)

    write_json(ORDERS_FILE, orders)

    return jsonify({'success': True, 'order': order}), 201


@app.route('/api/orders/<order_id>/status', methods=['PUT'])
def update_order_status(order_id):
    data = request.json
    new_status = data.get('status')

    valid_statuses = ['pending', 'preparing', 'ready', 'done']
    if new_status not in valid_statuses:
        return jsonify({'error': 'Invalid status'}), 400

    orders = read_json(ORDERS_FILE)
    idx = next((i for i, o in enumerate(orders) if o['id'] == order_id), None)

    if idx is None:
        return jsonify({'error': 'Order not found'}), 404

    orders[idx]['status'] = new_status
    write_json(ORDERS_FILE, orders)

    return jsonify({'success': True, 'order': orders[idx]})


@app.route('/api/orders/<order_id>', methods=['DELETE'])
def delete_order(order_id):
    orders = read_json(ORDERS_FILE)
    new_orders = [o for o in orders if o['id'] != order_id]

    if len(new_orders) == len(orders):
        return jsonify({'error': 'Order not found'}), 404

    write_json(ORDERS_FILE, new_orders)
    return jsonify({'success': True})


# ── STATS API ─────────────────────────────────────────────────
@app.route('/api/stats', methods=['GET'])
def get_stats():
    orders = read_json(ORDERS_FILE)
    today_str = datetime.now().strftime('%d %b %Y')

    pending   = sum(1 for o in orders if o.get('status') == 'pending')
    preparing = sum(1 for o in orders if o.get('status') == 'preparing')
    ready     = sum(1 for o in orders if o.get('status') == 'ready')

    done_today    = sum(1 for o in orders if o.get('status') == 'done' and today_str in o.get('dateStr', ''))
    revenue_today = sum(o.get('total', 0) for o in orders if o.get('status') == 'done' and today_str in o.get('dateStr', ''))

    return jsonify({
        'pending':       pending,
        'preparing':     preparing,
        'ready':         ready,
        'done_today':    done_today,
        'revenue_today': revenue_today,
    })


# ── Server Start ──────────────────────────────────────────────
if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    print("Server Starting on port:", port)
    app.run(host="0.0.0.0", port=port)