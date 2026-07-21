import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../../config/api";

const InventarioResumido = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/inventory?status=low`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
      setItems(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div className="p-6 text-white">Cargando inventario resumido...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-black text-white">Inventario resumido</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item.item_id} className="rounded-2xl bg-[var(--body)] p-4 text-white border border-white/10">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-bold">{item.nombre}</h3>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-black">Crítico</span>
            </div>
            <p className="text-sm text-gray-300 mt-2">{item.descripcion || "Sin descripción"}</p>
            <div className="mt-3 text-sm">
              <p>Disponible: <span className="font-bold">{Number(item.stock_available || 0).toLocaleString("es-VE")}</span></p>
              <p>Reservado: <span className="font-bold">{Number(item.stock_reserved || 0).toLocaleString("es-VE")}</span></p>
              <p>Mínimo: <span className="font-bold">{Number(item.stock_min || 0).toLocaleString("es-VE")}</span></p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InventarioResumido;