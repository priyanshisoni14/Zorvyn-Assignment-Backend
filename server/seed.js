import 'dotenv/config'
import mongoose from 'mongoose'
import connectDB from './config/db.js'
import User from './modules/auth/auth.model.js'
import Record from './modules/records/record.model.js'

await connectDB()

console.log('Clearing existing data...')
await User.deleteMany()
await Record.deleteMany()

console.log('Creating users...')

const admin = await User.create({
  name: 'Admin User',
  email: 'admin@test.com',
  password: 'password123',
  role: 'admin',
})

const analyst = await User.create({
  name: 'Analyst User',
  email: 'analyst@test.com',
  password: 'password123',
  role: 'analyst',
})

await User.create({
  name: 'Viewer User',
  email: 'viewer@test.com',
  password: 'password123',
  role: 'viewer',
})

console.log('Creating financial records...')

await Record.insertMany([
  {
    amount: 5000,
    type: 'income',
    category: 'Salary',
    date: new Date('2026-01-01'),
    notes: 'January salary',
    createdBy: admin._id,
  },
  {
    amount: 3000,
    type: 'income',
    category: 'Freelance',
    date: new Date('2026-01-15'),
    notes: 'Freelance project payment',
    createdBy: admin._id,
  },
  {
    amount: 1200,
    type: 'expense',
    category: 'Rent',
    date: new Date('2026-01-05'),
    notes: 'Monthly rent',
    createdBy: admin._id,
  },
  {
    amount: 300,
    type: 'expense',
    category: 'Food',
    date: new Date('2026-01-10'),
    notes: 'Groceries',
    createdBy: admin._id,
  },
  {
    amount: 200,
    type: 'expense',
    category: 'Transport',
    date: new Date('2026-01-20'),
    notes: 'Fuel and cab',
    createdBy: admin._id,
  },
  {
    amount: 5000,
    type: 'income',
    category: 'Salary',
    date: new Date('2026-02-01'),
    notes: 'February salary',
    createdBy: admin._id,
  },
  {
    amount: 800,
    type: 'expense',
    category: 'Utilities',
    date: new Date('2026-02-10'),
    notes: 'Electricity and internet bill',
    createdBy: admin._id,
  },
  {
    amount: 1500,
    type: 'income',
    category: 'Freelance',
    date: new Date('2026-02-20'),
    notes: 'Logo design project',
    createdBy: analyst._id,
  },
  {
    amount: 5000,
    type: 'income',
    category: 'Salary',
    date: new Date('2026-03-01'),
    notes: 'March salary',
    createdBy: admin._id,
  },
  {
    amount: 1200,
    type: 'expense',
    category: 'Rent',
    date: new Date('2026-03-05'),
    notes: 'Monthly rent',
    createdBy: admin._id,
  },
  {
    amount: 400,
    type: 'expense',
    category: 'Food',
    date: new Date('2026-03-12'),
    notes: 'Groceries and dining',
    createdBy: admin._id,
  },
  {
    amount: 2000,
    type: 'income',
    category: 'Freelance',
    date: new Date('2026-03-25'),
    notes: 'Web development project',
    createdBy: analyst._id,
  },
  {
    amount: 5000,
    type: 'income',
    category: 'Salary',
    date: new Date('2026-04-01'),
    notes: 'April salary',
    createdBy: admin._id,
  },
  {
    amount: 1200,
    type: 'expense',
    category: 'Rent',
    date: new Date('2026-04-05'),
    notes: 'Monthly rent',
    createdBy: admin._id,
  },
  {
    amount: 350,
    type: 'expense',
    category: 'Food',
    date: new Date('2026-04-08'),
    notes: 'Weekly groceries',
    createdBy: admin._id,
  },
])

console.log('✅ Database seeded successfully!')
console.log('')
console.log('Test accounts:')
console.log('  Admin    → admin@test.com    / password123')
console.log('  Analyst  → analyst@test.com  / password123')
console.log('  Viewer   → viewer@test.com   / password123')
console.log('')

await mongoose.disconnect()
console.log('Database connection closed.')