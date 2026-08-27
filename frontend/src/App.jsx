import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Home from './pages/Home';
import Checkout from './pages/Checkout';
import RestaurantDetails from './pages/RestaurantDetails';
import Profile from './pages/Profile';
import Signup from './pages/Signup';
import Login from './pages/Login';
import SearchPage from './pages/Search';
import OrderTracking from './pages/OrderTracking';
import PersonalInfo from './pages/PersonalInfo';
import SavedAddresses from './pages/SavedAddresses';
import BottomNav from './components/BottomNav';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const MainLayout = () => {
  const location = useLocation();
  const hideNavRoutes = ['/login', '/signup'];
  // Also hide nav on sub-pages and tracking
  const shouldShowNav = !hideNavRoutes.includes(location.pathname)
    && !location.pathname.startsWith('/order-tracking')
    && !location.pathname.startsWith('/profile/');

  return (
    <div className="app-wrapper" style={{ paddingBottom: shouldShowNav ? '80px' : '0' }}>
      <Routes>
        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/restaurant/:id" element={<ProtectedRoute><RestaurantDetails /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
        <Route path="/order-tracking/:orderId" element={<ProtectedRoute><OrderTracking /></ProtectedRoute>} />
        {/* Order tracking without orderId — reads from localStorage after Paystack redirect */}
        <Route path="/order-tracking" element={<ProtectedRoute><OrderTracking /></ProtectedRoute>} />

        {/* Student Profile Sub-pages */}
        <Route path="/profile/personal-info" element={<ProtectedRoute><PersonalInfo /></ProtectedRoute>} />
        <Route path="/profile/saved-addresses" element={<ProtectedRoute><SavedAddresses /></ProtectedRoute>} />

        {/* Public Routes */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
      </Routes>
      {shouldShowNav && <BottomNav />}
    </div>
  );
};

import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <MainLayout />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
