// ============================================================================
// BEACON SIGN IN PAGE - Standalone sign-in for Beacon Emergency App
// ============================================================================

import React, { useState } from 'react'
import './SignInPage.css'
import { authenticateUser, requestPasswordReset } from '../../shared_util/managers/user_mngr/index.js'

function BeaconSignInPage({ onLogin, onSwitchToCreateAccount }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotPasswordData, setForgotPasswordData] = useState({
    email: '',
    username: ''
  })
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState('')

  // Handle input changes
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    if (error) setError('') // Clear error when user types
  }

  // Username/Password verification using Groups authentication system
  const verifyCredentials = async (username, password) => {
    try {
      // Simulate API delay for UX
      await new Promise(resolve => setTimeout(resolve, 500))

      // Use the Beacon authentication system
      const result = await authenticateUser(username, password)
      return result
    } catch (error) {
      console.error('Beacon authentication error:', error)
      return { success: false, error: 'Authentication service unavailable' }
    }
  }

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Client-side validation
    if (!formData.email || !formData.password) {
      setError('Email and password are required')
      setLoading(false)
      return
    }

    try {
      // Call verification API
      const result = await verifyCredentials(formData.email, formData.password)

      if (result.success) {
        // Store current user session using Beacon format
        localStorage.setItem('beacon_current_user', JSON.stringify(result.user))

        // Call parent login handler
        onLogin(result.user)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    }

    setLoading(false)
  }

  // Handle forgot password form changes
  const handleForgotPasswordChange = (e) => {
    setForgotPasswordData({
      ...forgotPasswordData,
      [e.target.name]: e.target.value
    })
  }

  // Handle forgot password submission
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setForgotPasswordMessage('')

    try {
      // Use email or username, prioritize email if both provided
      const emailOrUsername = forgotPasswordData.email || forgotPasswordData.username

      if (!emailOrUsername) {
        setForgotPasswordMessage('Please provide either an email address or username.')
        setLoading(false)
        return
      }

      // Use the Groups password reset system
      const result = await requestPasswordReset(emailOrUsername)

      if (result.success) {
        setForgotPasswordMessage(result.message)
        // In development, log the reset token for testing
        if (result.resetToken) {
          console.log('Groups password reset token:', result.resetToken)
        }
      } else {
        setForgotPasswordMessage(result.error || 'An error occurred. Please try again.')
      }
    } catch (error) {
      console.error('Groups password reset error:', error)
      setForgotPasswordMessage('An error occurred. Please try again.')
    }

    setLoading(false)
  }

  return (
    <div className="beacon-signin-page">
      <img
        src="/create_account_wave.png"
        alt="Wave design"
        className="wave-image"
      />
      <img
        src="/beacon_lighthouse_svg.svg"
        alt=""
        className="beacon-lighthouse-logo"
        onClick={onSwitchToCreateAccount}
        style={{ cursor: 'pointer' }}
        onError={(e) => {
          console.error('Failed to load beacon lighthouse SVG:', e.target.src);
          e.target.style.display = 'none';
        }}
      />
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
              <label htmlFor="email">Email</label>
              <div className="beacon-signin-input-container">
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email address"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="beacon-signin-form-group">
              <label htmlFor="password">Password</label>
              <div className="beacon-signin-password-container">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="beacon-signin-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
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

            <div className="beacon-signin-forgot-password">
              <button
                type="button"
                className="beacon-signin-link-btn"
                onClick={() => setShowForgotPassword(true)}
              >
                Forgot your password?
              </button>
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
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                className="beacon-signin-link-btn"
                onClick={onSwitchToCreateAccount}
              >
                Create one here
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="forgot-password-overlay">
          <div className="forgot-password-modal">
            <div className="forgot-password-header">
              <h2>Reset Password</h2>
              <button
                className="close-modal-btn"
                onClick={() => {
                  setShowForgotPassword(false)
                  setForgotPasswordMessage('')
                  setForgotPasswordData({ email: '', username: '' })
                }}
              >
                ×
              </button>
            </div>

            <p>Enter your email address or username and we'll send you a link to reset your password.</p>

            {forgotPasswordMessage && (
              <div className={`forgot-password-message ${forgotPasswordMessage.includes('sent') ? 'success' : 'error'}`}>
                {forgotPasswordMessage}
              </div>
            )}

            <form onSubmit={handleForgotPasswordSubmit}>
              <div className="beacon-signin-form-group">
                <label htmlFor="forgot-email">Email Address</label>
                <input
                  id="forgot-email"
                  type="email"
                  name="email"
                  value={forgotPasswordData.email}
                  onChange={handleForgotPasswordChange}
                  placeholder="Enter your email address"
                />
              </div>

              <div className="forgot-password-or">
                <span>OR</span>
              </div>

              <div className="beacon-signin-form-group">
                <label htmlFor="forgot-username">Username</label>
                <input
                  id="forgot-username"
                  type="text"
                  name="username"
                  value={forgotPasswordData.username}
                  onChange={handleForgotPasswordChange}
                  placeholder="Enter your username"
                />
              </div>

              <div className="forgot-password-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setShowForgotPassword(false)
                    setForgotPasswordMessage('')
                    setForgotPasswordData({ email: '', username: '' })
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="beacon-signin-submit-btn"
                  disabled={loading || (!forgotPasswordData.email && !forgotPasswordData.username)}
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default BeaconSignInPage