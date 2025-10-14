import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import { api } from '../../lib/api';
import './Login.css';

export default function Login() {
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    // No API call, just show success and redirect
    setSuccess('Login successful!');
    setLoading(false);
    setTimeout(() => navigate('/'), 1000);
  }

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2 className="login-title">Login</h2>

        <div className="login-field">
          <label htmlFor="displayName">Display Name</label>
          <input
            type="text"
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            placeholder="Enter your display name"
          />
        </div>

        <div className="login-field">
          <label htmlFor="password">Password</label>
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
          />
          <button
            type="button"
            className="show-password-btn"
            onClick={() => setShowPassword((s) => !s)}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>

        {error && <div className="login-error">{error}</div>}
        {success && <div className="login-success">{success}</div>}

        <button
          className="login-submit"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <div className="login-footer">
          <span>Don't have an account?</span>
          <a href="/register" className="login-link">
            Register
          </a>
        </div>
      </form>
    </div>
  );
}
