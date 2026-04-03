import { registerUser, loginUser } from './auth.service.js'
import { sendSuccess, sendError } from '../../utils/response.js'
import { validationResult } from 'express-validator'

export const register = async (req, res, next) => {
  try {
    console.log('Register hit - body:', req.body)

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Validation failed', errors.array())
    }

    const { name, email, password, role } = req.body
    const { user, token } = await registerUser({ name, email, password, role })

    return sendSuccess(res, 201, 'User registered successfully', { user, token })
  } catch (error) {
    console.log('Register error:', error.message)
    return sendError(res, error.statusCode || 500, error.message)
  }
}

export const login = async (req, res, next) => {
  try {
    console.log('Login hit - body:', req.body)

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Validation failed', errors.array())
    }

    const { email, password } = req.body
    const { user, token } = await loginUser({ email, password })

    return sendSuccess(res, 200, 'Login successful', { user, token })
  } catch (error) {
    console.log('Login error:', error.message)
    return sendError(res, error.statusCode || 500, error.message)
  }
}