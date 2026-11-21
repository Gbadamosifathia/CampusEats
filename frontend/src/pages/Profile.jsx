import React, { useState, useEffect, useRef } from 'react';
import { User, MapPin, CreditCard, Bell, HelpCircle, LogOut, ChevronRight, Camera, Save, Plus, Edit2, Trash2, Package, CheckCircle, Clock, FileText, RefreshCw, Moon, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { API_URL } from '../config';
import { useNavigate } from 'react-router-dom';
import {
  registerDeviceTokenWithBackend,
  requestAndRegisterNotifications,
  showBrowserNotification,
  playNotificationChime,
} from '../utils/notifications';
import './Profile.css';

// Helper to decode JWT token
const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

function Profile() {
  const { user, token, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  
  // Data States
  const [vendorProfile, setVendorProfile] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const vendorIdRef = useRef(null);
  
  // UI States
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'menu', 'settings'
  const [isVendor, setIsVendor] = useState(false);
  const [showAddDish, setShowAddDish] = useState(false);

  // Notification States
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    typeof Notification !== 'undefined' && Notification.permission === 'granted'
  );
  const [notificationLoading, setNotificationLoading] = useState(false);
  const previousOrderIdsRef = useRef(new Set());
  const initialOrdersLoadedRef = useRef(false);

  // New Dish Form State
  const [dishForm, setDishForm] = useState({
    name: '',
    price: '',
    description: '',
    is_available: true,
    image: null,
    imagePreview: null
  });
  const [editingDishId, setEditingDishId] = useState(null);
  const [savingDish, setSavingDish] = useState(false);

  // Fetch vendor orders (used for initial load + polling)
  const fetchVendorOrders = async (vendorId) => {
    if (!vendorId || !token) return;
    try {
      const ordersRes = await fetch(`${API_URL}/api/vendor/${vendorId}/orders/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();

        // Detect newly arrived orders after initial load to trigger live alert
        if (initialOrdersLoadedRef.current) {
          const newOrders = ordersData.filter(o => !previousOrderIdsRef.current.has(o.id));
          if (newOrders.length > 0) {
            playNotificationChime();
            const latest = newOrders[0];
            showBrowserNotification(`New Order #${latest.id}! 🛍️`, {
              body: `Total: ₦${parseFloat(latest.total_amount).toLocaleString()} - Status: ${latest.status}`,
              tag: `order-${latest.id}`
            });
          }
        } else {
          initialOrdersLoadedRef.current = true;
        }

        previousOrderIdsRef.current = new Set(ordersData.map(o => o.id));
        setOrders(ordersData);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error("Error polling orders:", error);
    }
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);

        // Decode token to get user ID without hitting the backend
        const decoded = parseJwt(token);
        const currentUserId = decoded ? decoded.user_id : null;
        
        if (!currentUserId) {
           setLoading(false);
           return;
        }

        // Fetch all vendors to find ours
        const vendorsRes = await fetch(`${API_URL}/api/vendor_list/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (vendorsRes.ok) {
          const vendors = await vendorsRes.json();
          // Find the vendor owned by the current user ID
          const myVendor = vendors.find(v => String(v.owner) === String(currentUserId));
          
          if (myVendor) {
            setIsVendor(true);
            setVendorProfile(myVendor);
            vendorIdRef.current = myVendor.id;
            
            // Fetch Vendor's Menu Items and Orders simultaneously (Parallel fetching)
            const menuPromise = fetch(`${API_URL}/api/menuitem_list/?vendor=${myVendor.id}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            const ordersPromise = fetchVendorOrders(myVendor.id);

            const [menuRes] = await Promise.all([menuPromise, ordersPromise]);
            
            if (menuRes.ok) {
              const menuData = await menuRes.json();
              setMenuItems(menuData);
            }
          } else {
            setIsVendor(false);
          }
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [token]);

  // If vendor has notification permission granted, sync device token with /api/savetoken/
  useEffect(() => {
    if (isVendor && token && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      registerDeviceTokenWithBackend(token);
    }
  }, [isVendor, token]);

  // Poll for new vendor orders every 15 seconds
  useEffect(() => {
    if (!isVendor) return;
    const interval = setInterval(() => {
      if (vendorIdRef.current) fetchVendorOrders(vendorIdRef.current);
    }, 15000);
    return () => clearInterval(interval);
  }, [isVendor, token]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleEnableNotifications = async () => {
    setNotificationLoading(true);
    try {
      const res = await requestAndRegisterNotifications(token);
      if (res.success || res.permission === 'granted') {
        setNotificationsEnabled(true);
        playNotificationChime();
        showBrowserNotification('Order Alerts Active! 🔔', {
          body: 'You will receive immediate alerts whenever a customer places an order.'
        });
      } else {
        alert(res.error || 'Could not enable notifications. Please allow notifications in your browser settings.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setNotificationLoading(false);
    }
  };

  const handleStudentNotificationClick = async () => {
    if (!('Notification' in window)) {
      alert('Notifications are not supported in this browser.');
      return;
    }
    if (Notification.permission === 'granted') {
      alert('✅ Notifications are already active! You will receive alerts when your order status changes.');
      return;
    }
    const res = await requestAndRegisterNotifications(token);
    if (res.permission === 'granted' || res.success) {
      playNotificationChime();
      showBrowserNotification('CampusEats Alerts Enabled! 🎉', {
        body: 'We will notify you when your meals are preparing and ready for pickup.'
      });
    } else if (res.error) {
      alert(res.error);
    }
  };

  const handleToggleOpen = async () => {
    if (!vendorProfile) return;
    const newStatus = !vendorProfile.is_open;
    try {
      const res = await fetch(`${API_URL}/api/vendor/${vendorProfile.id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...vendorProfile,
          is_open: newStatus
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setVendorProfile(updated);
      } else {
        alert("Failed to update status");
      }
    } catch (error) {
      console.error("Error toggling open status:", error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDishForm({
        ...dishForm,
        image: file,
        imagePreview: URL.createObjectURL(file)
      });
    }
  };

  const handleEditClick = (dish) => {
    setEditingDishId(dish.id);
    setDishForm({
      name: dish.name,
      price: dish.price,
      description: dish.description,
      is_available: dish.is_available,
      image: null,
      imagePreview: dish.image_url || null
    });
    setShowAddDish(true);
  };

  const handleAddDish = async (e) => {
    e.preventDefault();
    if (!vendorProfile) return;
    setSavingDish(true);
    
    try {
      let imageUrl = null;
      if (dishForm.image) {
        const cloudinaryData = new FormData();
        cloudinaryData.append("file", dishForm.image);
        cloudinaryData.append("upload_preset", "CampusEat");
        
        const cloudinaryRes = await fetch("https://api.cloudinary.com/v1_1/nvte2bmp/image/upload", {
          method: "POST",
          body: cloudinaryData
        });
        
        if (cloudinaryRes.ok) {
          const uploadedData = await cloudinaryRes.json();
          imageUrl = uploadedData.secure_url;
        } else {
          console.error("Cloudinary upload failed");
          alert("Image upload failed. Please try again.");
          setSavingDish(false);
          return;
        }
      }

      const formData = new FormData();
      formData.append('vendor', vendorProfile.id);
      formData.append('name', dishForm.name);
      formData.append('price', dishForm.price);
      formData.append('description', dishForm.description);
      formData.append('is_available', dishForm.is_available);
      if (imageUrl) {
        formData.append('image_url', imageUrl);
      }

      const url = editingDishId ? `${API_URL}/api/menuitem/${editingDishId}/` : `${API_URL}/api/menuitem_list/`;
      const method = editingDishId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (res.ok) {
        const savedDish = await res.json();
        if (editingDishId) {
          setMenuItems(menuItems.map(d => d.id === editingDishId ? savedDish : d));
        } else {
          setMenuItems([...menuItems, savedDish]);
        }
        setShowAddDish(false);
        setEditingDishId(null);
        setDishForm({ name: '', price: '', description: '', is_available: true, image: null, imagePreview: null });
      } else {
        alert("Failed to save dish.");
      }
    } catch (error) {
      console.error("Error adding dish:", error);
    } finally {
      setSavingDish(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      // Backend route: /api/order/<id>/status/
      const res = await fetch(`${API_URL}/api/order/${orderId}/status/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        const updatedOrder = await res.json();
        setOrders(orders.map(o => o.id === orderId ? updatedOrder : o));
      }
    } catch (error) {
      console.error("Failed to update order status", error);
    }
  };

  const deleteMenuItem = async (dishId) => {
    if (!window.confirm("Are you sure you want to delete this dish?")) return;
    try {
      const res = await fetch(`${API_URL}/api/menuitem/${dishId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setMenuItems(menuItems.filter(m => m.id !== dishId));
      }
    } catch (error) {
      console.error("Failed to delete dish", error);
    }
  };

  const studentMenuItems = [
    { icon: <User size={20} />, title: 'Personal Information', route: '/profile/personal-info' },
    { icon: <MapPin size={20} />, title: 'Saved Addresses', route: '/profile/saved-addresses' },
    { icon: <CreditCard size={20} />, title: 'Payment Methods', route: null },
    { icon: <Bell size={20} />, title: 'Notifications', onClick: handleStudentNotificationClick },
    { icon: <HelpCircle size={20} />, title: 'Help & Support', route: null },
  ];

  if (loading) {
    return <div className="profile-page loading"><p>Loading profile...</p></div>;
  }

  return (
    <div className="profile-page">
      <header className={`profile-header ${isVendor ? 'vendor-header' : ''}`}>
        {isVendor && vendorProfile ? (
          <>
            <div className="header-left">
              <div className="mock-logo">
                <span style={{color: '#a03500', fontWeight: 'bold', fontSize: '12px'}}>
                  {vendorProfile.name ? vendorProfile.name.substring(0, 2).toUpperCase() : 'CE'}
                </span>
              </div>
              <div className="header-titles">
                <h1 className="profile-title">{vendorProfile.name}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <p className="profile-subtitle">Vendor Dashboard</p>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={vendorProfile.is_open} onChange={handleToggleOpen} />
                    <span className="slider round"></span>
                  </label>
                  <span style={{fontSize: '10px', fontWeight: 'bold', color: vendorProfile.is_open ? '#4caf50' : '#f44336'}}>
                    {vendorProfile.is_open ? 'OPEN' : 'CLOSED'}
                  </span>
                </div>
              </div>
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

      {isVendor ? (
        <div className="vendor-dashboard">
          {/* Tabs */}
          <div className="vendor-tabs">
            <button 
              className={`vendor-tab ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <Package size={18} /> Orders
            </button>
            <button 
              className={`vendor-tab ${activeTab === 'menu' ? 'active' : ''}`}
              onClick={() => setActiveTab('menu')}
            >
              <FileText size={18} /> Menu
            </button>
            <button 
              className={`vendor-tab ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <User size={18} /> Settings
            </button>
          </div>

          <main className="dashboard-content">
            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="tab-pane orders-pane fade-in">
                {/* Push Notification Alert Banner */}
                <div className="vendor-notification-banner">
                  <div className="notification-banner-left">
                    <div className={`notification-banner-icon ${notificationsEnabled ? 'active' : ''}`}>
                      <Bell size={18} />
                    </div>
                    <div>
                      <p className="notification-banner-title">
                        {notificationsEnabled ? 'Live Order Alerts Active' : 'Order Push Notifications'}
                      </p>
                      <p className="notification-banner-sub">
                        {notificationsEnabled 
                          ? 'Receiving alerts for new incoming orders' 
                          : 'Get notified immediately when a customer orders'}
                      </p>
                    </div>
                  </div>
                  {notificationsEnabled ? (
                    <span className="notification-badge-active">Active</span>
                  ) : (
                    <button 
                      className="notification-enable-btn"
                      onClick={handleEnableNotifications}
                      disabled={notificationLoading}
                    >
                      {notificationLoading ? 'Enabling...' : 'Enable Alerts'}
                    </button>
                  )}
                </div>

                <div className="pane-header">
                  <h2>Active Orders <span className="badge">{orders.length}</span></h2>
                  <div className="orders-refresh">
                    {lastUpdated && (
                      <span className="last-updated">
                        <RefreshCw size={11} /> {lastUpdated.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                </div>

                {orders.length === 0 ? (
                  <div className="empty-state">
                    <Package size={48} color="#ccc" />
                    <p>No orders yet.</p>
                  </div>
                ) : (
                  <div className="orders-list">
                    {orders.map(order => (
                      <div key={order.id} className="order-card">
                        <div className="order-header">
                          <span className="order-id">Order #{order.id}</span>
                          <span className={`order-status status-${order.status ? order.status.toLowerCase() : 'pending'}`}>
                            {order.status || 'Pending'}
                          </span>
                        </div>
                        <div className="order-body">
                          <p><strong>Total:</strong> ₦{parseFloat(order.total_amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</p>
                          <p className="order-date">{new Date(order.created_at).toLocaleString()}</p>
                        </div>
                        <div className="order-actions">
                          {(order.status === 'Pending' || order.status === 'Paid') && (
                            <button className="btn-action prepare-btn" onClick={() => updateOrderStatus(order.id, 'Preparing')}>
                              <Clock size={16} /> Mark Preparing
                            </button>
                          )}
                          {order.status === 'Preparing' && (
                            <button className="btn-action ready-btn" onClick={() => updateOrderStatus(order.id, 'Completed')}>
                              <CheckCircle size={16} /> Mark Ready
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Menu Tab */}
            {activeTab === 'menu' && (
              <div className="tab-pane menu-pane fade-in">
                <div className="pane-header">
                  <h2>Menu Items <span className="badge">{menuItems.length}</span></h2>
                  <button className="add-dish-btn" onClick={() => { setEditingDishId(null); setDishForm({ name: '', price: '', description: '', is_available: true, image: null, imagePreview: null }); setShowAddDish(true); }}>
                    <Plus size={16} /> Add Dish
                  </button>
                </div>

                {menuItems.length === 0 ? (
                  <div className="empty-state">
                    <FileText size={48} color="var(--text-muted)" />
                    <p style={{ marginTop: '12px', marginBottom: '16px', color: 'var(--text-muted)' }}>No menu items yet.</p>
                    <button className="add-dish-btn" onClick={() => { setEditingDishId(null); setDishForm({ name: '', price: '', description: '', is_available: true, image: null, imagePreview: null }); setShowAddDish(true); }}>
                      <Plus size={16} /> Add Your First Dish
                    </button>
                  </div>
                ) : (
                  <div className="menu-list">
                    {menuItems.map(dish => (
                      <div key={dish.id} className="dish-card">
                        <div className="dish-img-placeholder"
                          style={dish.image_url ? { 
                            backgroundImage: `url(${dish.image_url})`, 
                            backgroundSize: 'cover',
                            backgroundPosition: 'center' 
                          } : {}}>
                          {!dish.image_url && <Camera size={24} color="#888" />}
                        </div>
                        <div className="dish-info">
                          <h3>{dish.name}</h3>
                          <p className="dish-price">₦{parseFloat(dish.price).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</p>
                          <p className="dish-desc">{dish.description}</p>
                          <span className={`dish-status ${dish.is_available ? 'available' : 'unavailable'}`}>
                            {dish.is_available ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </div>
                        <div className="dish-actions">
                          <button className="icon-btn edit-btn" onClick={() => handleEditClick(dish)}>
                            <Edit2 size={16} />
                          </button>
                          <button className="icon-btn delete-btn" onClick={() => deleteMenuItem(dish.id)}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add/Edit Dish Modal */}
                {showAddDish && (
                  <div className="modal-overlay">
                    <form className="dish-modal" onSubmit={handleAddDish}>
                      <div className="modal-header">
                        <h3>{editingDishId ? 'Edit Dish' : 'Add New Dish'}</h3>
                        <button className="cancel-btn" onClick={() => { setShowAddDish(false); setEditingDishId(null); setDishForm({ name: '', price: '', description: '', is_available: true, image: null, imagePreview: null }); }}>Cancel</button>
                      </div>

                      {/* Image Upload Box */}
                      <div className="form-group">
                        <label>Dish Photo</label>
                        <div className="upload-box" onClick={() => document.getElementById('dish-image-input').click()}>
                          {dishForm.imagePreview ? (
                            <img src={dishForm.imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
                          ) : (
                            <div className="upload-placeholder">
                              <Camera size={28} color="#888" />
                              <span>Click to upload dish photo</span>
                            </div>
                          )}
                          <input 
                            type="file" 
                            id="dish-image-input" 
                            style={{ display: 'none' }} 
                            accept="image/*" 
                            onChange={handleImageChange} 
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Dish Name</label>
                        <input 
                          type="text" 
                          required 
                          placeholder="e.g., Jollof Rice & Chicken" 
                          value={dishForm.name}
                          onChange={(e) => setDishForm({...dishForm, name: e.target.value})}
                        />
                      </div>

                      <div className="form-group">
                        <label>Price (₦)</label>
                        <div className="price-input-wrapper">
                          <span className="currency-symbol">₦</span>
                          <input 
                            type="number" 
                            required 
                            placeholder="0.00" 
                            value={dishForm.price}
                            onChange={(e) => setDishForm({...dishForm, price: e.target.value})}
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Description</label>
                        <textarea 
                          placeholder="Describe the ingredients, taste, and portion size..." 
                          rows="3"
                          value={dishForm.description}
                          onChange={(e) => setDishForm({...dishForm, description: e.target.value})}
                        ></textarea>
                      </div>

                      <button type="submit" className="save-menu-btn" disabled={savingDish}>
                        <Save size={20} /> {savingDish ? 'Saving...' : 'Save Menu Item'}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="tab-pane settings-pane fade-in">
                <h2>Store Settings</h2>
                <div className="settings-section">
                  <div className="form-group">
                    <label>Shop Name</label>
                    <input type="text" value={vendorProfile?.name || ''} readOnly />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea value={vendorProfile?.description || ''} readOnly rows="2"></textarea>
                  </div>
                  <div className="form-group">
                    <label>Contact Phone</label>
                    <input type="text" value={vendorProfile?.phone_number || ''} readOnly />
                  </div>

                  {/* Push Notifications setting */}
                  <div className="settings-item" style={{marginTop: '8px'}}>
                    <div className="settings-item-left">
                      <span className="settings-icon"><Bell size={20} /></span>
                      <span className="settings-item-title">Push Notifications</span>
                    </div>
                    {notificationsEnabled ? (
                      <span className="notification-badge-active">Active</span>
                    ) : (
                      <button 
                        className="notification-enable-btn" 
                        onClick={handleEnableNotifications}
                        disabled={notificationLoading}
                        style={{ padding: '6px 12px', fontSize: '11px' }}
                      >
                        {notificationLoading ? '...' : 'Turn On'}
                      </button>
                    )}
                  </div>
                  
                  {/* Dark mode toggle */}
                  <div className="settings-item">
                    <div className="settings-item-left">
                      <span className="settings-icon">{theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}</span>
                      <span className="settings-item-title">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} />
                      <span className="slider round"></span>
                    </label>
                  </div>

                  <button className="settings-item logout-btn" onClick={handleLogout} style={{marginTop: '8px'}}>
                    <div className="settings-item-left">
                      <span className="settings-icon"><LogOut size={20} /></span>
                      <span className="settings-item-title">Log Out</span>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      ) : (
        /* Student Profile View */
        <main className="profile-content">
          <div className="user-summary">
            <div className="avatar-wrapper">
              <img 
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" 
                alt="User Avatar" 
                className="user-avatar"
              />
            </div>
            <h2 className="user-name">{user?.first_name} {user?.last_name}</h2>
            <p className="user-email">{user?.email}</p>
          </div>

          <div className="settings-section">
            {studentMenuItems.map((item, index) => (
              <button
                key={index}
                className={`settings-item ${item.route || item.onClick ? '' : 'settings-item-disabled'}`}
                onClick={() => {
                  if (item.onClick) item.onClick();
                  else if (item.route) navigate(item.route);
                }}
              >
                <div className="settings-item-left">
                  <span className="settings-icon">{item.icon}</span>
                  <span className="settings-item-title">{item.title}</span>
                </div>
                <ChevronRight size={20} color={item.route || item.onClick ? '#c7c7cc' : '#e0e0e0'} />
              </button>
            ))}
            
            {/* Dark mode toggle */}
            <div className="settings-item">
              <div className="settings-item-left">
                <span className="settings-icon">{theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}</span>
                <span className="settings-item-title">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} />
                <span className="slider round"></span>
              </label>
            </div>

            <button className="settings-item logout-btn" onClick={handleLogout}>
              <div className="settings-item-left">
                <span className="settings-icon"><LogOut size={20} /></span>
                <span className="settings-item-title">Log Out</span>
              </div>
            </button>
          </div>
        </main>
      )}
    </div>
  );
}

export default Profile;
