import { useState, useEffect } from 'react';

const Egresos = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/egresos')
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-900" /></div>;

  return (
    <div className="space-y-8">
      <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-6">📉 Egresos</h1>
      
      <div className="overflow-x-auto bg-white rounded-3xl shadow-2xl">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-red-50 to-orange-50">
            <tr>
              <th className="p-4 text-left font-bold">Fecha</th>
              <th className="p-4 text-left font-bold">Concepto</th>
              <th className="p-4 text-right font-bold">Monto</th>
            </tr>
          </thead>
          <tbody>
            {data.map((egreso) => (
              <tr key={egreso.id} className="border-t hover:bg-red-50">
                <td className="p-4">{egreso.fecha}</td>
                <td className="p-4">{egreso.concepto}</td>
                <td className="p-4 text-right font-bold text-red-600">${egreso.monto?.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Egresos;