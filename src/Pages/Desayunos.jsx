import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';
import ProductCartControls from '../Components/ProductCartControls';
import ProductCard from '../Components/ProductCard';

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
        <ProductCard key={item.product_id} item={item} />
      ))}
        </div>
      </div>
    </section>
  );
};

export default Desayunos;