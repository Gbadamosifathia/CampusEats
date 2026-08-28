import React, { useState } from 'react';
import { Mail, Eye, EyeOff, ArrowRight, Loader, User } from 'lucide-react';
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
              type={showPassword ? "text" : "password"} 
              name="password" 
              placeholder="Password" 
              required 
              value={formData.password} 
              onChange={handleChange} 
            />
            <button 
              type="button" 
              className="password-toggle-btn" 
              onClick={() => setShowPassword(!showPassword)}
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', position: 'absolute', right: '15px', color: '#8e8e93' }}
            >
              {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
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
