import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from '../config/api';
import ProductCartControls from '../Components/ProductCartControls';
import ProductCard from "../Components/ProductCard";

const Almuerzos = () => {
  // 1. Estados para manejar los datos, la carga y posibles errores
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

      // Usamos el category_id=2 para filtrar los almuerzos

  const API=`${API_BASE_URL}/products?category_id=2`;
  // 2. useEffect para llamar a la API al cargar el componente
  useEffect(() => {
    fetch(API)
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
        <ProductCard key={item.product_id} item={item} />
      ))}
        </div>
      </div>
    </section>
  );
};

export default Almuerzos;