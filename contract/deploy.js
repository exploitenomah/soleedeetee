const HDWalletProvider = require('@truffle/hdwallet-provider')
const Web3 = require('web3')
const { interface, bytecode } = require('./compile.js')
const dotenv = require('dotenv')
const { storeDeployedContractInfo } = require('./mongodb')

dotenv.config('./.env')

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
  const storedContractData = await storeDeployedContractInfo({ abi: interface, address: deployment.options.address})
  console.log(storedContractData)
  console.log(deployment, deployment.options.address)
}

deploy()