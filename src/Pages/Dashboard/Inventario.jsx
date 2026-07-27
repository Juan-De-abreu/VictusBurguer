import React, { useEffect, useMemo, useState, useCallback } from "react";
import { API_BASE_URL } from "../../config/api";

const EMPTY_FORM = {
  movement_type: "adjust",
  quantity: 1,
  reference_type: "manual",
  reference_id: 0,
  notes: "",
};

const EMPTY_FILTERS = {
  search: "",
  status: "all",
  type: "all",
};

const Inventario = () => {
  const [items, setItems] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedItem, setSelectedItem] = useState(null);
  const [movimientos, setMovimientos] = useState([]);
  const [movimientosLoading, setMovimientosLoading] = useState(false);
  const [movimientosError, setMovimientosError] = useState("");

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  const formatNumber = (value) =>
    Number(value || 0).toLocaleString("es-VE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const normalizeItems = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  };

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      if (filters.search.trim()) params.append("search", filters.search.trim());
      if (filters.status !== "all") params.append("status", filters.status);
      if (filters.type !== "all") params.append("type", filters.type);

      const res = await fetch(`${API_BASE_URL}/inventory?${params.toString()}`);
      const data = await res.json();

      if (!res.ok || data.error) throw new Error(data.error || "Error cargando inventario");
      setItems(normalizeItems(data));
    } catch (e) {
      setError(e.message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchCategorias = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/categories`);
      const data = await res.json();
      setCategorias(normalizeItems(data));
    } catch {
      setCategorias([]);
    }
  };

  const fetchMovimientos = async (itemId) => {
    try {
      setMovimientosLoading(true);
      setMovimientosError("");

      const res = await fetch(`${API_BASE_URL}/inventory?item_id=${itemId}&movements=1`);
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Error cargando historial de movimientos");

      if (data.item) setSelectedItem(data.item);
      setMovimientos(normalizeItems(data.movements || data.data || data));
    } catch (e) {
      setMovimientosError(e.message);
      setMovimientos([]);
    } finally {
      setMovimientosLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchItems();
    }, 400);

    return () => clearTimeout(timer);
  }, [filters, fetchItems]);

  const getEstado = (item) => {
    const disponible = Number(item.stock_available || 0);
    const min = Number(item.stock_min || 0);

    if (disponible <= 0) return { text: "Agotado", cls: "bg-red-600 text-white" };
    if (min > 0 && disponible <= min) return { text: "Urgente", cls: "bg-amber-500 text-black" };
    return { text: "Normal", cls: "bg-green-600 text-white" };
  };

  const stats = useMemo(() => {
    const total = items.length;
    let urgente = 0;
    let agotado = 0;

    items.forEach((item) => {
      const disponible = Number(item.stock_available || 0);
      const min = Number(item.stock_min || 0);
      if (disponible <= 0) agotado++;
      else if (min > 0 && disponible <= min) urgente++;
    });

    const normal = total - urgente - agotado;
    return { total, urgente, agotado, normal: Math.max(normal, 0) };
  }, [items]);

  const openModal = async (item) => {
    setSelectedItem(item);
    setMovimientos([]);
    setMovimientosError("");
    setForm(EMPTY_FORM);
    await fetchMovimientos(item.item_id);
  };

  const closeModal = () => {
    setSelectedItem(null);
    setMovimientos([]);
    setMovimientosError("");
    setForm(EMPTY_FORM);
  };

  const submitMovement = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    try {
      setSaving(true);
      const payload = {
        item_id: selectedItem.item_id,
        movement_type: form.movement_type,
        quantity: Number(form.quantity || 0),
        reference_type: form.reference_type,
        reference_id: Number(form.reference_id || 0),
        notes: form.notes.trim(),
      };

      const res = await fetch(`${API_BASE_URL}/inventory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "No se pudo registrar el movimiento");

      setForm(EMPTY_FORM);
      await fetchItems();
      await fetchMovimientos(selectedItem.item_id);
      alert("Movimiento registrado correctamente");
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-full p-2 sm:p-4 box-border">
      {/* Encabezado */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight break-words">
          Inventario de ingredientes e instrumentos
        </h1>
        <p className="text-sm sm:text-base text-gray-300">
          Control de stock para producción con alertas basadas en stock mínimo configurado.
        </p>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl sm:rounded-3xl bg-[var(--body)] p-4 sm:p-5 shadow-xl border border-white/10">
          <p className="text-xs sm:text-sm text-gray-300">Total de ítems</p>
          <p className="text-2xl sm:text-3xl font-black text-white">{stats.total}</p>
        </div>
        <div className="rounded-2xl sm:rounded-3xl bg-[var(--body)] p-4 sm:p-5 shadow-xl border border-white/10">
          <p className="text-xs sm:text-sm text-gray-300">Normales</p>
          <p className="text-2xl sm:text-3xl font-black text-green-400">{stats.normal}</p>
        </div>
        <div className="rounded-2xl sm:rounded-3xl bg-[var(--body)] p-4 sm:p-5 shadow-xl border border-white/10">
          <p className="text-xs sm:text-sm text-gray-300">Urgentes</p>
          <p className="text-2xl sm:text-3xl font-black text-amber-400">{stats.urgente}</p>
        </div>
        <div className="rounded-2xl sm:rounded-3xl bg-[var(--body)] p-4 sm:p-5 shadow-xl border border-white/10">
          <p className="text-xs sm:text-sm text-gray-300">Agotados</p>
          <p className="text-2xl sm:text-3xl font-black text-red-400">{stats.agotado}</p>
        </div>
      </div>

      {/* Controles y Filtros */}
      <div className="bg-[var(--body)] p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl space-y-4 max-w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
            placeholder="Buscar..."
            className="px-4 py-3 rounded-xl sm:rounded-2xl border border-gray-300/30 bg-[var(--body)] text-white w-full focus:outline-none focus:border-red-500 text-sm sm:text-base"
          />

          <select
            value={filters.status}
            onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
            className="px-4 py-3 rounded-xl sm:rounded-2xl border border-gray-300/30 bg-[var(--body)] text-white w-full text-sm sm:text-base"
          >
            <option value="all">Todos los estados</option>
            <option value="ok">Normal</option>
            <option value="low">Urgente</option>
            <option value="out">Agotado</option>
          </select>

          <select
            value={filters.type}
            onChange={(e) => setFilters((p) => ({ ...p, type: e.target.value }))}
            className="px-4 py-3 rounded-xl sm:rounded-2xl border border-gray-300/30 bg-[var(--body)] text-white w-full text-sm sm:text-base"
          >
            <option value="all">Todos los tipos</option>
            <option value="ingrediente">Ingredientes</option>
            <option value="instrumento">Instrumentos</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button
            onClick={() => setFilters(EMPTY_FILTERS)}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-red-100 text-red-700 font-bold hover:bg-red-200 transition-colors text-xs sm:text-sm"
          >
            Limpiar filtros
          </button>
          <button
            onClick={fetchItems}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white/10 text-white font-bold hover:bg-white/15 transition-colors text-xs sm:text-sm"
          >
            Refrescar
          </button>
        </div>
      </div>

      {/* Contenedor principal de items */}
      <div className="bg-[var(--body)] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden w-full">
        {loading ? (
          <div className="p-8 text-center text-white">Cargando inventario...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-white">No hay registros de inventario</div>
        ) : (
          <>
            {/* Vista en Tarjetas para pantallas móviles (< md) */}
            <div className="block md:hidden divide-y divide-white/10">
              {items.map((item) => {
                const estado = getEstado(item);
                return (
                  <div key={item.item_id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-white text-base truncate">{item.nombre || "N/D"}</div>
                        <div className="text-xs text-gray-400 line-clamp-2">
                          {item.descripcion || "Sin descripción"}
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 ${estado.cls}`}>
                        {estado.text}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-black/20 p-3 rounded-xl border border-white/5">
                      <div>
                        <span className="text-gray-400 block">Tipo / Unidad:</span>
                        <span className="text-white font-medium capitalize">{item.tipo || "N/D"} ({item.unit || "unid"})</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">Disponible:</span>
                        <span className="text-white font-bold">{formatNumber(item.stock_available)}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">Reservado:</span>
                        <span className="text-white">{formatNumber(item.stock_reserved)}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">Mín / Máx:</span>
                        <span className="text-white">{formatNumber(item.stock_min)} / {formatNumber(item.stock_max)}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => openModal(item)}
                      className="w-full py-2.5 rounded-xl bg-red-100 text-red-700 font-bold hover:bg-red-200 text-xs transition-colors text-center"
                    >
                      Ver Detalle e Historial
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Vista en Tabla ajustada para evitar desbordes (>= md) */}
            <div className="hidden md:block w-full overflow-x-auto">
              <table className="w-full text-left border-collapse table-fixed">
                <thead className="bg-[var(--body2)] text-white border-b border-white/10 text-xs sm:text-sm">
                  <tr>
                    <th className="p-3 lg:p-4 w-[25%]">Nombre</th>
                    <th className="p-3 lg:p-4 w-[12%]">Tipo</th>
                    <th className="p-3 lg:p-4 w-[10%]">Unidad</th>
                    <th className="p-3 lg:p-4 w-[11%] text-right">Disponible</th>
                    <th className="p-3 lg:p-4 w-[10%] text-right">Reservado</th>
                    <th className="p-3 lg:p-4 w-[9%] text-right">Mínimo</th>
                    <th className="p-3 lg:p-4 w-[9%] text-right">Máximo</th>
                    <th className="p-3 lg:p-4 w-[8%] text-center">Estado</th>
                    <th className="p-3 lg:p-4 w-[6%] text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-xs sm:text-sm text-white">
                  {items.map((item) => {
                    const estado = getEstado(item);
                    return (
                      <tr key={item.item_id} className="hover:bg-white/5 transition-colors">
                        <td className="p-3 lg:p-4">
                          <div className="font-semibold truncate" title={item.nombre}>{item.nombre || "N/D"}</div>
                          <div className="text-xs text-gray-400 truncate" title={item.descripcion}>
                            {item.descripcion || "Sin descripción"}
                          </div>
                        </td>
                        <td className="p-3 lg:p-4 capitalize truncate">{item.tipo || "N/D"}</td>
                        <td className="p-3 lg:p-4 truncate">{item.unit || "unidad"}</td>
                        <td className="p-3 lg:p-4 text-right font-bold truncate">{formatNumber(item.stock_available)}</td>
                        <td className="p-3 lg:p-4 text-right truncate">{formatNumber(item.stock_reserved)}</td>
                        <td className="p-3 lg:p-4 text-right truncate">{formatNumber(item.stock_min)}</td>
                        <td className="p-3 lg:p-4 text-right truncate">{formatNumber(item.stock_max)}</td>
                        <td className="p-3 lg:p-4 text-center">
                          <span className={`inline-flex px-2 py-1 rounded-full text-[10px] lg:text-xs font-bold ${estado.cls}`}>
                            {estado.text}
                          </span>
                        </td>
                        <td className="p-3 lg:p-4 text-center">
                          <button
                            onClick={() => openModal(item)}
                            className="px-2.5 py-1.5 rounded-xl bg-red-100 text-red-700 font-bold hover:bg-red-200 text-xs transition-colors"
                          >
                            Ver
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Modal de Detalle / Movimientos */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-2 sm:p-4 backdrop-blur-sm">
          <div className="w-full max-w-5xl max-h-[90vh] flex flex-col rounded-2xl sm:rounded-3xl bg-[var(--body)] text-white border border-white/10 shadow-2xl overflow-hidden mx-2">
            
            {/* Header Modal */}
            <div className="flex items-start justify-between gap-3 p-4 sm:p-6 border-b border-white/10 shrink-0">
              <div className="min-w-0">
                <h2 className="text-lg sm:text-2xl font-black truncate">{selectedItem.nombre}</h2>
                <p className="text-xs sm:text-sm text-gray-300 truncate">
                  {selectedItem.tipo} · {selectedItem.unit}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-red-100 text-red-700 font-bold hover:bg-red-200 text-xs sm:text-sm transition-colors shrink-0"
              >
                Cerrar
              </button>
            </div>

            {/* Body Modal Scrollable */}
            <div className="overflow-y-auto p-4 sm:p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Columna Izquierda: Resumen y Formulario */}
                <div className="space-y-4">
                  <div className="rounded-2xl bg-black/20 p-4 sm:p-5 border border-white/5">
                    <h3 className="font-bold text-base sm:text-lg mb-3">Resumen del ítem</h3>
                    <div className="grid grid-cols-2 gap-2.5 text-xs sm:text-sm">
                      <p><span className="text-gray-400 block sm:inline">Disponible:</span> <strong className="text-white">{formatNumber(selectedItem.stock_available)}</strong></p>
                      <p><span className="text-gray-400 block sm:inline">Reservado:</span> <strong className="text-white">{formatNumber(selectedItem.stock_reserved)}</strong></p>
                      <p><span className="text-gray-400 block sm:inline">Mínimo:</span> <strong className="text-white">{formatNumber(selectedItem.stock_min)}</strong></p>
                      <p><span className="text-gray-400 block sm:inline">Máximo:</span> <strong className="text-white">{formatNumber(selectedItem.stock_max)}</strong></p>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-black/20 p-4 sm:p-5 border border-white/5">
                    <h3 className="font-bold text-base sm:text-lg mb-3">Movimiento manual</h3>
                    <form onSubmit={submitMovement} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <select
                          value={form.movement_type}
                          onChange={(e) => setForm((p) => ({ ...p, movement_type: e.target.value }))}
                          className="px-3.5 py-2.5 rounded-xl bg-[var(--body)] border border-white/20 text-white text-xs sm:text-sm w-full"
                        >
                          <option value="adjust">Ajuste</option>
                          <option value="in">Entrada</option>
                          <option value="out">Salida</option>
                          <option value="reserve">Reservar</option>
                          <option value="release">Liberar</option>
                        </select>

                        <input
                          type="number"
                          min="1"
                          value={form.quantity}
                          onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))}
                          className="px-3.5 py-2.5 rounded-xl bg-[var(--body)] border border-white/20 text-white text-xs sm:text-sm w-full"
                          placeholder="Cantidad"
                          required
                        />

                        <input
                          type="number"
                          value={form.reference_id}
                          onChange={(e) => setForm((p) => ({ ...p, reference_id: e.target.value }))}
                          className="px-3.5 py-2.5 rounded-xl bg-[var(--body)] border border-white/20 text-white text-xs sm:text-sm w-full"
                          placeholder="ID referencia"
                        />

                        <input
                          type="text"
                          value={form.reference_type}
                          onChange={(e) => setForm((p) => ({ ...p, reference_type: e.target.value }))}
                          className="px-3.5 py-2.5 rounded-xl bg-[var(--body)] border border-white/20 text-white text-xs sm:text-sm w-full"
                          placeholder="Tipo referencia"
                        />
                      </div>

                      <textarea
                        value={form.notes}
                        onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                        className="w-full min-h-[80px] px-3.5 py-2.5 rounded-xl bg-[var(--body)] border border-white/20 text-white text-xs sm:text-sm"
                        placeholder="Observaciones..."
                      />

                      <button
                        type="submit"
                        disabled={saving}
                        className="w-full py-3 rounded-xl bg-red-700 text-white font-bold hover:bg-red-800 disabled:opacity-60 transition-colors text-xs sm:text-sm"
                      >
                        {saving ? "Guardando..." : "Registrar movimiento"}
                      </button>
                    </form>
                  </div>
                </div>

                {/* Columna Derecha: Historial */}
                <div className="rounded-2xl bg-black/20 p-4 sm:p-5 border border-white/5 flex flex-col min-w-0">
                  <h3 className="font-bold text-base sm:text-lg mb-3">Historial de movimientos</h3>
                  {movimientosLoading ? (
                    <div className="text-center text-white py-8 text-xs sm:text-sm">Cargando movimientos...</div>
                  ) : movimientosError ? (
                    <div className="text-center text-red-400 py-8 text-xs sm:text-sm">{movimientosError}</div>
                  ) : movimientos.length === 0 ? (
                    <div className="text-center text-gray-300 py-8 text-xs sm:text-sm">No hay movimientos registrados</div>
                  ) : (
                    <>
                      {/* Vista Móvil del Historial */}
                      <div className="block sm:hidden space-y-2 max-h-[300px] overflow-y-auto pr-1">
                        {movimientos.map((m) => (
                          <div key={m.movement_id || Math.random()} className="bg-white/5 p-3 rounded-xl text-xs space-y-1">
                            <div className="flex justify-between text-gray-400">
                              <span>{String(m.created_at || "").slice(0, 10)}</span>
                              <span className="font-bold text-white capitalize">{m.movement_type}</span>
                            </div>
                            <div className="flex justify-between font-semibold">
                              <span>Cant: {formatNumber(m.quantity)}</span>
                              <span className="text-gray-300">{m.reference_type} #{m.reference_id}</span>
                            </div>
                            {m.notes && <p className="text-gray-400 text-[11px] italic break-words">{m.notes}</p>}
                          </div>
                        ))}
                      </div>

                      {/* Vista Escritorio del Historial */}
                      <div className="hidden sm:block overflow-x-auto max-h-[400px] w-full">
                        <table className="w-full text-left text-xs sm:text-sm table-fixed">
                          <thead className="text-gray-300 border-b border-white/10 sticky top-0 bg-[var(--body)]">
                            <tr>
                              <th className="p-2 w-[22%]">Fecha</th>
                              <th className="p-2 w-[18%]">Tipo</th>
                              <th className="p-2 w-[18%] text-right">Cant.</th>
                              <th className="p-2 w-[22%]">Ref.</th>
                              <th className="p-2 w-[20%]">Notas</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/10">
                            {movimientos.map((m) => (
                              <tr key={m.movement_id || Math.random()} className="hover:bg-white/5">
                                <td className="p-2 truncate text-gray-300">{String(m.created_at || "").slice(0, 10)}</td>
                                <td className="p-2 capitalize font-medium truncate">{m.movement_type}</td>
                                <td className="p-2 text-right font-bold truncate">{formatNumber(m.quantity)}</td>
                                <td className="p-2 truncate">{m.reference_type} #{m.reference_id}</td>
                                <td className="p-2 truncate" title={m.notes}>{m.notes || "-"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>

              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Inventario;