import { useMemo } from 'react';
import { useCart } from '../contexts/CartContext';

const ProductCartControls = ({ item }) => {
  const { cart, addToCart, updateQuantity, removeFromCart } = useCart();
  const itemId = item.product_id ?? item.id;

  const quantity = useMemo(() => {
    const existing = cart.find((cartItem) => cartItem.id === itemId);
    return existing?.quantity ?? 0;
  }, [cart, itemId]);

  const dataItem = {
    id: itemId,
    nombre: item.nombre,
    precio: Number(item.precio || item.price || 0),
    imagen: item.image_url || item.imagen || '',
    descuento: Number(item.descuento || item.discount || 0)
  };

  const handleAdd = (e) => { 
    e.preventDefault();  
    e.stopPropagation();
    addToCart(dataItem, 1); };

  const handleRemove = (e) => {
    e.preventDefault();  
    e.stopPropagation();
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      updateQuantity(itemId, quantity - 1);
    }
  };

  return (
    <div className="flex items-center gap-2 text-[var(--letra)]">
      <button
        onClick={handleRemove}
        disabled={quantity === 0}
        className="w-8 h-8 rounded-full border border-red-500 text-red-500 hover:bg-red-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition"
        type="button"
      >
        -
      </button>
      <span className="min-w-[28px] text-center font-bold">{quantity}</span>
      <button
        onClick={handleAdd}
        className="w-8 h-8 rounded-full border border-green-500 text-green-500 hover:bg-green-500/20 transition"
        type="button"
      >
        +
      </button>
    </div>
  );
};

export default ProductCartControls;
