import { Router } from 'express'
import { body } from 'express-validator'
import { protect } from '../../middleware/auth.js'
import { allowRoles } from '../../middleware/roleGuard.js'
import {
  getUsers,
  getUser,
  changeRole,
  changeStatus,
  removeUser,
} from './user.controller.js'

const router = Router()

// All routes here are admin only
router.use(protect, allowRoles('admin'))

router.get('/', getUsers)
router.get('/:id', getUser)

router.patch(
  '/:id/role',
  [
    body('role')
      .isIn(['viewer', 'analyst', 'admin'])
      .withMessage('Role must be viewer, analyst, or admin'),
  ],
  changeRole
)

router.patch(
  '/:id/status',
  [
    body('isActive')
      .isBoolean()
      .withMessage('isActive must be true or false'),
  ],
  changeStatus
)

router.delete('/:id', removeUser)

export default router