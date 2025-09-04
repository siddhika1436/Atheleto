import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Pages from "./components/Pages/Pages"
import {BrowserRouter} from "react-router-dom"
import { AuthContext } from './components/AppContext/AppContext'
import AppContext from './components/AppContext/AppContext'
function App() {
  const [count, setCount] = useState(0)

  return (
    <h1 className='App'>
      <BrowserRouter>
      <AppContext>
      <Pages/>
      </AppContext>
     
      </BrowserRouter>
      
    </h1>
  )
}

export default App
