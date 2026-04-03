import Record from '../records/record.model.js'

export const getSummary = async () => {
  const result = await Record.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
      },
    },
  ])

  let totalIncome = 0
  let totalExpenses = 0

  result.forEach((item) => {
    if (item._id === 'income') totalIncome = item.total
    if (item._id === 'expense') totalExpenses = item.total
  })

  return {
    totalIncome,
    totalExpenses,
    netBalance: totalIncome - totalExpenses,
  }
}

export const getByCategory = async () => {
  const result = await Record.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: { category: '$category', type: '$type' },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: '$_id.category',
        breakdown: {
          $push: {
            type: '$_id.type',
            total: '$total',
            count: '$count',
          },
        },
        categoryTotal: { $sum: '$total' },
      },
    },
    { $sort: { categoryTotal: -1 } },
  ])

  return result
}

export const getTrends = async (period = 'monthly') => {
  const groupBy =
    period === 'weekly'
      ? {
          year: { $year: '$date' },
          week: { $week: '$date' },
        }
      : {
          year: { $year: '$date' },
          month: { $month: '$date' },
        }

  const result = await Record.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: { ...groupBy, type: '$type' },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.week': 1 } },
  ])

  return result
}

export const getRecentActivity = async (limit = 10) => {
  const records = await Record.find({ isDeleted: false })
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 })
    .limit(limit)

  return records
}