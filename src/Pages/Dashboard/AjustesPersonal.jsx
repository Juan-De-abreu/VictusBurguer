import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { API_BASE_URL } from "../../config/api";

const AjustesModal = ({ isOpen, onClose }) => {
  const modalRef = useRef(null);
  const { user, token, login } = useAuth();

  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    contraseña: ""
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cargarUsuario = async () => {
      if (!isOpen || !user) return;

      const userId = user.user_id || user.id;
      if (!userId) return;

      try {
        setLoading(true);

        const response = await fetch(`${API_BASE_URL}/users?user_id=${userId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          setMessage(`❌ ${data.error || "No se pudo cargar el usuario"}`);
          return;
        }

        setFormData({
          nombre: data.data.nombre || "",
          email: data.data.email || "",
          telefono: data.data.telefono || "",
          contraseña: ""
        });
      } catch (error) {
        setMessage("❌ Error al cargar el usuario");
      } finally {
        setLoading(false);
      }
    };

    cargarUsuario();
  }, [isOpen, user, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    if (
      !formData.nombre.trim() ||
      !formData.email.trim() ||
      !formData.telefono.trim()
    ) {
      setMessage("❌ No puedes dejar campos vacíos.");
      return;
    }

    const payload = {
      user_id: user.user_id || user.id,
      nombre: formData.nombre.trim(),
      email: formData.email.trim(),
      telefono: formData.telefono.trim()
    };

    if (formData.contraseña.trim() !== "") {
      payload.contraseña = formData.contraseña.trim();
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessage(`❌ ${data.error || "Error al actualizar"}`);
        return;
      }

      const updatedUser = {
        ...user,
        nombre: payload.nombre,
        email: payload.email,
        telefono: payload.telefono
      };

      login(token, updatedUser);
      setMessage("✅ Información actualizada correctamente.");

      setTimeout(() => {
        onClose();
        setMessage("");
      }, 1500);
    } catch (error) {
      setMessage("❌ Error de conexión");
    }
  };

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
          <h2 className="text-3xl font-black text-[var(--letra)]">⚙️ Ajustes</h2>
          <button
            onClick={onClose}
            className="text-2xl text-white hover:scale-110 transition-all duration-150 hover:cursor-pointer"
          >
            &times;
          </button>
        </div>

        {loading ? (
          <div className="text-center py-6 text-white">Cargando usuario...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Nombre Completo</label>
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
                required
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
                placeholder="Dejar vacío si no deseas cambiarla"
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
        )}
      </div>
    </div>
  );
};

export default AjustesModal;