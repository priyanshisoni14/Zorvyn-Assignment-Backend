import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: resolve(__dirname, '../.env.test') })

export const connectTestDB = async () => {
  await mongoose.connect(process.env.MONGO_URI)
}

export const disconnectTestDB = async () => {
  await mongoose.connection.close()
}

export const clearDB = async () => {
  const collections = mongoose.connection.collections
  for (const key in collections) {
    await collections[key].deleteMany()
  }
}