import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import OwnerLogin from './pages/OwnerLogin';
import OwnerDashboard from './pages/OwnerDashboard';

function Navbar() {
    const { user, logout } = React.useContext(AuthContext);
    return (
        <nav className="navbar">
            <div className="container nav-content">
                <Link to="/" className="logo">Hotel New Kishan</Link>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    {user ? (
                        <>
                            <span style={{ fontWeight: 600, color: 'var(--primary-dark)' }}>
                                Hi, {user.name} ({user.role})
                            </span>
                            {user.role === 'owner' && <Link to="/admin" className="btn btn-outline" style={{ padding: '6px 12px' }}>Dashboard</Link>}
                            <button onClick={logout} className="btn btn-logout" style={{ padding: '6px 12px' }}>Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-outline" style={{ padding: '6px 16px' }}>Customer Login</Link>
                            <Link to="/owner-login" style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'none' }}>Owner Panel</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

function App() {
    const { user } = React.useContext(AuthContext);

    const ProtectedOwner = ({ children }) => {
        if (!user) return <Navigate to="/owner-login" />;
        if (user.role !== 'owner') return <Navigate to="/" />;
        return children;
    };

    return (
        <BrowserRouter>
            <Navbar />
            <div className="container" style={{ paddingTop: '20px', paddingBottom: '60px' }}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
                    <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
                    <Route path="/owner-login" element={user?.role === 'owner' ? <Navigate to="/admin" /> : <OwnerLogin />} />
                    <Route path="/admin" element={<ProtectedOwner><OwnerDashboard /></ProtectedOwner>} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;
