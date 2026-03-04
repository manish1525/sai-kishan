import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function OwnerLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try { await login(email, password, true); navigate('/admin'); }
        catch (err) { setError(err.response?.data?.error || 'Login failed'); }
    };

    return (
        <div className="auth-container">
            <div className="card" style={{ borderTop: '4px solid var(--primary)' }}>
                <h2 className="text-center mb-4">Owner / Admin Login</h2>
                <p className="text-center mb-4 text-sm" style={{ color: 'var(--text-muted)' }}>Mr. Kuldip Khairnar - Hotel New Kishan</p>
                {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
                <form onSubmit={handleLogin}>
                    <div className="form-group"><label className="form-label">Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} className="form-input" required /></div>
                    <div className="form-group"><label className="form-label">Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} className="form-input" required /></div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', background: '#2c3e50' }}>Login to Dashboard</button>
                </form>
            </div>
        </div>
    );
}
