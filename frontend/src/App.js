
import web3 from './web3';
import { useEffect, useState, useMemo, useCallback } from 'react'



function App() {
  const [contractData, setContractData] = useState(null)
  const contract = useMemo(() => contractData ? new web3.eth.Contract(contractData.abi, contractData.address) : null, [contractData])
  const [manager, setManager] = useState('')
  const [lotteryInfo, setLotteryInfo] = useState({
    players: null, totalPrize: 0, winner: ""
  })
  const [loadingMessage, setLoadingMessage] = useState("")
  const [etherInputVal, setEtherInputVal] = useState("")

  const pickWinner = useCallback(async () => {
    const address = await web3.eth.getAccounts()
    await contract.methods.pickWinner().send({
      from: address[0],
    })
    let winner = await contract.methods.winner().call()
    console.log(winner)
    setLotteryInfo(prev => ({...prev, winner}))
  }, [contract])

  const handleFormSubmit = useCallback(async (event) => {
    event.preventDefault()
    if(etherInputVal.length === 0) return alert("Please specify the amount of ether!")
    if(+etherInputVal <= 0.01) return alert("Must be at least 0.1 ether!")
    setLoadingMessage("Attemmpting to enter you into the lottery...")
    const address = await web3.eth.getAccounts()
    const hasEntered = await contract.methods.enter().send({
      from: address[0],
      value: web3.utils.toWei(etherInputVal, "ether")
    })
    console.log(address[0], contract, hasEntered);
    setLoadingMessage("done didit")
    console.log(etherInputVal)
  }, [contract, etherInputVal])
  
  useEffect(() => {
    const fetchContractData = async () => {
      const response = await fetch(process.env.REACT_APP_SERVER_URL)
      const data = await response.json()
      setContractData({...data.data})
    }
    const getManager = async () => setManager(await contract.methods.manager().call())
    const getPlayers = async () => {
      const players = await contract.methods.getPlayers().call()
      const balance = await web3.eth.getBalance(contract.options.address)
      setLotteryInfo((prev) => ({ ...prev, players, totalPrize: balance}))
    }
    if(contractData === null){
      fetchContractData()
    }
    if(contract !== null){
     manager.length === 0 && getManager()
     lotteryInfo.players === null && getPlayers()
    }
  }, [contract, contractData, lotteryInfo, lotteryInfo.players, manager.length])

  return (
    <main className="App">
      <h1>Lottery Contract</h1>
      <p>This contract is managed by {manager}. <br/>
        There are currently {lotteryInfo.players?.length} people entered,
        competing to win a prize of {web3.utils.fromWei(lotteryInfo.totalPrize.toString(), "ether")} ether
      </p>
      <hr/>
      {loadingMessage.length > 0 &&
      <p>{loadingMessage.message}</p>}
      <form onSubmit={handleFormSubmit}>
        <fieldset>
          <legend>Want to try your luck?</legend>
          <label>
            Amount of ether to enter 
            <input
              type="number" 
              value={etherInputVal}
              onChange={e => setEtherInputVal(e.target.value)}
            />
            <button type='submit'>Enter</button>
          </label>
        </fieldset>
      </form>
      <button onClick={pickWinner} type='button'>pick winner</button>
      <p>The winner is {lotteryInfo.winner}</p>
    </main>
  );
}

export default App;
