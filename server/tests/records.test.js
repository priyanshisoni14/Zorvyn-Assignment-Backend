import request from 'supertest'
import app from '../app.js'
import { connectTestDB, disconnectTestDB, clearDB } from './setup.js'

beforeAll(async () => await connectTestDB())
afterAll(async () => await disconnectTestDB())
afterEach(async () => await clearDB())

let adminToken
let viewerToken
let recordId

const recordPayload = {
  amount: 5000,
  type: 'income',
  category: 'Salary',
  date: '2026-04-01',
  notes: 'Monthly salary',
}

beforeEach(async () => {
  const adminRes = await request(app)
    .post('/api/v1/auth/register')
    .send({ name: 'Admin', email: 'admin@test.com', password: 'password123', role: 'admin' })
  adminToken = adminRes.body.data.token

  const viewerRes = await request(app)
    .post('/api/v1/auth/register')
    .send({ name: 'Viewer', email: 'viewer@test.com', password: 'password123', role: 'viewer' })
  viewerToken = viewerRes.body.data.token

  const recordRes = await request(app)
    .post('/api/v1/records')
    .set('Authorization', `Bearer ${adminToken}`)
    .send(recordPayload)
  recordId = recordRes.body.data._id
})

describe('POST /api/v1/records', () => {
  it('should create a record for admin', async () => {
    const res = await request(app)
      .post('/api/v1/records')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(recordPayload)

    expect(res.statusCode).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.amount).toBe(recordPayload.amount)
  })

  it('should deny record creation for viewer', async () => {
    const res = await request(app)
      .post('/api/v1/records')
      .set('Authorization', `Bearer ${viewerToken}`)
      .send(recordPayload)

    expect(res.statusCode).toBe(403)
  })

  it('should fail if amount is missing', async () => {
    const res = await request(app)
      .post('/api/v1/records')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ type: 'income', category: 'Salary', date: '2026-04-01' })

    expect(res.statusCode).toBe(400)
  })

  it('should fail if type is invalid', async () => {
    const res = await request(app)
      .post('/api/v1/records')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...recordPayload, type: 'savings' })

    expect(res.statusCode).toBe(400)
  })
})

describe('GET /api/v1/records', () => {
  it('should return all records for viewer', async () => {
    const res = await request(app)
      .get('/api/v1/records')
      .set('Authorization', `Bearer ${viewerToken}`)

    expect(res.statusCode).toBe(200)
    expect(res.body.success).toBe(true)
    expect(Array.isArray(res.body.data.records)).toBe(true)
  })

  it('should filter records by type', async () => {
    const res = await request(app)
      .get('/api/v1/records?type=income')
      .set('Authorization', `Bearer ${adminToken}`)

    expect(res.statusCode).toBe(200)
    res.body.data.records.forEach((r) => {
      expect(r.type).toBe('income')
    })
  })

  it('should return paginated results', async () => {
    const res = await request(app)
      .get('/api/v1/records?page=1&limit=5')
      .set('Authorization', `Bearer ${adminToken}`)

    expect(res.statusCode).toBe(200)
    expect(res.body.data.pagination).toBeDefined()
    expect(res.body.data.pagination.page).toBe(1)
    expect(res.body.data.pagination.limit).toBe(5)
  })

  it('should deny access without token', async () => {
    const res = await request(app).get('/api/v1/records')
    expect(res.statusCode).toBe(401)
  })
})

describe('GET /api/v1/records/:id', () => {
  it('should return a single record', async () => {
    const res = await request(app)
      .get(`/api/v1/records/${recordId}`)
      .set('Authorization', `Bearer ${adminToken}`)

    expect(res.statusCode).toBe(200)
    expect(res.body.data._id).toBe(recordId)
  })

  it('should return 404 for non existent record', async () => {
    const res = await request(app)
      .get('/api/v1/records/000000000000000000000000')
      .set('Authorization', `Bearer ${adminToken}`)

    expect(res.statusCode).toBe(404)
  })
})

describe('PUT /api/v1/records/:id', () => {
  it('should update a record for admin', async () => {
    const res = await request(app)
      .put(`/api/v1/records/${recordId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: 9000, notes: 'Updated salary' })

    expect(res.statusCode).toBe(200)
    expect(res.body.data.amount).toBe(9000)
    expect(res.body.data.notes).toBe('Updated salary')
  })

  it('should deny update for viewer', async () => {
    const res = await request(app)
      .put(`/api/v1/records/${recordId}`)
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({ amount: 9000 })

    expect(res.statusCode).toBe(403)
  })
})

describe('DELETE /api/v1/records/:id', () => {
  it('should soft delete a record for admin', async () => {
    const res = await request(app)
      .delete(`/api/v1/records/${recordId}`)
      .set('Authorization', `Bearer ${adminToken}`)

    expect(res.statusCode).toBe(200)
    expect(res.body.success).toBe(true)
  })

  it('should not return deleted record in list', async () => {
    await request(app)
      .delete(`/api/v1/records/${recordId}`)
      .set('Authorization', `Bearer ${adminToken}`)

    const res = await request(app)
      .get('/api/v1/records')
      .set('Authorization', `Bearer ${adminToken}`)

    const ids = res.body.data.records.map((r) => r._id)
    expect(ids).not.toContain(recordId)
  })

  it('should deny delete for viewer', async () => {
    const res = await request(app)
      .delete(`/api/v1/records/${recordId}`)
      .set('Authorization', `Bearer ${viewerToken}`)

    expect(res.statusCode).toBe(403)
  })
})