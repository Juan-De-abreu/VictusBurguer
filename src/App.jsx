import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import "./App.css";
import Home from "./Pages/Home";
import Header from "./Components/Header";
import Footer from "./Components/Footer";
import Desayunos from "./Pages/Desayunos";
import Almuerzos from "./Pages/Almuerzos";
import ComidaRapida from "./Pages/ComidaRapida";
import ProductDetail from "./Components/ProductsDetail";
import Login from "./Pages/Login";
import Cart from "./Pages/Cart";
import Dashboard from "./Pages/Dashboard"; // ← NUEVO
import Ajustes from "./Pages/Ajustes";
import RoleProtectedRoute from "./Components/RoleProtectedRoute";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";

// ✅ IMPORTS Dashboard Páginas
import Ingresos from "./Pages/Dashboard/Ingresos";
import Egresos from "./Pages/Dashboard/Egresos";
import Inventario from "./Pages/Dashboard/Inventario";
import Cuentas from "./Pages/Dashboard/Cuentas";
import Facturas from "./Pages/Dashboard/Facturas";
import MasVendido from "./Pages/Dashboard/MasVendido";
import MenosVendido from "./Pages/Dashboard/MenosVendido";
import AjustesPersonal from "./Pages/Dashboard/AjustesPersonal";

// Layouts
const PublicLayout = ({ children }) => (
  <>
    <Header />
    <main className="min-h-screen">{children}</main>
    <Footer />
  </>
);

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" /></div>;
  const isPersonal = user && [1,2,3,4].includes(Number(user.role));
  if (isPersonal) return <Navigate to="/dashboard" replace />;
  return <PublicLayout>{children}</PublicLayout>;
};

function App() {
  return (
    <div className="App bg-[var(--body)]">
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <Routes>
              {/* ✅ PÚBLICAS */}
              <Route path="/" element={<PublicRoute><Home /></PublicRoute>} />
              <Route path="/Desayunos" element={<PublicRoute><Desayunos /></PublicRoute>} />
              <Route path="/Almuerzos" element={<PublicRoute><Almuerzos /></PublicRoute>} />
              <Route path="/ComidaRapida" element={<PublicRoute><ComidaRapida /></PublicRoute>} />
              <Route path="/product/:productId" element={<PublicRoute><ProductDetail /></PublicRoute>} />
              <Route path="/carrito" element={<PublicRoute><Cart /></PublicRoute>} />
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/ajustes" element={<PublicRoute><Ajustes /></PublicRoute>} />
              
              {/* 🚀 DASHBOARD LAYOUT FIJO - PROTEGIDO POR ROL */}
              <Route path="/dashboard/*" element={<RoleProtectedRoute allowedRoles={[1,2,3,4]}><Dashboard /></RoleProtectedRoute>}>

                {/* PÁGINAS COMPARTIDAS CON CHEF CONTADOR Y ADMIN (2,3,4) */}
                <Route path="inventario" element={<RoleProtectedRoute allowedRoles={[2,3,4]}><Inventario /></RoleProtectedRoute>} />
                <Route path="ajustes-de-cuenta" element={<RoleProtectedRoute allowedRoles={[1,2,3,4]}><AjustesPersonal /></RoleProtectedRoute>} />
                {/* ADMIN SOLO (ID 4) y (ID 3) contador */}
                <Route path="ingreso" element={<RoleProtectedRoute allowedRoles={[4,3]}><Ingresos /></RoleProtectedRoute>} />
                <Route path="egreso" element={<RoleProtectedRoute allowedRoles={[4,3]}><Egresos /></RoleProtectedRoute>} />
                <Route path="cuentas" element={<RoleProtectedRoute allowedRoles={[4]}><Cuentas /></RoleProtectedRoute>} />
                <Route path="facturas" element={<RoleProtectedRoute allowedRoles={[4]}><Facturas /></RoleProtectedRoute>} />
                <Route path="mas-vendido" element={<RoleProtectedRoute allowedRoles={[3,4]}><MasVendido /></RoleProtectedRoute>} />
                <Route path="menos-vendido" element={<RoleProtectedRoute allowedRoles={[3,4]}><MenosVendido /></RoleProtectedRoute>} />
                
                {/* DEFAULT */}
                <Route index element={<div className="flex items-center justify-center min-h-screen p-8"><h1 className="text-5xl font-black text-center text-white">Selecciona del menú <br /><span className="text-sm text-center">NOTA:algunas opciones son muy extensas para celulares</span></h1></div>} />
              </Route>
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </div>
  );
}

export default App;