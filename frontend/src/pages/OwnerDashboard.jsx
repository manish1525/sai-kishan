import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function OwnerDashboard() {
    const [tab, setTab] = useState('orders');
    const [stats, setStats] = useState({ pending: 0, doneToday: 0, revenueToday: 0 });
    const [orders, setOrders] = useState([]);
    const [menu, setMenu] = useState([]);

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
            }
        } catch (e) { console.error('Error fetching data', e); }
    };

    const updateOrderStatus = async (id, status) => {
        try { await axios.put(`/orders/${id}/status`, { status }); loadData(); } catch (e) { alert('Failed to update'); }
    };

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
                </div>
            </div>
        </div>
    );
}
