import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', address: '' });
    const [error, setError] = useState('');
    const { registerCustomer } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleReg = async (e) => {
        e.preventDefault();
        try { await registerCustomer(formData); navigate('/'); }
        catch (err) { setError(err.response?.data?.error || 'Registration failed'); }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    return (
        <div className="auth-container">
            <div className="card">
                <h2 className="text-center mb-4" style={{ color: 'var(--primary-dark)' }}>New Customer Registration</h2>
                {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
                <form onSubmit={handleReg}>
                    <div className="form-group"><label className="form-label">Name</label><input name="name" onChange={handleChange} className="form-input" required /></div>
                    <div className="form-group"><label className="form-label">Email</label><input name="email" type="email" onChange={handleChange} className="form-input" required /></div>
                    <div className="form-group"><label className="form-label">Phone No.</label><input name="phone" onChange={handleChange} className="form-input" required /></div>
                    <div className="form-group"><label className="form-label">Delivery Address</label><textarea name="address" onChange={handleChange} className="form-input" required></textarea></div>
                    <div className="form-group"><label className="form-label">Password</label><input name="password" type="password" onChange={handleChange} className="form-input" required minLength="6" /></div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Register & Start Ordering</button>
                </form>
                <p className="text-center mt-4">Already registered? <Link to="/login" style={{ color: 'var(--primary)' }}>Login</Link></p>
            </div>
        </div>
    );
}
