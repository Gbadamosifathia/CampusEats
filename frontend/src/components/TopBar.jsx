import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import logo from '../assets/logo.png';
import './TopBar.css';

function TopBar() {
  const [firstName, setFirstName] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const res = await fetch('http://127.0.0.1:8000/api/me/', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setFirstName(data.first_name);
          }
        } catch (error) {
          console.error("Failed to fetch user data", error);
        }
      }
    };
    fetchUser();
  }, []);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <img src={logo} alt="CampusEats Logo" className="logo-img" />
        {firstName && <h2 className="welcome-text">Welcome, {firstName}</h2>}
      </div>
      <div className="topbar-right">
        <button className="icon-btn" aria-label="Notifications">
          <Bell size={24} color="#1c1c1e" strokeWidth={1.5} />
        </button>
        <div className="avatar">
          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" alt="User Avatar" />
        </div>
      </div>
    </header>
  );
}

export default TopBar;
