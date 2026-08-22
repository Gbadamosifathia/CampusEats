import React from 'react';
import { Home, Search, ReceiptText, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import './BottomNav.css';

function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="bottom-nav-container">
      <nav className="bottom-nav">
        <button 
          className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}
          onClick={() => navigate('/')}
        >
          <Home size={24} />
          <span>Home</span>
        </button>
        <button className="nav-item">
          <Search size={24} />
          <span>Search</span>
        </button>
        <button 
          className={`nav-item ${location.pathname === '/checkout' ? 'active' : ''}`}
          onClick={() => navigate('/checkout')}
        >
          <ReceiptText size={24} />
          <span>Orders</span>
        </button>
        <button 
          className={`nav-item ${location.pathname === '/profile' ? 'active' : ''}`}
          onClick={() => navigate('/profile')}
        >
          <User size={24} />
          <span>Profile</span>
        </button>
      </nav>
    </div>
  );
}

export default BottomNav;
