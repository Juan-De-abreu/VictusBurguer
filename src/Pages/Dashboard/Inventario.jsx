import { useState, useEffect } from 'react';

const Inventario = () => {
  const [inventario, setInventario] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/inventario')
      .then(res => res.json())
      .then(setInventario)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900" /></div>;

  const critico = inventario.filter(item => item.stock <= item.minimo);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
        <h1 className="text-4xl sm:text-5xl font-black text-gray-900">📦 Inventario</h1>
        <div className="flex gap-4">
          <span className="px-4 py-2 bg-green-100 text-green-800 rounded-xl font-bold">Total: {inventario.length}</span>
          <span className={`px-4 py-2 ${critico.length ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'} rounded-xl font-bold`}>
            Crítico: {critico.length}
          </span>
        </div>
      </div>

      {/* ⚠️ CRÍTICO */}
      {critico.length > 0 && (
        <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-6">
          <h3 className="text-2xl font-bold text-red-900 mb-4 flex items-center">
            ⚠️ Inventario Crítico ({critico.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {critico.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-2xl border-2 border-red-300">
                <h4 className="font-bold text-lg">{item.nombre}</h4>
                <p className="text-red-600 font-bold">Stock: {item.stock}</p>
                <p className="text-sm text-gray-600">Mínimo: {item.minimo}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 📋 TABLA */}
      <div className="overflow-x-auto bg-white rounded-3xl shadow-2xl">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <tr>
              <th className="p-4 text-left font-bold">Producto</th>
              <th className="p-4 text-right font-bold">Stock</th>
              <th className="p-4 text-right font-bold">Mínimo</th>
              <th className="p-4 text-right font-bold">Estado</th>
            </tr>
          </thead>
          <tbody>
            {inventario.map((item) => (
              <tr key={item.id} className={`border-t ${item.stock <= item.minimo ? 'bg-red-50' : 'hover:bg-blue-50'}`}>
                <td className="p-4 font-semibold">{item.nombre}</td>
                <td className={`p-4 text-right font-bold ${item.stock <= item.minimo ? 'text-red-600' : 'text-green-600'}`}>
                  {item.stock}
                </td>
                <td className="p-4 text-right">{item.minimo}</td>
                <td className="p-4 text-right">
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    item.stock <= item.minimo ? 'bg-red-100 text-red-800' :
                    item.stock <= item.minimo * 2 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {item.stock <= item.minimo ? 'CRÍTICO' : item.stock <= item.minimo * 2 ? 'BAJO' : 'OK'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventario;