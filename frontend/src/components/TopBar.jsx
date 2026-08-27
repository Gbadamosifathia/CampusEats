import React from 'react';
import { Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';
import './TopBar.css';

function TopBar() {
  const { user } = useAuth();
  const firstName = user?.first_name || '';

  return (
    <header className="topbar">
      <div className="topbar-left">
        <img src={logo} alt="CampusEats Logo" className="logo-img" />
        <div className="greeting">
          <span className="greeting-sub">Welcome back 👋</span>
          {firstName && <h2 className="greeting-name">{firstName}</h2>}
        </div>
      </div>
      <div className="topbar-right">
        <button className="topbar-icon-btn" aria-label="Notifications">
          <Bell size={20} color="#1c1c1e" strokeWidth={1.5} />
        </button>
        <div className="topbar-avatar">
          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" alt="User Avatar" />
        </div>
      </div>
    </header>
  );
}

export default TopBar;
