import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';
import ProductCard from '../Components/ProductCard';
import { useAuth } from '../contexts/AuthContext';

const Favorites = () => {
  const { user } = useAuth();

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userId = user?.user_id || user?.id || null;
  const API = `${API_BASE_URL}/favorites?user_id=${userId}`;

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setFavorites([]);
      return;
    }

    fetch(API)
      .then((response) => {
        if (!response.ok) throw new Error('Error al conectar con la API');
        return response.json();
      })
      .then((data) => {
        setFavorites(data.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching favorites:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [userId]);

  if (loading) {
    return (
      <div className="text-center pt-40 text-[var(--letra)]">
        Cargando tus favoritos...
      </div>
    );
  }

  if (!userId) {
    return (
      <section className="min-h-screen bg-[var(--body)] pt-28 pb-12 px-4 lg:px-8">
        <div className="container mx-auto max-w-7xl text-center">
          <h2 className="text-4xl md:text-5xl font-serif italic font-bold text-[var(--letra)] mb-4">
            Tus <span className="text-red-600">Favoritos</span>
          </h2>
          <p className="text-[var(--letra)]/70 text-lg font-light max-w-2xl mx-auto mb-8">
            Inicia sesión para ver los productos que guardaste como favoritos.
          </p>
          <Link
            to="/login"
            className="inline-block bg-red-600 text-white px-8 py-3 rounded-2xl font-semibold hover:bg-red-700 transition-all"
          >
            Ir al login
          </Link>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <div className="text-center pt-40 text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-[var(--body)] pt-28 pb-12 px-4 lg:px-8">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16 fade-in">
          <h2 className="text-4xl md:text-5xl font-serif italic font-bold text-[var(--letra)] mb-4">
            Tus <span className="text-red-600">Favoritos</span>
          </h2>
          <p className="text-[var(--letra)]/70 text-lg font-light max-w-2xl mx-auto">
            Aquí encontrarás los productos que marcaste para guardar y volver a pedir después.
          </p>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-2xl font-bold text-[var(--letra)] mb-3">
              Aún no tienes favoritos
            </h3>
            <p className="text-[var(--letra)]/70 mb-8">
              Cuando marques un producto como favorito, aparecerá aquí automáticamente.
            </p>
            <Link
              to="/"
              className="inline-block bg-red-600 text-white px-8 py-3 rounded-2xl font-semibold hover:bg-red-700 transition-all"
            >
              Volver al menú
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {favorites.map((item) => (
              <ProductCard key={item.id || item.id_product} item={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Favorites;