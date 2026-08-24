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
  const shouldShowNav = !hideNavRoutes.includes(location.pathname);

  return (
    <div className="app-wrapper" style={{ paddingBottom: shouldShowNav ? '80px' : '0' }}>
      <Routes>
        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/restaurant/:id" element={<ProtectedRoute><RestaurantDetails /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
        
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
