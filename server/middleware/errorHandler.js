import { sendError } from '../utils/response.js'

export const errorHandler = (err, req, res, next) => {
  console.error('Unhandled Error:', err)

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message)
    return sendError(res, 400, 'Validation failed', messages)
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]
    return sendError(res, 409, `${field} already exists`)
  }

  if (err.name === 'CastError') {
    return sendError(res, 400, 'Invalid ID format')
  }

  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 401, 'Invalid token')
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, 401, 'Token expired')
  }

  return sendError(res, err.statusCode || 500, err.message || 'Internal server error')
}