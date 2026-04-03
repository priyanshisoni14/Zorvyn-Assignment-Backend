import { sendError } from '../utils/response.js'

export const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'Not authenticated')
    }

    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        403,
        `Access denied. Required role: ${roles.join(' or ')}`
      )
    }

    next()
  }
}