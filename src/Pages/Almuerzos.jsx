import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Almuerzos = () => {
  // 1. Estados para manejar los datos, la carga y posibles errores
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2. useEffect para llamar a la API al cargar el componente
  useEffect(() => {
    // Usamos el category_id=2 para filtrar los almuerzos
    const url = 'http://localhost:8081/victus-backend/api/products?category_id=2';

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error al conectar con el servidor');
        }
        return response.json();
      })
      .then((data) => {
        setProducts(data); // Guardamos la lista de almuerzos
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching lunches:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Manejo de estados visuales
  if (loading) return <div className="text-center pt-40 text-[var(--letra)]">Cargando almuerzos...</div>;
  if (error) return <div className="text-center pt-40 text-red-500">Error: {error}</div>;

  return (
    <section className="min-h-screen bg-[var(--body)] pt-28 pb-12 px-4 lg:px-8">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16 fade-in">
          <h2 className="text-4xl md:text-5xl font-serif italic font-bold text-[var(--letra)] mb-4">
            Disfruta de nuestros{" "}
            <span className="text-red-600">Almuerzos</span>
          </h2>
          <p className="text-[var(--letra)]/70 text-lg font-light max-w-2xl mx-auto">
            Combos completos y deliciosos para recargar energías durante el día.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {products.map((item) => (
            <div
              key={item.product_id} // Usamos product_id de la DB
              className="group relative flex flex-col bg-[var(--primario)]/5 backdrop-blur-sm border border-[var(--letra)]/10 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-red-900/10 transition-all duration-500 hover:-translate-y-2"
            >
              <div className="relative h-64 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity duration-300" />
                <img
                  src={item.image_url} // Mapeado a la columna image_url de tu DB
                  alt={item.nombre}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out"
                  onError={(e) => {
                    e.target.src =
                      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800"; // Imagen de respaldo (Lunch)
                  }}
                />
                <div className="absolute top-4 right-4 z-20 bg-[var(--body)]/90 backdrop-blur text-[var(--letra)] font-bold px-4 py-2 rounded-full shadow-lg border border-red-500/20">
                  ${parseFloat(item.precio).toFixed(2)}
                </div>
              </div>

              <div className="p-6 flex flex-col flex-grow relative">
                <h3 className="text-2xl font-serif italic font-bold text-[var(--letra)] mb-3 group-hover:text-red-600 transition-colors duration-300">
                  {item.nombre}
                </h3>
                <p className="text-[var(--letra)]/70 text-sm leading-relaxed mb-6 flex-grow">
                  {item.descripcion}
                </p>
                <div className="mt-auto pt-4 border-t border-[var(--letra)]/10 flex justify-between items-center">
                  <Link
                    to={`/producto/${item.product_id}`} // Enlace dinámico al ID del producto
                    className="text-sm font-semibold text-[var(--letra)] hover:text-red-500 transition-colors flex items-center gap-2"
                  >
                    Ver detalles
                  </Link>
                  <button className="bg-red-900 hover:bg-red-700 text-white p-3 rounded-full transition-all duration-300 hover:scale-110 shadow-lg group-hover:shadow-red-500/50">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Almuerzos;