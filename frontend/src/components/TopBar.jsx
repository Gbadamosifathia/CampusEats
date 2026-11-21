import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';
import './TopBar.css';

function TopBar({ children }) {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="topbar">
      <div className="topbar-left" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <img src={logo} alt="CampusEats Logo" className="logo-img" />
      </div>
      
      {children && (
        <div className="topbar-center">
          {children}
        </div>
      )}

      <div className="topbar-right">
        {token ? (
          <div 
            className="topbar-avatar" 
            onClick={() => navigate('/profile')} 
            role="button" 
            title={user?.first_name ? `${user.first_name}'s Profile` : 'View Profile'}
          >
            {user?.first_name ? (
              <div className="avatar-initial">
                {user.first_name.charAt(0).toUpperCase()}
              </div>
            ) : (
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" 
                alt="User Avatar" 
              />
            )}
          </div>
        ) : (
          <button 
            className="topbar-auth-btn" 
            onClick={() => navigate('/login')}
          >
            Log In / Sign Up
          </button>
        )}
      </div>
    </header>
  );
}

export default TopBar;
