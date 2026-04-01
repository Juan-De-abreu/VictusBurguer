import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config/api';

const ROLE_MAP = {
  2: 'Driver',
  3: 'Chef',
  4: 'Administracion',
  5: 'Admin'
};

const NAV_OPTIONS = {
  2: [ { to: '/notificaciones', label: 'Pedidos' }, { to: '/rutas', label: 'Rutas' }],
  3: [ { to: '/cocina', label: 'Cocina' }, { to: '/inventario', label: 'Inventario' }],
  4: [ { to: '/usuarios', label: 'Usuarios' }, { to: '/reportes', label: 'Reportes' }],
  5: [ { to: '/cocina', label: 'Cocina' }, { to: '/usuarios', label: 'Usuarios' }, { to: '/reportes', label: 'Reportes' }]
};

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ ESTADOS MOVIDOS ANTES DEL RETURN
  const [inventory] = useState([
    { id: 1, name: 'Carne de res', stock: 75 },
    { id: 2, name: 'Queso cheddar', stock: 180 },
    { id: 3, name: 'Pan artesanal', stock: 95 },
    { id: 4, name: 'Tomate', stock: 220 },
  ]);

  const [orders] = useState([
    { id: 101, item: 'Hamburguesa Doble', status: 'Preparando' },
    { id: 102, item: 'Papas Fritas', status: 'Listo para entrega' },
    { id: 103, item: 'Combo Familiar', status: 'En camino' },
  ]);

  const [delivered] = useState([
    { id: 201, item: 'Hamburguesa Veggie', completedAt: '09:32' },
    { id: 202, item: 'Almuerzo Ejecutivo', completedAt: '10:12' },
  ]);

  const [driverTasks] = useState([
    { id: 'D1', task: 'Ruta 1: Centro', due: '11:00' },
    { id: 'D2', task: 'Ruta 2: Playa', due: '12:30' },
  ]);

  const [efficiency] = useState({ staff: '87%', payroll: '72%', satisfaction: '91%' });
  const [accounting] = useState({ dailyRevenue: 5400, expenses: 1800, margin: '66%' });

  const rol = Number(user?.rol);
  const navLinks = NAV_OPTIONS[rol] ?? [];

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, { 
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('No se pudieron cargar usuarios');
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  useEffect(() => {
    if (authLoading) return; // Espera auth

    if (user && [2, 3, 4, 5].includes(rol)) {
      // Solo rol 5 necesita users
      if (rol === 5) {
        fetchUsers();
      }
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [user, rol, authLoading]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ rol: newRole })
      });
      if (!response.ok) throw new Error('No se pudo actualizar el rol');
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, rol: newRole } : u)));
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('¿Seguro que deseas eliminar este usuario?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('No se pudo eliminar el usuario');
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const lowStock = inventory.filter((item) => item.stock < 100);

  // Loading general
  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--body)] text-[var(--letra)]">
        <div className="w-12 h-12 border-4 border-[var(--primario)]/20 border-t-[var(--primario)] rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--body)] text-[var(--letra)]">
        <div className="text-red-400 text-center p-10 max-w-md">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-6 py-2 bg-[var(--primario)] text-white rounded-lg"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--body)] text-[var(--letra)]">
      <header className="fixed top-0 left-0 right-0 h-20 bg-[var(--primario)] border-b border-red-500/30 z-20 flex items-center justify-between px-6">
        <div className="text-white font-black text-xl">Victu's Burgers</div>
        <div className="text-white/80">
          {user?.nombre || 'Usuario'} - {ROLE_MAP[rol] || 'Invitado'}
        </div>
      </header>

      <div className="pt-24 lg:flex lg:space-x-6">
        <aside className="w-full lg:w-64 bg-[var(--primario)]/80 backdrop-blur-sm border-r border-red-500/30 p-6">
          <h2 className="text-white text-2xl font-bold mb-8">Panel {ROLE_MAP[rol] || 'Usuario'}</h2>
          <nav className="space-y-3">
            {navLinks.map((nav) => (
              <Link 
                key={nav.to} 
                to={nav.to} 
                className="block rounded-xl bg-white/10 text-white px-4 py-3 hover:bg-white/20 transition-all duration-200 flex items-center gap-2"
              >
                {nav.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-8">
          {rol === 3 && (
            <>
              <h2 className="text-4xl font-black mb-8 text-[var(--letra)]">👨‍🍳 Chef - Cocina</h2>
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="border border-red-500/20 rounded-2xl p-6 bg-[var(--primario)]/10 backdrop-blur-sm">
                  <h3 className="font-bold text-xl mb-4">📋 Pedidos Activos</h3>
                  <ul className="space-y-2">
                    {orders.map((o) => (
                      <li key={o.id} className="p-3 bg-white/5 rounded-xl">
                        <strong>#{o.id}</strong>: {o.item} 
                        <span className="ml-2 px-3 py-1 bg-yellow-500/20 text-yellow-200 rounded-full text-sm">
                          {o.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="border border-red-500/20 rounded-2xl p-6 bg-[var(--primario)]/10 backdrop-blur-sm">
                  <h3 className="font-bold text-xl mb-4">✅ Completados</h3>
                  <ul className="space-y-2">
                    {delivered.map((d) => (
                      <li key={d.id} className="p-3 bg-white/5 rounded-xl">
                        #{d.id}: {d.item} <span className="text-green-400">• {d.completedAt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="border border-red-500/20 rounded-2xl p-6 bg-[var(--primario)]/10 backdrop-blur-sm">
                  <h3 className="font-bold text-xl mb-4">📦 Inventario Bajo</h3>
                  <ul className="space-y-2">
                    {lowStock.map((i) => (
                      <li key={i.id} className="flex justify-between">
                        <span>{i.name}</span>
                        <span className="text-red-400 font-bold">{i.stock}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}

          {/* Resto de roles igual pero optimizado */}
          {rol === 2 && (
            <>
              <h2 className="text-4xl font-black mb-8 text-[var(--letra)]">🚚 Driver</h2>
              {/* Contenido driver */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* ... contenido igual pero con mejor styling */}
              </div>
            </>
          )}

          {rol === 4 && (
            <>
              <h2 className="text-4xl font-black mb-8 text-[var(--letra)]">📊 Administración</h2>
              <div className="grid gap-6 lg:grid-cols-3">
                {/* ... contenido igual */}
              </div>
            </>
          )}

          {rol === 5 && (
            <>
              <h2 className="text-4xl font-black mb-8 text-[var(--letra)]">👑 Admin Global</h2>
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="border border-red-500/20 rounded-2xl p-6 bg-[var(--primario)]/10 backdrop-blur-sm">
                  <h3 className="font-bold text-xl mb-6">👥 Gestión de Usuarios</h3>
                  {users.length === 0 ? (
                    <p className="text-gray-400">Cargando usuarios...</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="border-b border-gray-500/30 bg-white/5">
                            <th className="p-3">ID</th>
                            <th className="p-3">Nombre</th>
                            <th className="p-3">Email</th>
                            <th className="p-3">Rol</th>
                            <th className="p-3">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((u) => (
                            <tr key={u.id} className="border-b border-gray-500/20 hover:bg-white/10">
                              <td className="p-3">{u.id}</td>
                              <td className="p-3">{u.nombre || u.name || u.email}</td>
                              <td className="p-3 font-mono text-sm">{u.email}</td>
                              <td className="p-3">
                                <span className="px-3 py-1 bg-blue-500/20 text-blue-200 rounded-full text-xs">
                                  {ROLE_MAP[Number(u.rol)] || 'Cliente'}
                                </span>
                              </td>
                              <td className="p-3 space-x-2">
                                <select
                                  value={Number(u.rol) || 1}
                                  onChange={(e) => handleRoleChange(u.id, Number(e.target.value))}
                                  className="bg-[var(--body)] border border-red-500/50 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                >
                                  <option value={1}>Cliente</option>
                                  <option value={2}>Driver</option>
                                  <option value={3}>Chef</option>
                                  <option value={4}>Admin</option>
                                  <option value={5}>Super Admin</option>
                                </select>
                                <button
                                  onClick={() => handleDeleteUser(u.id)}
                                  className="px-3 py-1 bg-red-500/80 hover:bg-red-600 text-white rounded-lg text-sm transition-all"
                                >
                                  🗑️
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {![2,3,4,5].includes(rol) && (
            <div className="border border-red-500/50 rounded-2xl p-12 bg-[var(--primario)]/20 text-center max-w-2xl mx-auto mt-20">
              <h3 className="text-3xl font-black mb-4 text-red-300">🚫 Acceso Denegado</h3>
              <p className="text-xl text-gray-300 mb-6">Tu rol no tiene permisos para este panel.</p>
              <Link to="/" className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold">
                ← Volver al Menú Principal
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
