// ============================================================================
// BEACON CREATE ACCOUNT PAGE - Beacon-specific account creation functionality
// ============================================================================

import React, { useState } from 'react'
import './NewCreateAccountPage.css'
import { createUser } from '../../managers/user_mngr/index.js'

function NewCreateAccountPage({
  appName = "Beacon",
  appLogo,
  appColor = "#dc2626",
  welcomeTitle,
  welcomeSubtitle,
  additionalFields = [],
  onAccountCreated,
  onBackToSignIn,
  backgroundVideo
}) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    // Initialize additional fields
    ...additionalFields.reduce((acc, field) => ({
      ...acc,
      [field.name]: field.defaultValue || ''
    }), {})
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})

  // Handle input changes
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    if (error) setError('') // Clear error when user types
    if (success) setSuccess('') // Clear success when user types
    // Clear field-specific error when user types
    if (fieldErrors[e.target.name]) {
      setFieldErrors({
        ...fieldErrors,
        [e.target.name]: false
      })
    }
  }

  // Validate form data
  const validateForm = () => {
    const errors = {}
    let hasErrors = false

    // Required field validation
    const requiredFields = ['firstName', 'lastName', 'username', 'email', 'password', 'confirmPassword']
    for (const field of requiredFields) {
      if (!formData[field]) {
        errors[field] = true
        hasErrors = true
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.email = true
      hasErrors = true
    }

    // Username validation
    if (formData.username && formData.username.length < 3) {
      errors.username = true
      hasErrors = true
    }

    // Password validation
    if (formData.password && formData.password.length < 16) {
      errors.password = true
      hasErrors = true
    }

    // Password confirmation
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = true
      hasErrors = true
    }

    // Validate additional fields
    for (const field of additionalFields) {
      if (field.required && !formData[field.name]) {
        errors[field.name] = true
        hasErrors = true
      }
    }

    // Set field errors for visual feedback
    setFieldErrors(errors)

    if (hasErrors) {
      // Return a general error message for the main error display
      if (errors.firstName || errors.lastName || errors.username || errors.email || errors.password || errors.confirmPassword) {
        return 'Please fill in all required fields correctly'
      }
      for (const field of additionalFields) {
        if (errors[field.name]) {
          return `${field.label} is required`
        }
      }
    }

    return null
  }

  // Create new account using Groups user management system
  const createAccount = async (userData) => {
    try {
      // Simulate API delay for UX
      await new Promise(resolve => setTimeout(resolve, 800))

      // Use the Beacon user management system
      const result = await createUser({
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
        profilePicture: userData.profilePicture || null
      })

      return result
    } catch (error) {
      console.error('Error creating Beacon account:', error)
      return { success: false, error: 'Failed to create account. Please try again.' }
    }
  }

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    // Client-side validation
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      setLoading(false)
      return
    }

    try {
      // Create the account using Beacon user management system
      const result = await createAccount(formData)
      
      if (result.success) {
        setSuccess('Account created successfully!')
        
        // Store current user session using Beacon format
        localStorage.setItem('beacon_current_user', JSON.stringify(result.user))
        
        // Call parent success handler
        setTimeout(() => {
          onAccountCreated(result.user)
        }, 1000)
      } else {
        setError(result.error || 'Failed to create account')
      }
    } catch (err) {
      console.error('Beacon account creation error:', err)
      setError('An unexpected error occurred. Please try again.')
    }
    
    setLoading(false)
  }

  return (
    <div className="create-account-page">
      <video
        className="create-account-video-background"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/smoke_background.mp4" type="video/mp4" />
      </video>
      <div className="create-account-video-overlay"></div>
      <img
        src="/create_account_wave.png"
        alt="Wave design"
        className="wave-image"
      />
      <img
        src="/beacon_lighthouse_svg.svg"
        alt=""
        className="beacon-lighthouse-logo"
        onClick={onBackToSignIn}
        style={{ cursor: 'pointer' }}
        onError={(e) => {
          console.error('Failed to load beacon lighthouse SVG:', e.target.src);
          e.target.style.display = 'none';
        }}
      />
      <div className="create-account-content">
        <div className="create-account-form-container" style={{ borderTopColor: appColor }}>
          <div className="create-account-logo">
            {appLogo && <img src={appLogo} alt={`${appName} Logo`} />}
          </div>
          <div className="create-account-header">
            <h1>Create New Account</h1>
          </div>

          {error && (
            <div className="create-account-error-message">
              {error}
            </div>
          )}

          {success && (
            <div className="create-account-success-message">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="create-account-form">
            <div className="create-account-form-group">
              <label htmlFor="firstName">First Name</label>
              <div className="create-account-input-container">
                <input
                  id="firstName"
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Enter your first name"
                  className={fieldErrors.firstName ? 'error' : ''}
                  required
                />
              </div>
            </div>

            <div className="create-account-form-group">
              <label htmlFor="lastName">Last Name</label>
              <div className="create-account-input-container">
                <input
                  id="lastName"
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Enter your last name"
                  className={fieldErrors.lastName ? 'error' : ''}
                  required
                />
              </div>
            </div>

            <div className="create-account-form-group">
              <label htmlFor="username">Username</label>
              <div className="create-account-input-container">
                <input
                  id="username"
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Choose a username (minimum 3 characters)"
                  className={fieldErrors.username ? 'error' : ''}
                  required
                  minLength="3"
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="create-account-form-group">
              <label htmlFor="email">Email Address</label>
              <div className="create-account-input-container">
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email address"
                  className={fieldErrors.email ? 'error' : ''}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="create-account-form-group">
              <label htmlFor="password">Password</label>
              <div className="create-account-password-container">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Create a password"
                  className={fieldErrors.password ? 'error' : ''}
                  required
                  minLength="16"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="create-account-password-toggle"
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
              <div className="create-account-field-help">Minimum 16 characters required (no special characters needed)</div>
            </div>

            <div className="create-account-form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="create-account-password-container">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                  className={fieldErrors.confirmPassword ? 'error' : ''}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="create-account-password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
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

            {additionalFields.map((field) => (
              <div key={field.name} className="create-account-form-group">
                <label htmlFor={field.name}>{field.label}</label>
                {field.type === 'select' ? (
                  <select
                    id={field.name}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleInputChange}
                    className={fieldErrors[field.name] ? 'error' : ''}
                    required={field.required}
                  >
                    <option value="">Select {field.label}</option>
                    {field.options.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : field.type === 'textarea' ? (
                  <textarea
                    id={field.name}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleInputChange}
                    placeholder={field.placeholder}
                    className={fieldErrors[field.name] ? 'error' : ''}
                    required={field.required}
                    rows={field.rows || 3}
                  />
                ) : (
                  <input
                    id={field.name}
                    type={field.type || 'text'}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleInputChange}
                    placeholder={field.placeholder}
                    className={fieldErrors[field.name] ? 'error' : ''}
                    required={field.required}
                  />
                )}
                {field.help && (
                  <div className="create-account-field-help">{field.help}</div>
                )}
              </div>
            ))}

            <button 
              type="submit" 
              className="create-account-submit-btn"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="create-account-footer">
            <p>
              Already have an account?{' '}
              <button 
                type="button" 
                className="create-account-link-btn"
                onClick={onBackToSignIn}
              >
                Sign in here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewCreateAccountPage