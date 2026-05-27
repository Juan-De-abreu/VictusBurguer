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
    <div className="space-y-6">
      <h1 className="text-3xl sm:text-5xl font-black text-white">
        Productos más vendidos
      </h1>

      <div className="bg-[var(--body)] rounded-3xl shadow-2xl overflow-hidden border-1 border-white">
        {loading ? (
          <div className="p-8 text-center text-white">Cargando productos...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center text-white">
            No hay ventas registradas
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-[var(--body)] text-white">
                <tr>
                  <th className="p-4 text-left">#</th>
                  <th className="p-4 text-left">Producto</th>
                  <th className="p-4 text-left">Descripción</th>
                  <th className="p-4 text-right">Precio</th>
                  <th className="p-4 text-right">Vendidos</th>
                  <th className="p-4 text-right">Ingresos</th>
                </tr>
              </thead>
              <tbody>
                {products.map((item, index) => (
                  <tr key={item.product_id} className="border-t border-white text-white hover:bg-red-500/20 transition-all">
                    <td className="p-4">{index + 1}</td>
                    <td className="p-4 font-semibold">{item.nombre || "N/D"}</td>
                    <td className="p-4">{item.descripcion || "N/D"}</td>
                    <td className="p-4 text-right">
                      {Number(item.precio || 0).toLocaleString("es-VE", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="p-4 text-right font-bold">
                      {Number(item.total_sold || 0).toLocaleString("es-VE")}
                    </td>
                    <td className="p-4 text-right font-bold">
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