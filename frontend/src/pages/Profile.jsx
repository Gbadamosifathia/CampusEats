import React, { useState } from 'react';
import { User, MapPin, CreditCard, Bell, HelpCircle, LogOut, ChevronRight, Camera, Save } from 'lucide-react';
import './Profile.css';

function Profile() {
  const [isVendor, setIsVendor] = useState(true); // Mocking vendor state

  const menuItems = [
    { icon: <User size={20} />, title: 'Personal Information' },
    { icon: <MapPin size={20} />, title: 'Saved Addresses' },
    { icon: <CreditCard size={20} />, title: 'Payment Methods' },
    { icon: <Bell size={20} />, title: 'Notifications' },
    { icon: <HelpCircle size={20} />, title: 'Help & Support' },
  ];

  return (
    <div className="profile-page">
      <header className={`profile-header ${isVendor ? 'vendor-header' : ''}`}>
        {isVendor ? (
          <>
            <div className="header-left">
              {/* Mock logo space */}
              <div className="mock-logo">
                <span style={{color: '#a03500', fontWeight: 'bold', fontSize: '10px'}}>CE</span>
              </div>
              <h1 className="profile-title" style={{color: '#a03500', marginLeft: '4px'}}>Profile</h1>
            </div>
            <img 
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" 
              alt="User Avatar" 
              className="header-avatar"
            />
          </>
        ) : (
          <h1 className="profile-title">Profile</h1>
        )}
      </header>

      <main className="profile-content">
        {isVendor ? (
          <div className="vendor-add-menu">
            <h2>Add Menu Item</h2>
            <p className="subtitle">Fill out the details below to add a new dish to your menu.</p>

            <div className="form-group">
              <label>Dish Photo</label>
              <div className="upload-box">
                <Camera size={32} color="#a03500" />
                <span className="upload-text">Upload Dish Photo</span>
              </div>
            </div>

            <div className="form-group">
              <label>Dish Name</label>
              <input type="text" placeholder="e.g. Spicy Jollof Rice" />
            </div>

            <div className="form-group">
              <label>Price (₦)</label>
              <div className="price-input-wrapper">
                <span className="currency-symbol">₦</span>
                <input type="number" placeholder="0.00" />
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea placeholder="Describe the ingredients, taste, and portion size..." rows="4"></textarea>
            </div>

            <button className="save-menu-btn">
              <Save size={20} /> Save Menu Item
            </button>
          </div>
        ) : (
          <>
            <div className="user-summary">
              <div className="avatar-wrapper">
                <img 
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" 
                  alt="User Avatar" 
                  className="user-avatar"
                />
              </div>
              <h2 className="user-name">Alex Johnson</h2>
              <p className="user-email">alex.johnson@example.com</p>
            </div>

            <div className="settings-section">
              {menuItems.map((item, index) => (
                <button key={index} className="settings-item">
                  <div className="settings-item-left">
                    <span className="settings-icon">{item.icon}</span>
                    <span className="settings-item-title">{item.title}</span>
                  </div>
                  <ChevronRight size={20} color="#c7c7cc" />
                </button>
              ))}
              
              <button className="settings-item logout-btn">
                <div className="settings-item-left">
                  <span className="settings-icon"><LogOut size={20} /></span>
                  <span className="settings-item-title">Log Out</span>
                </div>
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default Profile;
