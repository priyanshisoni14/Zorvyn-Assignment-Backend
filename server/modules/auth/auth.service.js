import jwt from 'jsonwebtoken'
import User from './auth.model.js'

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  )
}

export const registerUser = async ({ name, email, password, role }) => {
  try {
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      const error = new Error('Email already registered')
      error.statusCode = 409
      throw error
    }

    const user = await User.create({ name, email, password, role })
    const token = generateToken(user)

    return { user, token }
  } catch (error) {
    throw error
  }
}

export const loginUser = async ({ email, password }) => {
  try {
    const user = await User.findOne({ email })
    if (!user) {
      const error = new Error('Invalid email or password')
      error.statusCode = 401
      throw error
    }

    if (!user.isActive) {
      const error = new Error('Your account has been deactivated')
      error.statusCode = 403
      throw error
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      const error = new Error('Invalid email or password')
      error.statusCode = 401
      throw error
    }

    const token = generateToken(user)
    return { user, token }
  } catch (error) {
    throw error
  }
}