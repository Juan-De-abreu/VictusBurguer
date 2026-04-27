import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
void motion;
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { cart, addToCart, updateQuantity } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [favorites, setFavorites] = useState([]);
  const [pendingFavorite, setPendingFavorite] = useState(null);

  useEffect(() => {
    const API = `${API_BASE_URL}/products?product_id=${productId}`;

    fetch(API)
      .then((res) => res.json())
      .then((data) => {
        if (data && (data.product_id || (Array.isArray(data) && data.length > 0))) {
          const activeProduct = data.product_id ? data : data[0];
          setProduct(activeProduct);

          const itemId = activeProduct.product_id ?? activeProduct.id ?? Number(productId);
          const existing = cart.find((item) => item.id === itemId);
          const initialQty = existing && existing.quantity > 0 ? Number(existing.quantity) : 1;

          setQuantity(initialQty);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error:', err);
        setLoading(false);
      });
  }, [productId, cart]);

  useEffect(() => {
    const loadFavorites = async () => {
      if (!user?.user_id && !user?.id) {
        setFavorites([]);
        return;
      }

      try {
        const userId = user.user_id || user.id;
        const res = await axios.get(`${API_BASE_URL}/favorites?user_id=${userId}`);
        setFavorites(res.data?.data || []);
      } catch (err) {
        console.error('Error cargando favoritos:', err);
        setFavorites([]);
      }
    };

    loadFavorites();
  }, [user]);

  useEffect(() => {
    const runPendingFavorite = async () => {
      if (!user || !pendingFavorite) return;

      try {
        const userId = user.user_id || user.id;

        await axios.post(`${API_BASE_URL}/favorites.php`, {
          id_user: userId,
          id_product: pendingFavorite.id
        });

        const res = await axios.get(`${API_BASE_URL}/favorites?user_id=${userId}`);
        setFavorites(res.data?.data || []);
      } catch (err) {
        console.error('Error agregando favorito pendiente:', err);
      } finally {
        setPendingFavorite(null);
        navigate(location.state?.from || `/product/${productId}`, { replace: true });
      }
    };

    runPendingFavorite();
  }, [user, pendingFavorite, navigate, location.state, productId]);

  const itemId = product?.product_id ?? product?.id ?? Number(productId);
  const isFavorite = favorites.some((item) => Number(item.id_product || item.product_id || item.id) === Number(itemId));

  const handleAddToCart = () => {
    if (!product) return;

    if (!user) {
      navigate('/login', {
        state: {
          from: location.pathname,
          addToCartProduct: {
            id: product.product_id ?? product.id ?? Number(productId),
            nombre: product.nombre,
            precio: Number(product.precio || 0),
            imagen: product.image_url || product.imagen || '',
            quantity
          }
        }
      });
      return;
    }

    const cartId = product.product_id ?? product.id ?? Number(productId);
    const cartItem = {
      id: cartId,
      nombre: product.nombre,
      precio: Number(product.precio || 0),
      imagen: product.image_url || product.imagen || ''
    };

    const existing = cart.find((item) => item.id === cartId);

    if (existing) {
      updateQuantity(cartId, quantity);
    } else {
      addToCart(cartItem, quantity);
    }
  };

  const handleFavorite = async () => {
    if (!product) return;

    const favoriteItem = {
      id: itemId,
      nombre: product.nombre,
      precio: Number(product.precio || 0),
      imagen: product.image_url || product.imagen || ''
    };

    if (!user) {
      setPendingFavorite(favoriteItem);
      navigate('/login', {
        state: {
          from: location.pathname,
          addFavoriteProduct: favoriteItem
        }
      });
      return;
    }

    try {
      const userId = user.user_id || user.id;

      if (isFavorite) {
        await axios.delete(`${API_BASE_URL}/favorites`, {
          data: {
            id_user: userId,
            id_product: itemId
          }
        });
      } else {
        await axios.post(`${API_BASE_URL}/favorites`, {
          id_user: userId,
          id_product: itemId
        });
      }

      const res = await axios.get(`${API_BASE_URL}/favorites?user_id=${userId}`);
      setFavorites(res.data?.data || []);
    } catch (err) {
      console.error('Error favorito:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--body2)] to-[var(--body)] py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="bg-[var(--body)] rounded-3xl p-8 shadow-2xl mb-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="h-96 bg-[var(--body2)] rounded-2xl"></div>
                <div>
                  <div className="h-12 bg-[var(--body2)] rounded-xl mb-6 w-3/4"></div>
                  <div className="space-y-4">
                    <div className="h-8 bg-[var(--body2)] rounded-lg w-full"></div>
                    <div className="h-6 bg-[var(--body2)] rounded-lg w-5/6"></div>
                    <div className="h-20 bg-[var(--body2)] rounded-2xl"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--body)] to-[var(--body2)] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[var(--letra)] mb-4">🍔 Producto no encontrado</h1>
          <a href="/" className="bg-[var(--segundario)] text-[var(--letra)] px-8 py-3 rounded-2xl font-semibold hover:bg-red-600 transition-all">
            ← Volver al menú
          </a>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--body)] to-[var(--body2)] py-12 lg:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center text-sm text-[var(--letra)]/70 mb-8">
          <a href="/" className="hover:text-[var(--segundario)] transition-colors">🍔 Menú</a>
          <span className="mx-2">/</span>
          <span className="font-semibold">{product.nombre_categoria}</span>
          <span className="mx-2">/</span>
          <span className="font-bold text-[var(--segundario)]">{product.nombre}</span>
        </nav>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--body)] shadow-2xl rounded-3xl overflow-hidden border border-[var(--body2)]/50"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-12 p-8 lg:p-12 text-[var(--letra)]">
            <motion.div
              initial={{ scale: 0.9, rotateY: -10 }}
              animate={{ scale: 1, rotateY: 0 }}
              className="relative"
            >
              <img
                src={product.image_url || '/api-placeholder.jpg'}
                alt={product.nombre}
                className="w-full h-96 lg:h-[500px] object-cover rounded-2xl shadow-2xl hover:scale-105 transition-transform duration-500"
              />
              {product.is_trending && (
                <div className="absolute top-6 right-6">
                  <span className="bg-gradient-to-r from-red-500 to-orange-500 text-[var(--letra)] px-4 py-2 rounded-2xl font-bold shadow-xl">
                    🔥 En Tendencia
                  </span>
                </div>
              )}
            </motion.div>

            <div className="lg:pt-8 space-y-6">
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h1 className="text-4xl lg:text-5xl font-black mb-4 leading-tight">
                  {product.nombre}
                </h1>
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex gap-1 text-yellow-400">
                    <span>⭐</span><span>⭐</span><span>⭐</span><span>⭐</span><span>⭐</span>
                  </div>
                  <span className="text-lg font-semibold text-[var(--letra)]/80">4.9 (1,247 reseñas)</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="space-y-4"
              >
                <div className="flex items-baseline gap-4">
                  <span className="text-5xl lg:text-6xl font-black text-[var(--segundario)]">
                    {product.descuento ? `$${product.precio * (1 - product.descuento / 100)}` : `$${product.precio}`}
                  </span>
                  {product.descuento && (
                    <span className="text-2xl text-[var(--letra)]/60 line-through">
                      {product.precio}
                    </span>
                  )}
                  {product.descuento && (
                    <span className="bg-green-500 text-[var(--letra)] px-3 py-1 rounded-full text-sm font-bold">
                      {product.descuento}% OFF
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <label className="text-lg font-semibold text-[var(--letra)]">Cantidad</label>
                  <div className="flex items-center bg-[var(--body2)]/50 backdrop-blur-sm rounded-2xl p-1 border border-[var(--segundario)]/30">
                    <button
                      onClick={() => setQuantity(Math.max(0, quantity - 1))}
                      className="w-12 h-12 flex items-center justify-center text-xl font-bold text-[var(--letra)] hover:text-[var(--segundario)] transition-colors"
                    >
                      -
                    </button>
                    <span className="px-6 py-3 font-bold text-xl text-[var(--letra)]">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-12 h-12 flex items-center justify-center text-xl font-bold text-[var(--letra)] hover:text-[var(--segundario)] transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="py-3">
                  <label className="text-lg font-semibold text-[var(--letra)]">
                    Total: <span className="text-[var(--segundario)] text-2xl font-black">${(quantity * (product.precio * (1 - (product.descuento || 0) / 100))).toFixed(2)}</span>
                  </label>
                  {product.descuento && (
                    <span className="text-2xl ml-2 text-[var(--letra)]/60 line-through">
                      {quantity * product.precio}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-gradient-to-r from-[var(--segundario)] to-red-600 hover:from-red-600 hover:to-red-700 text-[var(--letra)] py-5 px-8 rounded-3xl font-black text-xl shadow-2xl hover:shadow-3xl transition-all duration-300 border border-[var(--segundario)]/50"
                    onClick={handleAddToCart}
                  >
                    🛒 Agregar al Carrito
                  </motion.button>

                   <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`py-5 px-8 rounded-3xl font-black text-xl shadow-2xl hover:shadow-3xl transition-all duration-300 border ${
          isFavorite
            ? 'bg-transparent border-red-500 text-red-500'
            : 'bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-[var(--letra)] border-gray-600/50'
        }`}
        onClick={handleFavorite}
      >
        {isFavorite ? '❤️ eliminar' : '❤️ A Favoritos'}
      </motion.button>
                </div>
              </motion.div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="px-8 lg:px-12 pb-12 pt-8 border-t border-[var(--body2)]/50 bg-[var(--body2)]/30"
          >
            <h2 className="text-3xl font-black mb-8 text-center text-[var(--letra)]">📝 Ingredientes</h2>
            <div className="prose prose-lg max-w-none text-center">
              <p className="text-xl text-[var(--letra)]/90 leading-relaxed mb-8 max-w-2xl mx-auto">
                {product.descripcion || 'Hamburguesa premium con ingredientes frescos del día. Pan artesanal, carne 100% Angus, queso cheddar derretido, vegetales crujientes y nuestra salsa secreta que la hace irresistible.'}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="border border-[var(--segundario)]/30 p-6 rounded-2xl shadow-lg bg-[var(--body)]">
                  <h3 className="text-xl font-bold text-[var(--letra)] mb-3">🥩 Carne Premium</h3>
                  <p className="text-[var(--letra)]/80">100% Angus seleccionada</p>
                </div>
                <div className="border border-[var(--segundario)]/30 p-6 rounded-2xl shadow-lg bg-[var(--body)]">
                  <h3 className="text-xl font-bold text-[var(--letra)] mb-3">🍞 Pan Artesanal</h3>
                  <p className="text-[var(--letra)]/80">Horneado diariamente</p>
                </div>
                <div className="border border-[var(--segundario)]/30 p-6 rounded-2xl shadow-lg bg-[var(--body)]">
                  <h3 className="text-xl font-bold text-[var(--letra)] mb-3">🌿 Fresco Siempre</h3>
                  <p className="text-[var(--letra)]/80">Ingredientes del día</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductDetail;