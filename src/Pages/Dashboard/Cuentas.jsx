import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config/api';
import '../../index.css'; // Asegúrate de que Tailwind esté importado
const Cuentas = () => {
  const [cuentas, setCuentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    telefono: '',
    rol: '',
  });
  const [message, setMessage] = useState('');

  // 🔄 CARGAR USUARIOS
  useEffect(() => {
    fetchUsuarios();
  }, []);

  // 🔄 CARGAR USUARIOS - FIX
const fetchUsuarios = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/users`);  // ✅ await
    const data = await response.json();                     // ✅ simple
    if (data.success) {
      setCuentas(data.data.map(u => ({
        ...u,
        activo: true
      })));
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    setLoading(false);
  }
};

  // ➕ AGREGAR USUARIO
  const handleAgregar = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      
      if (data.success) {
        setMessage('✅ Usuario creado: #' + data.user_id);
        setFormData({ nombre: '', email: '', password: '', telefono: '', rol: '' });
        setModalOpen(false);
        fetchUsuarios(); // Recargar lista
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('❌ ' + (data.error || 'Error desconocido'));
      }
    } catch (error) {
      setMessage('❌ Error conexión');
    }
  };

  // 🗑️ ELIMINAR USUARIO
  const handleEliminar = async (user_id) => {
    if (!confirm(`¿Eliminar usuario #${user_id}?`)) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id })
      });
      const data = await response.json();
      
      if (data.success) {
        setMessage('✅ Usuario eliminado');
        fetchUsuarios();
        setTimeout(() => setMessage(''), 2000);
      } else {
        setMessage('❌ ' + data.error);
      }
    } catch (error) {
      setMessage('❌ Error conexión');
    }
  };

// 1. FIX handleEditar
const handleEditar = (cuenta) => {
  setEditingUserId(cuenta.user_id);
  setFormData({
    user_id: cuenta.user_id,
    nombre: cuenta.nombre,
    email: cuenta.email,
    password: '',
    telefono: cuenta.telefono || '',
    rol: Number(cuenta.rol) || 1  // ✅ CAST + DEFAULT 1
  });
  setModalEditarOpen(true);
};

// 2. FIX handleActualizar
const handleActualizar = async (e) => {
  e.preventDefault();
  
  const rolNum = Number(formData.rol);
  if (![1,2,3,4].includes(rolNum)) {
    setMessage('❌ Selecciona un rol válido (1-4)');
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, rol: rolNum })
    });

    const data = await response.json();
    
    if (data.success) {
      setMessage('✅ Usuario actualizado: #' + data.user_id);
      setModalEditarOpen(false);
      setEditingUserId(null);
      fetchUsuarios();
      setTimeout(() => setMessage(''), 3000);
    } else {
      setMessage('❌ ' + (data.error || 'Error'));
    }
  } catch (error) {
    setMessage('❌ Error conexión');
  }
};

  if (loading) {
    return <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600" />
    </div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h1 className="text-4xl sm:text-5xl text-white pl-20 lg:pl-0">👥 Gestión Cuentas</h1>
        <button
          onClick={() => {
            setModalOpen(true);
            setFormData({ nombre: '', email: '', password: '', telefono: '', rol: '' });
          }}
          className="px-8 py-3 bg-gradient-to-r from-green-800 to-green-900 hover:from-green-900 hover:to-green-800 duration-300 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl  hover:scale-102 transition-colors whitespace-nowrap"
        >
          ➕ Agregar Cuenta
        </button>
      </div>

      {/* 📢 Mensaje */}
      {message && (
        <div className={`p-4 rounded-2xl text-center font-bold text-lg shadow-lg ${
          message.includes('✅') ? 'bg-green-100 text-green-800 border-4 border-green-200' : 'bg-red-100 text-red-800 border-4 border-red-200'
        }`}>
          {message}
        </div>
      )}

      {/* 📋 TABLA */}
      <div className="overflow-x-auto bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-blue-200">
        <table className="w-full">
          <thead>
            <tr className="bg-[var(--body)] text-white">
              <th className="p-4 text-left font-bold ">ID</th>
              <th className="p-4 text-left font-bold ">Usuario</th>
              <th className="p-4 text-left font-bold ">Email</th>
              <th className="p-4 text-center font-bold ">Rol</th>
              <th className="p-4 text-center font-bold ">Teléfono</th>
              <th className="p-4 text-center font-bold ">Creado</th>
              <th className="p-4 text-center font-bold ">Acciones</th>
            </tr>
          </thead>
          <tbody className='bg-[var(--primario)] text-white'>
            {cuentas.map((cuenta) => (
              <tr key={cuenta.user_id} className="border-t hover:bg-red-500/20 transition-all">
                <td className="p-4 font-mono font-bold text-lg ">#{cuenta.user_id}</td>
                <td className="p-4 font-bold ">{cuenta.nombre}</td>
                <td className="p-4 text-sm  font-medium">{cuenta.email}</td>
                <td className="p-4 text-center">
                  <span className={`px-4 py-2 rounded-full text-sm font-bold `}>
                    {
                     cuenta.rol === 0 ? 'cliente ' :
                     cuenta.rol === 1 ? 'Uber' :
                     cuenta.rol === 2 ? 'Chef' :
                     cuenta.rol === 3 ? 'Contador' :
                     cuenta.rol === 4 ? 'Admin' : 'Desconocido'}
                  </span>
                </td>
                <td className="p-4 text-center text-sm">{cuenta.telefono || '—'}</td>
                <td className="p-4 text-center text-xs ">{new Date(cuenta.created_at).toLocaleDateString()}</td>
                <td className="p-4">
                  <div className="flex gap-2 justify-center">
                    <button 
                      onClick={() => handleEditar(cuenta)}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all whitespace-nowrap"
                    >
                      ✏️ Editar
                    </button>
                    <button 
                      onClick={() => handleEliminar(cuenta.user_id)}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all whitespace-nowrap"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ➕ MODAL AGREGAR */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 h-[100vh] bg-black/80 backdrop-blur-md animate-fade-in text-white" onClick={() => setModalOpen(false)}>
          <div className="w-full max-w-md border-4 border-red-400/50 rounded-3xl shadow-2xl p-8 m-4 max-h-[90vh] overflow-y-auto animate-slide-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black ">Nueva Cuenta</h2>
              <button onClick={() => setModalOpen(false)} className="text-3xl text-red-400 hover:text-red-500 transition">×</button>
            </div>

            <form onSubmit={handleAgregar} className="space-y-6">
              <div>
                <label className="block text-sm font-bold mb-2 ">Nombre Completo *</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, [e.target.name]: e.target.value})}
                  className="w-full p-4 border border-red-300 rounded-2xl focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-2 ">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, [e.target.name]: e.target.value})}
                  className="w-full p-4 border border-red-300 rounded-2xl focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-2 ">Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, [e.target.name]: e.target.value})}
                  className="w-full p-4 border border-red-300 rounded-2xl focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-2 ">Teléfono</label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={(e) => setFormData({...formData, [e.target.name]: e.target.value})}
                  className="w-full p-4 border border-red-300 rounded-2xl focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-2 ">Rol *</label>
                <select
                  name="rol"
                  value={formData.rol}
                  onChange={(e) => setFormData({...formData, rol: Number(e.target.value)})}
                  className="w-full p-4 border border-red-300 rounded-2xl focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all"
                  required
                >
                  <option className='bg-[var(--body)]' value={1}>Uber (1)</option>
                  <option className='bg-[var(--body)]' value={2}>Chef (2)</option>
                  <option className='bg-[var(--body)]' value={3}>Contador (3)</option>
                  <option className='bg-[var(--body)]' value={4}>Admin (4)</option>
                </select>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 p-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-colors duration-300 text-lg"
                >
                  ➕ Crear
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 p-4 bg-gray-500 hover:bg-red-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-lg transition-colors duration-300"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

       {/* ✏️ MODAL EDITAR (NUEVO - IGUAL ESTRUCTURA) */}
      {modalEditarOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 h-[100vh] bg-black/80 backdrop-blur-md animate-fade-in" onClick={() => {setModalEditarOpen(false); setEditingUserId(null);}}>
          <div className="w-full max-w-md text-white border-4 border-red-900/50 rounded-3xl shadow-2xl p-8 m-4 max-h-[90vh] overflow-y-auto animate-slide-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black ">✏️ Editar Usuario #{editingUserId}</h2>
              <button onClick={() => {setModalEditarOpen(false); setEditingUserId(null);}} className="text-3xl text-gray-400 hover:text-red-500 transition">×</button>
            </div>

            <form onSubmit={handleActualizar} className="space-y-6">
              <div>
                <label className="block text-sm font-bold mb-2 ">Nombre Completo *</label>
                <input name="nombre" value={formData.nombre} onChange={(e) => setFormData({...formData, [e.target.name]: e.target.value})} type="text" className="w-full p-4 border border-gray-300 rounded-2xl focus:border-red-700 focus:ring-2 focus:ring-red-700/20 focus:outline-none transition-all" required />
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-2 ">Email *</label>
                <input name="email" value={formData.email} onChange={(e) => setFormData({...formData, [e.target.name]: e.target.value})} type="email" className="w-full p-4 border border-gray-300 rounded-2xl focus:border-red-700 focus:ring-2 focus:ring-red-700/20 focus:outline-none transition-all" required />
              </div>
              
              <div className="opacity-50">
                <label className="block text-sm font-bold mb-2 ">Password (dejar vacío para mantener)</label>
                <input name="password" value={formData.password} onChange={(e) => setFormData({...formData, [e.target.name]: e.target.value})} type="password" placeholder="Nueva contraseña (opcional)" className="w-full p-4 border border-gray-300 rounded-2xl  focus:border-red-700 focus:ring-2 focus:ring-red-700/20 focus:outline-none transition-all" />
                <p className="text-xs  mt-1">Vacío = sin cambios</p>
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-2 ">Teléfono</label>
                <input name="telefono" value={formData.telefono} onChange={(e) => setFormData({...formData, [e.target.name]: e.target.value})} type="tel" className="w-full p-4 border border-gray-300 rounded-2xl focus:border-red-700 focus:ring-2 focus:ring-red-700/20 focus:outline-none transition-all" />
              </div>
              
              <div>
  <label className="block text-sm font-bold mb-2">Rol *</label>
  <select
    name="rol"
    value={formData.rol}
    onChange={(e) => setFormData({ ...formData, rol: Number(e.target.value) })}
    className="w-full p-4 border border-red-300 rounded-2xl bg-red-900/10 text-white focus:border-red-700 focus:ring-2 focus:ring-red-700/20 focus:outline-none transition-all appearance-none"
    required
  >
    <option className='bg-[var(--body)]' value="">Seleccione un rol (1-4)</option>
    <option className='bg-[var(--body)]' value={1}>Uber (1)</option>
    <option className='bg-[var(--body)]' value={2}>Chef (2)</option>
    <option className='bg-[var(--body)]' value={3}>Contador (3)</option>
    <option className='bg-[var(--body)]' value={4}>Admin (4)</option>
  </select>
</div>

              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 p-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-colors duration-300 text-lg">
                  Actualizar 
                </button>
                <button type="button" onClick={() => {setModalEditarOpen(false); setEditingUserId(null);}} className="flex-1 p-4 bg-gray-500 hover:bg-red-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-lg transition-colors duration-400">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-in { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
      `}</style>

    </div>
  );
};

export default Cuentas;