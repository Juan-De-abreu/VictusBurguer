import React, { useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "../../config/api";

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
  const [form, setForm] = useState({
    movement_type: "adjust",
    quantity: 1,
    reference_type: "manual",
    reference_id: 0,
    notes: "",
  });

  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    type: "all",
  });

  const formatNumber = (value) =>
    Number(value || 0).toLocaleString("es-VE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const buildQuery = () => {
    const params = new URLSearchParams();
    if (filters.search) params.append("search", filters.search);
    if (filters.status !== "all") params.append("status", filters.status);
    if (filters.type !== "all") params.append("type", filters.type);
    return params.toString();
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_BASE_URL}/inventory?${buildQuery()}`);
      const data = await res.json();

      if (!res.ok || data.error) throw new Error(data.error || "Error cargando inventario");
      setItems(Array.isArray(data.data) ? data.data : []);
    } catch (e) {
      setError(e.message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategorias = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/categories`);
      const data = await res.json();
      if (res.ok && Array.isArray(data)) setCategorias(data);
    } catch {}
  };

  const fetchMovimientos = async (itemId) => {
    try {
      setMovimientosLoading(true);
      setMovimientosError("");
      const res = await fetch(`${API_BASE_URL}/inventory?item_id=${itemId}`);
      const data = await res.json();

      if (!res.ok || data.error) throw new Error(data.error || "No se pudo cargar el detalle");
      setSelectedItem(data.data || null);

      const movRes = await fetch(`${API_BASE_URL}/inventory?item_id=${itemId}&movements=1`);
      const movData = await movRes.json();
      if (!movRes.ok || movData.error) throw new Error(movData.error || "Error cargando movimientos");

      setMovimientos(Array.isArray(movData.data) ? movData.data : []);
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
    fetchItems();
  }, [filters.search, filters.status, filters.type]);

  const stats = useMemo(() => {
    const total = items.length;
    const urgente = items.filter((x) => Number(x.stock_available || 0) <= 1000).length;
    const agotado = items.filter((x) => Number(x.stock_available || 0) <= 0).length;
    const normal = total - urgente;
    return { total, urgente, agotado, normal };
  }, [items]);

  const getEstado = (item) => {
    const disponible = Number(item.stock_available || 0);
    if (disponible <= 0) return { text: "Agotado", cls: "bg-red-600 text-white" };
    if (disponible <= 1000) return { text: "Urgente", cls: "bg-amber-500 text-black" };
    return { text: "Normal", cls: "bg-green-600 text-white" };
  };

  const openModal = async (item) => {
    setSelectedItem(null);
    setMovimientos([]);
    await fetchMovimientos(item.item_id);
    setForm({
      movement_type: "adjust",
      quantity: 1,
      reference_type: "manual",
      reference_id: 0,
      notes: "",
    });
  };

  const closeModal = () => {
    setSelectedItem(null);
    setMovimientos([]);
    setMovimientosError("");
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
        notes: form.notes,
      };

      const res = await fetch(`${API_BASE_URL}/inventory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "No se pudo registrar el movimiento");

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
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">
          Inventario de ingredientes e instrumentos
        </h1>
        <p className="text-gray-300">
          Control de stock para producción, con alerta urgente cuando el disponible baje de 1000.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-3xl bg-[var(--body)] p-5 shadow-xl border border-white/10">
          <p className="text-sm text-gray-300">Total de ítems</p>
          <p className="text-3xl font-black text-white">{stats.total}</p>
        </div>
        <div className="rounded-3xl bg-[var(--body)] p-5 shadow-xl border border-white/10">
          <p className="text-sm text-gray-300">Normales</p>
          <p className="text-3xl font-black text-green-400">{stats.normal}</p>
        </div>
        <div className="rounded-3xl bg-[var(--body)] p-5 shadow-xl border border-white/10">
          <p className="text-sm text-gray-300">Urgentes</p>
          <p className="text-3xl font-black text-amber-400">{stats.urgente}</p>
        </div>
        <div className="rounded-3xl bg-[var(--body)] p-5 shadow-xl border border-white/10">
          <p className="text-sm text-gray-300">Agotados</p>
          <p className="text-3xl font-black text-red-400">{stats.agotado}</p>
        </div>
      </div>

      <div className="bg-[var(--body)] p-5 sm:p-6 rounded-3xl shadow-xl space-y-4 max-w-full overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
            placeholder="Buscar por nombre o descripción"
            className="px-4 py-3 rounded-2xl border border-gray-300 bg-[var(--body)] text-white w-full"
          />

          <select
            value={filters.status}
            onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
            className="px-4 py-3 rounded-2xl border border-gray-300 bg-[var(--body)] text-white w-full"
          >
            <option value="all">Todos los estados</option>
            <option value="ok">Normal</option>
            <option value="low">Urgente</option>
            <option value="out">Agotado</option>
          </select>

          <select
            value={filters.type}
            onChange={(e) => setFilters((p) => ({ ...p, type: e.target.value }))}
            className="px-4 py-3 rounded-2xl border border-gray-300 bg-[var(--body)] text-white w-full"
          >
            <option value="all">Todos los tipos</option>
            <option value="ingrediente">Ingredientes</option>
            <option value="instrumento">Instrumentos</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setFilters({ search: "", status: "all", type: "all" })}
            className="px-4 py-2 rounded-xl bg-red-100 text-red-700 font-bold hover:bg-red-200"
          >
            Limpiar filtros
          </button>
          <button
            onClick={fetchItems}
            className="px-4 py-2 rounded-xl bg-white/10 text-white font-bold hover:bg-white/15"
          >
            Refrescar
          </button>
        </div>
      </div>

      <div className="bg-[var(--body)] rounded-3xl shadow-2xl overflow-hidden max-w-full">
        {loading ? (
          <div className="p-8 text-center text-white">Cargando inventario...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-white">No hay registros de inventario</div>
        ) : (
          <div className="overflow-x-auto max-w-full">
            <table className="w-full min-w-[1200px] table-auto">
              <thead className="bg-[var(--body2)] text-white border-b border-white/10">
                <tr>
                  <th className="p-4 text-left">Nombre</th>
                  <th className="p-4 text-left">Tipo</th>
                  <th className="p-4 text-left">Unidad</th>
                  <th className="p-4 text-right">Disponible</th>
                  <th className="p-4 text-right">Reservado</th>
                  <th className="p-4 text-right">Mínimo</th>
                  <th className="p-4 text-right">Máximo</th>
                  <th className="p-4 text-center">Estado</th>
                  <th className="p-4 text-center">Detalle</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const estado = getEstado(item);
                  return (
                    <tr key={item.item_id} className="border-t border-white/10 text-white hover:bg-white/5">
                      <td className="p-4">
                        <div className="font-semibold truncate max-w-[240px]">{item.nombre || "N/D"}</div>
                        <div className="text-xs text-gray-400 truncate max-w-[240px]">
                          {item.descripcion || "Sin descripción"}
                        </div>
                      </td>
                      <td className="p-4">{item.tipo || "N/D"}</td>
                      <td className="p-4">{item.unit || "unidad"}</td>
                      <td className="p-4 text-right font-bold">{formatNumber(item.stock_available)}</td>
                      <td className="p-4 text-right">{formatNumber(item.stock_reserved)}</td>
                      <td className="p-4 text-right">{formatNumber(item.stock_min)}</td>
                      <td className="p-4 text-right">{formatNumber(item.stock_max)}</td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex px-3 py-2 rounded-full text-xs font-bold ${estado.cls}`}>
                          {estado.text}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => openModal(item)}
                          className="px-4 py-2 rounded-xl bg-red-100 text-red-700 font-bold hover:bg-red-200 text-sm"
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
        )}
      </div>

      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-6xl max-h-[92vh] overflow-y-auto rounded-3xl bg-[var(--body)] text-white border border-white/10 shadow-2xl">
            <div className="flex items-start justify-between gap-4 p-4 sm:p-6 border-b border-white/10">
              <div>
                <h2 className="text-2xl font-black">{selectedItem.nombre}</h2>
                <p className="text-sm text-gray-300">
                  {selectedItem.tipo} · {selectedItem.unit}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-xl bg-red-100 text-red-700 font-bold hover:bg-red-200"
              >
                Cerrar
              </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 p-4 sm:p-6">
              <div className="space-y-4">
                <div className="rounded-2xl bg-black/20 p-5">
                  <h3 className="font-bold text-lg mb-3">Resumen del ítem</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <p><span className="text-gray-400">Disponible:</span> {formatNumber(selectedItem.stock_available)}</p>
                    <p><span className="text-gray-400">Reservado:</span> {formatNumber(selectedItem.stock_reserved)}</p>
                    <p><span className="text-gray-400">Mínimo:</span> {formatNumber(selectedItem.stock_min)}</p>
                    <p><span className="text-gray-400">Máximo:</span> {formatNumber(selectedItem.stock_max)}</p>
                    <p><span className="text-gray-400">Tipo:</span> {selectedItem.tipo}</p>
                    <p><span className="text-gray-400">Unidad:</span> {selectedItem.unit}</p>
                  </div>
                </div>

                <div className="rounded-2xl bg-black/20 p-5">
                  <h3 className="font-bold text-lg mb-3">Movimiento manual</h3>
                  <form onSubmit={submitMovement} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <select
                        value={form.movement_type}
                        onChange={(e) => setForm((p) => ({ ...p, movement_type: e.target.value }))}
                        className="px-4 py-3 rounded-2xl bg-[var(--body)] border border-white/20 text-white"
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
                        className="px-4 py-3 rounded-2xl bg-[var(--body)] border border-white/20 text-white"
                        placeholder="Cantidad"
                      />

                      <input
                        type="number"
                        value={form.reference_id}
                        onChange={(e) => setForm((p) => ({ ...p, reference_id: e.target.value }))}
                        className="px-4 py-3 rounded-2xl bg-[var(--body)] border border-white/20 text-white"
                        placeholder="ID referencia"
                      />

                      <input
                        type="text"
                        value={form.reference_type}
                        onChange={(e) => setForm((p) => ({ ...p, reference_type: e.target.value }))}
                        className="px-4 py-3 rounded-2xl bg-[var(--body)] border border-white/20 text-white"
                        placeholder="Tipo referencia"
                      />
                    </div>

                    <textarea
                      value={form.notes}
                      onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                      className="w-full min-h-[100px] px-4 py-3 rounded-2xl bg-[var(--body)] border border-white/20 text-white"
                      placeholder="Observaciones"
                    />

                    <button
                      type="submit"
                      disabled={saving}
                      className="px-5 py-3 rounded-2xl bg-red-700 text-white font-bold hover:bg-red-800 disabled:opacity-60"
                    >
                      {saving ? "Guardando..." : "Registrar movimiento"}
                    </button>
                  </form>
                </div>
              </div>

              <div className="rounded-2xl bg-black/20 p-5">
                <h3 className="font-bold text-lg mb-3">Historial de movimientos</h3>
                {movimientosLoading ? (
                  <div className="text-center text-white py-8">Cargando movimientos...</div>
                ) : movimientosError ? (
                  <div className="text-center text-red-400 py-8">{movimientosError}</div>
                ) : movimientos.length === 0 ? (
                  <div className="text-center text-gray-300 py-8">No hay movimientos registrados</div>
                ) : (
                  <div className="overflow-x-auto max-w-full">
                    <table className="w-full min-w-[700px] table-auto text-sm">
                      <thead className="text-left text-gray-300 border-b border-white/10">
                        <tr>
                          <th className="p-2">Fecha</th>
                          <th className="p-2">Tipo</th>
                          <th className="p-2 text-right">Cantidad</th>
                          <th className="p-2">Referencia</th>
                          <th className="p-2">Notas</th>
                        </tr>
                      </thead>
                      <tbody>
                        {movimientos.map((m) => (
                          <tr key={m.movement_id} className="border-t border-white/10">
                            <td className="p-2 whitespace-nowrap">{String(m.created_at || "").slice(0, 19)}</td>
                            <td className="p-2">{m.movement_type}</td>
                            <td className="p-2 text-right">{formatNumber(m.quantity)}</td>
                            <td className="p-2">{m.reference_type} #{m.reference_id}</td>
                            <td className="p-2">{m.notes || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventario;