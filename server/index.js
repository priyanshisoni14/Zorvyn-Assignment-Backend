import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import connectDB from './config/db.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()

connectDB()

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json())

app.get('/', (req, res) => {
  res.json({ success: true, message: 'Finance Dashboard API is running' })
})

app.use('/api/auth', (await import('./modules/auth/auth.routes.js')).default)
app.use('/api/users', (await import('./modules/users/user.routes.js')).default)
app.use('/api/records', (await import('./modules/records/record.routes.js')).default)
app.use('/api/dashboard', (await import('./modules/dashboard/dashboard.routes.js')).default)

app.use(errorHandler)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})