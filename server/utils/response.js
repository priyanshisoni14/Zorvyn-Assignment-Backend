export const sendSuccess = (res, statusCode = 200, message = 'Success', data = null) => {
  const response = { success: true, message }
  if (data !== null) response.data = data
  return res.status(statusCode).json(response)
}

export const sendError = (res, statusCode = 500, message = 'Something went wrong', errors = null) => {
  const response = { success: false, error: { message } }
  if (errors !== null) response.error.details = errors
  return res.status(statusCode).json(response)
}