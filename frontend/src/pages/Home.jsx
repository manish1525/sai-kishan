import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Home() {
    const [menu, setMenu] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [type, setType] = useState('veg');
    const [cart, setCart] = useState([]);
    const [cartOpen, setCartOpen] = useState(false);
    const [mode, setMode] = useState('dinein');
    const [table, setTable] = useState('');
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('/menu/all').then(res => {
            setMenu(res.data);
            setFiltered(res.data.filter(m => m.type === 'veg'));
        }).catch(e => console.error(e));
    }, []);

    const handleType = (t) => {
        setType(t);
        setFiltered(menu.filter(m => m.type === t));
    };

    const addToCart = (item) => {
        setCart(prev => {
            const ex = prev.find(i => i.menuItemId === item._id);
            if (ex) return prev.map(i => i.menuItemId === item._id ? { ...i, qty: i.qty + 1 } : i);
            return [...prev, { menuItemId: item._id, name: item.name, emoji: item.emoji, price: item.price, qty: 1 }];
        });
    };

    const updateQty = (id, d) => {
        setCart(prev => {
            const arr = prev.map(i => i.menuItemId === id ? { ...i, qty: i.qty + d } : i);
            return arr.filter(i => i.qty > 0);
        });
    };

    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

    const placeOrder = async () => {
        if (!user || user.role !== 'customer') {
            alert('Please login as a customer to place orders!');
            navigate('/login');
            return;
        }
        if (cart.length === 0) return alert('Cart is empty!');
        if (mode === 'dinein' && !table) return alert('Enter table number for dine-in');

        try {
            const res = await axios.post('/orders', {
                type: mode,
                table: mode === 'dinein' ? table : undefined,
                address: mode === 'delivery' ? user.address : undefined,
                items: cart,
                total
            });
            alert(`🎉 Shukriya! Order Placed Successfully!\nOrder ID: ${res.data._id}`);
            setCart([]);
            setCartOpen(false);
        } catch (e) {
            alert('Error placing order: ' + (e.response?.data?.error || e.message));
        }
    };

    return (
        <div>
            <div style={{ textAlign: 'center', margin: '20px 0 40px' }}>
                <h1 style={{ fontSize: '3rem', color: 'var(--primary-dark)', letterSpacing: '2px' }}>Hotel New Kishan</h1>
                <p style={{ color: 'var(--text-muted)' }}>Mr. Kuldip Khairnar · Authentic Cuisine Since 1995</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '30px' }}>
                <button onClick={() => setMode('dinein')} className="btn" style={{ background: mode === 'dinein' ? 'var(--primary)' : 'white', color: mode === 'dinein' ? 'white' : 'var(--text)', border: '1px solid var(--border)' }}>🍽️ Dine-In</button>
                <button onClick={() => setMode('delivery')} className="btn" style={{ background: mode === 'delivery' ? 'var(--primary)' : 'white', color: mode === 'delivery' ? 'white' : 'var(--text)', border: '1px solid var(--border)' }}>🛵 Home Delivery</button>
            </div>

            {mode === 'dinein' && (
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <input type="text" placeholder="Table No (e.g. 5)" value={table} onChange={e => setTable(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', textAlign: 'center' }} />
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
                <button onClick={() => handleType('veg')} className="btn" style={{ background: type === 'veg' ? '#27ae60' : 'white', color: type === 'veg' ? 'white' : 'var(--text)', border: '1px solid #27ae60' }}>🟢 Vegetarian</button>
                <button onClick={() => handleType('nonveg')} className="btn" style={{ background: type === 'nonveg' ? '#e74c3c' : 'white', color: type === 'nonveg' ? 'white' : 'var(--text)', border: '1px solid #e74c3c' }}>🔴 Non-Veg</button>
            </div>

            <div className="menu-grid">
                {filtered.map(item => {
                    const inCart = cart.find(c => c.menuItemId === item._id);
                    return (
                        <div key={item._id} className="menu-card">
                            <div className="menu-header">
                                <div>
                                    <div className="menu-name">{item.emoji} {item.name}</div>
                                    <div style={{ fontSize: '13px', color: 'var(--primary)', marginTop: '2px' }}>{item.nameHi}</div>
                                </div>
                                <div className="menu-price">₹{item.price}</div>
                            </div>
                            <div className="menu-desc">{item.desc}</div>
                            <div style={{ marginTop: '16px' }}>
                                {!inCart ? (
                                    <button onClick={() => addToCart(item)} className="btn btn-outline" style={{ padding: '6px 12px', width: '100%' }}>+ ADD</button>
                                ) : (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--primary)', borderRadius: '8px', padding: '4px' }}>
                                        <button onClick={() => updateQty(item._id, -1)} style={{ background: 'transparent', border: 'none', fontSize: '20px', color: 'var(--primary)', cursor: 'pointer', padding: '0 10px' }}>-</button>
                                        <span style={{ fontWeight: 'bold' }}>{inCart.qty}</span>
                                        <button onClick={() => updateQty(item._id, 1)} style={{ background: 'transparent', border: 'none', fontSize: '20px', color: 'var(--primary)', cursor: 'pointer', padding: '0 10px' }}>+</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Cart Float Button */}
            {cart.length > 0 && (
                <button onClick={() => setCartOpen(true)} className="btn btn-primary" style={{ position: 'fixed', bottom: '30px', right: '30px', borderRadius: '30px', padding: '15px 30px', fontSize: '1.2rem', boxShadow: 'var(--shadow-hover)', zIndex: 100 }}>
                    🛒 View Cart ({cart.reduce((a, b) => a + b.qty, 0)} items)
                </button>
            )}

            {/* Cart Sidebar */}
            <div className={`cart-panel ${cartOpen ? 'open' : ''}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2>Your Order</h2>
                    <button onClick={() => setCartOpen(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>×</button>
                </div>

                <div className="cart-items">
                    {cart.map(item => (
                        <div key={item.menuItemId} className="cart-item">
                            <div>
                                <strong>{item.emoji} {item.name}</strong>
                                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>₹{item.price} x {item.qty}</div>
                            </div>
                            <div style={{ fontWeight: 'bold' }}>₹{item.price * item.qty}</div>
                        </div>
                    ))}
                    {cart.length === 0 && <p className="text-center mt-4">Cart is empty</p>}
                </div>

                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '20px' }}>
                        <span>Total:</span>
                        <span style={{ color: 'var(--primary-dark)' }}>₹{total}</span>
                    </div>
                    <button onClick={placeOrder} className="btn btn-primary" style={{ width: '100%', fontSize: '1.1rem', padding: '14px' }}>
                        {user ? 'Confirm && Place Order' : 'Login to Order'}
                    </button>
                </div>
            </div>
        </div>
    );
}
