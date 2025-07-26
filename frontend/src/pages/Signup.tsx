import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SignupForm } from '../components/signup/SignupForm';

export const Signup: React.FC = () => {
  const navigate = useNavigate();

  const handleSignupSuccess = () => {
    navigate('/');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Create Account</h1>
        <SignupForm onSuccess={handleSignupSuccess} />
        <div className="auth-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
        <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#2d2d2d', borderRadius: '8px', fontSize: '14px', color: '#888' }}>
          <strong>Note:</strong> For demo purposes, use email "user1@mail.com" to create an account.
        </div>
      </div>
    </div>
  );
};