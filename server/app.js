import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { errorHandler } from './middleware/errorHandler.js'
import authRoutes from './modules/auth/auth.routes.js'
import userRoutes from './modules/users/user.routes.js'
import recordRoutes from './modules/records/record.routes.js'
import dashboardRoutes from './modules/dashboard/dashboard.routes.js'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.json({ success: true, message: 'Finance Dashboard API is running' })
})

app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/users', userRoutes)
app.use('/api/v1/records', recordRoutes)
app.use('/api/v1/dashboard', dashboardRoutes)

app.use(errorHandler)

export default app