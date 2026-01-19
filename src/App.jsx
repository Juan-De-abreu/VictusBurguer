import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Home from './Pages/Home'
import Header from './Components/Header'
import Footer from './Components/Footer'

function App() {

  return (
    <div className='App bg-[var(--body)] '>
    <BrowserRouter>
      <Header/>
        <Routes>
          <Route path="/" element={<Home/>}/>
        </Routes>
      <Footer/>
    </BrowserRouter>
    </div>
  )
}

export default App
