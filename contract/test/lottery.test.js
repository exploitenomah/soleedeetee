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
      assert(false)
    } catch(err) {
      players = await lottery.methods.getPlayers().call()
      assert.ok(players.length === 0)
      assert(err)
    }
  })

  it('does not allow player to enter if payment is less than 0.01 ether',
  async () => {
    try{ 
      await lottery.methods.enter().send({ 
        from: accounts[0],
        value: web3Instance.utils.toWei('0.001', 'ether'),})
        assert(false)
    } catch(err){
      let players = await lottery.methods.getPlayers().call()
      console.log(players, players.length)
      assert.ok(players.length === 0)
      assert(err)
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

  it('does not allow non manager account to pick winner', async () => {
    try{
      await lottery.methods.enter().send({
        from: accounts[0],
        value: web3Instance.utils.toWei('0.011', 'ether')
      })
      await lottery.methods.pickWinner().send({
        from: accounts[1]
      })
      assert(false)
    }catch(err) {
      assert(err)
    }
  })

  it.only('allows only manager to pick winner', async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3Instance.utils.toWei('2', 'ether')
    })
    const winnerBalAfterEnter = await web3Instance.eth.getBalance(accounts[0])
    await lottery.methods.pickWinner().send({
      from: accounts[0],
    })
    const winnerBalAfterWin = await web3Instance.eth.getBalance(accounts[0])
    let winner = await lottery.methods.winner().call()
    assert.equal(winner, accounts[0])
    assert(winnerBalAfterWin > winnerBalAfterEnter)
  })

  it('cannot be reset by non manager', async () => {
    try{
      await lottery.methods.resetLottery().send({
        from: accounts[1]
      })
      assert(false)
    }catch(err) {
      assert(err)
    }
  })

  it('can be reset manager only', async () => {
    try{
      await lottery.methods.resetLottery().send({
        from: accounts[0]
      })
      assert(true)
    }catch(err) {
      assert(!err)
    }
  })
})

