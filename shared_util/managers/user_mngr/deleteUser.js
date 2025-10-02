// ============================================================================
// DELETE USER FUNCTION - Handles user account deletion for Groups app
// ============================================================================

import { 
  generateDeletedUserId,
  getAllUsers,
  saveUsers,
  getAllDeletedUsers,
  saveDeletedUsers,
  findUserById
} from './userUtils.js'

/**
 * Delete user account and move to deleted_users table for Groups app
 * @param {string} userId - User ID to delete
 * @param {Object} deletionReason - Reason for deletion
 * @param {boolean} [deletionReason.userDeletedAccount=false] - User requested account deletion
 * @param {boolean} [deletionReason.userDeemedInactive=false] - User deemed inactive
 * @param {boolean} [deletionReason.deletedByAppManager=false] - Deleted by app manager
 * @param {string} [deletedByUserId] - ID of user performing the deletion (for admin deletions)
 * @returns {Promise<Object>} Result object with success/error
 */
export const deleteUser = async (userId, deletionReason = {}, deletedByUserId = null) => {
  try {
    if (!userId) {
      return {
        success: false,
        error: 'User ID is required'
      }
    }

    // Find user to delete
    const user = findUserById(userId)
    if (!user) {
      return {
        success: false,
        error: 'User not found'
      }
    }

    // Validate deletion reason - at least one must be true
    const { 
      userDeletedAccount = false, 
      userDeemedInactive = false, 
      deletedByAppManager = false 
    } = deletionReason

    if (!userDeletedAccount && !userDeemedInactive && !deletedByAppManager) {
      return {
        success: false,
        error: 'At least one deletion reason must be specified'
      }
    }

    // Generate unique deleted user ID
    const deletedUsers = getAllDeletedUsers()
    let deletedUserId
    do {
      deletedUserId = generateDeletedUserId()
    } while (deletedUsers.some(du => du.deleted_user_id === deletedUserId))

    // Create deleted user record
    const deletedUserRecord = {
      deleted_user_id: deletedUserId,
      // Original user fields
      user_id: user.user_id,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      password_hash: user.password_hash,
      password_salt: user.password_salt,
      user_creation_datetime: user.user_creation_datetime,
      last_login: user.last_login,
      is_active: user.is_active,
      profile_picture_path: user.profile_picture_path,
      initials: user.initials,
      // Deletion tracking fields
      user_deleted_account: userDeletedAccount,
      user_deemed_inactive: userDeemedInactive,
      deleted_by_app_manager: deletedByAppManager,
      deleted_user_creation_datetime: new Date().toISOString(),
      deleted_by_user_id: deletedByUserId
    }

    // Add to deleted users
    const updatedDeletedUsers = [...deletedUsers, deletedUserRecord]
    if (!saveDeletedUsers(updatedDeletedUsers)) {
      return {
        success: false,
        error: 'Failed to save deleted user record'
      }
    }

    // Remove from active users
    const users = getAllUsers()
    const updatedUsers = users.filter(u => u.user_id !== userId)
    if (!saveUsers(updatedUsers)) {
      // Rollback deleted user record if we can't remove from active users
      saveDeletedUsers(deletedUsers)
      return {
        success: false,
        error: 'Failed to remove user from active users'
      }
    }

    // TODO: Call session management function to handle session deletion
    // This will be implemented when session_mngmt is created for Groups
    // await deleteUserSessions(userId, deletionReason, deletedByUserId)

    return {
      success: true,
      message: 'User account has been deleted successfully',
      deletedUserId: deletedUserId,
      deletionInfo: {
        userDeletedAccount,
        userDeemedInactive,
        deletedByAppManager,
        deletedDateTime: deletedUserRecord.deleted_user_creation_datetime
      }
    }

  } catch (error) {
    console.error('Error deleting groups user:', error)
    return {
      success: false,
      error: 'An unexpected error occurred while deleting the user account'
    }
  }
}

/**
 * Restore deleted user (admin function) for Groups app
 * @param {string} deletedUserId - Deleted user ID to restore
 * @param {string} restoredByUserId - ID of user performing the restoration
 * @returns {Promise<Object>} Result object with success/error
 */
export const restoreUser = async (deletedUserId, restoredByUserId) => {
  try {
    if (!deletedUserId) {
      return {
        success: false,
        error: 'Deleted user ID is required'
      }
    }

    // Find deleted user
    const deletedUsers = getAllDeletedUsers()
    const deletedUser = deletedUsers.find(du => du.deleted_user_id === deletedUserId)
    
    if (!deletedUser) {
      return {
        success: false,
        error: 'Deleted user not found'
      }
    }

    // Check if user ID already exists in active users
    const users = getAllUsers()
    if (users.some(u => u.user_id === deletedUser.user_id)) {
      return {
        success: false,
        error: 'A user with this ID already exists in active users'
      }
    }

    // Check if username or email already exists
    if (users.some(u => u.username === deletedUser.username)) {
      return {
        success: false,
        error: 'Username is already taken by another user'
      }
    }

    if (users.some(u => u.email === deletedUser.email)) {
      return {
        success: false,
        error: 'Email is already taken by another user'
      }
    }

    // Restore user to active users (excluding deletion-specific fields)
    const restoredUser = {
      user_id: deletedUser.user_id,
      username: deletedUser.username,
      first_name: deletedUser.first_name,
      last_name: deletedUser.last_name,
      email: deletedUser.email,
      password_hash: deletedUser.password_hash,
      password_salt: deletedUser.password_salt,
      user_creation_datetime: deletedUser.user_creation_datetime,
      last_login: deletedUser.last_login,
      is_active: true, // Reactivate user
      profile_picture_path: deletedUser.profile_picture_path,
      initials: deletedUser.initials,
      restored_datetime: new Date().toISOString(),
      restored_by_user_id: restoredByUserId
    }

    // Add to active users
    const updatedUsers = [...users, restoredUser]
    if (!saveUsers(updatedUsers)) {
      return {
        success: false,
        error: 'Failed to restore user to active users'
      }
    }

    // Remove from deleted users
    const updatedDeletedUsers = deletedUsers.filter(du => du.deleted_user_id !== deletedUserId)
    if (!saveDeletedUsers(updatedDeletedUsers)) {
      // Rollback if we can't remove from deleted users
      saveUsers(users)
      return {
        success: false,
        error: 'Failed to remove user from deleted users'
      }
    }

    return {
      success: true,
      message: 'User account has been restored successfully',
      user: {
        user_id: restoredUser.user_id,
        username: restoredUser.username,
        first_name: restoredUser.first_name,
        last_name: restoredUser.last_name,
        email: restoredUser.email,
        restored_datetime: restoredUser.restored_datetime
      }
    }

  } catch (error) {
    console.error('Error restoring groups user:', error)
    return {
      success: false,
      error: 'An unexpected error occurred while restoring the user account'
    }
  }
}

/**
 * Get deleted user information (admin function) for Groups app
 * @param {string} deletedUserId - Deleted user ID
 * @returns {Object} Result object with deleted user data
 */
export const getDeletedUser = (deletedUserId) => {
  try {
    if (!deletedUserId) {
      return {
        success: false,
        error: 'Deleted user ID is required'
      }
    }

    const deletedUsers = getAllDeletedUsers()
    const deletedUser = deletedUsers.find(du => du.deleted_user_id === deletedUserId)
    
    if (!deletedUser) {
      return {
        success: false,
        error: 'Deleted user not found'
      }
    }

    // Return user data excluding sensitive information
    const { password_hash, password_salt, ...safeDeletedUserData } = deletedUser
    
    return {
      success: true,
      deletedUser: safeDeletedUserData
    }

  } catch (error) {
    console.error('Error getting deleted groups user:', error)
    return {
      success: false,
      error: 'An unexpected error occurred while retrieving deleted user information'
    }
  }
}

/**
 * List all deleted users (admin function) for Groups app
 * @param {Object} [filters] - Optional filters
 * @param {boolean} [filters.userDeletedAccount] - Filter by user-requested deletions
 * @param {boolean} [filters.userDeemedInactive] - Filter by inactive user deletions
 * @param {boolean} [filters.deletedByAppManager] - Filter by admin deletions
 * @returns {Object} Result object with deleted users list
 */
export const listDeletedUsers = (filters = {}) => {
  try {
    let deletedUsers = getAllDeletedUsers()

    // Apply filters if provided
    if (Object.keys(filters).length > 0) {
      deletedUsers = deletedUsers.filter(user => {
        if (filters.userDeletedAccount !== undefined && user.user_deleted_account !== filters.userDeletedAccount) {
          return false
        }
        if (filters.userDeemedInactive !== undefined && user.user_deemed_inactive !== filters.userDeemedInactive) {
          return false
        }
        if (filters.deletedByAppManager !== undefined && user.deleted_by_app_manager !== filters.deletedByAppManager) {
          return false
        }
        return true
      })
    }

    // Return users excluding sensitive information
    const safeDeletedUsers = deletedUsers.map(user => {
      const { password_hash, password_salt, ...safeUserData } = user
      return safeUserData
    })

    return {
      success: true,
      deletedUsers: safeDeletedUsers,
      count: safeDeletedUsers.length
    }

  } catch (error) {
    console.error('Error listing deleted groups users:', error)
    return {
      success: false,
      error: 'An unexpected error occurred while retrieving deleted users'
    }
  }
}