import React from 'react';
import '../styles/header.css';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import api from '@/api.js';

export function Header() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/user/logout');
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="header">
      <div className="container header-content">
        <div className="header-left">
          <Link to="/products" className="brand">Marketplace Hub</Link>
        </div>

        <div className="header-center">
          <Link to="/adminProducts" className="header-link">Home</Link>
          <Link to="/adminOrders" className="header-link">Order History</Link>
          <Link to="/addProduct" className="header-link">Add Product</Link>
        </div>

        <div className="header-right">
          <LogOut className="header-icon logout-icon" onClick={handleLogout} />
        </div>
      </div>
    </header>
  );
}
