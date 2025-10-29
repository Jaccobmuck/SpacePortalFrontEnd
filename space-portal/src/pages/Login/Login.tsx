// React hooks and routing utilities
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Shared API helper and response types
import { api, LoginResponse } from '../../lib/api';
import { api as API } from '../../lib/api';

// Page-specific styles
import './Login.css';

export default function Login() {
  // Local component state for form and feedback
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  // Remember me: store JWT in localStorage when checked; sessionStorage otherwise
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  // Router navigation hook
  const navigate = useNavigate();

  // Submit handler: authenticate against backend and redirect
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const resp: LoginResponse = await api.login({ displayName, password });
      // Persist token depending on user preference
      if (resp && resp.token) {
        API.setToken(resp.token, { persist: remember ? 'local' : 'session' });
      }
      // Show immediate success then keep user informed about redirect
      setSuccess(`Welcome ${resp.user.displayName}! Redirecting to home page...`);
      // Extended delay (additional 2 seconds from previous 0.5s => 2500ms total)
      setTimeout(() => {
        navigate('/');
      }, 2500);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
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
            onClick={() => {
              setShowPassword((s) => !s);
            }}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>

        {/* User account section */}
        <div className="login-field" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label htmlFor="remember" className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              id="remember"
              type="checkbox"
              checked={remember}
              onChange={(e) => {
                setRemember(e.target.checked);
              }}
            />
            Keep me signed in
          </label>
        </div>

        {error && <div className="login-error">{error}</div>}
        {success && <div className="login-success">{success}</div>}

        <button
          className="login-submit"
          type="submit"
          disabled={loading || !displayName || !password}
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
