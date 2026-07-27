import React, { useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "../../config/api";
import { useAuth } from "../../contexts/AuthContext";

const formatNumber = (value) =>
  Number(value || 0).toLocaleString("es-VE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatDateTime = (value) => {
  if (!value) return "Sin hora";
  const d = new Date(String(value).replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return String(value).slice(0, 19);
  return d.toLocaleString("es-VE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const PedidosCulminados = () => {
  const { user } = useAuth();
  const chefUserId = Number(user?.user_id || user?.id || 0);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const [detailOpen, setDetailOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  const activeOrders = useMemo(() => orders || [], [orders]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${API_BASE_URL}/chef_orders?action=completed&chef_user_id=${chefUserId}`
      );
      const data = await res.json();
      setOrders(Array.isArray(data?.data) ? data.data : []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDetail = async (orderId) => {
    try {
      setDetailLoading(true);
      const res = await fetch(
        `${API_BASE_URL}/chef_orders?action=detail&order_id=${orderId}`
      );
      const data = await res.json();
      setSelectedOrder(data?.data?.order || null);
      setSelectedItems(Array.isArray(data?.data?.items) ? data.data.items : []);
      setDetailOpen(true);
      setClosing(false);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    if (!chefUserId) return;
    fetchOrders();
  }, [chefUserId]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape" && detailOpen) {
        closeModal();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [detailOpen]);

  const openModal = async (order) => {
    await fetchDetail(order.order_id);
  };

  const closeModal = () => {
    setClosing(true);
    setTimeout(() => {
      setDetailOpen(false);
      setClosing(false);
      setSelectedOrder(null);
      setSelectedItems([]);
    }, 180);
  };

  return (
    <div className="space-y-5 mt-16 xl:mt-0 mx-4 sm:mx-6 text-center">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl sm:text-4xl font-black text-white border-b-1 pb-2 border-red-900 mt-6">
          Pedidos culminados
        </h2>
        <p className="text-sm sm:text-base text-gray-300">
          {activeOrders.length} órdenes culminadas registradas.
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-white rounded-3xl bg-[var(--body)] border border-white/10">
          Cargando pedidos culminados...
        </div>
      ) : activeOrders.length === 0 ? (
        <div className="p-8 text-center text-white rounded-3xl bg-[var(--body)] border border-white/10">
          No hay pedidos culminados
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {activeOrders.map((order) => (
            <div
              key={order.order_id}
              className="rounded-3xl bg-[var(--body)] p-4 sm:p-5 border border-white/10 hover:border-white/30 text-white shadow-md hover:shadow-black transition-all duration-200 text-left"
            >
              <div className="flex flex-col gap-4">
                <button
                  onClick={() => openModal(order)}
                  className="text-left flex-1 w-full"
                >
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-black text-xl">
                      Orden #{order.order_id}
                    </h3>
                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-green-600 text-white">
                      Culminada
                    </span>
                  </div>

                  <p className="text-sm text-gray-300 mt-1">
                    {order.customer_name || "Cliente"} ·{" "}
                    {formatDateTime(order.cooked_at)}
                  </p>

                  <p className="text-sm text-gray-300 mt-2">
                    {Number(order.items_count || 0)} comidas distintas ·{" "}
                    {Number(order.total_items || 0)} unidades
                  </p>

                  
                  <p className="mt-2 text-xs text-gray-400">
                    Estado: {order.kitchen_status}
                  </p>
                </button>

                <div className="flex justify-end">
                  <button
                    onClick={() => openModal(order)}
                    className="px-4 py-3 rounded-2xl bg-green-600 text-white font-bold hover:bg-green-700 transition"
                  >
                    Ver detalle
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {detailOpen && selectedOrder && (
        <div
          className={[
            "fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 transition-opacity duration-200",
            closing ? "opacity-0" : "opacity-100",
          ].join(" ")}
          onClick={closeModal}
        >
          <div
            className={[
              "w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-3xl bg-[var(--body)] text-white border border-white/10 shadow-2xl transform transition-transform duration-200",
              closing ? "scale-90" : "scale-100",
            ].join(" ")}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 p-4 sm:p-6 border-b border-white/10">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black">
                  Orden #{selectedOrder.order_id}
                </h2>
                <p className="text-sm text-gray-300">
                  {selectedOrder.customer_name || "Cliente"} ·{" "}
                  {selectedOrder.kitchen_status}
                </p>
              </div>

              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-xl bg-red-100 text-red-700 font-bold hover:bg-red-200 transition"
              >
                Cerrar
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-6">
              {detailLoading ? (
                <div className="text-center py-10 text-white">
                  Cargando detalle...
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl bg-black/20 p-4">
                      <p className="text-gray-400">Estado</p>
                      <p className="font-bold">
                        {selectedOrder.kitchen_status}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-black/20 p-4">
                      <p className="text-gray-400">Hora de cocinado</p>
                      <p className="font-bold">
                        {formatDateTime(selectedOrder.cooked_at)}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-black/20 p-4">
                      <p className="text-gray-400">Comidas distintas</p>
                      <p className="font-bold">
                        {selectedOrder.items_count || selectedItems.length || 0}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-black/20 p-4">
                      <p className="text-gray-400">Unidades</p>
                      <p className="font-bold">
                        {selectedItems.reduce(
                          (sum, item) => sum + Number(item.quantity || 0),
                          0
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-black/20 p-4 sm:p-5">
                    <h3 className="font-black text-lg mb-4">
                      Comidas preparadas
                    </h3>

                    <div className="grid gap-3">
                      {selectedItems.map((item) => (
                        <div
                          key={item.order_item_id}
                          className="rounded-2xl bg-[var(--body2)] p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 transition-transform duration-200 hover:scale-[1.01]"
                        >
                          <div>
                            <p className="font-bold text-base sm:text-lg">
                              {item.product_name}
                            </p>
                          </div>

                          <div className="text-left sm:text-right text-sm text-gray-300">
                            <p>Cantidad: {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PedidosCulminados;