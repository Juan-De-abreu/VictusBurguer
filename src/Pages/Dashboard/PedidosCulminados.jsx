import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../../config/api";
import { useAuth } from '../../contexts/AuthContext';

const PedidosCulminados = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
       const chefUserId = Number(user?.id || 0);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/chef_orders?action=completed&chef_user_id=${chefUserId}`);
      const data = await res.json();
      setOrders(Array.isArray(data?.data) ? data.data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return <div className="p-6 text-white">Cargando pedidos culminados...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-black text-white">Pedidos culminados</h2>
      <div className="grid gap-4">
        {orders.map((order) => (
          <div key={order.order_id} className="rounded-2xl bg-[var(--body)] p-4 border border-white/10 text-white">
            <h3 className="font-bold">Orden #{order.order_id}</h3>
            <p className="text-sm text-gray-300">Cliente: {order.customer_name || "Cliente"}</p>
            <p className="text-sm text-gray-300">Cocinado: {String(order.cooked_at || "").slice(0, 19)}</p>
            <p className="text-sm text-gray-300">Estado: {order.kitchen_status}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PedidosCulminados;