import React, { useState } from 'react';
import { Mail, EyeOff, Store, FileText, Smartphone, User, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Signup.css';

const Signup = () => {
  const [accountType, setAccountType] = useState('vendor'); // 'student' or 'vendor'

  return (
    <div className="signup-container">
      <div className="signup-header">
        <h1>Create an Account</h1>
        <p>Join the campus food network.</p>
      </div>

      <div className="account-type-toggle">
        <button 
          className={`toggle-btn ${accountType === 'student' ? 'active-student' : ''}`}
          onClick={() => setAccountType('student')}
        >
          Student
        </button>
        <button 
          className={`toggle-btn ${accountType === 'vendor' ? 'active-vendor' : ''}`}
          onClick={() => setAccountType('vendor')}
        >
          Campus Vendor
        </button>
      </div>

      <form className="signup-form">
        {accountType === 'student' ? (
          <>
            <div className="input-group">
              <input type="text" placeholder="Username" />
              <User size={20} className="input-icon" />
            </div>
            <div className="input-group">
              <input type="email" placeholder="Email (.edu preferred)" />
              <Mail size={20} className="input-icon" />
            </div>
            <div className="input-group">
              <input type="password" placeholder="Password" />
              <EyeOff size={20} className="input-icon" />
            </div>
            <button className="submit-btn student-btn" type="submit">
              Create Account <ArrowRight size={20} />
            </button>
          </>
        ) : (
          <>
            <div className="input-group">
              <input type="email" placeholder="Email" />
              <Mail size={20} className="input-icon" />
            </div>
            <div className="input-group">
              <input type="password" placeholder="Password" />
              <EyeOff size={20} className="input-icon" />
            </div>
            <div className="input-group">
              <input type="text" placeholder="Shop Name" />
              <Store size={20} className="input-icon" />
            </div>
            <div className="input-group">
              <input type="text" placeholder="Shop Description" />
              <FileText size={20} className="input-icon" />
            </div>
            <div className="input-group">
              <input type="tel" placeholder="Phone Number" />
              <Smartphone size={20} className="input-icon" />
            </div>
            <button className="submit-btn vendor-btn" type="submit">
              Create Vendor Account <ArrowRight size={20} />
            </button>
          </>
        )}
      </form>

      <p className="login-link">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
};

export default Signup;
