import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../../config/api";
import { useAuth } from '../../contexts/AuthContext';

const MisPedidoschef = () => {
   
   const { user } = useAuth();
   const chefUserId = Number(user?.id || 0);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/chef_orders?action=mine&chef_user_id=${chefUserId}`);
      const data = await res.json();
      setOrders(Array.isArray(data?.data) ? data.data : []);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, action) => {
    await fetch(`${API_BASE_URL}/chef_orders`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        order_id: orderId,
        action,
        chef_user_id: chefUserId,
        kitchen_notes: notes
      })
    });
    setNotes("");
    fetchOrders();
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-black text-white">Mis pedidos</h2>
      <input
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notas de cocina"
        className="w-full px-4 py-3 rounded-2xl bg-[var(--body)] border border-white/10 text-white"
      />
      <div className="grid gap-4">
        {orders.map((order) => (
          <div key={order.order_id} className="rounded-2xl bg-[var(--body)] p-4 border border-white/10 text-white">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-bold">Orden #{order.order_id}</h3>
                <p className="text-sm text-gray-300">Estado: {order.kitchen_status}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => updateStatus(order.order_id, "start")} className="px-4 py-2 rounded-xl bg-amber-500 text-black font-bold">
                  En cocina
                </button>
                <button onClick={() => updateStatus(order.order_id, "complete")} className="px-4 py-2 rounded-xl bg-green-600 text-white font-bold">
                  Cocinado
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MisPedidoschef;