import React, { useState } from 'react';
import { Mail, EyeOff, ArrowRight, Loader, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import './Login.css';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://127.0.0.1:8000/api/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Invalid credentials');
      }

      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      
      // Navigate to profile or home
      navigate('/profile');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box slide-up">
        <div className="login-header">
          <img src={logo} alt="CampusEats Logo" className="auth-logo pulse-logo" />
          <h1>Welcome Back!</h1>
          <p>Sign in to continue to your account.</p>
        </div>

        {error && <div className="error-message shake">{error}</div>}

        <form className="login-form slide-up-delay-1" onSubmit={handleLogin}>
          <div className="input-group">
            <input 
              type="text" 
              name="username" 
              placeholder="Username" 
              required 
              value={formData.username} 
              onChange={handleChange} 
            />
            <User size={20} className="input-icon" />
          </div>

          <div className="input-group">
            <input 
              type="password" 
              name="password" 
              placeholder="Password" 
              required 
              value={formData.password} 
              onChange={handleChange} 
            />
            <EyeOff size={20} className="input-icon" />
          </div>

          <button className="submit-btn login-btn" type="submit" disabled={loading}>
            {loading ? <Loader className="spin" size={20} /> : (
              <>Sign In <ArrowRight size={20} /></>
            )}
          </button>
        </form>

        <p className="signup-link slide-up-delay-2">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
