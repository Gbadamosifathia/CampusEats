import React from 'react';
import { Home, Search, ReceiptText, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './BottomNav.css';

function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isVendor } = useAuth();

  const handleOrdersClick = () => {
    if (isVendor) {
      navigate('/profile');
      return;
    }
    const lastId = localStorage.getItem('last_order_id');
    if (lastId) {
      navigate(`/order-tracking/${lastId}`);
    } else {
      navigate('/order-tracking');
    }
  };

  const isOrdersActive = isVendor
    ? location.pathname === '/profile'
    : location.pathname.startsWith('/order-tracking');

  const isProfileActive = isVendor
    ? false
    : location.pathname === '/profile';

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
        <button
          className={`nav-item ${location.pathname === '/search' ? 'active' : ''}`}
          onClick={() => navigate('/search')}
        >
          <Search size={24} />
          <span>Search</span>
        </button>
        <button
          className={`nav-item ${isOrdersActive ? 'active' : ''}`}
          onClick={handleOrdersClick}
        >
          <ReceiptText size={24} />
          <span>Orders</span>
        </button>
        <button
          className={`nav-item ${isProfileActive ? 'active' : ''}`}
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
