import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../../config/api";

const LeastSoldProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLeastSoldProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`${API_BASE_URL}/least_sold_products`);
        const data = await res.json();

        if (!res.ok || data.error) {
          throw new Error(data.error || "Error cargando productos");
        }

        setProducts(Array.isArray(data.data) ? data.data : []);
      } catch (e) {
        setError(e.message);
        setProducts([]);
      }  {
        setLoading(false);
      }
    };

    fetchLeastSoldProducts();
  }, []);

  return (
    <div className="w-full max-w-full p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 box-border">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
          📉 Productos menos vendidos
        </h1>
      </div>

      {/* CONTENEDOR DE TABLA */}
      <div className="bg-[var(--body)] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-white/20 w-full">
        {loading ? (
          <div className="p-12 text-center text-white flex flex-col items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500" />
            <span className="font-semibold text-lg">Cargando productos con menor rotación...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-400 font-bold bg-red-900/20 border-l-4 border-red-500">
            ⚠️ {error}
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-white/70 font-medium text-lg">
            🔍 No hay registros de ventas disponibles
          </div>
        ) : (
          <div className="w-full overflow-x-auto custom-scrollbar">
            <table className="w-full min-w-[850px] border-collapse text-sm sm:text-base">
              <thead>
                <tr className="bg-white/5 text-white border-b border-white/20">
                  <th className="p-4 text-left font-bold">#</th>
                  <th className="p-4 text-left font-bold">Producto</th>
                  <th className="p-4 text-left font-bold">Descripción</th>
                  <th className="p-4 text-right font-bold">Precio Unit.</th>
                  <th className="p-4 text-center font-bold">Vendidos</th>
                  <th className="p-4 text-right font-bold">Total Ingresos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-white">
                {products.map((item, index) => (
                  <tr 
                    key={item.product_id || index} 
                    className="hover:bg-red-500/10 transition-colors duration-150"
                  >
                    <td className="p-4 font-mono font-bold text-white/60">
                      {index + 1}
                    </td>
                    <td className="p-4 font-bold text-white whitespace-nowrap">
                      {item.nombre || "N/D"}
                    </td>
                    <td className="p-4 text-white/80 max-w-[280px] truncate" title={item.descripcion}>
                      {item.descripcion || "Sin descripción"}
                    </td>
                    <td className="p-4 text-right font-mono font-medium whitespace-nowrap">
                      {Number(item.precio || 0).toLocaleString("es-VE", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}$
                    </td>
                    <td className="p-4 text-center whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-black ${
                        Number(item.total_sold || 0) === 0 
                          ? 'bg-red-500/20 text-red-400 border border-red-500/40' 
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}>
                        {Number(item.total_sold || 0).toLocaleString("es-VE")} ud.
                      </span>
                    </td>
                    <td className="p-4 text-right font-mono font-bold text-green-400 whitespace-nowrap">
                      ${Number(item.total_revenue || 0).toLocaleString("es-VE", {
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

export default LeastSoldProducts;