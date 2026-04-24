import { useState, useEffect } from "react";
import { motion } from "framer-motion"; // npm i framer-motion
import { Link } from "react-router-dom";
import ProductCartControls from '../../Components/ProductCartControls';
import ProductCard from "../../Components/ProductCard";
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
    <section className="border-b-1 border-black py-16 lg:py-24 bg-gradient-to-b from-[var(--body)] to-[var(--body2)] border-t-1 text-center">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 relative space-y-6">
          {trending.map((item) => (
        <ProductCard key={item.product_id} item={item} />
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
