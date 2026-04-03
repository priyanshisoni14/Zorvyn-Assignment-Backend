import { Router } from 'express'
import { body } from 'express-validator'
import { protect } from '../../middleware/auth.js'
import { allowRoles } from '../../middleware/roleGuard.js'
import { create, getAll, getOne, update, remove } from './record.controller.js'

const router = Router()

// All routes require login
router.use(protect)

// All roles can view records
router.get('/', getAll)
router.get('/:id', getOne)

// Only admin can create, update, delete
router.post(
  '/',
  allowRoles('admin'),
  [
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('type')
      .isIn(['income', 'expense'])
      .withMessage('Type must be income or expense'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('date').optional().isISO8601().withMessage('Invalid date format'),
    body('notes').optional().trim(),
  ],
  create
)

router.put(
  '/:id',
  allowRoles('admin'),
  [
    body('amount').optional().isNumeric().withMessage('Amount must be a number'),
    body('type')
      .optional()
      .isIn(['income', 'expense'])
      .withMessage('Type must be income or expense'),
    body('category').optional().trim().notEmpty().withMessage('Category is required'),
    body('date').optional().isISO8601().withMessage('Invalid date format'),
    body('notes').optional().trim(),
  ],
  update
)

router.delete('/:id', allowRoles('admin'), remove)

export default router