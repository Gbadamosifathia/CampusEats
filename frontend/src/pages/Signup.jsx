import React, { useState } from 'react';
import { Mail, Eye, EyeOff, Store, FileText, Smartphone, User, ArrowRight, Loader } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import logo from '../assets/logo.png';
import './Signup.css';

const Signup = () => {
  const [accountType, setAccountType] = useState('vendor'); // 'student' or 'vendor'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    shopName: '',
    shopDescription: '',
    phoneNumber: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Step 1: Create the User account
      const userRes = await fetch(`${API_URL}/api/signup/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          username: formData.username,
          email: formData.email,
          password: formData.password
        })
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

      if (accountType === 'vendor') {
        // Step 2: Login to get token for vendor creation
        const loginRes = await fetch(`${API_URL}/api/token/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: formData.username, password: formData.password })
        });

        const loginData = await loginRes.json();
        if (!loginRes.ok) throw new Error('Failed to authenticate for vendor setup');

        const accessToken = loginData.access;
        login(accessToken, loginData.refresh);

        // Step 3: Create Vendor Profile
        const vendorRes = await fetch(`${API_URL}/api/vendor_list/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            shop_name: formData.shopName,
            description: formData.shopDescription,
            contact_email: formData.email,
            contact_phone: formData.phoneNumber
          })
        });

        if (!vendorRes.ok) throw new Error('Failed to create vendor profile');
        navigate('/profile');
      } else {
        // Direct to login for student
        navigate('/login');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-header slide-up">
        <img src={logo} alt="CampusEats Logo" className="auth-logo" />
        <h1>Create an Account</h1>
        <p>Join the campus food network.</p>
      </div>

      <div className="account-type-toggle slide-up-delay-1">
        <button
          type="button"
          className={`toggle-btn ${accountType === 'student' ? 'active-student' : ''}`}
          onClick={() => setAccountType('student')}
        >
          Student
        </button>
        <button
          type="button"
          className={`toggle-btn ${accountType === 'vendor' ? 'active-vendor' : ''}`}
          onClick={() => setAccountType('vendor')}
        >
          Campus Vendor
        </button>
      </div>

      {error && <div className="error-message slide-up">{error}</div>}

      <form className="signup-form slide-up-delay-2" onSubmit={handleSignup}>
        <div className="input-row">
          <div className="input-group">
            <input type="text" name="firstName" placeholder="First Name" required value={formData.firstName} onChange={handleChange} />
          </div>
          <div className="input-group">
            <input type="text" name="lastName" placeholder="Last Name" required value={formData.lastName} onChange={handleChange} />
          </div>
        </div>

        <div className="input-group">
          <input type="text" name="username" placeholder="Username" required value={formData.username} onChange={handleChange} />
          <User size={20} className="input-icon" />
        </div>

        <div className="input-group">
          <input type="email" name="email" placeholder={accountType === 'student' ? "Email" : "Email"} required value={formData.email} onChange={handleChange} />
          <Mail size={20} className="input-icon" />
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

        {accountType === 'vendor' && (
          <div className="vendor-fields slide-down">
            <div className="input-group">
              <input type="text" name="shopName" placeholder="Shop Name" required value={formData.shopName} onChange={handleChange} />
              <Store size={20} className="input-icon" />
            </div>
            <div className="input-group">
              <input type="text" name="shopDescription" placeholder="Shop Description" required value={formData.shopDescription} onChange={handleChange} />
              <FileText size={20} className="input-icon" />
            </div>
            <div className="input-group">
              <input type="tel" name="phoneNumber" placeholder="Phone Number" required value={formData.phoneNumber} onChange={handleChange} />
              <Smartphone size={20} className="input-icon" />
            </div>
          </div>
        )}

        <button className={`submit-btn ${accountType === 'vendor' ? 'vendor-btn' : 'student-btn'}`} type="submit" disabled={loading}>
          {loading ? <Loader className="spin" size={20} /> : (
            <>{accountType === 'vendor' ? 'Create Vendor Account' : 'Create Account'} <ArrowRight size={20} /></>
          )}
        </button>
      </form>

      <p className="login-link slide-up-delay-3">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
};

export default Signup;
