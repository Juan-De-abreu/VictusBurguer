import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';
import ProductCartControls from '../Components/ProductCartControls';

const Desayunos = () => {
  // 1. Definimos el estado para guardar los productos y el estado de carga
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API=`${API_BASE_URL}/products?category_id=1`;
  // 2. useEffect para ejecutar el fetch cuando se carga el componente
  useEffect(() => {
    // Cambia 'http://localhost:8000' por la URL real de tu servidor PHP

    fetch(API)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error al conectar con el servidor');
        }
        return response.json();
      })
      .then((data) => {
        setProducts(data); // Guardamos los datos de la API
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Si está cargando, mostramos un mensaje sencillo
  if (loading) return <div className="text-center pt-40 text-[var(--letra)]">Cargando desayunos...</div>;
  
  // Si hay un error (como el de la base de datos), lo mostramos
  if (error) return <div className="text-center pt-40 text-red-500">Error: {error}</div>;

  return (
    <section className="min-h-screen bg-[var(--body)] pt-28 pb-12 px-4 lg:px-8">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16 fade-in">
          <h2 className="text-4xl md:text-5xl font-serif italic font-bold text-[var(--letra)] mb-4">
            Comienza el día <span className="text-red-600">con Sabor</span>
          </h2>
          <p className="text-[var(--letra)]/70 text-lg font-light max-w-2xl mx-auto">
            Ingredientes frescos y preparaciones al momento.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {products.map((item) => (
            <Link to={`/product/${item.product_id}`}>
            <div 
              key={item.product_id} // Usamos product_id de tu tabla SQL
              className="group relative flex flex-col bg-[var(--primario)]/5 backdrop-blur-sm border border-[var(--letra)]/10 rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
            >
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={item.image_url} // Usamos image_url de tu API
                  alt={item.nombre}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  onError={(e) => {e.target.src = "https://images.unsplash.com/photo-1493770348161-369560ae357d?w=800"}} 
                />
                
                <div className="absolute top-4 right-4 z-20 bg-[var(--body)]/90 backdrop-blur text-[var(--letra)] font-bold px-4 py-2 rounded-full shadow-lg border border-red-500/20">
                  ${parseFloat(item.precio).toFixed(2)}
                </div>
              </div>

              <div className="p-6 flex flex-col flex-grow relative">
                <h3 className="text-2xl font-serif italic font-bold text-[var(--letra)] mb-3 group-hover:text-red-600 transition-colors">
                  {item.nombre}
                </h3>
                
                <p className="text-[var(--letra)]/70 text-sm leading-relaxed mb-6 flex-grow">
                  {item.descripcion}
                </p>

                <div className="mt-auto pt-4 border-t border-[var(--letra)]/10 flex justify-between items-center">
                  <Link to={`/producto/${item.product_id}`} className="text-sm font-semibold text-[var(--letra)] hover:text-red-500 transition-colors">
                    Ver detalles
                  </Link>

                  <ProductCartControls item={item} />
                </div>
              </div>
            </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Desayunos;