import request from 'supertest';
import {TokenModel} from '../src/models/token.js';


describe('Token Create/List', () => {
  const Token = {
    coin: 'USDC',
    abi: [],
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
  }
  beforeEach(async() => {
    await TokenModel.create(Token)
  })

  it('Token Create Exists', async () => {
    const res = await request(app.server)
      .post('/token')
      .send({
        coin: "USDC",
        address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        abi: []
      })
      expect(res.statusCode).toBe(201)

    const query = await TokenModel.findAndCountAll()
    expect(query['count']).toBe(1)
  })
  it('Token Create New', async () => {
    const res = await request(app.server)
      .post('/token')
      .send({
        coin: "USDT",
        address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        abi: []
      })
    expect(res.statusCode).toBe(201)

    const query = await TokenModel.findAndCountAll()
    expect(query['count']).toBe(2)
  })
  it('Token Create Validation Error', async() => {
    const res = await request(app.server)
      .post('/token')
      .send()
    expect(res.statusCode).toBe(400)

    const query = await TokenModel.findAndCountAll()
    expect(query['count']).toBe(1)
  })
  it('Token list', async () => {
    const res = await request(app.server).get('/token')
    expect(res.statusCode).toBe(200)
    expect(res.body.length).toBe(1)
  })
  afterEach(async () => {
    await TokenModel.destroy({truncate: true})
  })
})

describe('Token Detail', () => {
  const Token = {
    coin: 'USDC',
    abi: [],
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
  }
  beforeEach(async() => {
    await TokenModel.create(Token)
  })

  it('Token Detail', async () => {
    const token = await TokenModel.findOne()

    const res = await request(app.server).get(`/token/detail/${token.id}`)
    expect(res.statusCode).toBe(200)
    expect(res.body.address).toBe(token.address)
    expect(res.body.id).toBe(token.id)
    expect(res.body.abi).toEqual(token.abi)
  })

  it('Token Detail Not Found', async() => {
    const res = await request(app.server).get('/token/detail/0')
    expect(res.statusCode).toBe(404)
    expect(res.body.error).toBe('Token Not Found')
  })

  it('Token Delete', async() => {
    const token = await TokenModel.findOne()
    const res = await request(app.server).delete(`/token/detail/${token.id}`)
    expect(res.statusCode).toBe(204)

    const query = await TokenModel.findAndCountAll()
    expect(query['count']).toBe(0)
  })

  it('Token Delete Not Found', async() => {
    const res = await request(app.server).delete('/token/detail/0')
    expect(res.statusCode).toBe(204)

    const query = await TokenModel.findAndCountAll()
    expect(query['count']).toBe(1)
  })

  afterEach(async() => {
    await TokenModel.destroy({truncate: true})
  })
})
