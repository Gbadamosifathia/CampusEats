import React from 'react';
import { ArrowLeft, User, Mail, AtSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './SubPage.css';

function PersonalInfo() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const fields = [
    { label: 'First Name', value: user?.first_name || '—', icon: <User size={18} /> },
    { label: 'Last Name', value: user?.last_name || '—', icon: <User size={18} /> },
    { label: 'Username', value: user?.username || '—', icon: <AtSign size={18} /> },
    { label: 'Email Address', value: user?.email || '—', icon: <Mail size={18} /> },
  ];

  return (
    <div className="subpage">
      <header className="subpage-header">
        <button className="subpage-back" onClick={() => navigate('/profile')}>
          <ArrowLeft size={22} color="#1c1c1e" />
        </button>
        <h1>Personal Information</h1>
      </header>

      <div className="subpage-avatar-section">
        <img
          src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"
          alt="Avatar"
          className="subpage-avatar"
        />
        <p className="subpage-name">{user?.first_name} {user?.last_name}</p>
      </div>

      <div className="subpage-card">
        {fields.map((field, i) => (
          <div key={i} className="subpage-field">
            <div className="subpage-field-icon">{field.icon}</div>
            <div className="subpage-field-content">
              <span className="subpage-field-label">{field.label}</span>
              <span className="subpage-field-value">{field.value}</span>
            </div>
          </div>
        ))}
      </div>

      <p className="subpage-note">To update your details, please contact support.</p>
    </div>
  );
}

export default PersonalInfo;
