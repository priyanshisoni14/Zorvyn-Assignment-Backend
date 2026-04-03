import { Router } from 'express'
import { body } from 'express-validator'
import { register, login } from './auth.controller.js'

const router = Router()

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('role')
      .optional()
      .isIn(['viewer', 'analyst', 'admin'])
      .withMessage('Role must be viewer, analyst, or admin'),
  ],
  register
)

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  login
)

export default router