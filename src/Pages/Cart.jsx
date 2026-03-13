import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const CartPage = () => {
  const { cart, totalItems, totalPrice, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pt-30 p-4 lg:p-30 bg-[var(--body)] text-[var(--letra)]">
      <div className="max-w-6xl mx-auto bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl p-6 lg:p-8">
        <h1 className="text-3xl lg:text-4xl text-center pb-4 border-b-1 border-white/20 font-black mb-6">🛒 Tu Carrito</h1>

        {cart.length === 0 ? (
          <div className="space-y-4 text-center">
            <p className="text-lg">Tu carrito está vacío. Agrega algo delicioso.</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-red-800 text-white rounded-xl font-semibold hover:bg-[var(--segundario)] transition"
            >
              Volver al Menú
            </button>
          </div>
        ) : (
          <>
            <div className="grid gap-4">
              {cart.map((item) => (
                <div key={item.id} className="flex flex-col md:flex-row md:items-center md:justify-between bg-[var(--body2)]/70 border border-white/20 rounded-2xl p-4">
                  <div>
                    <h2 className="text-xl font-bold">{item.nombre}</h2>
                    <p className="text-sm text-gray-400">Precio unitario: ${Number(item.precio || 0).toFixed(2)}</p>
                    <p className="text-sm text-gray-400">Subtotal: ${((Number(item.precio || 0) * Number(item.quantity || 1))).toFixed(2)}</p>
                  </div>
                  <div className="mt-3 md:mt-0 flex items-center gap-2">
                    <input
                      type="number"
                      value={item.quantity}
                      min={1}
                      className="w-20 px-2 py-1 rounded-lg bg-white/90 text-black border border-gray-300"
                      onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                    />
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                    >Eliminar</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-white/20 pt-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="space-y-2">
                <p>Total unidades: <strong>{totalItems}</strong></p>
                <p>Total precio: <strong>${totalPrice.toFixed(2)}</strong></p>
              </div>
              <div className="flex flex-wrap gap-3 justify-end">
                <button
                  onClick={() => clearCart()}
                  className="px-5 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition"
                >Limpiar Carrito</button>
                <button
                  onClick={() => alert('Checkout no implementado todavía, agrega backend para completar.')}
                  className="px-5 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
                >Ir a Pagar</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartPage;
