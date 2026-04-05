import request from 'supertest'
import app from '../app.js'
import { connectTestDB, disconnectTestDB, clearDB } from './setup.js'

beforeAll(async () => await connectTestDB())
afterAll(async () => await disconnectTestDB())
afterEach(async () => await clearDB())

let adminToken
let viewerToken
let userId

beforeEach(async () => {
  const adminRes = await request(app)
    .post('/api/v1/auth/register')
    .send({ name: 'Admin', email: 'admin@test.com', password: 'password123', role: 'admin' })
  adminToken = adminRes.body.data.token

  const viewerRes = await request(app)
    .post('/api/v1/auth/register')
    .send({ name: 'Viewer', email: 'viewer@test.com', password: 'password123', role: 'viewer' })
  viewerToken = viewerRes.body.data.token
  userId = viewerRes.body.data.user._id
})

describe('GET /api/v1/users', () => {
  it('should return all users for admin', async () => {
    const res = await request(app)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${adminToken}`)

    expect(res.statusCode).toBe(200)
    expect(res.body.success).toBe(true)
    expect(Array.isArray(res.body.data)).toBe(true)
  })

  it('should deny access for viewer', async () => {
    const res = await request(app)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${viewerToken}`)

    expect(res.statusCode).toBe(403)
    expect(res.body.success).toBe(false)
  })

  it('should deny access without token', async () => {
    const res = await request(app).get('/api/v1/users')

    expect(res.statusCode).toBe(401)
    expect(res.body.success).toBe(false)
  })
})

describe('GET /api/v1/users/:id', () => {
  it('should return a single user for admin', async () => {
    const res = await request(app)
      .get(`/api/v1/users/${userId}`)
      .set('Authorization', `Bearer ${adminToken}`)

    expect(res.statusCode).toBe(200)
    expect(res.body.data._id).toBe(userId)
  })

  it('should return 404 for invalid user id', async () => {
    const res = await request(app)
      .get('/api/v1/users/000000000000000000000000')
      .set('Authorization', `Bearer ${adminToken}`)

    expect(res.statusCode).toBe(404)
  })
})

describe('PATCH /api/v1/users/:id/role', () => {
  it('should update user role successfully', async () => {
    const res = await request(app)
      .patch(`/api/v1/users/${userId}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'analyst' })

    expect(res.statusCode).toBe(200)
    expect(res.body.data.role).toBe('analyst')
  })

  it('should fail with invalid role', async () => {
    const res = await request(app)
      .patch(`/api/v1/users/${userId}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'superadmin' })

    expect(res.statusCode).toBe(400)
  })

  it('should deny access for viewer', async () => {
    const res = await request(app)
      .patch(`/api/v1/users/${userId}/role`)
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({ role: 'analyst' })

    expect(res.statusCode).toBe(403)
  })
})

describe('PATCH /api/v1/users/:id/status', () => {
  it('should deactivate a user', async () => {
    const res = await request(app)
      .patch(`/api/v1/users/${userId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isActive: false })

    expect(res.statusCode).toBe(200)
    expect(res.body.data.isActive).toBe(false)
  })

  it('should reactivate a user', async () => {
    const res = await request(app)
      .patch(`/api/v1/users/${userId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isActive: true })

    expect(res.statusCode).toBe(200)
    expect(res.body.data.isActive).toBe(true)
  })
})

describe('DELETE /api/v1/users/:id', () => {
  it('should delete a user successfully', async () => {
    const res = await request(app)
      .delete(`/api/v1/users/${userId}`)
      .set('Authorization', `Bearer ${adminToken}`)

    expect(res.statusCode).toBe(200)
    expect(res.body.success).toBe(true)
  })

  it('should deny access for viewer', async () => {
    const res = await request(app)
      .delete(`/api/v1/users/${userId}`)
      .set('Authorization', `Bearer ${viewerToken}`)

    expect(res.statusCode).toBe(403)
  })
})