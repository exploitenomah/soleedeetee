const path = require('node:path')
const fs = require('node:fs')
const solc = require('solc')


const lotteryPath = path.resolve(__dirname, 'contracts', 'lottery.sol')
const source = fs.readFileSync(lotteryPath, 'utf-8')

 const compiled = JSON.parse(solc.compile(JSON.stringify({
  language: 'Solidity',
  sources: {
    'lottery.sol': {
      content: source
    },
  },
  settings: {
    outputSelection: {
        '*': {
            '*': ['*']
        }
    }
}
})))
if(compiled.errors?.length > 0){
  throw new Error(...compiled.errors)
}
const Lottery = compiled.contracts['lottery.sol'].Lottery
const lotteryABI = Lottery.abi
const lotteryBytecode = Lottery.evm.bytecode
module.exports = { interface: lotteryABI, bytecode: lotteryBytecode}
