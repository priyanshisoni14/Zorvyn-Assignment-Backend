import {
  getSummary,
  getByCategory,
  getTrends,
  getRecentActivity,
} from './dashboard.service.js'
import { sendSuccess, sendError } from '../../utils/response.js'

export const summary = async (req, res) => {
  try {
    const data = await getSummary()
    return sendSuccess(res, 200, 'Summary fetched successfully', data)
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message)
  }
}

export const byCategory = async (req, res) => {
  try {
    const data = await getByCategory()
    return sendSuccess(res, 200, 'Category breakdown fetched successfully', data)
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message)
  }
}

export const trends = async (req, res) => {
  try {
    const period = req.query.period || 'monthly'
    if (!['monthly', 'weekly'].includes(period)) {
      return sendError(res, 400, 'Period must be monthly or weekly')
    }

    const data = await getTrends(period)
    return sendSuccess(res, 200, `${period} trends fetched successfully`, data)
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message)
  }
}

export const recentActivity = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10
    const data = await getRecentActivity(limit)
    return sendSuccess(res, 200, 'Recent activity fetched successfully', data)
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message)
  }
}