
import './App.css';
import web3 from './web3';
import { useMemo } from 'react'

const fetcher = async () => {
  const response = await fetch(process.env.REACT_APP_SERVER_URL)
  const data = await response.json()
  return data
}

function App() {

  const contractData = useMemo(async () => await fetcher(), [])
  console.log(web3)
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
