import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Home from './pages/Home';
import Checkout from './pages/Checkout';
import RestaurantDetails from './pages/RestaurantDetails';
import Profile from './pages/Profile';
import Signup from './pages/Signup';
import Login from './pages/Login';
import SearchPage from './pages/Search';
import OrderTracking from './pages/OrderTracking';
import PaymentSuccess from './pages/PaymentSuccess';
import PersonalInfo from './pages/PersonalInfo';
import SavedAddresses from './pages/SavedAddresses';
import BottomNav from './components/BottomNav';
import VendorNotificationListener from './components/VendorNotificationListener';

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
  // Hide nav on auth, sub-pages, payment success, and tracking
  const shouldShowNav = !hideNavRoutes.includes(location.pathname)
    && !location.pathname.startsWith('/order-tracking')
    && !location.pathname.startsWith('/payment-success')
    && !location.pathname.startsWith('/profile/');

  return (
    <div className="app-wrapper" style={{ paddingBottom: shouldShowNav ? '80px' : '0' }}>
      <VendorNotificationListener />
      <Routes>
        {/* Public Browsing Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/restaurant/:id" element={<RestaurantDetails />} />
        <Route path="/search" element={<SearchPage />} />

        {/* Protected User Action Routes */}
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/payment-success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/order-tracking/:orderId" element={<ProtectedRoute><OrderTracking /></ProtectedRoute>} />
        <Route path="/order-tracking" element={<ProtectedRoute><OrderTracking /></ProtectedRoute>} />

        {/* Student Profile Sub-pages */}
        <Route path="/profile/personal-info" element={<ProtectedRoute><PersonalInfo /></ProtectedRoute>} />
        <Route path="/profile/saved-addresses" element={<ProtectedRoute><SavedAddresses /></ProtectedRoute>} />

        {/* Auth Pages */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
      </Routes>
      {shouldShowNav && <BottomNav />}
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <MainLayout />
          </Router>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
