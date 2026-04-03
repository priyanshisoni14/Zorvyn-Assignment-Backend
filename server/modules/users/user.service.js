import User from '../auth/auth.model.js'

export const getAllUsers = async () => {
  return await User.find().select('-password')
}

export const getUserById = async (id) => {
  const user = await User.findById(id).select('-password')
  if (!user) {
    const error = new Error('User not found')
    error.statusCode = 404
    throw error
  }
  return user
}

export const updateUserRole = async (id, role) => {
  const user = await User.findById(id)
  if (!user) {
    const error = new Error('User not found')
    error.statusCode = 404
    throw error
  }

  user.role = role
  await user.save()
  return user
}

export const updateUserStatus = async (id, isActive) => {
  const user = await User.findById(id)
  if (!user) {
    const error = new Error('User not found')
    error.statusCode = 404
    throw error
  }

  user.isActive = isActive
  await user.save()
  return user
}

export const deleteUser = async (id) => {
  const user = await User.findById(id)
  if (!user) {
    const error = new Error('User not found')
    error.statusCode = 404
    throw error
  }

  await user.deleteOne()
  return { message: 'User deleted successfully' }
}