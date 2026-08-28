import React, { useState } from 'react';
import { Mail, Eye, EyeOff, Store, FileText, Smartphone, User, ArrowRight, Loader } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import logo from '../assets/logo.png';
import './Login.css';
import './Signup.css';

const Signup = () => {
  const [accountType, setAccountType] = useState('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', username: '', email: '',
    password: '', shopName: '', shopDescription: '', phoneNumber: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        username: formData.username,
        email: formData.email,
        password: formData.password
      };

      if (accountType === 'vendor') {
        payload.is_vendor = true;
        payload.shop_name = formData.shopName;
        payload.description = formData.shopDescription;
        payload.phone_number = formData.phoneNumber;
      }

      const userRes = await fetch(`${API_URL}/api/signup/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const userData = await userRes.json();
      if (!userRes.ok) {
        let errMsg = 'Signup failed';
        if (userData.detail) errMsg = userData.detail;
        else if (userData.email) errMsg = `Email: ${userData.email[0]}`;
        else if (userData.username) errMsg = `Username: ${userData.username[0]}`;
        else if (typeof userData === 'object') {
           const firstKey = Object.keys(userData)[0];
           if (userData[firstKey] && Array.isArray(userData[firstKey])) {
              errMsg = `${firstKey}: ${userData[firstKey][0]}`;
           } else if (typeof userData[firstKey] === 'string') {
              errMsg = userData[firstKey];
           }
        }
        throw new Error(errMsg);
      }

      const loginRes = await fetch(`${API_URL}/api/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: formData.username, password: formData.password })
      });

      const loginData = await loginRes.json();
      if (!loginRes.ok) throw new Error('Signup successful, but auto-login failed.');

      login(loginData.access, loginData.refresh);
      navigate(accountType === 'vendor' ? '/profile' : '/');
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
      <div className="auth-overlay" />

      <div className="auth-card slide-up" style={{ maxWidth: '420px' }}>
        <div className="auth-card-header">
          <img src={logo} alt="CampusEats" className="auth-logo" />
          <h1>Create account</h1>
          <p>Join the campus food network</p>
        </div>

        {/* Account type toggle */}
        <div className="signup-type-toggle">
          <button
            type="button"
            className={`signup-type-btn ${accountType === 'student' ? 'active' : ''}`}
            onClick={() => setAccountType('student')}
          >
            🎓 Student
          </button>
          <button
            type="button"
            className={`signup-type-btn vendor ${accountType === 'vendor' ? 'active-vendor' : ''}`}
            onClick={() => setAccountType('vendor')}
          >
            🏪 Campus Vendor
          </button>
        </div>

        {error && <div className="auth-error shake">{error}</div>}

        <form className="auth-form" onSubmit={handleSignup}>
          <div className="signup-name-row">
            <div className="auth-input-group">
              <User size={16} className="auth-input-icon" />
              <input type="text" name="firstName" placeholder="First name" required value={formData.firstName} onChange={handleChange} />
            </div>
            <div className="auth-input-group">
              <input type="text" name="lastName" placeholder="Last name" required value={formData.lastName} onChange={handleChange} style={{ paddingLeft: '16px' }} />
            </div>
          </div>

          <div className="auth-input-group">
            <User size={18} className="auth-input-icon" />
            <input type="text" name="username" placeholder="Username" required value={formData.username} onChange={handleChange} />
          </div>

          <div className="auth-input-group">
            <Mail size={18} className="auth-input-icon" />
            <input type="email" name="email" placeholder="Email address" required value={formData.email} onChange={handleChange} />
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
            <button type="button" className="auth-eye-btn" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>

          {accountType === 'vendor' && (
            <div className="vendor-fields slide-down">
              <div className="auth-input-group">
                <Store size={18} className="auth-input-icon" />
                <input type="text" name="shopName" placeholder="Shop name" required value={formData.shopName} onChange={handleChange} />
              </div>
              <div className="auth-input-group">
                <FileText size={18} className="auth-input-icon" />
                <input type="text" name="shopDescription" placeholder="Shop description" required value={formData.shopDescription} onChange={handleChange} />
              </div>
              <div className="auth-input-group">
                <Smartphone size={18} className="auth-input-icon" />
                <input type="tel" name="phoneNumber" placeholder="Phone number" required value={formData.phoneNumber} onChange={handleChange} />
              </div>
            </div>
          )}

          <button
            className={`auth-submit-btn ${accountType === 'vendor' ? '' : 'student-submit'}`}
            type="submit"
            disabled={loading}
          >
            {loading ? <Loader className="spin" size={20} /> : (
              <>{accountType === 'vendor' ? 'Create Vendor Account' : 'Create Account'} <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
