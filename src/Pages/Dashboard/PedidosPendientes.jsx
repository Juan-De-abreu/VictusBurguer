import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../../config/api";
import { useAuth } from '../../contexts/AuthContext';


const PedidosPendientes = () => {

     const { user } = useAuth();
     const chefUserId = Number(user?.id || 0);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/chef_orders?action=pending`);
      const data = await res.json();
      setOrders(Array.isArray(data?.data) ? data.data : []);
    } finally {
      setLoading(false);
    }
  };

  const assignOrder = async (orderId) => {
    await fetch(`${API_BASE_URL}/chef_orders`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        order_id: orderId,
        action: "assign",
        chef_user_id: chefUserId,
        kitchen_notes: ""
      })
    });
    fetchOrders();
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-black text-white">Pedidos pendientes</h2>
      <div className="grid gap-4">
        {orders.map((order) => (
          <div key={order.order_id} className="rounded-2xl bg-[var(--body)] p-4 border border-white/10 text-white">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-bold">Orden #{order.order_id}</h3>
                <p className="text-sm text-gray-300">{order.customer_name || "Cliente"} · {String(order.created_at).slice(0, 19)}</p>
              </div>
              <button
                onClick={() => assignOrder(order.order_id)}
                className="px-4 py-2 rounded-xl bg-red-700 text-white font-bold"
              >
                Tomar
              </button>
            </div>
            <p className="mt-2 text-sm">Total: {Number(order.total || 0).toLocaleString("es-VE", { minimumFractionDigits: 2 })}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PedidosPendientes;