const assert = require('assert')
const ganache = require('ganache')
const Web3 = require('web3')
const { interface, bytecode } = require('../compile')
const web3Instance = new Web3(ganache.provider())
const { eth } = web3Instance

let accounts = []
let lottery;

beforeEach(async () => {
  accounts = await eth.getAccounts()
  lottery = await new eth.Contract(interface)
  .deploy({ data: bytecode.object, arguments: []})
  .send({ from: accounts[0], gas: 1000000 })
})

describe('Lottery Contract', () => {
  it('deploys contract', () => {
    assert.ok(lottery.options.address)
  })

  it('does not allow player to enter without payment', async () => {
    let players = await lottery.methods.getPlayers().call()
    assert.ok(players.length === 0)
    try{
      await lottery.methods.enter().send({
        from: accounts[0]
      })
    } catch(err) {
      players = await lottery.methods.getPlayers().call()
      assert.ok(players.length === 0)
    }
  })

  it('does not allow player to enter if payment is less than 0.01 ether',
  async () => {
    try{ 
      await lottery.methods.enter().send({ 
        from: accounts[0],
        value: web3Instance.utils.toWei('0.001', 'ether'),})
    } catch(err){
      let players = await lottery.methods.getPlayers().call()
      console.log(players, players.length)
      assert.ok(players.length === 0)
    }  
  })

  it('allows one player to enter with value of wei greater than 0.01 ether', async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3Instance.utils.toWei('0.011', 'ether')
    })
    let players = await lottery.methods.getPlayers().call()
    console.log(players, players.length)
    assert.equal(1, players.length)
    assert.equal(accounts[0], players[0])
  })
})

