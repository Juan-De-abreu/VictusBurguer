import { useState, useEffect } from 'react';

const Ingresos = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🚀 BACKEND READY
    fetch('/api/ingresos')
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" /></div>;

  const total = data.reduce((sum, i) => sum + (i.monto || 0), 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-6">📈 Ingresos</h1>
        <p className="text-3xl font-bold text-green-600">${total.toLocaleString()}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((ingreso) => (
          <div key={ingreso.id} className="bg-white rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all">
            <h3 className="font-bold text-xl mb-3">{ingreso.fecha}</h3>
            <p className="text-2xl font-bold text-green-600 mb-2">${ingreso.monto?.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Método: {ingreso.metodo}</p>
            <p className="text-sm text-gray-600">Pedidos: {ingreso.pedidos}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Ingresos;