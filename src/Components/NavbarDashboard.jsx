import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const NavbarDashboard = ({ isMobileOpen, onToggle, setAjustesModalOpen }) => { // ← RECIBE setAjustesModalOpen
  const { user, logout } = useAuth();
  const location = useLocation();
  const userId = Number(user?.rol || 0);

  // Config menú
  const menuConfig = {
    1: { 
      title: "🚀 Uber", 
      items: [
        { path: '/dashboard/pedidos', label: ' Pedidos', icon: '📦' },
        { path: '/dashboard/pedidos-culminados', label: ' Culminados', icon: '✅' }
      ]
    },
    2: { 
      title: "👨‍🍳 Chef", 
      items: [
        { path: '/dashboard/pedidos-pendientes', label: ' Pendientes', icon: '⏳' },
        { path: '/dashboard/mis-pedidos', label: ' Tus Pedidos', icon: '✅' },
        { path: '/dashboard/inventario', label: ' Inventario', icon: '📦' }
      ]
    },
    3: { 
      title: "💰 Contador", 
      items: [
        { path: '/dashboard/facturas', label: ' Facturas', icon: '📋' },
        { path: '/dashboard/inventario', label: ' Inventario', icon: '📦' },
        { path: '/dashboard/inventario-critico', label: ' Crítico', icon: '⚠️' },
        { path: '/dashboard/mas-vendido', label: ' Más Vendido', icon: '⭐' },
        { path: '/dashboard/menos-vendido', label: ' Menos Vendido', icon: '📉' },
        { path: '/dashboard/menu-ajustes', label: ' Ajustes Menú', icon: '🍔' }
      ]
    },
    4: { 
      title: "👑 Admin", 
      items: [
        { path: '/dashboard/facturas', label: ' Facturas', icon: '📋' },
        { path: '/dashboard/cuentas', label: ' Cuentas', icon: '👥' },
        { path: '/dashboard/mas-vendido', label: ' Más Vendido', icon: '⭐' },
        { path: '/dashboard/menos-vendido', label: ' Menos Vendido', icon: '📉' },
        { path: '/dashboard/inventario', label: ' Inventario', icon: '📦' } // ✅ FIX path
      ]
    }
  };

  const config = menuConfig[userId] || menuConfig[4];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className={`
      fixed lg:static top-0 left-0 h-full w-60 md:w-70 lg:w-80 2xl:w-96 z-40
      bg-gradient-to-b from-[var(--primario)] to-[var(--primario)]/90 backdrop-blur-md 
      shadow-2xl border-r border-red-500/30 flex flex-col
      transform transition-transform duration-300 lg:translate-x-0
      ${isMobileOpen ? 'translate-x-0 shadow-3xl' : '-translate-x-full lg:translate-x-0'}
    `}>
      
      {/* 👤 HEADER */}
      <div className="p-6 border-b border-red-500/30 sticky top-0 bg-[var(--primario)]/95 z-10">
        <div className="text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg border-2 border-white/30">
            <span className="text-2xl">👤</span>
          </div>
          <h1 className="text-xl font-black text-white mb-2 drop-shadow-lg">
            {config.title}
          </h1>
          {user?.nombre && <p className="text-white/90 text-base font-semibold">{user.nombre}</p>}
        </div>

        {/* 🚪 AJUSTES + LOGOUT */}
      <div className="grid grid-cols-2 gap-2 pt-4">
  <button
    onClick={() => setAjustesModalOpen(true)}
    className="w-full h-12 flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-colors duration-300"
  >
    <span className="hidden sm:inline mr-1">Ajustes</span>
    <span className="text-xl">⚙️</span>
  </button>

  <button
    onClick={handleLogout}
    className="w-full h-12 flex items-center justify-center bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-colors duration-300 text-sm"
  >
    <span className="hidden sm:inline mr-1">Cerrar</span>
    <span className="hidden sm:inline mr-1">Sesión</span>
    <span className="text-xl">🚪</span>
  </button>
</div>

      </div>

      {/* 📋 MENÚ */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {config.items.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => onToggle(false)} // Cierra mobile
              className={`group flex items-center space-x-4 p-4 rounded-xl text-lg font-semibold transition-all duration-300 transform ${
                isActive
                  ? 'bg-red-900/20 text-white shadow-lg shadow-black/30 border-2 border-white/40 scale-[1.02]'
                  : 'text-white/90 hover:bg-red-900/90 hover:text-white hover:shadow-lg hover:shadow-black/20 hover:border-white/20 border border-white/5 hover:scale-[1.02]'
              }`}
            >
              <span className={`text-xl transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                {item.icon}
              </span>
              <span className="flex-1">{item.label}</span>
              {isActive && <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse ml-auto" />}
            </Link>
          );
        })}
      </nav>

      
    </div>
  );
};

export default NavbarDashboard;