// ============================================================================
// GROUPS USER MANAGEMENT UTILITIES - Core user management functionality for Groups app
// ============================================================================

// Simple password hashing for demo purposes (not production-ready)
const simpleHash = (password, salt) => {
  let hash = salt
  for (let i = 0; i < password.length; i++) {
    hash = ((hash * 31) + password.charCodeAt(i)) % Math.pow(2, 32)
  }
  return hash.toString(36)
}

// Generate unique 10-character alphanumeric user ID
export const generateUserId = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 10; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}

// Generate unique 10-character deleted user ID
export const generateDeletedUserId = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = 'DEL'
  for (let i = 0; i < 7; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}

// Extract initials from first and last name
export const extractInitials = (firstName, lastName) => {
  const first = firstName ? firstName.charAt(0).toUpperCase() : ''
  const last = lastName ? lastName.charAt(0).toUpperCase() : ''
  return first + last
}

// Hash password with salt
export const hashPassword = async (password) => {
  const salt = Math.floor(Math.random() * 1000000)
  const hash = simpleHash(password, salt)
  return { hash, salt: salt.toString() }
}

// Verify password against hash
export const verifyPassword = async (password, hash, salt) => {
  const computedHash = simpleHash(password, parseInt(salt))
  return computedHash === hash
}

// Validate email format
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Check if username is valid (3+ characters, alphanumeric + underscore)
export const validateUsername = (username) => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,}$/
  return usernameRegex.test(username)
}

// Get all users from storage (Groups-specific)
export const getAllUsers = () => {
  try {
    const users = localStorage.getItem('groups_users')
    return users ? JSON.parse(users) : []
  } catch (error) {
    console.error('Error getting groups users:', error)
    return []
  }
}

// Save users to storage (Groups-specific)
export const saveUsers = (users) => {
  try {
    localStorage.setItem('groups_users', JSON.stringify(users))
    return true
  } catch (error) {
    console.error('Error saving groups users:', error)
    return false
  }
}

// Get all deleted users from storage (Groups-specific)
export const getAllDeletedUsers = () => {
  try {
    const deletedUsers = localStorage.getItem('groups_deleted_users')
    return deletedUsers ? JSON.parse(deletedUsers) : []
  } catch (error) {
    console.error('Error getting groups deleted users:', error)
    return []
  }
}

// Save deleted users to storage (Groups-specific)
export const saveDeletedUsers = (deletedUsers) => {
  try {
    localStorage.setItem('groups_deleted_users', JSON.stringify(deletedUsers))
    return true
  } catch (error) {
    console.error('Error saving groups deleted users:', error)
    return false
  }
}

// Check if user ID exists
export const userIdExists = (userId) => {
  const users = getAllUsers()
  return users.some(user => user.user_id === userId)
}

// Check if username exists
export const usernameExists = (username, excludeUserId = null) => {
  const users = getAllUsers()
  return users.some(user => user.username === username && user.user_id !== excludeUserId)
}

// Check if email exists
export const emailExists = (email, excludeUserId = null) => {
  const users = getAllUsers()
  return users.some(user => user.email === email && user.user_id !== excludeUserId)
}

// Find user by ID
export const findUserById = (userId) => {
  const users = getAllUsers()
  return users.find(user => user.user_id === userId)
}

// Find user by username
export const findUserByUsername = (username) => {
  const users = getAllUsers()
  return users.find(user => user.username === username)
}

// Find user by email
export const findUserByEmail = (email) => {
  const users = getAllUsers()
  return users.find(user => user.email === email)
}