import React, { useState, useEffect, useRef } from 'react';
import { User, MapPin, CreditCard, Bell, HelpCircle, LogOut, ChevronRight, Camera, Save, Plus, Edit2, Trash2, Package, CheckCircle, Clock, FileText, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import { useNavigate } from 'react-router-dom';
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

  // New Dish Form State
  const [dishForm, setDishForm] = useState({
    name: '',
    price: '',
    description: '',
    is_available: true
  });
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
        setOrders(ordersData);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error("Error polling orders:", error);
    }
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!token) return;
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
          // Find the vendor owned by the current user ID (converting both to string to avoid type mismatch)
          const myVendor = vendors.find(v => String(v.owner) === String(currentUserId));
          
          if (myVendor) {
            setIsVendor(true);
            setVendorProfile(myVendor);
            vendorIdRef.current = myVendor.id;
            
            // Fetch Vendor's Menu Items
            const menuRes = await fetch(`${API_URL}/api/menuitem_list/?vendor=${myVendor.id}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (menuRes.ok) {
              const menuData = await menuRes.json();
              setMenuItems(menuData);
            }

            // Fetch initial orders
            await fetchVendorOrders(myVendor.id);
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

  const handleAddDish = async (e) => {
    e.preventDefault();
    if (!vendorProfile) return;
    setSavingDish(true);
    
    try {
      const res = await fetch(`${API_URL}/api/menuitem_list/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          vendor: vendorProfile.id,
          name: dishForm.name,
          price: dishForm.price,
          description: dishForm.description,
          is_available: dishForm.is_available
        })
      });

      if (res.ok) {
        const newDish = await res.json();
        setMenuItems([...menuItems, newDish]);
        setShowAddDish(false);
        setDishForm({ name: '', price: '', description: '', is_available: true });
      } else {
        alert("Failed to add dish.");
      }
    } catch (error) {
      console.error("Error adding dish:", error);
    } finally {
      setSavingDish(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      // Fixed URL to match backend route: /api/order/<id>/status/
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
    { icon: <Bell size={20} />, title: 'Notifications', route: null },
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
                          <p><strong>Total:</strong> ₦{order.total_amount}</p>
                          <p className="order-date">{new Date(order.created_at).toLocaleString()}</p>
                        </div>
                        <div className="order-actions">
                          {order.status === 'Pending' && (
                            <button className="btn-action prepare-btn" onClick={() => updateOrderStatus(order.id, 'Preparing')}>
                              <Clock size={16} /> Mark Preparing
                            </button>
                          )}
                          {order.status === 'Preparing' && (
                            <button className="btn-action complete-btn" onClick={() => updateOrderStatus(order.id, 'Completed')}>
                              <CheckCircle size={16} /> Mark Completed
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
                {!showAddDish ? (
                  <>
                    <div className="pane-header">
                      <h2>Your Menu</h2>
                      <button className="vendor-add-dish-btn" onClick={() => setShowAddDish(true)}>
                        <Plus size={18} /> Add Dish
                      </button>
                    </div>
                    
                    {menuItems.length === 0 ? (
                      <div className="empty-state">
                        <FileText size={48} color="#ccc" />
                        <p>Your menu is empty.</p>
                      </div>
                    ) : (
                      <div className="menu-grid">
                        {menuItems.map(dish => (
                          <div key={dish.id} className="menu-item-card">
                            <div className="dish-img-placeholder">
                              <span className="dish-price">₦{dish.price}</span>
                            </div>
                            <div className="dish-info">
                              <h3>{dish.name}</h3>
                              <p className="dish-desc">{dish.description}</p>
                            </div>
                            <div className="dish-actions">
                              <button className="icon-btn edit"><Edit2 size={16} /></button>
                              <button className="icon-btn delete" onClick={() => deleteMenuItem(dish.id)}>
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="vendor-add-menu fade-in">
                    <div className="pane-header">
                      <h2>Add New Dish</h2>
                      <button className="cancel-btn" onClick={() => setShowAddDish(false)}>Cancel</button>
                    </div>
                    
                    <form onSubmit={handleAddDish}>
                      <div className="form-group">
                        <label>Dish Photo</label>
                        <div className="upload-box">
                          <Camera size={32} color="#a03500" />
                          <span className="upload-text">Upload Dish Photo</span>
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Dish Name</label>
                        <input 
                          type="text" 
                          required 
                          placeholder="e.g. Spicy Jollof Rice" 
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
                  
                  <button className="settings-item logout-btn" onClick={handleLogout} style={{marginTop: '20px'}}>
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
                className={`settings-item ${item.route ? '' : 'settings-item-disabled'}`}
                onClick={() => item.route && navigate(item.route)}
              >
                <div className="settings-item-left">
                  <span className="settings-icon">{item.icon}</span>
                  <span className="settings-item-title">{item.title}</span>
                </div>
                <ChevronRight size={20} color={item.route ? '#c7c7cc' : '#e0e0e0'} />
              </button>
            ))}
            
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
