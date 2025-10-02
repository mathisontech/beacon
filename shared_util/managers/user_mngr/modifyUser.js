// ============================================================================
// MODIFY USER FUNCTION - Updates user account information for Groups app
// ============================================================================

import { 
  hashPassword, 
  validateEmail, 
  validateUsername,
  extractInitials,
  getAllUsers,
  saveUsers,
  findUserById,
  usernameExists,
  emailExists
} from './userUtils.js'

/**
 * Modify user account information for Groups app
 * @param {string} userId - User ID to modify
 * @param {Object} updates - Object containing fields to update
 * @param {string} [updates.firstName] - New first name
 * @param {string} [updates.lastName] - New last name
 * @param {string} [updates.email] - New email address
 * @param {string} [updates.username] - New username
 * @param {string} [updates.password] - New password (plain text, will be hashed)
 * @param {string} [updates.profilePicture] - New profile picture path
 * @returns {Promise<Object>} Result object with success/error and updated user data
 */
export const modifyUser = async (userId, updates) => {
  try {
    if (!userId) {
      return {
        success: false,
        error: 'User ID is required'
      }
    }

    if (!updates || Object.keys(updates).length === 0) {
      return {
        success: false,
        error: 'No updates provided'
      }
    }

    // Find user
    const user = findUserById(userId)
    if (!user) {
      return {
        success: false,
        error: 'User not found'
      }
    }

    // Validate updates
    const validatedUpdates = {}

    // First Name
    if (updates.firstName !== undefined) {
      if (!updates.firstName || updates.firstName.trim().length === 0) {
        return {
          success: false,
          error: 'First name cannot be empty',
          field: 'firstName'
        }
      }
      validatedUpdates.first_name = updates.firstName.trim()
    }

    // Last Name
    if (updates.lastName !== undefined) {
      if (!updates.lastName || updates.lastName.trim().length === 0) {
        return {
          success: false,
          error: 'Last name cannot be empty',
          field: 'lastName'
        }
      }
      validatedUpdates.last_name = updates.lastName.trim()
    }

    // Username
    if (updates.username !== undefined) {
      if (!validateUsername(updates.username)) {
        return {
          success: false,
          error: 'Username must be at least 3 characters and contain only letters, numbers, and underscores',
          field: 'username'
        }
      }
      if (usernameExists(updates.username, userId)) {
        return {
          success: false,
          error: 'Username already exists',
          field: 'username'
        }
      }
      validatedUpdates.username = updates.username.toLowerCase()
    }

    // Email
    if (updates.email !== undefined) {
      if (!validateEmail(updates.email)) {
        return {
          success: false,
          error: 'Please enter a valid email address',
          field: 'email'
        }
      }
      if (emailExists(updates.email, userId)) {
        return {
          success: false,
          error: 'Email address already exists',
          field: 'email'
        }
      }
      validatedUpdates.email = updates.email.toLowerCase()
    }

    // Password
    if (updates.password !== undefined) {
      if (updates.password.length < 6) {
        return {
          success: false,
          error: 'Password must be at least 6 characters long',
          field: 'password'
        }
      }
      const { hash, salt } = await hashPassword(updates.password)
      validatedUpdates.password_hash = hash
      validatedUpdates.password_salt = salt
    }

    // Profile Picture
    if (updates.profilePicture !== undefined) {
      validatedUpdates.profile_picture_path = updates.profilePicture
    }

    // Update initials if first or last name changed
    if (validatedUpdates.first_name || validatedUpdates.last_name) {
      const firstName = validatedUpdates.first_name || user.first_name
      const lastName = validatedUpdates.last_name || user.last_name
      validatedUpdates.initials = extractInitials(firstName, lastName)
    }

    // Get all users and update the specific user
    const users = getAllUsers()
    const updatedUsers = users.map(u => 
      u.user_id === userId 
        ? { ...u, ...validatedUpdates }
        : u
    )

    // Save updated users
    if (!saveUsers(updatedUsers)) {
      return {
        success: false,
        error: 'Failed to save user updates'
      }
    }

    // Get updated user data (excluding sensitive fields)
    const updatedUser = updatedUsers.find(u => u.user_id === userId)
    const { password_hash, password_salt, ...safeUserData } = updatedUser

    return {
      success: true,
      user: safeUserData,
      message: 'User information updated successfully'
    }

  } catch (error) {
    console.error('Error modifying groups user:', error)
    return {
      success: false,
      error: 'An unexpected error occurred while updating user information'
    }
  }
}

/**
 * Generate password reset token and send email for Groups app
 * @param {string} emailOrUsername - Email address or username
 * @returns {Promise<Object>} Result object with success/error
 */
export const requestPasswordReset = async (emailOrUsername) => {
  try {
    if (!emailOrUsername) {
      return {
        success: false,
        error: 'Email address or username is required'
      }
    }

    // Find user by email or username
    const users = getAllUsers()
    const user = users.find(u => 
      u.email === emailOrUsername.toLowerCase() || 
      u.username === emailOrUsername.toLowerCase()
    )

    if (!user) {
      // For security, don't reveal if user exists or not
      return {
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      }
    }

    // Generate reset token (in real app, this would be a secure token)
    const resetToken = Math.random().toString(36).substring(2, 15) + 
                      Math.random().toString(36).substring(2, 15)
    
    // Store reset token with expiration (24 hours)
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    
    const updatedUsers = users.map(u => 
      u.user_id === user.user_id 
        ? { ...u, reset_token: resetToken, reset_token_expiry: resetTokenExpiry }
        : u
    )
    
    saveUsers(updatedUsers)

    // In a real application, you would send an email here
    console.log(`Groups password reset link for ${user.email}: /reset-password?token=${resetToken}`)

    return {
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
      resetToken // Only for development - remove in production
    }

  } catch (error) {
    console.error('Error requesting groups password reset:', error)
    return {
      success: false,
      error: 'An unexpected error occurred while processing password reset request'
    }
  }
}

/**
 * Reset password using reset token for Groups app
 * @param {string} resetToken - Password reset token
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} Result object with success/error
 */
export const resetPassword = async (resetToken, newPassword) => {
  try {
    if (!resetToken || !newPassword) {
      return {
        success: false,
        error: 'Reset token and new password are required'
      }
    }

    if (newPassword.length < 6) {
      return {
        success: false,
        error: 'Password must be at least 6 characters long'
      }
    }

    // Find user with valid reset token
    const users = getAllUsers()
    const user = users.find(u => 
      u.reset_token === resetToken && 
      u.reset_token_expiry && 
      new Date(u.reset_token_expiry) > new Date()
    )

    if (!user) {
      return {
        success: false,
        error: 'Invalid or expired reset token'
      }
    }

    // Hash new password
    const { hash, salt } = await hashPassword(newPassword)

    // Update user with new password and remove reset token
    const updatedUsers = users.map(u => 
      u.user_id === user.user_id 
        ? { 
            ...u, 
            password_hash: hash, 
            password_salt: salt,
            reset_token: null,
            reset_token_expiry: null
          }
        : u
    )

    saveUsers(updatedUsers)

    return {
      success: true,
      message: 'Password has been reset successfully'
    }

  } catch (error) {
    console.error('Error resetting groups password:', error)
    return {
      success: false,
      error: 'An unexpected error occurred while resetting password'
    }
  }
}