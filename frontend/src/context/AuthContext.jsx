import React, { createContext, useState, useEffect, useContext } from 'react';
import { API_URL } from '../config';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('access_token'));
  const [isVendor, setIsVendor] = useState(localStorage.getItem('ce_is_vendor') === 'true');
  const [vendorId, setVendorId] = useState(localStorage.getItem('ce_vendor_id'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await fetch(`${API_URL}/api/me/`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setUser(data);

            // Check if current user owns a vendor
            try {
              const decoded = JSON.parse(atob(token.split('.')[1]));
              const currentUserId = decoded ? decoded.user_id : null;
              if (currentUserId) {
                const vRes = await fetch(`${API_URL}/api/vendor_list/`, {
                  headers: { 'Authorization': `Bearer ${token}` }
                });
                if (vRes.ok) {
                  const vendors = await vRes.json();
                  const myVendor = vendors.find(v => String(v.owner) === String(currentUserId));
                  if (myVendor) {
                    setIsVendor(true);
                    setVendorId(myVendor.id);
                    localStorage.setItem('ce_is_vendor', 'true');
                    localStorage.setItem('ce_vendor_id', String(myVendor.id));
                  } else {
                    setIsVendor(false);
                    setVendorId(null);
                    localStorage.removeItem('ce_is_vendor');
                    localStorage.removeItem('ce_vendor_id');
                  }
                }
              }
            } catch (vErr) {
              console.debug("Vendor verification check:", vErr);
            }
          } else if (res.status === 401) {
            logout();
          } else {
            console.error("Failed to fetch user data, server returned:", res.status);
          }
        } catch (error) {
          console.error("Failed to fetch user data", error);
        }
      } else {
        setIsVendor(false);
        setVendorId(null);
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  const login = (access, refresh) => {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    setToken(access);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('ce_is_vendor');
    localStorage.removeItem('ce_vendor_id');
    localStorage.removeItem('last_order_id');
    setToken(null);
    setUser(null);
    setIsVendor(false);
    setVendorId(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isVendor, vendorId, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
