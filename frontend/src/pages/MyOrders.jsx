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

// ── Star Rating Component ──────────────────────────────────────
function StarRating({ value, onChange }) {
    const [hovered, setHovered] = useState(0);
    return (
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', margin: '8px 0' }}>
            {[1, 2, 3, 4, 5].map(star => (
                <span
                    key={star}
                    onClick={() => onChange && onChange(star)}
                    onMouseEnter={() => onChange && setHovered(star)}
                    onMouseLeave={() => onChange && setHovered(0)}
                    style={{
                        fontSize: '32px',
                        cursor: onChange ? 'pointer' : 'default',
                        color: (hovered || value) >= star ? '#f39c12' : '#ddd',
                        transition: 'color 0.15s',
                        userSelect: 'none',
                    }}
                >★</span>
            ))}
        </div>
    );
}

// ── Review Modal ───────────────────────────────────────────────
function ReviewModal({ order, onClose, onSubmitted }) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (rating === 0) { setError('Pehle rating select karein ⭐'); return; }
        setLoading(true);
        setError('');
        try {
            await axios.post('/reviews', { orderId: order._id, rating, comment });
            onSubmitted();
            onClose();
        } catch (e) {
            setError(e.response?.data?.error || 'Kuch gadbad hui, dobara try karein');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: '16px',
        }}
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div style={{
                background: '#fff', borderRadius: '20px', padding: '32px 28px',
                maxWidth: '420px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
                animation: 'fadeInUp 0.25s ease',
            }}>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '6px' }}>⭐</div>
                    <h2 style={{ fontSize: '1.3rem', color: '#2c3e50', margin: 0 }}>Apna Review Dein</h2>
                    <p style={{ color: '#888', fontSize: '13px', marginTop: '4px' }}>
                        Order #{order._id.slice(-8).toUpperCase()} ke baare mein batayein
                    </p>
                    <div style={{ fontSize: '12px', color: '#aaa', marginTop: '4px' }}>
                        {order.items.map(i => `${i.emoji} ${i.name}`).join(', ')}
                    </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <p style={{ textAlign: 'center', fontWeight: 600, color: '#555', marginBottom: '0' }}>
                        Khana kaisa laga?
                    </p>
                    <StarRating value={rating} onChange={setRating} />
                    <p style={{ textAlign: 'center', fontSize: '13px', color: '#f39c12', minHeight: '18px' }}>
                        {rating === 1 ? 'Bahut bura 😞' : rating === 2 ? 'Theek nahi tha 😕' : rating === 3 ? 'Theek tha 🙂' : rating === 4 ? 'Bahut acha tha 😊' : rating === 5 ? 'Ekdum zabardast! 🤩' : ''}
                    </p>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <textarea
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        placeholder="Koi bhi baat likhein — khane ki quality, service... (optional)"
                        maxLength={500}
                        rows={3}
                        style={{
                            width: '100%', borderRadius: '10px', border: '1.5px solid #ddd',
                            padding: '10px 14px', fontSize: '14px', resize: 'vertical',
                            fontFamily: 'inherit', boxSizing: 'border-box',
                            outline: 'none', transition: 'border 0.2s',
                        }}
                        onFocus={e => e.target.style.border = '1.5px solid #8e44ad'}
                        onBlur={e => e.target.style.border = '1.5px solid #ddd'}
                    />
                    <div style={{ textAlign: 'right', fontSize: '11px', color: '#aaa' }}>{comment.length}/500</div>
                </div>

                {error && (
                    <div style={{
                        background: '#fdecea', color: '#c0392b', borderRadius: '8px',
                        padding: '8px 14px', fontSize: '13px', marginBottom: '14px', textAlign: 'center',
                    }}>{error}</div>
                )}

                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={onClose}
                        style={{
                            flex: 1, padding: '12px', borderRadius: '10px', border: '1.5px solid #ddd',
                            background: '#fff', color: '#555', fontWeight: 600, cursor: 'pointer', fontSize: '14px',
                        }}
                    >Baad mein</button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || rating === 0}
                        style={{
                            flex: 2, padding: '12px', borderRadius: '10px', border: 'none',
                            background: rating === 0 ? '#ccc' : 'linear-gradient(135deg, #8e44ad, #6c3483)',
                            color: '#fff', fontWeight: 700, cursor: rating === 0 ? 'not-allowed' : 'pointer',
                            fontSize: '14px', transition: 'all 0.2s',
                        }}
                    >
                        {loading ? '⏳ Submit ho raha hai...' : '⭐ Review Submit Karein'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Order Card ─────────────────────────────────────────────────
function OrderCard({ order, isReviewed, onReviewClick }) {
    const isCancelled = order.status === 'cancelled';
    const isDone = order.status === 'done';
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
                                const isStepDone = i < currentStep;
                                return (
                                    <React.Fragment key={step}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '64px' }}>
                                            <div style={{
                                                width: '42px',
                                                height: '42px',
                                                borderRadius: '50%',
                                                background: isStepDone ? '#27ae60' : isActive ? info.color : '#eee',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '18px',
                                                boxShadow: isActive ? `0 0 0 4px ${info.color}44` : 'none',
                                                transition: 'all 0.3s ease',
                                            }}>
                                                {isStepDone ? '✓' : stepInfo.emoji}
                                            </div>
                                            <div style={{
                                                fontSize: '11px',
                                                marginTop: '4px',
                                                fontWeight: isActive ? 700 : 400,
                                                color: isActive ? info.color : isStepDone ? '#27ae60' : '#aaa',
                                                textAlign: 'center',
                                            }}>
                                                {stepInfo.label}
                                            </div>
                                        </div>
                                        {i < STATUS_STEPS.length - 1 && (
                                            <div style={{
                                                flex: 1,
                                                height: '3px',
                                                background: isStepDone ? '#27ae60' : '#eee',
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

                {/* Review Section — only for 'done' orders */}
                {isDone && (
                    <div style={{ marginTop: '16px', borderTop: '1px solid #f0f0f0', paddingTop: '16px' }}>
                        {isReviewed ? (
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                background: '#f3e5f5', borderRadius: '10px',
                                padding: '10px 16px', color: '#8e44ad', fontWeight: 600, fontSize: '14px',
                            }}>
                                <span style={{ fontSize: '18px' }}>✅</span>
                                Aapne is order ka review de diya hai — Shukriya!
                            </div>
                        ) : (
                            <button
                                onClick={() => onReviewClick(order)}
                                style={{
                                    width: '100%', padding: '12px', borderRadius: '12px', border: 'none',
                                    background: 'linear-gradient(135deg, #8e44ad, #6c3483)',
                                    color: '#fff', fontWeight: 700, fontSize: '15px',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', gap: '8px',
                                    boxShadow: '0 4px 14px rgba(142,68,173,0.3)',
                                    transition: 'transform 0.15s, box-shadow 0.15s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(142,68,173,0.4)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(142,68,173,0.3)'; }}
                            >
                                ⭐ Apna Review Dein
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function MyOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [reviewedOrderIds, setReviewedOrderIds] = useState([]);
    const [reviewOrder, setReviewOrder] = useState(null); // order to be reviewed (modal)
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

    const fetchReviewedIds = async () => {
        try {
            const res = await axios.get('/reviews/my');
            setReviewedOrderIds(res.data.reviewedOrderIds || []);
        } catch (e) {
            console.error('Error fetching reviews:', e);
        }
    };

    useEffect(() => {
        if (!user || user.role !== 'customer') {
            navigate('/login');
            return;
        }
        fetchOrders();
        fetchReviewedIds();
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
            {/* Review Modal */}
            {reviewOrder && (
                <ReviewModal
                    order={reviewOrder}
                    onClose={() => setReviewOrder(null)}
                    onSubmitted={() => {
                        setReviewedOrderIds(prev => [...prev, reviewOrder._id]);
                        setReviewOrder(null);
                    }}
                />
            )}

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
                orders.map(order => (
                    <OrderCard
                        key={order._id}
                        order={order}
                        isReviewed={reviewedOrderIds.includes(order._id)}
                        onReviewClick={setReviewOrder}
                    />
                ))
            )}
        </div>
    );
}
