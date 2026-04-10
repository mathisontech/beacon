'use client';

import { useState, useEffect, useRef } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import './login.css';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const usernameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    usernameRef.current?.focus();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.username || !formData.password) {
      setError('Username and password are required');
      setLoading(false);
      return;
    }

    try {
      const result = await signIn('credentials', {
        username: formData.username,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid username or password');
        setLoading(false);
        return;
      }

      // Create login session
      await fetch('/api/admin/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: formData.username }),
      });

      // Hard redirect to ensure cookies are sent
      window.location.href = '/admin/dashboard';
    } catch {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleDevBypass = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/dev-bypass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'kristin' }),
      });

      if (response.ok) {
        // Hard redirect to ensure cookies are sent with the request
        window.location.href = '/admin/dashboard';
      } else {
        setError('Dev bypass failed');
        setLoading(false);
      }
    } catch {
      setError('Dev bypass failed');
      setLoading(false);
    }
  };

  return (
    <div className="beacon-signin-page">
      {/* Wave background image */}
      <img
        src="/create_account_wave.png"
        alt=""
        className="wave-image"
      />

      {/* Logo/Title in top left */}
      <div className="beacon-admin-logo">
        <span className="beacon-text">BEACON</span>
        <span className="admin-text">Admin</span>
      </div>

      {/* Main content */}
      <div className="beacon-signin-content">
        <div className="beacon-signin-form-container">
          <div className="beacon-signin-header">
            <h1>Welcome back!</h1>
          </div>

          {error && (
            <div className="beacon-signin-error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="beacon-signin-form">
            <div className="beacon-signin-form-group">
              <label htmlFor="username">Username</label>
              <div className="beacon-signin-input-container">
                <input
                  ref={usernameRef}
                  id="username"
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Enter your username"
                  disabled={loading}
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="beacon-signin-form-group">
              <label htmlFor="password">Password</label>
              <div className="beacon-signin-password-container">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="beacon-signin-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 13 8 13 8a13.16 13.16 0 0 1-1.67 2.68"></path>
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s6 8 13 8a9.74 9.74 0 0 0 5.39-1.61"></path>
                      <line x1="2" y1="2" x2="22" y2="22"></line>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="beacon-signin-submit-btn"
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="beacon-signin-footer">
            <button
              type="button"
              className="beacon-signin-link-btn"
              onClick={handleDevBypass}
              disabled={loading}
            >
              Dev Bypass (Remove before production)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
