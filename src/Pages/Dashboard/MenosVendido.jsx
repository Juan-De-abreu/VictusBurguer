const MenosVendido = () => {
  const menosVendido = [
    { nombre: 'Pizza Vegetariana', ventas: 12, ingresos: 240.00 },
    { nombre: 'Ensalada César', ventas: 8, ingresos: 120.00 },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-6">📉 Menos Vendidos</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gradient-to-r from-red-50 to-orange-50 p-12 rounded-3xl border border-red-200 text-center">
          <div className="text-6xl mb-6">📉</div>
          <h2 className="text-3xl font-black text-red-900 mb-4">Oportunidades</h2>
          <p className="text-xl text-gray-700">Analiza estos productos para promociones o ajustes</p>
        </div>

        <div className="space-y-4">
          {menosVendido.map((producto, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-xl border border-orange-200 hover:shadow-2xl transition-all">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mt-1 text-orange-600 font-bold text-xl">
                  {i + 1}
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="font-bold text-xl text-gray-900 mb-2">{producto.nombre}</h3>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Ventas: <span className="font-bold text-orange-600">{producto.ventas}</span></span>
                    <span>Ingresos: <span className="font-bold text-green-600">${producto.ingresos.toLocaleString()}</span></span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MenosVendido;