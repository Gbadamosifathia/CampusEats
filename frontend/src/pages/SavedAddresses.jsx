import React, { useState } from 'react';
import { ArrowLeft, MapPin, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './SubPage.css';

const STORAGE_KEY = 'campuseats_saved_addresses';

function SavedAddresses() {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch { return []; }
  });
  const [showForm, setShowForm] = useState(false);
  const [newAddr, setNewAddr] = useState({ label: '', address: '' });

  const save = (updated) => {
    setAddresses(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newAddr.label || !newAddr.address) return;
    save([...addresses, { ...newAddr, id: Date.now() }]);
    setNewAddr({ label: '', address: '' });
    setShowForm(false);
  };

  const handleDelete = (id) => {
    save(addresses.filter(a => a.id !== id));
  };

  return (
    <div className="subpage">
      <header className="subpage-header">
        <button className="subpage-back" onClick={() => navigate('/profile')}>
          <ArrowLeft size={22} color="#1c1c1e" />
        </button>
        <h1>Saved Addresses</h1>
      </header>

      <div className="subpage-section-title">Your Pickup Spots</div>

      <div className="subpage-card">
        {addresses.length === 0 && !showForm && (
          <div className="subpage-empty">
            <MapPin size={40} color="#ddd" />
            <p>No saved addresses yet.</p>
          </div>
        )}

        {addresses.map(addr => (
          <div key={addr.id} className="subpage-field">
            <div className="subpage-field-icon"><MapPin size={18} /></div>
            <div className="subpage-field-content">
              <span className="subpage-field-label">{addr.label}</span>
              <span className="subpage-field-value">{addr.address}</span>
            </div>
            <button className="subpage-delete-btn" onClick={() => handleDelete(addr.id)}>
              <Trash2 size={16} color="#eb5757" />
            </button>
          </div>
        ))}
      </div>

      {showForm ? (
        <form className="subpage-form" onSubmit={handleAdd}>
          <input
            className="subpage-input"
            placeholder="Label (e.g. Hostel Block A)"
            value={newAddr.label}
            onChange={e => setNewAddr({ ...newAddr, label: e.target.value })}
            required
          />
          <input
            className="subpage-input"
            placeholder="Full address"
            value={newAddr.address}
            onChange={e => setNewAddr({ ...newAddr, address: e.target.value })}
            required
          />
          <div className="subpage-form-btns">
            <button type="button" className="subpage-cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="subpage-save-btn">Save Address</button>
          </div>
        </form>
      ) : (
        <button className="subpage-add-btn" onClick={() => setShowForm(true)}>
          <Plus size={18} /> Add New Address
        </button>
      )}
    </div>
  );
}

export default SavedAddresses;
