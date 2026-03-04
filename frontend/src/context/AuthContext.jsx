import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || '');
    const [loading, setLoading] = useState(true);

    axios.defaults.baseURL = 'http://localhost:5000/api';

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            fetchUser();
        } else {
            setLoading(false);
        }
    }, [token]);

    const fetchUser = async () => {
        try {
            const res = await axios.get('/auth/me');
            setUser(res.data.user);
        } catch (err) {
            localStorage.removeItem('token');
            setToken('');
            setUser(null);
        }
        setLoading(false);
    };

    const login = async (email, password, isOwner = false) => {
        const url = isOwner ? '/auth/owner/login' : '/auth/customer/login';
        const res = await axios.post(url, { email, password });
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('token', res.data.token);
        return res.data.user;
    };

    const registerCustomer = async (data) => {
        const res = await axios.post('/auth/customer/register', data);
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('token', res.data.token);
        return res.data.user;
    };

    const logout = () => {
        setToken('');
        setUser(null);
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, registerCustomer, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
