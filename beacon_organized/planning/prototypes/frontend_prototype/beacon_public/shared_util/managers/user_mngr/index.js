// ============================================================================
// GROUPS USER MANAGEMENT INDEX - Main exports for Groups user management functionality
// ============================================================================

// Core user functions
export { createUser, authenticateUser } from './createUser.js'
export { modifyUser, requestPasswordReset, resetPassword } from './modifyUser.js'
export { deleteUser, restoreUser, getDeletedUser, listDeletedUsers } from './deleteUser.js'

// Utility functions
export {
  generateUserId,
  generateDeletedUserId,
  extractInitials,
  hashPassword,
  verifyPassword,
  validateEmail,
  validateUsername,
  getAllUsers,
  saveUsers,
  getAllDeletedUsers,
  saveDeletedUsers,
  userIdExists,
  usernameExists,
  emailExists,
  findUserById,
  findUserByUsername,
  findUserByEmail
} from './userUtils.js'

// Groups User management API - simplified interface for common operations
export const GroupsUserAPI = {
  // User creation and authentication
  createUser: async (userData) => {
    const { createUser } = await import('./createUser.js')
    return createUser(userData)
  },
  
  authenticateUser: async (username, password) => {
    const { authenticateUser } = await import('./createUser.js')
    return authenticateUser(username, password)
  },
  
  // User modification
  updateUser: async (userId, updates) => {
    const { modifyUser } = await import('./modifyUser.js')
    return modifyUser(userId, updates)
  },
  
  changePassword: async (userId, newPassword) => {
    const { modifyUser } = await import('./modifyUser.js')
    return modifyUser(userId, { password: newPassword })
  },
  
  updateProfile: async (userId, profileData) => {
    const { modifyUser } = await import('./modifyUser.js')
    return modifyUser(userId, profileData)
  },
  
  // Password reset
  requestPasswordReset: async (emailOrUsername) => {
    const { requestPasswordReset } = await import('./modifyUser.js')
    return requestPasswordReset(emailOrUsername)
  },
  
  resetPassword: async (token, newPassword) => {
    const { resetPassword } = await import('./modifyUser.js')
    return resetPassword(token, newPassword)
  },
  
  // User deletion and restoration
  deleteUser: async (userId, reason, deletedByUserId) => {
    const { deleteUser } = await import('./deleteUser.js')
    return deleteUser(userId, reason, deletedByUserId)
  },
  
  restoreUser: async (deletedUserId, restoredByUserId) => {
    const { restoreUser } = await import('./deleteUser.js')
    return restoreUser(deletedUserId, restoredByUserId)
  },
  
  // User lookup
  getUserById: (userId) => {
    const { findUserById } = import('./userUtils.js')
    const user = findUserById(userId)
    if (user) {
      const { password_hash, password_salt, ...safeUser } = user
      return { success: true, user: safeUser }
    }
    return { success: false, error: 'User not found' }
  },
  
  getUserByUsername: (username) => {
    const { findUserByUsername } = import('./userUtils.js')
    const user = findUserByUsername(username)
    if (user) {
      const { password_hash, password_salt, ...safeUser } = user
      return { success: true, user: safeUser }
    }
    return { success: false, error: 'User not found' }
  },
  
  getUserByEmail: (email) => {
    const { findUserByEmail } = import('./userUtils.js')
    const user = findUserByEmail(email)
    if (user) {
      const { password_hash, password_salt, ...safeUser } = user
      return { success: true, user: safeUser }
    }
    return { success: false, error: 'User not found' }
  }
}