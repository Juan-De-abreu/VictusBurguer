import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../config/api';

const Critico = () => {
  const [delaysWeek, setDelaysWeek] = useState([]);
  const [stockCritico, setStockCritico] = useState([]);
  const [lowSalesWeek, setLowSalesWeek] = useState([]);
  const [complaintsWeek, setComplaintsWeek] = useState([]);
  const [missingIngredients, setMissingIngredients] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedDelay, setSelectedDelay] = useState(null);
  const [selectedStock, setSelectedStock] = useState(null);
  const [selectedSale, setSelectedSale] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [selectedIngredient, setSelectedIngredient] = useState(null);

  const [newDelaysCount, setNewDelaysCount] = useState(0);
  const [newStockCount, setNewStockCount] = useState(0);
  const [newSalesCount, setNewSalesCount] = useState(0);
  const [newComplaintsCount, setNewComplaintsCount] = useState(0);
  const [newIngredientsCount, setNewIngredientsCount] = useState(0);

  const today = new Date().toISOString().slice(0, 10);
  const lastWeek = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [delaysRes, stockRes, salesRes, complaintsRes, ingredientsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/kitchen_delays_week?start_date=${lastWeek}&end_date=${today}`),
          fetch(`${API_BASE_URL}/inventory_critical`),
          fetch(`${API_BASE_URL}/menu_low_sales_week?start_date=${lastWeek}&end_date=${today}`),
          fetch(`${API_BASE_URL}/complaints_week?start_date=${lastWeek}&end_date=${today}`),
          fetch(`${API_BASE_URL}/product_ingredients_check`)
        ]);

        const delaysData = await delaysRes.json();
        const stockData = await stockRes.json();
        const salesData = await salesRes.json();
        const complaintsData = await complaintsRes.json();
        const ingredientsData = await ingredientsRes.json();

        const delaysArr = delaysData.data || [];
        const stockArr = stockData.data || [];
        const salesArr = salesData.data || [];
        const complaintsArr = complaintsData.data || [];
        const ingredientsArr = ingredientsData.data || [];

        const totalDelays = delaysArr.reduce((sum, d) => sum + (d.delay_count || 0), 0);
        const totalSales = salesArr.length;

        setNewDelaysCount(totalDelays);
        setNewStockCount(stockArr.length);
        setNewSalesCount(totalSales);
        setNewComplaintsCount(complaintsArr.length);
        setNewIngredientsCount(ingredientsArr.length);

        setDelaysWeek(delaysArr);
        setStockCritico(stockArr);
        setLowSalesWeek(salesArr);
        setComplaintsWeek(complaintsArr);
        setMissingIngredients(ingredientsArr);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [today, lastWeek]);

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

  const handleOpenComplaint = (item) => {
    setSelectedComplaint(item);
    setNewComplaintsCount(0);
  };

  const handleOpenIngredient = (item) => {
    setSelectedIngredient(item);
    setNewIngredientsCount(0);
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
    <div className="min-h-screen p-6">
      <h1 className="text-4xl font-black text-white mb-8 text-center">
        ⚠️ Panel Crítico
      </h1>

      {/* BOTONES PRINCIPALES */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8 max-w-7xl mx-auto">
        <ButtonCritico
          label="🕒 Tardanzas"
          count={newDelaysCount}
          onClick={() => document.getElementById('tardanzas-section')?.scrollIntoView({ behavior: 'smooth' })}
          color="bg-gradient-to-br from-red-600 to-red-800 text-white"
        />
        <ButtonCritico
          label="📦 Inventario"
          count={newStockCount}
          onClick={() => document.getElementById('inventario-section')?.scrollIntoView({ behavior: 'smooth' })}
          color="bg-gradient-to-br from-amber-600 to-amber-800 text-white"
        />
        <ButtonCritico
          label="📉 Ventas"
          count={newSalesCount}
          onClick={() => document.getElementById('ventas-section')?.scrollIntoView({ behavior: 'smooth' })}
          color="bg-gradient-to-br from-blue-600 to-blue-800 text-white"
        />
        <ButtonCritico
          label="⚠️ Quejas"
          count={newComplaintsCount}
          onClick={() => document.getElementById('quejas-section')?.scrollIntoView({ behavior: 'smooth' })}
          color="bg-gradient-to-br from-purple-600 to-purple-800 text-white"
        />
        <ButtonCritico
          label="🥗 Ingredientes"
          count={newIngredientsCount}
          onClick={() => document.getElementById('ingredientes-section')?.scrollIntoView({ behavior: 'smooth' })}
          color="bg-gradient-to-br from-green-600 to-green-800 text-white"
        />
      </div>

      {/* TARDANZAS SEMANA */}
      <section id="tardanzas-section" className="bg-[var(--primario)]/90 p-6 rounded-3xl shadow-xl mb-8">
        <h2 className="text-3xl font-black text-white mb-6 flex items-center">
          🕒 Tardanzas Semanales
          {newDelaysCount > 10 && (
            <span className="ml-4 bg-red-600 text-white px-4 py-2 rounded-full font-bold text-lg animate-pulse">
              ¡ALERTA! {newDelaysCount}
            </span>
          )}
        </h2>

        {delaysWeek.length === 0 ? (
          <p className="text-white text-lg">✅ Sin tardanzas registradas.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {delaysWeek.map((d) => (
              <button
                key={d.date}
                onClick={() => handleOpenDelay(d)}
                className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl text-left transition-all duration-300 transform hover:scale-[1.02]"
              >
                <p className="text-white font-bold text-lg">{d.date}</p>
                <p className="text-white/80">{d.delay_count} tardanzas</p>
                <p className="text-white/60 text-sm mt-2">
                  Promedio: {Math.round(d.avg_delay_minutes)} min
                </p>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* INVENTARIO CRÍTICO */}
      <section id="inventario-section" className="bg-[var(--primario)]/90 p-6 rounded-3xl shadow-xl mb-8">
        <h2 className="text-3xl font-black text-white mb-6">📦 Inventario Crítico</h2>

        {stockCritico.length === 0 ? (
          <p className="text-white text-lg">✅ Todo el inventario está en niveles normales.</p>
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

      {/* VENTAS BAJAS SEMANA */}
      <section id="ventas-section" className="bg-[var(--primario)]/90 p-6 rounded-3xl shadow-xl mb-8">
        <h2 className="text-3xl font-black text-white mb-6">📉 Ventas Bajas Semana</h2>

        {lowSalesWeek.length === 0 ? (
          <p className="text-white text-lg">✅ Todos los productos tienen ventas normales.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lowSalesWeek.map((item) => (
              <button
                key={`${item.product_id}-${item.date}`}
                onClick={() => handleOpenSale(item)}
                className="bg-blue-900/40 p-4 rounded-2xl text-left transition-all duration-300 transform hover:scale-[1.02]"
              >
                <p className="text-white font-bold text-lg">{item.product_name}</p>
                <p className="text-white/80">Fecha: {item.date}</p>
                <p className="text-blue-300 text-sm mt-2 font-bold">
                  Ventas: {item.sales_count}
                </p>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* QUEJAS SEMANA */}
      <section id="quejas-section" className="bg-[var(--primario)]/90 p-6 rounded-3xl shadow-xl mb-8">
        <h2 className="text-3xl font-black text-white mb-6">⚠️ Quejas / Reportes</h2>

        {complaintsWeek.length === 0 ? (
          <p className="text-white text-lg">✅ Sin quejas registradas.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {complaintsWeek.map((c) => (
              <button
                key={c.complaint_id}
                onClick={() => handleOpenComplaint(c)}
                className="bg-purple-900/40 p-4 rounded-2xl text-left transition-all duration-300 transform hover:scale-[1.02]"
              >
                <p className="text-white font-bold text-lg">Orden #{c.order_number}</p>
                <p className="text-white/80">{c.complaint_type}</p>
                <p className="text-purple-300 text-sm mt-2 font-bold">
                  Severidad: {c.severidad}
                </p>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* INGREDIENTES FALTANTES */}
      <section id="ingredientes-section" className="bg-[var(--primario)]/90 p-6 rounded-3xl shadow-xl mb-8">
        <h2 className="text-3xl font-black text-white mb-6">🥗 Ingredientes Faltantes</h2>

        {missingIngredients.length === 0 ? (
          <p className="text-white text-lg">✅ Todos los ingredientes están disponibles.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {missingIngredients.map((item, idx) => (
              <button
                key={`${item.product_id}-${item.item_id}-${idx}`}
                onClick={() => handleOpenIngredient(item)}
                className={`
                  p-4 rounded-2xl text-left transition-all duration-300 transform hover:scale-[1.02]
                  ${item.estado === 'inexistente' ? 'bg-red-900/40' : item.estado === 'insuficiente' ? 'bg-orange-900/40' : 'bg-green-900/40'}
                `}
              >
                <p className="text-white font-bold text-lg">{item.product_name}</p>
                <p className="text-white/80 text-sm">
                  ❌ {item.ingredient_name}
                </p>
                <p className="text-white/60 text-xs mt-1">
                  Requiere: {item.quantity_required} {item.ingredient_unit}
                </p>
                <p className={`text-sm mt-2 font-bold ${item.estado === 'inexistente' ? 'text-red-400' : item.estado === 'insuficiente' ? 'text-orange-400' : 'text-green-400'}`}>
                  {item.estado.toUpperCase()}
                </p>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* MODAL INGREDIENTE FALTANTE */}
      {selectedIngredient && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--primario)] rounded-3xl p-8 max-w-lg w-full shadow-2xl relative">
            <button onClick={() => setSelectedIngredient(null)} className="absolute top-4 right-4 text-white hover:text-white text-2xl">✕</button>
            <h3 className="text-3xl font-black text-white mb-6">🥗 {selectedIngredient.product_name}</h3>
            <div className="space-y-4 text-white">
              <p><strong>Ingrediente:</strong> {selectedIngredient.ingredient_name}</p>
              <p><strong>Tipo:</strong> {selectedIngredient.ingredient_type}</p>
              <p><strong>Requerido:</strong> {selectedIngredient.quantity_required} {selectedIngredient.ingredient_unit}</p>
              <p><strong>Stock actual:</strong> {selectedIngredient.stock_actual} {selectedIngredient.ingredient_unit}</p>
              <p><strong>Stock mínimo:</strong> {selectedIngredient.stock_min} {selectedIngredient.ingredient_unit}</p>
              <p className={`font-bold text-xl ${selectedIngredient.estado === 'inexistente' ? 'text-red-400' : selectedIngredient.estado === 'insuficiente' ? 'text-orange-400' : 'text-green-400'}`}>
                Estado: {selectedIngredient.estado.toUpperCase()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TARDANZA */}
      {selectedDelay && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--primario)] rounded-3xl p-8 max-w-lg w-full shadow-2xl relative">
            <button onClick={() => setSelectedDelay(null)} className="absolute top-4 right-4 text-white hover:text-white text-2xl">✕</button>
            <h3 className="text-3xl font-black text-white mb-6">🕒 {selectedDelay.date}</h3>
            <div className="space-y-4 text-white">
              <p><strong>Tardanzas:</strong> {selectedDelay.delay_count}</p>
              <p><strong>Promedio retraso:</strong> {Math.round(selectedDelay.avg_delay_minutes)} min</p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL INVENTARIO */}
      {selectedStock && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--primario)] rounded-3xl p-8 max-w-lg w-full shadow-2xl relative">
            <button onClick={() => setSelectedStock(null)} className="absolute top-4 right-4 text-white hover:text-white text-2xl">✕</button>
            <h3 className="text-3xl font-black text-white mb-6">📦 {selectedStock.product_name}</h3>
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
              {selectedStock.descripcion && <p><strong>Descripción:</strong> {selectedStock.descripcion}</p>}
            </div>
          </div>
        </div>
      )}

      {/* MODAL VENTAS BAJAS */}
      {selectedSale && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--primario)] rounded-3xl p-8 max-w-lg w-full shadow-2xl relative">
            <button onClick={() => setSelectedSale(null)} className="absolute top-4 right-4 text-white hover:text-white text-2xl">✕</button>
            <h3 className="text-3xl font-black text-white mb-6">📉 {selectedSale.product_name}</h3>
            <div className="space-y-4 text-white">
              <p><strong>Fecha:</strong> {selectedSale.date}</p>
              <p><strong>Ventas:</strong> {selectedSale.sales_count}</p>
              <p><strong>Precio:</strong> ${selectedSale.precio}</p>
              {selectedSale.descuento > 0 && <p><strong>Descuento:</strong> {selectedSale.descuento}%</p>}
              <p><strong>Trending:</strong> {selectedSale.is_trending ? '✅ Sí' : '❌ No'}</p>
              {selectedSale.descripcion && <p><strong>Descripción:</strong> {selectedSale.descripcion}</p>}
              {selectedSale.image_url && (
                <img src={selectedSale.image_url} alt={selectedSale.product_name} className="w-full h-48 object-cover rounded-2xl mt-4" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL QUEJAS */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--primario)] rounded-3xl p-8 max-w-lg w-full shadow-2xl relative">
            <button onClick={() => setSelectedComplaint(null)} className="absolute top-4 right-4 text-white hover:text-white text-2xl">✕</button>
            <h3 className="text-3xl font-black text-white mb-6">⚠️ Orden #{selectedComplaint.order_number}</h3>
            <div className="space-y-4 text-white">
              <p><strong>Tipo:</strong> {selectedComplaint.complaint_type}</p>
              <p><strong>Descripción:</strong> {selectedComplaint.descripcion}</p>
              <p><strong>Severidad:</strong> {selectedComplaint.severidad}</p>
              <p><strong>Estado:</strong> {selectedComplaint.estado}</p>
              <p><strong>Fecha:</strong> {selectedComplaint.created_at}</p>
              {selectedComplaint.user_name && <p><strong>Usuario:</strong> {selectedComplaint.user_name}</p>}
              {selectedComplaint.user_email && <p><strong>Email:</strong> {selectedComplaint.user_email}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Critico;