import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/login/LoginForm';

export const Login: React.FC = () => {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    navigate('/');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Welcome Back</h1>
        <LoginForm onSuccess={handleLoginSuccess} />
        <div className="auth-link">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </div>
        <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#2d2d2d', borderRadius: '8px', fontSize: '14px', color: '#888' }}>
          <strong>Demo Credentials:</strong><br />
          Email: user1@mail.com<br />
          Password: 123456
        </div>
      </div>
    </div>
  );
};