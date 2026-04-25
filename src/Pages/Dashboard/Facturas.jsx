const Facturas = () => {
  const facturas = [
    { id: '#FAC001', fecha: '2026-04-24', cliente: 'Juan Pérez', total: 1250.50, estado: 'Pagada' },
    { id: '#FAC002', fecha: '2026-04-23', cliente: 'María García', total: 890.25, estado: 'Pendiente' },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-6">📋 Facturación</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-8 rounded-3xl border border-green-200">
          <h3 className="text-2xl font-bold mb-4 text-green-900">✅ Pagadas</h3>
          <p className="text-4xl font-black text-green-600">$2,140.75</p>
        </div>
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-8 rounded-3xl border border-orange-200">
          <h3 className="text-2xl font-bold mb-4 text-orange-900">⏳ Pendientes</h3>
          <p className="text-4xl font-black text-orange-600">$890.25</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
            <tr>
              <th className="p-6 text-left font-bold text-gray-800">Factura</th>
              <th className="p-6 text-left font-bold text-gray-800">Cliente</th>
              <th className="p-6 text-left font-bold text-gray-800">Fecha</th>
              <th className="p-6 text-right font-bold text-gray-800">Total</th>
              <th className="p-6 text-center font-bold text-gray-800">Estado</th>
            </tr>
          </thead>
          <tbody>
            {facturas.map((factura, i) => (
              <tr key={i} className="border-t hover:bg-indigo-50 transition">
                <td className="p-6 font-mono text-lg">{factura.id}</td>
                <td className="p-6">{factura.cliente}</td>
                <td className="p-6">{factura.fecha}</td>
                <td className="p-6 text-right font-bold text-indigo-900">${factura.total.toLocaleString()}</td>
                <td className="p-6 text-center">
                  <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                    factura.estado === 'Pagada' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {factura.estado}
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

export default Facturas;