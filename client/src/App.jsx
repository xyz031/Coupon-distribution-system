import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './App.css';
import CouponClaim from './components/CouponClaim';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import AdminClaimHistory from './components/AdminClaimHistory';

function App() {
  const [admin, setAdmin] = useState(null);

  // Check for existing admin token on initial load
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setAdmin({ username: 'admin' }); // Ideally, verify the token with the server
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setAdmin(null);
  };

  return (
    <Router>
      <div className="App">
        <Header admin={admin} handleLogout={handleLogout} />

        <Routes>
          <Route path="/" element={<CouponClaim />} />
          <Route 
            path="/admin/login" 
            element={admin ? <Navigate to="/admin/dashboard" /> : <AdminLogin setAdmin={setAdmin} />} 
          />
          <Route 
            path="/admin/dashboard" 
            element={admin ? <AdminDashboard /> : <Navigate to="/admin/login" />} 
          />
          <Route 
            path="/admin/claim-history" 
            element={admin ? <AdminClaimHistory /> : <Navigate to="/admin/login" />} 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

// Header Component with Login/Logout Button
const Header = ({ admin, handleLogout }) => {
  const navigate = useNavigate();

  return (
    <header>
      <h1 onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        Coupon Distribution System
      </h1>
      {admin ? (
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      ) : (
        <button onClick={() => navigate('/admin/login')} className="login-btn">
          Admin Login
        </button>
      )}
    </header>
  );
};

export default App;
