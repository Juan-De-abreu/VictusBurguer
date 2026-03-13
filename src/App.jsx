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
import Cart from './Pages/Cart';
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'

function App() {

  return (
    <div className='App bg-[var(--body)]'>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <Header/>
            <Routes>
              <Route path="/" element={<Home/>}/>
              <Route path="/Desayunos" element={<Desayunos />} /> {/* Ruta para desayunos */}
              <Route path="/Almuerzos" element={<Almuerzos />} /> {/* Ruta para almuerzos */}
              <Route path="/ComidaRapida" element={<ComidaRapida />} /> {/* Ruta para comida rápida */}
              <Route path='/product/:productId' element={<ProductDetail/>}/>
              <Route path='/login' element={<Login/>}/>
              <Route path='/carrito' element={<Cart/>}/>
              {/* <Route path="/cocina" element={<ProtectedRoute isAllowed={user && user.rol === 'admin'} redirectTo="/home"><Cocina /> </ProtectedRoute>} /> */} {/* cuando tengamos roles */} 
            </Routes>
            <Footer/>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </div>
  )
}

export default App
