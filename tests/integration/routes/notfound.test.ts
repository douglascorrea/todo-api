import request from 'supertest'
import '../utils/apiValidator'
import app from '../../../src/server'

describe('Invalid Routes', () => {
  describe('GET /not-valid', () => {
    it('It should return error not found', async () => {
      const res = await request(app).get('/api/not-valid')

      expect(res.statusCode).toEqual(404)
      expect(res.body.status).toEqual('error')
      expect(res.body.message).toEqual('Not Found')
    })
  })
})
