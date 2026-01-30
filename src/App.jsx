import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Home from './Pages/Home'
import Header from './Components/Header'
import Footer from './Components/Footer'
import Desayunos from './Pages/Desayunos' // Importar la página de desayunos
import Almuerzos from './Pages/Almuerzos'
import ComidaRapida from './Pages/ComidaRapida' // Importar la página de comida rápida
import ProductDetail from './Components/ProductsDetail'
import Login from './Pages/Login'

function App() {

  return (
    <div className='App bg-[var(--body)]'>
    <BrowserRouter>
      <Header/>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/Desayunos" element={<Desayunos />} /> {/* Ruta para desayunos */}
          <Route path="/Almuerzos" element={<Almuerzos />} /> {/* Ruta para almuerzos */}
          <Route path="/ComidaRapida" element={<ComidaRapida />} /> {/* Ruta para comida rápida */}
          <Route path='/product/:productId' element={<ProductDetail/>}/>
          <Route path='/login' element={<Login/>}/>
        </Routes>
      <Footer/>
    </BrowserRouter>
    </div>
  )
}

export default App
