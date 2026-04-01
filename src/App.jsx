import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Home from "./Pages/Home";
import Header from "./Components/Header";
import Footer from "./Components/Footer";
import HeaderPersonal from "./Components/HeaderPersonal"; 
import FooterPersonal from "./Components/FooterPersonal"; 
import Desayunos from "./Pages/Desayunos";
import Almuerzos from "./Pages/Almuerzos";
import ComidaRapida from "./Pages/ComidaRapida";
import ProductDetail from "./Components/ProductsDetail";
import Login from "./Pages/Login";
import Cart from "./Pages/Cart";
import Dashboard from "./Pages/Dashboard";
import Ajustes from "./Pages/Ajustes";
import RoleProtectedRoute from "./Components/RoleProtectedRoute";
import ProtectedRoute from "./Components/ProtectedRoute";
import { AuthProvider, useAuth } from "./contexts/AuthContext"; // ← useAuth
import { CartProvider } from "./contexts/CartContext";

// ← SOLO AGREGAR ESTE COMPONENTE (6 líneas)
const PersonalLayout = ({ children }) => {
  const { user } = useAuth();
  return (
    <>
      <HeaderPersonal />
      <main className="min-h-screen pt-20 pb-20">{children}</main>
      <FooterPersonal />
    </>
  );
};

function App() {
  return (
    <div className="App bg-[var(--body)]">
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <Header />
            <Routes>
              {/* ✅ CLIENTE (Rol 0 / Sin login) - Header/Footer normal */}
              <Route path="/" element={<Home />} />
              <Route path="/Desayunos" element={<Desayunos />} />
              <Route path="/Almuerzos" element={<Almuerzos />} />
              <Route path="/ComidaRapida" element={<ComidaRapida />} />
              <Route path="/product/:productId" element={<ProductDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/carrito" element={<Cart />} />
              
              {/* ✅ PERSONAL (Rol 1-4) - HeaderPersonal/FooterPersonal */}
              <Route
                path="/ajustes"
                element={
                  <ProtectedRoute>
                    <PersonalLayout>
                      <Ajustes />
                    </PersonalLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <RoleProtectedRoute allowedRoles={[1, 2, 3, 4]}>
                    <PersonalLayout>
                      <Dashboard />
                    </PersonalLayout>
                  </RoleProtectedRoute>
                }
              />
            </Routes>
            <Footer />
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </div>
  );
}

export default App;