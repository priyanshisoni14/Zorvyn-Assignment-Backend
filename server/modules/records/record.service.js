import Record from './record.model.js'

export const createRecord = async (data, userId) => {
  const record = await Record.create({ ...data, createdBy: userId })
  return record
}

export const getRecords = async (filters = {}) => {
  const query = { isDeleted: false }

  if (filters.type) query.type = filters.type
  if (filters.category) query.category = new RegExp(filters.category, 'i')
  if (filters.startDate || filters.endDate) {
    query.date = {}
    if (filters.startDate) query.date.$gte = new Date(filters.startDate)
    if (filters.endDate) query.date.$lte = new Date(filters.endDate)
  }

  const page = parseInt(filters.page) || 1
  const limit = parseInt(filters.limit) || 10
  const skip = (page - 1) * limit

  const total = await Record.countDocuments(query)
  const records = await Record.find(query)
    .populate('createdBy', 'name email')
    .sort({ date: -1 })
    .skip(skip)
    .limit(limit)

  return {
    records,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export const getRecordById = async (id) => {
  const record = await Record.findOne({ _id: id, isDeleted: false }).populate(
    'createdBy',
    'name email'
  )
  if (!record) {
    const error = new Error('Record not found')
    error.statusCode = 404
    throw error
  }
  return record
}

export const updateRecord = async (id, data) => {
  const record = await Record.findOne({ _id: id, isDeleted: false })
  if (!record) {
    const error = new Error('Record not found')
    error.statusCode = 404
    throw error
  }

  Object.assign(record, data)
  await record.save()
  return record
}

export const softDeleteRecord = async (id) => {
  const record = await Record.findOne({ _id: id, isDeleted: false })
  if (!record) {
    const error = new Error('Record not found')
    error.statusCode = 404
    throw error
  }

  record.isDeleted = true
  await record.save()
  return { message: 'Record deleted successfully' }
}