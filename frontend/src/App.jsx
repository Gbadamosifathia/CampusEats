import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Home from './pages/Home';
import Checkout from './pages/Checkout';
import RestaurantDetails from './pages/RestaurantDetails';
import Profile from './pages/Profile';
import Signup from './pages/Signup';
import BottomNav from './components/BottomNav';

function App() {
  return (
    <CartProvider>
      <Router>
        <div className="app-wrapper">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/restaurant/:id" element={<RestaurantDetails />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
          <BottomNav />
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;
