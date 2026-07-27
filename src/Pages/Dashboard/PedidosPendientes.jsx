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

const getElapsedMinutes = (value) => {
  if (!value) return 0;
  const d = new Date(String(value).replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return 0;
  return Math.floor((Date.now() - d.getTime()) / 60000);
};

const PedidosPendientes = () => {
  const { user } = useAuth();
  const chefUserId = Number(user?.user_id || user?.id || 0);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const [detailOpen, setDetailOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  const [savingId, setSavingId] = useState(null);
  const [animatingOutId, setAnimatingOutId] = useState(null);

  const [nowTick, setNowTick] = useState(Date.now());

  const activeOrder = useMemo(
    () =>
      orders.find(
        (o) =>
          Number(o.chef_user_id || 0) === chefUserId &&
          String(o.kitchen_status || "") === "en_cocina"
      ) || null,
    [orders, chefUserId]
  );

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${API_BASE_URL}/chef_orders?action=pending&chef_user_id=${chefUserId}`
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
    const t = setInterval(() => setNowTick(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      const assigned =
        selectedOrder &&
        String(selectedOrder.kitchen_status || "") === "en_cocina";

      if (e.key === "Escape" && assigned) {
        e.preventDefault();
      }

      if (e.key === "Escape" && !assigned) {
        closeModal();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedOrder]);

  const assignOrder = async (orderId) => {
    if (!chefUserId) return;
    if (activeOrder && Number(activeOrder.order_id) !== Number(orderId)) return;

    try {
      setSavingId(orderId);
      const res = await fetch(`${API_BASE_URL}/chef_orders`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: orderId,
          action: "assign",
          chef_user_id: chefUserId,
          kitchen_notes: "",
        }),
      });

      const result = await res.json();

      setAnimatingOutId(orderId);
      await fetchOrders();

      if (result?.success) {
        await fetchDetail(orderId);
      }

      setTimeout(() => setAnimatingOutId(null), 250);
    } finally {
      setSavingId(null);
    }
  };

  const openAndAssign = async (order) => {
    if (
      activeOrder &&
      Number(activeOrder.order_id) !== Number(order.order_id)
    ) {
      return;
    }
    await assignOrder(order.order_id);
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

  const abandonOrder = async (orderId) => {
    if (!chefUserId) return;

    try {
      setSavingId(orderId);
      await fetch(`${API_BASE_URL}/chef_orders`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: orderId,
          action: "abandon",
          chef_user_id: chefUserId,
          kitchen_notes: "",
        }),
      });

      setClosing(true);
      setTimeout(() => {
        setDetailOpen(false);
        setClosing(false);
        setSelectedOrder(null);
        setSelectedItems([]);
      }, 180);

      await fetchOrders();
    } finally {
      setSavingId(null);
    }
  };

  const completeOrder = async (orderId) => {
    if (!chefUserId) return;

    try {
      setSavingId(orderId);
      await fetch(`${API_BASE_URL}/chef_orders`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: orderId,
          action: "complete",
          chef_user_id: chefUserId,
          kitchen_notes: "",
        }),
      });

      setAnimatingOutId(orderId);
      setTimeout(() => {
        setDetailOpen(false);
        setClosing(false);
        setSelectedOrder(null);
        setSelectedItems([]);
      }, 220);

      await fetchOrders();
      setTimeout(() => setAnimatingOutId(null), 280);
    } finally {
      setSavingId(null);
    }
  };

  const visibleOrders = activeOrder
    ? orders.filter((o) => Number(o.order_id) === Number(activeOrder.order_id))
    : orders;

  const canDismiss =
    !selectedOrder ||
    String(selectedOrder.kitchen_status || "") !== "en_cocina";

  const modalUnits = selectedItems.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  const assignedTime = selectedOrder?.assigned_at;
const elapsedMinutes = useMemo(() => {
  if (!assignedTime) return 0;
  const d = new Date(String(assignedTime).replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return 0;
  return Math.floor((Date.now() - d.getTime()) / 60000);
}, [assignedTime, nowTick]);
const isDelayed = !!assignedTime && elapsedMinutes > 20;

  return (
    <div className="space-y-5 mt-16 xl:mt-0 mx-4 sm:mx-6 text-center">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl sm:text-4xl font-black text-white border-b-1 pb-2 border-red-900 mt-6">
          Pedidos pendientes
        </h2>
        <p className="text-sm sm:text-base text-gray-300">
          {activeOrder
            ? `Tienes una orden activa: #${activeOrder.order_id}. Debes abandonarla para tomar otra.`
            : `${visibleOrders.length} órdenes disponibles para cocina.`}
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-white rounded-3xl bg-[var(--body)] border border-white/10">
          Cargando pedidos...
        </div>
      ) : visibleOrders.length === 0 ? (
        <div className="p-8 text-center text-white rounded-3xl bg-[var(--body)] border border-white/10">
          No hay pedidos pendientes
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {visibleOrders.map((order) => {
            const isActive =
              Number(activeOrder?.order_id || 0) === Number(order.order_id);
            const itemCount = Number(order.items_count || 0);
            const totalItems = Number(order.total_items || 0);

            return (
              <div
                key={order.order_id}
                className={[
                  "rounded-3xl bg-[var(--body)] p-4 sm:p-5 border border-white/10 hover:border-white/30 text-white shadow-md hover:shadow-black transition-all duration-200 text-left",
                  isActive
                    ? "ring-2 ring-amber-500 scale-[1.01]"
                    : "hover:scale-[1.01]",
                  animatingOutId === order.order_id
                    ? "animate-pulse opacity-70 scale-95"
                    : "",
                ].join(" ")}
              >
                <div className="flex flex-col gap-4">
                  <button
                    onClick={() => openAndAssign(order)}
                    className="text-left flex-1 w-full"
                  >
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-black text-xl">
                        Orden #{order.order_id}
                      </h3>
                      <span
                        className={[
                          "inline-flex px-3 py-1 rounded-full text-xs font-bold",
                          isActive
                            ? "bg-amber-500 text-black"
                            : "bg-red-900 text-red-300 animate-pulse",
                        ].join(" ")}
                      >
                        {isActive ? "En trabajo" : "Pendiente"}
                      </span>
                    </div>

                    <p className="text-sm text-gray-300 mt-1">
                      {order.customer_name || "Cliente"} ·{" "}
                      {String(order.created_at || "").slice(0, 19)}
                    </p>

                    <p className="text-sm text-gray-300 mt-2">
                      {itemCount} comidas distintas · {totalItems} unidades
                    </p>
                  </button>

                  <div className="text-center sm:flex-row sm:items-center gap-2 sm:justify-end">
                    {!isActive ? (
                      <button
                        disabled={!!activeOrder && !isActive}
                        onClick={() => openAndAssign(order)}
                        className="px-5 py-3 rounded-2xl bg-red-700 text-white font-bold disabled:opacity-50 hover:cursor-pointer hover:bg-red-800 transition"
                      >
                        {savingId === order.order_id ? "Tomando..." : "Tomar"}
                      </button>
                    ) : (
                      <button
                        onClick={() => openAndAssign(order)}
                        className="px-4 py-3 rounded-2xl bg-amber-500 text-black font-bold hover:bg-amber-400 transition"
                      >
                        Ver orden
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {detailOpen && selectedOrder && (
        <div
          className={[
            "fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 transition-opacity duration-200",
            closing ? "opacity-0" : "opacity-100",
          ].join(" ")}
          onClick={canDismiss ? closeModal : undefined}
        >
          <div
            className={[
              "w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-3xl bg-[var(--body)] text-white border border-white/10 shadow-2xl transform transition-transform duration-200",
              isDelayed ? "animate-pulse ring-2 ring-red-500" : "",
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

              {canDismiss ? (
                <button
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl bg-red-100 text-red-700 font-bold hover:bg-red-200 transition"
                >
                  Cerrar
                </button>
              ) : null}
            </div>

            <div className="p-4 sm:p-6 space-y-6">
              {detailLoading ? (
                <div className="text-center py-10 text-white">
                  Cargando detalle...
                </div>
              ) : (
                <>
                  {isDelayed ? (
                    <div className="rounded-2xl bg-red-600/20 border border-red-500/40 p-4 text-red-200 animate-pulse">
                      <p className="font-black text-lg">
                        Haz tardado mucho ya
                      </p>
                      <p className="text-sm mt-1">
                        Tiempo transcurrido: {elapsedMinutes} minutos.
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-2xl bg-black/20 p-4 text-white">
                      <p className="text-gray-400">Tiempo transcurrido</p>
                      <p className="font-bold">{elapsedMinutes} minutos</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl bg-black/20 p-4">
                      <p className="text-gray-400">Estado</p>
                      <p className="font-bold">{selectedOrder.kitchen_status}</p>
                    </div>

                    <div className="rounded-2xl bg-black/20 p-4">
                      <p className="text-gray-400">Hora del pedido</p>
                      <p className="font-bold">
                        {formatDateTime(selectedOrder.created_at)}
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
                      <p className="font-bold">{modalUnits}</p>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-black/20 p-4 sm:p-5">
                    <h3 className="font-black text-lg mb-4">
                      Comidas a preparar
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
                            <p className="text-sm text-gray-300">
                              Cantidad: {item.quantity}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={() => abandonOrder(selectedOrder.order_id)}
                      disabled={savingId === selectedOrder.order_id}
                      className="px-5 py-4 rounded-2xl bg-gray-700 text-white font-bold hover:bg-gray-600 transition disabled:opacity-60"
                    >
                      {savingId === selectedOrder.order_id
                        ? "Procesando..."
                        : "Abandonar orden"}
                    </button>

                    <button
                      onClick={() => completeOrder(selectedOrder.order_id)}
                      disabled={savingId === selectedOrder.order_id}
                      className="px-5 py-4 rounded-2xl bg-green-600 text-white font-bold hover:bg-green-700 transition disabled:opacity-60"
                    >
                      {savingId === selectedOrder.order_id
                        ? "Culminando..."
                        : "Culminada"}
                    </button>
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

export default PedidosPendientes;