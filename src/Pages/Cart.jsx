import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const CartPage = () => {
  const { cart, totalItems, totalPrice, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  // 🧮 TOTALES CORREGIDOS
  const realTotalPrice = cart.reduce((acc, item) => {
    const precioReal = Number(item.precio || 0);
    return acc + (precioReal * (Number(item.quantity) || 0));
  }, 0);

  const discountTotalPrice = cart.reduce((acc, item) => {
    const descuento = Number(item.descuento || 0);
    const precioReal = Number(item.precio || 0);
    const precioDescuento = descuento > 0 ? precioReal * (1 - descuento / 100) : precioReal;
    return acc + (precioDescuento * (Number(item.quantity) || 0));
  }, 0);

  // ✅ FIX: Ahorro SOLO si hay descuentos reales
  const descuentoTotal = cart.reduce((acc, item) => {
    const descuento = Number(item.descuento || 0);
    if (descuento > 0) {
      const precioReal = Number(item.precio || 0);
      return acc + (precioReal * (Number(item.quantity) || 0) * (descuento / 100));
    }
    return acc;
  }, 0);

  const handleCheckout = () => {
    const orderData = {
      items: cart.map(item => ({
        id: item.id,
        quantity: item.quantity,
        precio_unitario: Number(item.precio),
        subtotal: Number(item.precio) * item.quantity
      })),
      total: discountTotalPrice.toFixed(2),
      total_items: totalItems
    };
  };

  return (
    /* ✅ DIV UNIVERSAL - SIN CAMBIOS */
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 xl:p-12 mt-20 bg-gradient-to-br from-[var(--body)] to-[var(--body2)] text-[var(--letra)]">
      
      <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-4xl mx-auto bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 lg:p-12">
        
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-center pb-6 sm:pb-8 border-b border-white/20 font-black mb-8 sm:mb-10 tracking-tight bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
          🛒 Tu Carrito
        </h1>

        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center space-y-6 py-12 sm:py-20 md:py-24">
            <div className="text-5xl sm:text-6xl md:text-7xl mb-6 animate-bounce">🛒</div>
            <p className="text-base sm:text-xl md:text-2xl text-center max-w-md leading-relaxed px-4">
              Tu carrito está vacío. <br className="hidden sm:block" />
              <span className="text-[var(--primario)] font-semibold">¡Agrega algo delicioso!</span>
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-[var(--primario)] text-white rounded-2xl font-bold text-base sm:text-lg hover:bg-[var(--segundario)] transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 active:scale-95"
            >
              ← Volver al Menú
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4 sm:space-y-6 mb-8 sm:mb-10">
              {cart.map((item) => {
                const precioReal = Number(item.precio || 0);
                const descuento = Number(item.descuento || 0);
                const precioDescuento = descuento > 0 ? precioReal * (1 - descuento / 100) : precioReal;
                const subtotalDescuento = precioDescuento * (item.quantity || 1);
                const subtotalReal = precioReal * (item.quantity || 1);
                const ahorroItem = descuento > 0 ? (precioReal * (descuento / 100) * item.quantity) : 0;

                return (
                  <div 
                    key={item.id} 
                    className="flex flex-col sm:flex-row sm:items-start lg:items-center gap-4 sm:gap-6 bg-[var(--body2)]/80 backdrop-blur-sm border border-white/30 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2 truncate">{item.nombre}</h2>
                      
                      {/* 💰 PRECIO CON DESCUENTO */}
                      <p className="text-md sm:text-base md:text-lg text-gray-300 mb-1">
                        Precio:{' '}
                        <strong>
                          {descuento > 0 ? (
                            <>
                              <span className="line-through text-gray-400 mr-2">${precioReal.toFixed(2)}</span>
                              <span className="text-green-400">${precioDescuento.toFixed(2)}</span>
                              <span className="text-xs ml-1 text-green-400">({descuento}% off)</span>
                            </>
                          ) : (
                            `$${precioReal.toFixed(2)}`
                          )}
                        </strong>
                      </p>

                      {/* 📊 SUBTOTAL CON DESCUENTO */}
                      <p className="text-lg sm:text-base md:text-lg text-gray-300">
                        Subtotal ({item.quantity}): <strong>${subtotalDescuento.toFixed(2)}</strong>
                      </p>

                      {/* 🛡️ DEBUG OCULTO */}
                      {ahorroItem > 0 && (
                        <p className="text-s text-green-400 mt-1">
                          Ahorro: ${ahorroItem.toFixed(2)}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-center sm:items-center gap-3 sm:gap-4 mt-2 sm:mt-0 w-full sm:w-auto">
                      <div className="flex items-center w-full sm:w-auto gap-2 bg-white/20 backdrop-blur-sm rounded-xl p-2 sm:p-3">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            updateQuantity(item.id, Math.max(1, (item.quantity || 1) - 1));
                          }}
                          className="flex-1 sm:w-10 sm:h-10 sm:flex-none bg-[var(--primario)] text-white rounded-lg flex items-center justify-center text-sm sm:text-lg hover:bg-[var(--segundario)] transition-all aspect-square"
                          type="button"
                        >
                          -
                        </button>
                        <span className="w-14 sm:w-16 text-center text-lg sm:text-xl font-bold bg-white/30 rounded-lg px-2 sm:px-4 py-2 sm:py-2 min-w-[2.5rem]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            updateQuantity(item.id, (item.quantity || 1) + 1);
                          }}
                          className="flex-1 sm:w-10 sm:h-10 sm:flex-none bg-[var(--primario)] text-white rounded-lg flex items-center justify-center text-sm sm:text-lg hover:bg-[var(--segundario)] transition-all aspect-square"
                          type="button"
                        >
                          +
                        </button>
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeFromCart(item.id);
                        }}
                        className="w-full sm:w-auto px-4 sm:px-6 py-3 bg-red-500/90 text-white rounded-xl font-semibold text-sm sm:text-base hover:bg-red-600 transition-all shadow-lg hover:shadow-xl active:scale-95"
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ✅ TOTAL - SIN CAMBIOS ESTRUCTURA */}
            <div className="border-t-2 border-white/30 pt-6 sm:pt-8">
              <div className="mx-auto max-w-sm sm:max-w-md md:w-80 lg:w-96 bg-[var(--primario)]/20 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-white/20 shadow-2xl">
                <div className="space-y-2 sm:space-y-3 text-center">
                  <div className="flex justify-between text-sm sm:text-base md:text-lg">
                    <span className="font-medium">🧾 Unidades:</span>
                    <strong className="text-xl">{totalItems}</strong>
                  </div>
                  
                  {/* ✅ AHORRO SOLO SI EXISTE */}
                  {descuentoTotal > 0 && (
                    <div className="flex justify-between text-sm sm:text-base text-green-400 font-semibold">
                      <span>🎉 Ahorro total:</span>
                      <strong>${descuentoTotal.toFixed(2)}</strong>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-lg sm:text-xl md:text-2xl font-black pt-2">
                    <span>💰 Total:</span>
                    <strong className="text-2xl sm:text-3xl md:text-4xl text-green-400">
                      ${discountTotalPrice.toFixed(2)}
                    </strong>
                  </div>
                  
                </div>
                
                <div className="flex flex-row gap-3 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-white/20">
                  <button
                    onClick={() => clearCart()}
                    className="flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-gray-600/80 text-white rounded-xl font-semibold text-sm sm:text-base hover:bg-gray-700/90 transition-all backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl active:scale-95"
                  >
                    🗑️ Limpiar Carrito
                  </button>
                  <button
                    onClick={handleCheckout}
                    className="flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold text-sm sm:text-lg hover:from-green-600 hover:to-green-700 transition-all shadow-2xl hover:shadow-3xl active:scale-95 backdrop-blur-sm border border-white/20"
                  >
                    💳 Ir a Pagar
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartPage;