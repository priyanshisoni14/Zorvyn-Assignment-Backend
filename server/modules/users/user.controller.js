import {
  getAllUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
  deleteUser,
} from './user.service.js'
import { sendSuccess, sendError } from '../../utils/response.js'
import { validationResult } from 'express-validator'

export const getUsers = async (req, res) => {
  try {
    const users = await getAllUsers()
    return sendSuccess(res, 200, 'Users fetched successfully', users)
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message)
  }
}

export const getUser = async (req, res) => {
  try {
    const user = await getUserById(req.params.id)
    return sendSuccess(res, 200, 'User fetched successfully', user)
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message)
  }
}

export const changeRole = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Validation failed', errors.array())
    }

    const user = await updateUserRole(req.params.id, req.body.role)
    return sendSuccess(res, 200, 'User role updated successfully', user)
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message)
  }
}

export const changeStatus = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Validation failed', errors.array())
    }

    const user = await updateUserStatus(req.params.id, req.body.isActive)
    return sendSuccess(res, 200, 'User status updated successfully', user)
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message)
  }
}

export const removeUser = async (req, res) => {
  try {
    const result = await deleteUser(req.params.id)
    return sendSuccess(res, 200, result.message)
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message)
  }
}