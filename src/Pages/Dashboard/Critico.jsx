import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../config/api';

const Critico = () => {
  const [delays, setDelays] = useState([]);
  const [stockCritico, setStockCritico] = useState([]);
  const [lowSales, setLowSales] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedDelay, setSelectedDelay] = useState(null);
  const [selectedStock, setSelectedStock] = useState(null);
  const [selectedSale, setSelectedSale] = useState(null);

  const [newDelaysCount, setNewDelaysCount] = useState(0);
  const [newStockCount, setNewStockCount] = useState(0);
  const [newSalesCount, setNewSalesCount] = useState(0);

  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [delaysRes, stockRes, salesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/kitchen_delays_today?date=${today}`),
          fetch(`${API_BASE_URL}/inventory_critical`),
          fetch(`${API_BASE_URL}/menu_low_sales_today?date=${today}`)
        ]);

        const delaysData = await delaysRes.json();
        const stockData = await stockRes.json();
        const salesData = await salesRes.json();

        const delaysArr = delaysData.data || [];
        const stockArr = stockData.data || [];
        const salesArr = salesData.data || [];

        setNewDelaysCount(delaysArr.length);
        setNewStockCount(stockArr.length);
        setNewSalesCount(salesArr.length);

        setDelays(delaysArr);
        setStockCritico(stockArr);
        setLowSales(salesArr);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [today]);

  const handleOpenDelay = (item) => {
    setSelectedDelay(item);
    setNewDelaysCount(0);
  };

  const handleOpenStock = (item) => {
    setSelectedStock(item);
    setNewStockCount(0);
  };

  const handleOpenSale = (item) => {
    setSelectedSale(item);
    setNewSalesCount(0);
  };

  const ButtonCritico = ({ label, count, onClick, color }) => {
    const hasNew = count > 0;
    return (
      <button
        onClick={onClick}
        className={`
          relative w-full p-6 rounded-3xl font-black text-xl shadow-2xl
          transition-all duration-300 transform hover:scale-[1.03]
          ${color}
          ${hasNew ? 'animate-pulse' : ''}
        `}
      >
        <div className="flex items-center justify-between">
          <span>{label}</span>
          {hasNew && (
            <span className="bg-white text-red-600 px-4 py-2 rounded-full font-bold text-lg">
              {count}
            </span>
          )}
        </div>
      </button>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--body)]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white text-xl font-bold">Cargando críticos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--body)] p-6">
      <h1 className="text-4xl font-black text-white mb-8 text-center">
        ⚠️ Panel Crítico
      </h1>

      {/* BOTONES PRINCIPALES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-6xl mx-auto">
        <ButtonCritico
          label="🕒 Tardanzas"
          count={newDelaysCount}
          onClick={() => document.getElementById('tardanzas-section')?.scrollIntoView({ behavior: 'smooth' })}
          color="bg-gradient-to-br from-red-600 to-red-800 text-white"
        />
        <ButtonCritico
          label="📦 Inventario Crítico"
          count={newStockCount}
          onClick={() => document.getElementById('inventario-section')?.scrollIntoView({ behavior: 'smooth' })}
          color="bg-gradient-to-br from-amber-600 to-amber-800 text-white"
        />
        <ButtonCritico
          label="📉 Ventas Bajas"
          count={newSalesCount}
          onClick={() => document.getElementById('ventas-section')?.scrollIntoView({ behavior: 'smooth' })}
          color="bg-gradient-to-br from-blue-600 to-blue-800 text-white"
        />
      </div>

      {/* TARDANZAS */}
      <section id="tardanzas-section" className="bg-[var(--primario)]/10 p-6 rounded-3xl shadow-xl mb-8">
        <h2 className="text-3xl font-black text-white mb-6 flex items-center">
          🕒 Tardanzas hoy
          {delays.length > 10 && (
            <span className="ml-4 bg-red-600 text-white px-4 py-2 rounded-full font-bold text-lg animate-pulse">
              ¡ALERTA! {delays.length}
            </span>
          )}
        </h2>

        {delays.length === 0 ? (
          <p className="text-white/70 text-lg">✅ Sin tardanzas registradas.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {delays.map((d) => (
              <button
                key={d.order_id}
                onClick={() => handleOpenDelay(d)}
                className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl text-left transition-all duration-300 transform hover:scale-[1.02]"
              >
                <p className="text-white font-bold text-lg">Orden #{d.order_number}</p>
                <p className="text-white/80">{d.elapsed_minutes} min de retraso</p>
                <p className="text-white/60 text-sm mt-2">
                  Estado: {d.kitchen_status}
                </p>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* INVENTARIO CRÍTICO */}
      <section id="inventario-section" className="bg-[var(--primario)]/10 p-6 rounded-3xl shadow-xl mb-8">
        <h2 className="text-3xl font-black text-white mb-6">📦 Inventario Crítico</h2>

        {stockCritico.length === 0 ? (
          <p className="text-white/70 text-lg">✅ Todo el inventario está en niveles normales.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stockCritico.map((item) => (
              <button
                key={item.item_id}
                onClick={() => handleOpenStock(item)}
                className={`
                  p-4 rounded-2xl text-left transition-all duration-300 transform hover:scale-[1.02]
                  ${item.estado === 'inexistente' ? 'bg-red-900/40' : 'bg-amber-900/40'}
                `}
              >
                <p className="text-white font-bold text-lg">{item.product_name}</p>
                <p className="text-white/80">
                  Stock: {item.stock_actual} / Mín: {item.stock_minimo}
                </p>
                <p className={`text-sm mt-2 font-bold ${item.estado === 'inexistente' ? 'text-red-400' : 'text-amber-400'}`}>
                  {item.estado.toUpperCase()}
                </p>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* VENTAS BAJAS */}
      <section id="ventas-section" className="bg-[var(--primario)]/10 p-6 rounded-3xl shadow-xl mb-8">
        <h2 className="text-3xl font-black text-white mb-6">📉 Ventas Bajas Hoy</h2>

        {lowSales.length === 0 ? (
          <p className="text-white/70 text-lg">✅ Todos los productos tienen ventas normales.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lowSales.map((item) => (
              <button
                key={item.product_id}
                onClick={() => handleOpenSale(item)}
                className="bg-blue-900/40 p-4 rounded-2xl text-left transition-all duration-300 transform hover:scale-[1.02]"
              >
                <p className="text-white font-bold text-lg">{item.product_name}</p>
                <p className="text-white/80">Ventas hoy: {item.sales_today}</p>
                <p className="text-blue-300 text-sm mt-2 font-bold">
                  {item.sales_today === 0 ? 'NO VENDIDO' : 'MUY BAJA ROTACIÓN'}
                </p>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* MODAL TARDANZA */}
      {selectedDelay && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--primario)] rounded-3xl p-8 max-w-lg w-full shadow-2xl relative">
            <button
              onClick={() => setSelectedDelay(null)}
              className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl"
            >
              ✕
            </button>
            <h3 className="text-3xl font-black text-white mb-6">
              🕒 Orden #{selectedDelay.order_number}
            </h3>
            <div className="space-y-4 text-white">
              <p><strong>Estado:</strong> {selectedDelay.kitchen_status}</p>
              <p><strong>Tiempo transcurrido:</strong> {selectedDelay.elapsed_minutes} minutos</p>
              <p><strong>Asignada:</strong> {selectedDelay.assigned_at || 'N/A'}</p>
              <p><strong>Creada:</strong> {selectedDelay.created_at}</p>
              {selectedDelay.chef_user_id && (
                <p><strong>Chef ID:</strong> {selectedDelay.chef_user_id}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL INVENTARIO */}
      {selectedStock && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--primario)] rounded-3xl p-8 max-w-lg w-full shadow-2xl relative">
            <button
              onClick={() => setSelectedStock(null)}
              className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl"
            >
              ✕
            </button>
            <h3 className="text-3xl font-black text-white mb-6">
              📦 {selectedStock.product_name}
            </h3>
            <div className="space-y-4 text-white">
              <p><strong>Categoría:</strong> {selectedStock.category || 'N/A'}</p>
              <p><strong>Stock actual:</strong> {selectedStock.stock_actual}</p>
              <p><strong>Stock mínimo:</strong> {selectedStock.stock_minimo}</p>
              <p><strong>En mano:</strong> {selectedStock.stock_on_hand}</p>
              <p><strong>Reservado:</strong> {selectedStock.stock_reserved}</p>
              <p><strong>Unidad:</strong> {selectedStock.unit || 'N/A'}</p>
              <p className={`font-bold text-xl ${selectedStock.estado === 'inexistente' ? 'text-red-400' : 'text-amber-400'}`}>
                Estado: {selectedStock.estado.toUpperCase()}
              </p>
              {selectedStock.descripcion && (
                <p><strong>Descripción:</strong> {selectedStock.descripcion}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL VENTAS BAJAS */}
      {selectedSale && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--primario)] rounded-3xl p-8 max-w-lg w-full shadow-2xl relative">
            <button
              onClick={() => setSelectedSale(null)}
              className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl"
            >
              ✕
            </button>
            <h3 className="text-3xl font-black text-white mb-6">
              📉 {selectedSale.product_name}
            </h3>
            <div className="space-y-4 text-white">
              <p><strong>Ventas hoy:</strong> {selectedSale.sales_today}</p>
              <p><strong>Precio:</strong> ${selectedSale.precio}</p>
              {selectedSale.descuento > 0 && (
                <p><strong>Descuento:</strong> {selectedSale.descuento}%</p>
              )}
              <p><strong>Trending:</strong> {selectedSale.is_trending ? '✅ Sí' : '❌ No'}</p>
              {selectedSale.descripcion && (
                <p><strong>Descripción:</strong> {selectedSale.descripcion}</p>
              )}
              {selectedSale.image_url && (
                <div className="mt-4">
                  <img
                    src={selectedSale.image_url}
                    alt={selectedSale.product_name}
                    className="w-full h-48 object-cover rounded-2xl"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Critico;