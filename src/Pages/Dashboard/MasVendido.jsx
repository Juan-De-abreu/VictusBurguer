import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../../config/api";

const TopProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`${API_BASE_URL}/top_products`);
        const data = await res.json();

        if (!res.ok || data.error) {
          throw new Error(data.error || "Error cargando productos");
        }

        setProducts(Array.isArray(data.data) ? data.data : []);
      } catch (e) {
        setError(e.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTopProducts();
  }, []);

  return (
    <div className="w-full max-w-full p-4 sm:p-6 md:p-8 space-y-6 box-border">
      <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
        Productos más vendidos
      </h1>

      <div className="bg-[var(--body)] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-white/20 w-full">
        {loading ? (
          <div className="p-8 text-center text-white font-medium">Cargando productos...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-400 font-medium">{error}</div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center text-white/80 font-medium">
            No hay ventas registradas
          </div>
        ) : (
          /* Scroll horizontal contenido solo dentro de la tarjeta */
          <div className="w-full overflow-x-auto custom-scrollbar">
            <table className="w-full min-w-[700px] text-sm sm:text-base border-collapse">
              <thead className="bg-white/5 text-white border-b border-white/20">
                <tr>
                  <th className="p-3 sm:p-4 text-left font-semibold">#</th>
                  <th className="p-3 sm:p-4 text-left font-semibold">Producto</th>
                  <th className="p-3 sm:p-4 text-left font-semibold">Descripción</th>
                  <th className="p-3 sm:p-4 text-right font-semibold">Precio</th>
                  <th className="p-3 sm:p-4 text-right font-semibold">Vendidos</th>
                  <th className="p-3 sm:p-4 text-right font-semibold">Ingresos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {products.map((item, index) => (
                  <tr 
                    key={item.product_id || index} 
                    className="text-white hover:bg-red-500/10 transition-colors"
                  >
                    <td className="p-3 sm:p-4 font-mono text-white/70">{index + 1}</td>
                    <td className="p-3 sm:p-4 font-semibold whitespace-nowrap">
                      {item.nombre || "N/D"}
                    </td>
                    <td className="p-3 sm:p-4 max-w-xs truncate" title={item.descripcion}>
                      {item.descripcion || "N/D"}
                    </td>
                    <td className="p-3 sm:p-4 text-right whitespace-nowrap font-mono">
                      {Number(item.precio || 0).toLocaleString("es-VE", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}$
                    </td>
                    <td className="p-3 sm:p-4 text-right font-bold whitespace-nowrap font-mono">
                      <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-black ${
                        Number(item.total_sold || 0) === 0 
                          ? 'bg-red-500/20 text-red-400 border border-red-500/40' 
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}>
                        {Number(item.total_sold || 0).toLocaleString("es-VE")} ud.
                      </span>
                    </td>
                    <td className="p-3 sm:p-4 text-right font-bold whitespace-nowrap font-mono text-emerald-400">
                      {Number(item.total_revenue || 0).toLocaleString("es-VE", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopProducts;