import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { API_BASE_URL } from "../config/api";

const Ajustes = () => {
  const { user, token, login } = useAuth();

  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    contraseña: ""
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarUsuario = async () => {
      if (!user) return;

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
  }, [user, token]);

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
    } catch (error) {
      setMessage("❌ Error de conexión");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--body)] text-[var(--letra)] p-8 pt-30 2xl:pt-50">
        <div className="mx-auto max-w-2xl bg-[var(--body2)] border border-red-500/20 rounded-3xl p-8 shadow-2xl">
          <p className="text-center">Cargando datos...</p>
        </div>
      </div>
    );
  }

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
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold">Contraseña</span>
            <input
              type="password"
              name="contraseña"
              value={formData.contraseña}
              onChange={handleChange}
              className="w-full mt-2 p-3 rounded-xl border border-red-500/30 bg-[var(--body)]"
              placeholder="Dejar vacío si no deseas cambiarla"
            />
          </label>

          <button
            type="submit"
            className="w-full p-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold hover:from-red-700 hover:to-red-800 transition"
          >
            Guardar cambios
          </button>

          {message && (
            <p className={`text-sm ${message.includes("✅") ? "text-green-400" : "text-red-400"}`}>
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Ajustes;