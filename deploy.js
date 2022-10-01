const HDWalletProvider = require('@truffle/hdwallet-provider')
const Web3 = require('web3')
const { interface, bytecode } = require('./compile.js')
const dotenv = require('dotenv')

dotenv.config('./.env')
console.log(process.env)
const provider = new HDWalletProvider(
   process.env.SECRET_PHRASE,
   process.env.INFURA_URL,
)

const web3 = new Web3(provider)

const deploy = async () => {
  let accounts = await web3.eth.getAccounts()

  console.log('attempting to deploy from account: ==>', + ' ' + accounts[0])

  const deployment = await new web3.eth.Contract( interface )
  .deploy({data: bytecode.object, arguments: []})
  .send({ gas: '1000000', from: accounts[0]})

  console.log(deployment, deployment.options)
}

deploy()