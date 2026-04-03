import {
  createRecord,
  getRecords,
  getRecordById,
  updateRecord,
  softDeleteRecord,
} from './record.service.js'
import { sendSuccess, sendError } from '../../utils/response.js'
import { validationResult } from 'express-validator'

export const create = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Validation failed', errors.array())
    }

    const record = await createRecord(req.body, req.user.id)
    return sendSuccess(res, 201, 'Record created successfully', record)
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message)
  }
}

export const getAll = async (req, res) => {
  try {
    const result = await getRecords(req.query)
    return sendSuccess(res, 200, 'Records fetched successfully', result)
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message)
  }
}

export const getOne = async (req, res) => {
  try {
    const record = await getRecordById(req.params.id)
    return sendSuccess(res, 200, 'Record fetched successfully', record)
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message)
  }
}

export const update = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Validation failed', errors.array())
    }

    const record = await updateRecord(req.params.id, req.body)
    return sendSuccess(res, 200, 'Record updated successfully', record)
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message)
  }
}

export const remove = async (req, res) => {
  try {
    const result = await softDeleteRecord(req.params.id)
    return sendSuccess(res, 200, result.message)
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message)
  }
}