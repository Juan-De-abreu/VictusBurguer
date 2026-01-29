import { useState, useEffect } from "react";
import { motion } from "framer-motion"; // npm i framer-motion
import { Link } from "react-router-dom";
import { API_BASE_URL } from '../../config/api';

const TrendingMenus = () => {
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const API = API_BASE_URL + "/products/trending";
  // Fetch productos trending del backend
  useEffect(() => {
    fetch(API)
      .then((res) => res.json())
      .then((data) => {
        setTrending(data.slice(0, 3)); // Top 6
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error trending:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando menús en tendencia...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-[var(--body)] to-[var(--body2)] border-t-1 text-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Título */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold bg-clip-text text-[var(--letra)] mb-4">
            🔥 Menús en Tendencia
          </h2>
          <p className="text-xl text-[var(--letra)] max-w-2xl mx-auto">
            Los más pedidos esta semana. ¡No te los pierdas!
          </p>
        </motion.div>

        {/* Grid Trending */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 relative">
          {trending.map((product, index) => (
            <Link to={`/product/${product.product_id}`}>
            <motion.div
              key={product.product_id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group/card cursor-pointer bg-[var(--body)] text-center rounded-3xl text-[var(--letra)] overflow-hidden shadow-md hover:shadow-2xl transition-all duration-400 border border-transparent relative z-0 hover:z-10 
                  hover:scale-105 hover:-translate-y-2 opacity-100
                  data-[focus=false]:scale-[0.92] data-[focus=false]:opacity-70"
              data-focus="true" // Estado inicial
            >
              {/* Imagen */}
              <div className="relative h-64 lg:h-72 overflow-hidden">
                <img
                  src={product.image_url || "/api-placeholder.jpg"}
                  alt={product.nombre}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                {product.is_trending && (
                  <div className="absolute top-4 left-4">
                    <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                      🔥 Tendencia
                    </span>
                  </div>
                )}
              </div>

              {/* Contenido */}
              <div className="p-6 lg:p-8">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-[var(--body2)] text-red-700 rounded-full text-xs font-semibold">
                    {product.nombre_categoria?.toUpperCase()}
                  </span>
                </div>

                <h3 className="text-xl lg:text-2xl font-bold mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
                  {product.nombre}
                </h3>

                {product.descripcion && (
                  <p className="text-sm lg:text-base mb-4 line-clamp-2">
                    {product.descripcion}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl lg:text-3xl font-bold text-red-600">
                      ${product.precio}
                    </span>
                    <span className="text-sm text-gray-500 line-through ml-2">
                      ${Math.round(product.precio * 1.2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <span>⭐</span>
                    <span>4.8</span>
                    <span className="ml-2">(245)</span>
                  </div>
                </div>

                {/* Botón Agregar */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full mt-6 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 px-6 rounded-2xl font-semibold text-base shadow-xl hover:shadow-2xl transition-all duration-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log("Agregar al carrito:", product);
                  }}
                >
                  🛒 Agregar al Carrito
                </motion.button>
              </div>
            </motion.div>
            </Link>
          ))}
        </div>

        <style jsx>{`
          .group\/card:hover {
            transform: scale(1.05) translateY(-8px) !important;
            opacity: 1 !important;
            z-index: 20 !important;
          }

          /* ACHICAR otros cards cuando uno está en hover */
          .group\\/card:hover ~ .group\\/card {
            transform: scale(0.92) !important;
            opacity: 0.6 !important;
          }

          /* Para grid (no solo lineal) - JavaScript maneja mejor */
        `}</style>

        <script
          dangerouslySetInnerHTML={{
            __html: `
    document.addEventListener('DOMContentLoaded', function() {
      const cards = document.querySelectorAll('.group\\/card');
      
      cards.forEach((card, index) => {
        card.addEventListener('mouseenter', function() {
          cards.forEach((otherCard, otherIndex) => {
            if (otherCard !== card) {
              otherCard.style.transform = 'scale(0.92)';
              otherCard.style.opacity = '0.65';
              otherCard.style.zIndex = '1';
            } else {
              otherCard.style.transform = 'scale(1.05) translateY(-8px)';
              otherCard.style.opacity = '1';
              otherCard.style.zIndex = '20';
            }
          });
        });
        
        card.addEventListener('mouseleave', function() {
          cards.forEach(card => {
            card.style.transform = '';
            card.style.opacity = '';
            card.style.zIndex = '';
          });
        });
      });
    });
  `,
          }}
        />

        <div className="mt-10">
          {/* Botón Ver Más */}
          <Link to={"/ComidaRapida"} className="text-center mt-16">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r shadow-black from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-12 py-4 rounded-2xl font-semibold text-xl shadow-md hover:shadow-lg transition-all duration-300"
            >
              Ver Todos los Productos
            </motion.button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TrendingMenus;
