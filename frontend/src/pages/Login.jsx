import React, { useState } from 'react';
import { Eye, EyeOff, ArrowRight, Loader, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import logo from '../assets/logo.png';
import './Login.css';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

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
      const res = await fetch(`${API_URL}/api/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        })
      });

      const data = await res.json();
      if (!res.ok) {
        let errMsg = 'Invalid credentials';
        if (data.detail) errMsg = data.detail;
        else if (typeof data === 'object') {
           const firstKey = Object.keys(data)[0];
           if (data[firstKey] && Array.isArray(data[firstKey])) {
              errMsg = `${firstKey}: ${data[firstKey][0]}`;
           } else if (typeof data[firstKey] === 'string') {
              errMsg = data[firstKey];
           }
        }
        throw new Error(errMsg);
      }

      login(data.access, data.refresh);
      navigate('/profile');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Food doodle background */}
      <div className="doodle-bg" aria-hidden="true">
        {['🍕','🍔','☕','🍜','🍩','🥗','🌮','🧃','🍱','🥪','🍣','🥤','🍟','🧆','🍛'].map((emoji, i) => (
          <span key={i} className="doodle-item" style={{ '--i': i }}>{emoji}</span>
        ))}
      </div>

      {/* Gradient overlay */}
      <div className="auth-overlay" />

      {/* Card */}
      <div className="auth-card slide-up">
        <div className="auth-card-header">
          <img src={logo} alt="CampusEats" className="auth-logo" />
          <h1>Welcome back</h1>
          <p>Sign in to continue ordering</p>
        </div>

        {error && <div className="auth-error shake">{error}</div>}

        <form className="auth-form" onSubmit={handleLogin}>
          <div className="auth-input-group">
            <User size={18} className="auth-input-icon" />
            <input
              type="text"
              name="username"
              placeholder="Username"
              required
              value={formData.username}
              onChange={handleChange}
            />
          </div>

          <div className="auth-input-group">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              required
              value={formData.password}
              onChange={handleChange}
              style={{ paddingLeft: '16px' }}
            />
            <button
              type="button"
              className="auth-eye-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>

          <button className="auth-submit-btn" type="submit" disabled={loading}>
            {loading ? <Loader className="spin" size={20} /> : (
              <>Sign In <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        <p className="auth-link">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
