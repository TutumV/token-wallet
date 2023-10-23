import request from 'supertest';
import {WalletModel} from '../src/models/wallet.js';


describe('Wallet List/Create', () => {
  const wallet = {
    mnemonic: 'hammer skill park merit cost hover twin fat sight great crash indoor',
    path: "m/44'/60'/0'/0/0",
    address: '0x7e13F900472204F062c270B5E9Cb3CF127B08F18',
    privateKey: '42ba349b3c2120f30e4210c9086515b8e231a2047af84767b584ec35f7e25494'
  }
  beforeEach(async() => {
    await WalletModel.create(wallet)
  })

  it('Wallet Create', async () => {
    const res = await request(app.server)
      .post('/wallet')
      .send({
        mnemonic: 'virtual suffer rule fortune regret festival sleep crash rescue change dinner artwork'
      })
    expect(res.statusCode).toBe(201)
    expect(res.body.mnemonic).toBe('virtual suffer rule fortune regret festival sleep crash rescue change dinner artwork')
    expect(res.body.privateKey).toBe('0x26d3bc00b941173f28dd87dea642d6ea1bb3ebca8312a94b43ce914427ac8cb5')
    expect(res.body.path).toBe("m/44'/60'/0'/0/0")
    expect(res.body.address).toBe('0x4e92dE091a79B6d0CF25c63eF7Bd4B55454693d3')

    const query = await WalletModel.findAndCountAll()
    expect(query['count']).toBe(2)
  });

  it('Wallet Create Exist', async() => {
    const res = await request(app.server)
      .post('/wallet')
      .send({
        mnemonic: wallet.mnemonic
      })
    expect(res.statusCode).toBe(201)
    expect(res.body.mnemonic).toBe(wallet.mnemonic)
    expect(res.body.privateKey).toBe(wallet.privateKey)
    expect(res.body.path).toBe(wallet.path)
    expect(res.body.address).toBe(wallet.address)

    const query = await WalletModel.findAndCountAll()
    expect(query['count']).toBe(1)
  })

  it('Wallet Create Random', async() => {
    const res = await request(app.server)
      .post('/wallet')
      .send()
    expect(res.statusCode).toBe(201)

    const query = await WalletModel.findAndCountAll()
    expect(query['count']).toBe(2)
  })

  it('Wallet List', async() => {
    const res = await request(app.server).get('/wallet')
    expect(res.statusCode).toBe(200)
    expect(res.body.length).toBe(1)
  })

  afterEach(async () => {
    await WalletModel.destroy({truncate: true})
  })
})
