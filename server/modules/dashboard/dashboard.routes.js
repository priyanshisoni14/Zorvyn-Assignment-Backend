import { Router } from 'express'
import { protect } from '../../middleware/auth.js'
import { allowRoles } from '../../middleware/roleGuard.js'
import { summary, byCategory, trends, recentActivity } from './dashboard.controller.js'

const router = Router()

// All dashboard routes require login
router.use(protect)

// All roles can see summary and recent activity
router.get('/summary', summary)
router.get('/recent', recentActivity)

// Only analyst and admin can see detailed analytics
router.get('/by-category', allowRoles('analyst', 'admin'), byCategory)
router.get('/trends', allowRoles('analyst', 'admin'), trends)

export default router