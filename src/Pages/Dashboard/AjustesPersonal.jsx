import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { time } from "framer-motion";

const AjustesModal = ({ isOpen, onClose }) => {
  const modalRef = useRef(null);
  const { user, token, login } = useAuth();
  const [formData, setFormData] = useState({
    nombre: user?.nombre || "",
    email: user?.email || "",
    telefono: user?.telefono || "",
    contraseña: user?.contraseña || ""
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setMessage("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) return;

    const updatedUser = {
      ...user,
      nombre: formData.nombre,
      email: formData.email,
      telefono: formData.telefono,
      contraseña: formData.contraseña
    };

    login(token, updatedUser);
    setMessage("Información actualizada correctamente.");
        setTimeout(() => setMessage("Cerrando ajustes..."), 1000);
    setTimeout(() => onClose(), 2000);
    setTimeout(() => setMessage(""), 2000);

  };
  // Cerrar click fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in zoom-in duration-200 text-white">
      <div
        ref={modalRef}
        className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-[var(--body2)] border-2 border-red-500/50 rounded-3xl shadow-2xl p-8 animate-in slide-in-from-bottom-4 duration-300"
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-black text-[var(--letra)]">
            ⚙️ Ajustes
          </h2>
          <button
            onClick={onClose}
            className="text-2xl hover:scale-110 transition text-white hover:scale-115 transition-all duration-150 hover:cursor-pointer"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">
              Nombre Completo
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className="w-full p-4 rounded-2xl border border-red-500/30 bg-[var(--body)] focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-4 rounded-2xl border border-red-500/30 bg-[var(--body)] focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Teléfono</label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              className="w-full p-4 rounded-2xl border border-red-500/30 bg-[var(--body)] focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Contraseña</label>
            <input
              type="password"
              name="contraseña"
              value={formData.contraseña}
              onChange={handleChange}
              className="w-full p-4 rounded-2xl border border-red-500/30 bg-[var(--body)] focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition"
            />
          </div>

          <button
            type="submit"
            className="w-full p-4 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 text-white font-bold text-lg hover:from-red-700 hover:to-red-800 shadow-xl hover:shadow-2xl transition-all duration-300 active:scale-95"
          >
            💾 Guardar Cambios
          </button>

          {message && (
            <div
              className={`p-4 rounded-2xl text-center font-semibold text-sm ${
                message.includes("✅")
                  ? "bg-green-100 text-green-800 border-2 border-green-300"
                  : "bg-red-100 text-red-800 border-2 border-red-300"
              }`}
            >
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AjustesModal;
