import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const STATUS_STEPS = ['pending', 'preparing', 'ready', 'done'];

const STATUS_INFO = {
    pending: { label: 'Pending', emoji: '🕐', color: '#f39c12', bg: '#fff8e1' },
    preparing: { label: 'Preparing', emoji: '👨‍🍳', color: '#2980b9', bg: '#e3f2fd' },
    ready: { label: 'Ready!', emoji: '✅', color: '#27ae60', bg: '#e8f5e9' },
    done: { label: 'Delivered', emoji: '🎉', color: '#8e44ad', bg: '#f3e5f5' },
    cancelled: { label: 'Cancelled', emoji: '❌', color: '#e74c3c', bg: '#fdecea' },
};

function OrderCard({ order }) {
    const isCancelled = order.status === 'cancelled';
    const currentStep = STATUS_STEPS.indexOf(order.status);
    const info = STATUS_INFO[order.status] || STATUS_INFO.pending;

    const date = new Date(order.createdAt);
    const dateStr = date.toLocaleDateString('hi-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const timeStr = date.toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' });

    return (
        <div style={{
            background: '#fff',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            marginBottom: '24px',
            overflow: 'hidden',
            border: `2px solid ${info.color}22`,
        }}>
            {/* Header */}
            <div style={{
                background: info.bg,
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px',
            }}>
                <div>
                    <div style={{ fontSize: '12px', color: '#888', marginBottom: '2px' }}>
                        Order ID: <span style={{ fontFamily: 'monospace', color: '#333' }}>#{order._id.slice(-8).toUpperCase()}</span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#555' }}>
                        📅 {dateStr} &nbsp; 🕓 {timeStr}
                    </div>
                </div>
                <div style={{
                    background: info.color,
                    color: '#fff',
                    borderRadius: '20px',
                    padding: '6px 16px',
                    fontWeight: 700,
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                }}>
                    {info.emoji} {info.label}
                </div>
            </div>

            <div style={{ padding: '20px' }}>
                {/* Progress Steps */}
                {!isCancelled && (
                    <div style={{ marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0 }}>
                            {STATUS_STEPS.map((step, i) => {
                                const stepInfo = STATUS_INFO[step];
                                const isActive = i === currentStep;
                                const isDone = i < currentStep;
                                return (
                                    <React.Fragment key={step}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '64px' }}>
                                            <div style={{
                                                width: '42px',
                                                height: '42px',
                                                borderRadius: '50%',
                                                background: isDone ? '#27ae60' : isActive ? info.color : '#eee',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '18px',
                                                boxShadow: isActive ? `0 0 0 4px ${info.color}44` : 'none',
                                                transition: 'all 0.3s ease',
                                            }}>
                                                {isDone ? '✓' : stepInfo.emoji}
                                            </div>
                                            <div style={{
                                                fontSize: '11px',
                                                marginTop: '4px',
                                                fontWeight: isActive ? 700 : 400,
                                                color: isActive ? info.color : isDone ? '#27ae60' : '#aaa',
                                                textAlign: 'center',
                                            }}>
                                                {stepInfo.label}
                                            </div>
                                        </div>
                                        {i < STATUS_STEPS.length - 1 && (
                                            <div style={{
                                                flex: 1,
                                                height: '3px',
                                                background: isDone ? '#27ae60' : '#eee',
                                                marginBottom: '18px',
                                                transition: 'background 0.3s ease',
                                            }} />
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Order Type + Details */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                    <span style={{ background: '#f0f0f0', borderRadius: '8px', padding: '4px 12px', fontSize: '13px' }}>
                        {order.type === 'dinein' ? '🍽️ Dine-In' : '🛵 Home Delivery'}
                    </span>
                    {order.type === 'dinein' && order.table && (
                        <span style={{ background: '#f0f0f0', borderRadius: '8px', padding: '4px 12px', fontSize: '13px' }}>
                            🪑 Table: {order.table}
                        </span>
                    )}
                    {order.type === 'delivery' && order.address && (
                        <span style={{ background: '#f0f0f0', borderRadius: '8px', padding: '4px 12px', fontSize: '13px' }}>
                            📍 {order.address}
                        </span>
                    )}
                </div>

                {/* Items */}
                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '12px' }}>
                    {order.items.map((item, idx) => (
                        <div key={idx} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '6px 0',
                            borderBottom: '1px dashed #f5f5f5',
                        }}>
                            <span style={{ fontSize: '14px' }}>
                                {item.emoji} {item.name}
                                <span style={{ color: '#aaa', marginLeft: '6px' }}>x{item.qty}</span>
                            </span>
                            <span style={{ fontWeight: 600, color: '#333' }}>₹{item.price * item.qty}</span>
                        </div>
                    ))}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginTop: '12px',
                        fontWeight: 700,
                        fontSize: '16px',
                    }}>
                        <span>Total</span>
                        <span style={{ color: 'var(--primary-dark, #c0392b)' }}>₹{order.total}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function MyOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const fetchOrders = async () => {
        try {
            const res = await axios.get('/orders/myorders');
            setOrders(res.data);
            setLastUpdated(new Date());
        } catch (e) {
            console.error('Error fetching orders:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user || user.role !== 'customer') {
            navigate('/login');
            return;
        }
        fetchOrders();
        // Auto-refresh har 15 seconds mein
        const interval = setInterval(fetchOrders, 15000);
        return () => clearInterval(interval);
    }, [user]);

    if (loading) return (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔄</div>
            <p style={{ color: '#888' }}>Orders load ho rahe hain...</p>
        </div>
    );

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto', padding: '20px' }}>
            {/* Page Header */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h1 style={{ fontSize: '2rem', color: 'var(--primary-dark, #c0392b)', marginBottom: '8px' }}>
                    📦 Meri Orders
                </h1>
                <p style={{ color: '#888', fontSize: '14px' }}>
                    Apni saari orders yahan dekh sakte hain
                </p>
                {lastUpdated && (
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: '#f0f9f0',
                        border: '1px solid #c8e6c9',
                        borderRadius: '20px',
                        padding: '4px 14px',
                        fontSize: '12px',
                        color: '#27ae60',
                        marginTop: '8px',
                    }}>
                        🟢 Live tracking — har 15 sec mein update hota hai
                    </div>
                )}
            </div>

            {/* Manual Refresh Button */}
            <div style={{ textAlign: 'right', marginBottom: '16px' }}>
                <button
                    onClick={fetchOrders}
                    style={{
                        background: 'white',
                        border: '1px solid var(--border, #ddd)',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        color: '#555',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                    }}
                >
                    🔄 Refresh
                </button>
            </div>

            {/* Orders List */}
            {orders.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    background: '#fafafa',
                    borderRadius: '16px',
                    border: '2px dashed #ddd',
                }}>
                    <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🍽️</div>
                    <h3 style={{ color: '#555', marginBottom: '8px' }}>Abhi koi order nahi hai</h3>
                    <p style={{ color: '#aaa', marginBottom: '24px' }}>Menu se kuch order karein!</p>
                    <button
                        onClick={() => navigate('/')}
                        className="btn btn-primary"
                        style={{ padding: '12px 28px', fontSize: '15px' }}
                    >
                        🛒 Menu Dekho
                    </button>
                </div>
            ) : (
                orders.map(order => <OrderCard key={order._id} order={order} />)
            )}
        </div>
    );
}
