import React, { useState } from 'react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { authService } from '../../services/authService';

interface LoginFormProps {
  onSuccess: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await authService.login(email, password);
      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <Input
        type="email"
        label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="user1@mail.com"
        required
      />
      
      <Input
        type="password"
        label="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="123456"
        required
      />

      {error && <div className="error">{error}</div>}

      <Button type="submit" disabled={isLoading} style={{ width: '100%' }}>
        {isLoading ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );
};