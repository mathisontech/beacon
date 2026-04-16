// ============================================================================
// BEACON AUTH SERVICE - Self-contained authentication functions
// ============================================================================

// Simulate user authentication (replace with real backend integration)
export const authenticateUser = async (credentials) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // For development - accept any credentials
      if (credentials.email && credentials.password) {
        resolve({
          id: 'user-' + Date.now(),
          email: credentials.email,
          username: credentials.email.split('@')[0],
          isAuthenticated: true
        })
      } else {
        reject(new Error('Invalid credentials'))
      }
    }, 500)
  })
}

// Simulate user creation
export const createUser = async (userData) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (userData.email && userData.password && userData.username) {
        resolve({
          id: 'user-' + Date.now(),
          email: userData.email,
          username: userData.username,
          isAuthenticated: true,
          created: new Date().toISOString()
        })
      } else {
        reject(new Error('Missing required fields'))
      }
    }, 500)
  })
}

// Simulate password reset
export const requestPasswordReset = async (email) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'Password reset email sent (simulation)',
        email
      })
    }, 300)
  })
}

// Local storage helpers
export const saveUserSession = (userData) => {
  localStorage.setItem('beacon_current_user', JSON.stringify(userData))
}

export const getUserSession = () => {
  try {
    const userData = localStorage.getItem('beacon_current_user')
    return userData ? JSON.parse(userData) : null
  } catch (error) {
    console.error('Error loading user session:', error)
    return null
  }
}

export const clearUserSession = () => {
  localStorage.removeItem('beacon_current_user')
}