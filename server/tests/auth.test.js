import request from 'supertest'
import app from '../app.js'
import { connectTestDB, disconnectTestDB, clearDB } from './setup.js'

beforeAll(async () => await connectTestDB())
afterAll(async () => await disconnectTestDB())
afterEach(async () => await clearDB())

const registerPayload = {
  name: 'Admin User',
  email: 'admin@test.com',
  password: 'password123',
  role: 'admin',
}

describe('POST /api/v1/auth/register', () => {
  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(registerPayload)

    expect(res.statusCode).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.user.email).toBe(registerPayload.email)
    expect(res.body.data.token).toBeDefined()
  })

  it('should not return password in response', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(registerPayload)

    expect(res.body.data.user.password).toBeUndefined()
  })

  it('should fail if email is already registered', async () => {
    await request(app).post('/api/v1/auth/register').send(registerPayload)
    const res = await request(app).post('/api/v1/auth/register').send(registerPayload)

    expect(res.statusCode).toBe(409)
    expect(res.body.success).toBe(false)
  })

  it('should fail if email is invalid', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...registerPayload, email: 'not-an-email' })

    expect(res.statusCode).toBe(400)
    expect(res.body.success).toBe(false)
  })

  it('should fail if password is less than 6 characters', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...registerPayload, password: '123' })

    expect(res.statusCode).toBe(400)
    expect(res.body.success).toBe(false)
  })

  it('should fail if name is missing', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'test@test.com', password: 'password123' })

    expect(res.statusCode).toBe(400)
    expect(res.body.success).toBe(false)
  })

  it('should fail if role is invalid', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...registerPayload, role: 'superadmin' })

    expect(res.statusCode).toBe(400)
    expect(res.body.success).toBe(false)
  })
})

describe('POST /api/v1/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/v1/auth/register').send(registerPayload)
  })

  it('should login successfully with correct credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: registerPayload.email, password: registerPayload.password })

    expect(res.statusCode).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.token).toBeDefined()
  })

  it('should fail with wrong password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: registerPayload.email, password: 'wrongpassword' })

    expect(res.statusCode).toBe(401)
    expect(res.body.success).toBe(false)
  })

  it('should fail with unregistered email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nobody@test.com', password: 'password123' })

    expect(res.statusCode).toBe(401)
    expect(res.body.success).toBe(false)
  })

  it('should fail if email is missing', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ password: 'password123' })

    expect(res.statusCode).toBe(400)
    expect(res.body.success).toBe(false)
  })
})