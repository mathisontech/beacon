// ============================================================================
// CREATE USER FUNCTION - Creates new user accounts for Groups app
// ============================================================================

import { 
  generateUserId, 
  extractInitials, 
  hashPassword, 
  validateEmail, 
  validateUsername,
  getAllUsers,
  saveUsers,
  userIdExists,
  usernameExists,
  emailExists
} from './userUtils.js'

/**
 * Creates a new user account for Groups app
 * @param {Object} userData - User data object
 * @param {string} userData.username - Username (3+ chars, alphanumeric + underscore)
 * @param {string} userData.firstName - First name
 * @param {string} userData.lastName - Last name
 * @param {string} userData.email - Email address
 * @param {string} userData.password - Plain text password (will be hashed)
 * @param {string} [userData.profilePicture] - Profile picture path (optional)
 * @returns {Promise<Object>} Result object with success/error and user data
 */
export const createUser = async (userData) => {
  try {
    const { username, firstName, lastName, email, password, profilePicture } = userData

    // Validation
    if (!username || !firstName || !lastName || !email || !password) {
      return {
        success: false,
        error: 'All required fields must be provided',
        field: 'required'
      }
    }

    // Validate username format
    if (!validateUsername(username)) {
      return {
        success: false,
        error: 'Username must be at least 3 characters and contain only letters, numbers, and underscores',
        field: 'username'
      }
    }

    // Validate email format
    if (!validateEmail(email)) {
      return {
        success: false,
        error: 'Please enter a valid email address',
        field: 'email'
      }
    }

    // Validate password length
    if (password.length < 16) {
      return {
        success: false,
        error: 'Password must be at least 16 characters long',
        field: 'password'
      }
    }

    // Check for existing username
    if (usernameExists(username)) {
      return {
        success: false,
        error: 'Username already exists',
        field: 'username'
      }
    }

    // Check for existing email
    if (emailExists(email)) {
      return {
        success: false,
        error: 'Email address already exists',
        field: 'email'
      }
    }

    // Generate unique user ID
    let userId
    do {
      userId = generateUserId()
    } while (userIdExists(userId))

    // Hash password
    const { hash, salt } = await hashPassword(password)

    // Handle profile picture or generate initials
    const initials = extractInitials(firstName, lastName)
    const profileData = profilePicture 
      ? { profile_picture_path: profilePicture, initials }
      : { profile_picture_path: null, initials }

    // Create user object
    const currentDateTime = new Date().toISOString()
    const newUser = {
      user_id: userId,
      username: username.toLowerCase(),
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.toLowerCase(),
      password_hash: hash,
      password_salt: salt,
      user_creation_datetime: currentDateTime,
      last_login: currentDateTime,
      is_active: true,
      ...profileData
    }

    // Get existing users and add new user
    const users = getAllUsers()
    users.push(newUser)

    // Save to storage
    if (!saveUsers(users)) {
      return {
        success: false,
        error: 'Failed to save user data',
        field: 'system'
      }
    }

    // Return success with user data (excluding sensitive fields)
    const { password_hash, password_salt, ...safeUserData } = newUser
    return {
      success: true,
      user: safeUserData,
      message: 'User account created successfully'
    }

  } catch (error) {
    console.error('Error creating groups user:', error)
    return {
      success: false,
      error: 'An unexpected error occurred while creating the account',
      field: 'system'
    }
  }
}

/**
 * Authenticate user login for Groups app
 * @param {string} username - Username or email
 * @param {string} password - Plain text password
 * @returns {Promise<Object>} Result object with success/error and user data
 */
export const authenticateUser = async (username, password) => {
  try {
    if (!username || !password) {
      return {
        success: false,
        error: 'Username and password are required'
      }
    }

    // Find user by username or email
    const users = getAllUsers()
    const user = users.find(u => 
      u.username === username.toLowerCase() || 
      u.email === username.toLowerCase()
    )

    if (!user) {
      return {
        success: false,
        error: 'Invalid username or password'
      }
    }

    // Check if user is active
    if (!user.is_active) {
      return {
        success: false,
        error: 'Account has been deactivated'
      }
    }

    // Verify password
    const { verifyPassword } = await import('./userUtils.js')
    const isValidPassword = await verifyPassword(password, user.password_hash, user.password_salt)

    if (!isValidPassword) {
      return {
        success: false,
        error: 'Invalid username or password'
      }
    }

    // Update last login
    const updatedUsers = users.map(u => 
      u.user_id === user.user_id 
        ? { ...u, last_login: new Date().toISOString() }
        : u
    )
    saveUsers(updatedUsers)

    // Return success with user data (excluding sensitive fields)
    const { password_hash, password_salt, ...safeUserData } = user
    return {
      success: true,
      user: {
        ...safeUserData,
        last_login: new Date().toISOString()
      },
      message: 'Login successful'
    }

  } catch (error) {
    console.error('Error authenticating groups user:', error)
    return {
      success: false,
      error: 'An unexpected error occurred during login'
    }
  }
}