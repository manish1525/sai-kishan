"""
Hotel New Kishan - Flask Backend Server
Owner: Mr. Kuldip Khairnar
"""

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import json, os, time
from datetime import datetime

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# IMPORTANT FIX
# Always use db folder (not /tmp)

WRITE_DIR = os.path.join(BASE_DIR, 'db')

MENU_FILE = os.path.join(WRITE_DIR, 'menu.json')
ORDERS_FILE = os.path.join(WRITE_DIR, 'orders.json')
SETTINGS_FILE = os.path.join(WRITE_DIR, 'settings.json')


# -----------------------------
# DB HELPERS
# -----------------------------

def read_json(path):
    if not os.path.exists(path):
        return []

    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)


def write_json(path, data):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def get_settings():
    if not os.path.exists(SETTINGS_FILE):
        return {}
    return read_json(SETTINGS_FILE)


# -----------------------------
# SERVE FRONTEND
# -----------------------------

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')


@app.route('/admin')
def admin():
    return send_from_directory('.', 'admin.html')


# -----------------------------
# SETTINGS API
# -----------------------------

@app.route('/api/settings', methods=['GET'])
def get_settings_api():
    s = get_settings()

    return jsonify({
        'owner_name': s.get('owner_name', 'Mr. Kuldip Khairnar'),
        'hotel_address': s.get('hotel_address', ''),
        'hotel_phone': s.get('hotel_phone', ''),
        'upi_id': s.get('upi_id', '')
    })


@app.route('/api/settings/upi', methods=['PUT'])
def update_upi():
    data = request.json
    s = get_settings()

    s['upi_id'] = data.get('upi_id', '')

    write_json(SETTINGS_FILE, s)

    return jsonify({'success': True})


@app.route('/api/settings/password', methods=['PUT'])
def change_password():

    data = request.json
    s = get_settings()

    if data.get('current') != s.get('admin_password'):
        return jsonify({'error': 'Current password incorrect'}), 400

    if len(data.get('new', '')) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400

    s['admin_password'] = data['new']

    write_json(SETTINGS_FILE, s)

    return jsonify({'success': True})


@app.route('/api/settings/owner', methods=['PUT'])
def update_owner():

    data = request.json
    s = get_settings()

    s['owner_name'] = data.get('name', s.get('owner_name'))
    s['hotel_address'] = data.get('hotel_address', s.get('hotel_address'))
    s['hotel_phone'] = data.get('hotel_phone', s.get('hotel_phone'))

    write_json(SETTINGS_FILE, s)

    return jsonify({'success': True})


# -----------------------------
# AUTH
# -----------------------------

@app.route('/api/auth/login', methods=['POST'])
def login():

    data = request.json
    s = get_settings()

    if data.get('password') == s.get('admin_password'):
        return jsonify({
            'success': True,
            'owner_name': s.get('owner_name')
        })

    return jsonify({'error': 'Invalid password'}), 401


# -----------------------------
# MENU API
# -----------------------------

@app.route('/api/menu', methods=['GET'])
def get_menu():

    menu = read_json(MENU_FILE)

    type_filter = request.args.get('type')
    cat_filter = request.args.get('category')

    if type_filter:
        menu = [i for i in menu if i['type'] == type_filter]

    if cat_filter:
        menu = [i for i in menu if i['category'] == cat_filter]

    return jsonify(menu)


@app.route('/api/menu', methods=['POST'])
def add_menu_item():

    data = request.json
    menu = read_json(MENU_FILE)

    data['id'] = str(int(time.time()))

    menu.append(data)

    write_json(MENU_FILE, menu)

    return jsonify({'success': True})


@app.route('/api/menu/<item_id>', methods=['DELETE'])
def delete_menu_item(item_id):

    menu = read_json(MENU_FILE)

    menu = [i for i in menu if i['id'] != item_id]

    write_json(MENU_FILE, menu)

    return jsonify({'success': True})


# -----------------------------
# ORDERS API
# -----------------------------

@app.route('/api/orders', methods=['GET'])
def get_orders():

    orders = read_json(ORDERS_FILE)

    return jsonify(orders)


@app.route('/api/orders', methods=['POST'])
def place_order():

    data = request.json

    orders = read_json(ORDERS_FILE)

    order_id = "ORD-" + str(int(time.time()*1000))[-6:]

    now = datetime.now()

    order = {
        "id": order_id,
        "status": "pending",
        "timestamp": now.isoformat(),
        "dateStr": now.strftime("%d %b %Y %I:%M %p"),
        **data
    }

    orders.insert(0, order)

    write_json(ORDERS_FILE, orders)

    return jsonify({
        "success": True,
        "order": order
    })


@app.route('/api/orders/<order_id>/status', methods=['PUT'])
def update_order_status(order_id):

    data = request.json

    orders = read_json(ORDERS_FILE)

    for o in orders:

        if o['id'] == order_id:

            o['status'] = data.get('status', o['status'])

            write_json(ORDERS_FILE, orders)

            return jsonify({'success': True})

    return jsonify({'error': 'Order not found'}), 404


# -----------------------------
# STATS
# -----------------------------

@app.route('/api/stats')
def stats():

    orders = read_json(ORDERS_FILE)

    pending = len([o for o in orders if o['status'] == 'pending'])
    preparing = len([o for o in orders if o['status'] == 'preparing'])
    done = len([o for o in orders if o['status'] == 'done'])

    revenue = sum(o.get('total', 0) for o in orders if o['status'] == 'done')

    return jsonify({
        "pending": pending,
        "preparing": preparing,
        "done": done,
        "revenue": revenue
    })


# -----------------------------
# RUN SERVER
# -----------------------------

if __name__ == '__main__':

    print("=" * 50)
    print("Hotel New Kishan Server Running")
    print("Customer: http://127.0.0.1:5000")
    print("Admin: http://127.0.0.1:5000/admin")
    print("=" * 50)

    port = int(os.environ.get("PORT", 5000))

    app.run(host='0.0.0.0', port=port)
