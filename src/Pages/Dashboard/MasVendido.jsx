const MasVendido = () => {
  const topVendido = [
    { nombre: 'Big Burger Especial', ventas: 245, ingresos: 7345.00 },
    { nombre: 'Papas Deluxe', ventas: 189, ingresos: 945.00 },
    { nombre: 'Combo Familiar', ventas: 156, ingresos: 6240.00 },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-6">⭐ Más Vendidos</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 📊 Gráfico */}
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-8 rounded-3xl border border-yellow-200 h-96 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">📈</div>
            <p className="text-2xl text-gray-600">Gráfico Top Vendidos</p>
          </div>
        </div>

        {/* 🏆 Ranking */}
        <div className="space-y-4">
          {topVendido.map((producto, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-xl border border-yellow-200 hover:shadow-2xl transition-all">
              <div className="flex items-center mb-3">
                <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center mr-4 text-2xl font-bold text-yellow-700">
                  #{i + 1}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-xl text-gray-900">{producto.nombre}</h3>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-8 text-sm text-gray-600">
                <div>Ventas: <span className="font-bold text-2xl text-yellow-600">{producto.ventas}</span></div>
                <div>Ingresos: <span className="font-bold text-2xl text-green-600">${producto.ingresos.toLocaleString()}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MasVendido;