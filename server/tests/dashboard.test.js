import request from 'supertest'
import app from '../app.js'
import { connectTestDB, disconnectTestDB, clearDB } from './setup.js'

beforeAll(async () => await connectTestDB())
afterAll(async () => await disconnectTestDB())
afterEach(async () => await clearDB())

let adminToken
let analystToken
let viewerToken

beforeEach(async () => {
  const adminRes = await request(app)
    .post('/api/v1/auth/register')
    .send({ name: 'Admin', email: 'admin@test.com', password: 'password123', role: 'admin' })
  adminToken = adminRes.body.data.token

  const analystRes = await request(app)
    .post('/api/v1/auth/register')
    .send({ name: 'Analyst', email: 'analyst@test.com', password: 'password123', role: 'analyst' })
  analystToken = analystRes.body.data.token

  const viewerRes = await request(app)
    .post('/api/v1/auth/register')
    .send({ name: 'Viewer', email: 'viewer@test.com', password: 'password123', role: 'viewer' })
  viewerToken = viewerRes.body.data.token

  await request(app)
    .post('/api/v1/records')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ amount: 5000, type: 'income', category: 'Salary', date: '2026-04-01' })

  await request(app)
    .post('/api/v1/records')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ amount: 2000, type: 'expense', category: 'Rent', date: '2026-04-02' })

  await request(app)
    .post('/api/v1/records')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ amount: 3000, type: 'income', category: 'Freelance', date: '2026-04-03' })
})

describe('GET /api/v1/dashboard/summary', () => {
  it('should return correct summary for admin', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/summary')
      .set('Authorization', `Bearer ${adminToken}`)

    expect(res.statusCode).toBe(200)
    expect(res.body.data.totalIncome).toBe(8000)
    expect(res.body.data.totalExpenses).toBe(2000)
    expect(res.body.data.netBalance).toBe(6000)
  })

  it('should return summary for viewer', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/summary')
      .set('Authorization', `Bearer ${viewerToken}`)

    expect(res.statusCode).toBe(200)
    expect(res.body.success).toBe(true)
  })

  it('should deny access without token', async () => {
    const res = await request(app).get('/api/v1/dashboard/summary')
    expect(res.statusCode).toBe(401)
  })
})

describe('GET /api/v1/dashboard/recent', () => {
  it('should return recent activity for all roles', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/recent')
      .set('Authorization', `Bearer ${viewerToken}`)

    expect(res.statusCode).toBe(200)
    expect(Array.isArray(res.body.data)).toBe(true)
  })

  it('should respect the limit parameter', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/recent?limit=2')
      .set('Authorization', `Bearer ${adminToken}`)

    expect(res.statusCode).toBe(200)
    expect(res.body.data.length).toBeLessThanOrEqual(2)
  })
})

describe('GET /api/v1/dashboard/by-category', () => {
  it('should return category breakdown for admin', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/by-category')
      .set('Authorization', `Bearer ${adminToken}`)

    expect(res.statusCode).toBe(200)
    expect(Array.isArray(res.body.data)).toBe(true)
  })

  it('should return category breakdown for analyst', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/by-category')
      .set('Authorization', `Bearer ${analystToken}`)

    expect(res.statusCode).toBe(200)
    expect(res.body.success).toBe(true)
  })

  it('should deny access for viewer', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/by-category')
      .set('Authorization', `Bearer ${viewerToken}`)

    expect(res.statusCode).toBe(403)
  })
})

describe('GET /api/v1/dashboard/trends', () => {
  it('should return monthly trends for admin', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/trends?period=monthly')
      .set('Authorization', `Bearer ${adminToken}`)

    expect(res.statusCode).toBe(200)
    expect(Array.isArray(res.body.data)).toBe(true)
  })

  it('should return weekly trends for analyst', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/trends?period=weekly')
      .set('Authorization', `Bearer ${analystToken}`)

    expect(res.statusCode).toBe(200)
    expect(res.body.success).toBe(true)
  })

  it('should fail with invalid period', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/trends?period=yearly')
      .set('Authorization', `Bearer ${adminToken}`)

    expect(res.statusCode).toBe(400)
  })

  it('should deny access for viewer', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/trends')
      .set('Authorization', `Bearer ${viewerToken}`)

    expect(res.statusCode).toBe(403)
  })
})