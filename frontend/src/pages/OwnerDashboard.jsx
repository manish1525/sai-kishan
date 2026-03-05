import React, { useState, useEffect } from 'react';
import axios from 'axios';

// ── Star display (read-only) ───────────────────────────────────
function Stars({ value }) {
    return (
        <span>
            {[1, 2, 3, 4, 5].map(s => (
                <span key={s} style={{ fontSize: '18px', color: s <= value ? '#f39c12' : '#ddd' }}>★</span>
            ))}
        </span>
    );
}

export default function OwnerDashboard() {
    const [tab, setTab] = useState('orders');
    const [stats, setStats] = useState({ pending: 0, doneToday: 0, revenueToday: 0 });
    const [orders, setOrders] = useState([]);
    const [menu, setMenu] = useState([]);
    const [reviews, setReviews] = useState([]);

    useEffect(() => { loadData(); const i = setInterval(loadData, 10000); return () => clearInterval(i); }, [tab]);

    const loadData = async () => {
        try {
            const s = await axios.get('/orders/stats');
            setStats(s.data);
            if (tab === 'orders') {
                const res = await axios.get('/orders/all?status=pending');
                setOrders(res.data);
            } else if (tab === 'history') {
                const res = await axios.get('/orders/all?status=done');
                setOrders(res.data);
            } else if (tab === 'menu') {
                const res = await axios.get('/menu/all');
                setMenu(res.data);
            } else if (tab === 'reviews') {
                const res = await axios.get('/reviews/all');
                setReviews(res.data);
            }
        } catch (e) { console.error('Error fetching data', e); }
    };

    const updateOrderStatus = async (id, status) => {
        try { await axios.put(`/orders/${id}/status`, { status }); loadData(); } catch (e) { alert('Failed to update'); }
    };

    // Average rating
    const avgRating = reviews.length
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : null;

    return (
        <div>
            <h2 style={{ marginBottom: '20px' }}>Dashboard Overview (Mr. Kuldip Khairnar)</h2>
            <div className="stat-cards">
                <div className="stat-card"><h3>{stats.pending}</h3><p>Active Pending</p></div>
                <div className="stat-card" style={{ borderColor: 'var(--success)' }}><h3 style={{ color: 'var(--success)' }}>{stats.doneToday}</h3><p>Completed Today</p></div>
                <div className="stat-card" style={{ background: 'var(--primary-light)' }}><h3 style={{ color: 'var(--text)' }}>₹{stats.revenueToday}</h3><p style={{ color: 'white' }}>Today's Revenue</p></div>
            </div>

            <div className="admin-layout">
                <div className="sidebar">
                    <button className={`sidebar-btn ${tab === 'orders' ? 'active' : ''}`} onClick={() => setTab('orders')}>Live Orders</button>
                    <button className={`sidebar-btn ${tab === 'history' ? 'active' : ''}`} onClick={() => setTab('history')}>Order History</button>
                    <button className={`sidebar-btn ${tab === 'menu' ? 'active' : ''}`} onClick={() => setTab('menu')}>Menu Manger</button>
                    <button className={`sidebar-btn ${tab === 'reviews' ? 'active' : ''}`} onClick={() => setTab('reviews')}>⭐ Reviews</button>
                </div>

                <div className="admin-content card" style={{ maxWidth: '100%', padding: '24px' }}>
                    {tab === 'orders' && (
                        <div>
                            <h3>Pending Orders</h3>
                            {orders.length === 0 ? <p>No pending orders.</p> : orders.map(o => (
                                <div key={o._id} style={{ borderBottom: '1px solid var(--border)', padding: '15px 0' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                        <strong>{o.type === 'dinein' ? `Table ${o.table}` : 'Delivery'} - {o.customerName}</strong>
                                        <span style={{ color: 'var(--primary-dark)', fontWeight: 'bold' }}>₹{o.total}</span>
                                    </div>
                                    <div>{o.items.map(i => <div key={i.menuItemId}>{i.qty}x {i.name}</div>)}</div>
                                    <button onClick={() => updateOrderStatus(o._id, 'done')} className="btn btn-primary mt-4" style={{ background: 'var(--success)', padding: '6px 16px' }}>Mark as Done</button>
                                </div>
                            ))}
                        </div>
                    )}

                    {tab === 'history' && (
                        <div>
                            <h3>Order History</h3>
                            {orders.length === 0 ? <p>No completed orders.</p> : orders.map(o => (
                                <div key={o._id} style={{ borderBottom: '1px solid var(--border)', padding: '10px 0', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>{o.type === 'dinein' ? `Table ${o.table}` : 'Delivery'} ({o.customerName})</span>
                                    <span>₹{o.total}</span>
                                    <span style={{ color: 'var(--success)' }}>Complete</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {tab === 'menu' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3>Menu Items</h3>
                                <span className="text-sm">Cannot edit directly from this demo yet, fully operational via seed db</span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', marginTop: '20px' }}>
                                {menu.map(m => (
                                    <div key={m._id} style={{ border: '1px solid var(--border)', padding: '15px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                                        <div><strong>{m.name}</strong> ({m.type})</div>
                                        <span>₹{m.price}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {tab === 'reviews' && (
                        <div>
                            {/* Header + Summary */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                                <h3 style={{ margin: 0 }}>⭐ Customer Reviews</h3>
                                {avgRating && (
                                    <div style={{
                                        background: '#fff8e1', border: '1.5px solid #f39c12',
                                        borderRadius: '12px', padding: '8px 18px',
                                        display: 'flex', alignItems: 'center', gap: '10px',
                                    }}>
                                        <span style={{ fontSize: '28px', fontWeight: 800, color: '#f39c12' }}>{avgRating}</span>
                                        <div>
                                            <Stars value={Math.round(avgRating)} />
                                            <div style={{ fontSize: '12px', color: '#888' }}>{reviews.length} review{reviews.length !== 1 ? 's' : ''}</div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {reviews.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#aaa' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '10px' }}>⭐</div>
                                    <p>Abhi tak koi review nahi aaya hai.</p>
                                </div>
                            ) : (
                                reviews.map(r => (
                                    <div key={r._id} style={{
                                        background: '#fafafa', borderRadius: '12px',
                                        border: '1px solid #eee', padding: '16px 18px',
                                        marginBottom: '14px',
                                    }}>
                                        {/* Top row: name + date */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                                            <div>
                                                <span style={{ fontWeight: 700, fontSize: '15px', color: '#2c3e50' }}>
                                                    👤 {r.customerName}
                                                </span>
                                                <div style={{ marginTop: '4px' }}>
                                                    <Stars value={r.rating} />
                                                    <span style={{ marginLeft: '6px', fontSize: '13px', fontWeight: 700, color: '#f39c12' }}>
                                                        {r.rating}/5
                                                    </span>
                                                </div>
                                            </div>
                                            <span style={{ fontSize: '12px', color: '#aaa' }}>
                                                {new Date(r.createdAt).toLocaleDateString('hi-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                        </div>

                                        {/* Items ordered */}
                                        {r.items && r.items.length > 0 && (
                                            <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>
                                                🍽️ {r.items.join(', ')}
                                            </div>
                                        )}

                                        {/* Comment */}
                                        {r.comment ? (
                                            <div style={{
                                                background: '#fff', borderLeft: '3px solid #f39c12',
                                                borderRadius: '0 8px 8px 0', padding: '10px 14px',
                                                fontSize: '14px', color: '#444', fontStyle: 'italic',
                                            }}>
                                                "{r.comment}"
                                            </div>
                                        ) : (
                                            <div style={{ fontSize: '13px', color: '#bbb', fontStyle: 'italic' }}>Koi comment nahi</div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
