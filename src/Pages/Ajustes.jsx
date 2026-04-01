import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Ajustes = () => {
  const { user, token, login } = useAuth();
  const [formData, setFormData] = useState({
    nombre: user?.nombre || '',
    email: user?.email || '',
    telefono: user?.telefono || ''
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setMessage('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) return;

    const updatedUser = {
      ...user,
      nombre: formData.nombre,
      email: formData.email,
      telefono: formData.telefono,
    };

    login(token, updatedUser);
    setMessage('Información actualizada correctamente.');
  };

  return (
    <div className="min-h-screen bg-[var(--body)] text-[var(--letra)] p-8 pt-30 2xl:pt-50">
      <div className="mx-auto max-w-2xl bg-[var(--body2)] border border-red-500/20 rounded-3xl p-8 shadow-2xl">
        <h1 className="text-3xl font-black mb-6">Ajustes de cuenta</h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block">
            <span className="text-sm font-semibold">Nombre Completo</span>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className="w-full mt-2 p-3 rounded-xl border border-red-500/30 bg-[var(--body)]"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold">Email</span>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full mt-2 p-3 rounded-xl border border-red-500/30 bg-[var(--body)]"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold">Teléfono</span>
            <input
              type="text"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              className="w-full mt-2 p-3 rounded-xl border border-red-500/30 bg-[var(--body)]"
            />
          </label>
          <button
            type="submit"
            className="w-full p-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold hover:from-red-700 hover:to-red-800 transition"
          >
            Guardar cambios
          </button>
          {message && <p className="text-green-400 text-sm">{message}</p>}
        </form>
      </div>
    </div>
  );
};

export default Ajustes;
