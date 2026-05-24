import { describe, it, expect, vi } from 'vitest'
import request from 'supertest'
import app from './server'

// Mock prisma queries to prevent database network requests during simple server tests
vi.mock('./lib/prisma', () => ({
  prisma: {
    $queryRaw: vi.fn().mockResolvedValue([{ '1': 1 }]),
  },
}))

describe('Express API Gateway Server', () => {
  describe('GET /health', () => {
    it('should return 200 and healthy status details', async () => {
      const response = await request(app)
        .get('/health')
        .expect('Content-Type', /json/)
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body.data).toHaveProperty('status', 'ok')
      expect(response.body.data).toHaveProperty('service', 'express-api-gateway')
      expect(response.body.data.db).toHaveProperty('status', 'ok')
    })
  })

  describe('GET /api/v1/health', () => {
    it('should return 200 and operational message', async () => {
      const response = await request(app)
        .get('/api/v1/health')
        .expect('Content-Type', /json/)
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body.message).toContain('Gateway operational')
      expect(response.body.data).toHaveProperty('status', 'ok')
    })
  })

  describe('GET /invalid-route-xyz', () => {
    it('should return 404 for unhandled routes', async () => {
      const response = await request(app)
        .get('/invalid-route-xyz')
        .expect(404)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body.message).toContain('Route /invalid-route-xyz not found')
    })
  })
})
