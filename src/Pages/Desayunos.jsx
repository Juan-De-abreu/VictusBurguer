import React from 'react';
import { Link } from 'react-router-dom';

const Desayunos = () => {
  // 1. Datos extraídos de tu tabla 'products' (category_id: 1)
  // He usado las URLs del SQL, pero asegúrate de que sean accesibles o cámbialas por tus rutas locales.
  const products = [
    {
      id: 1,
      nombre: 'Arepa Pabellón',
      descripcion: 'Arepa rellena con carne mechada, caraotas negras, tajadas y queso blanco rallado.',
      precio: 5.50,
      image: 'https://img.dbburguer.com/desayunos/arepa_pabellon.jpg' // Reemplazar con imagen real si esta no carga
    },
    {
      id: 2,
      nombre: 'Desayuno Americano',
      descripcion: 'Dos huevos fritos, tocineta crujiente, pan tostado y mermelada de la casa.',
      precio: 7.00,
      image: 'https://img.dbburguer.com/desayunos/americano.jpg'
    },
    {
      id: 3,
      nombre: 'Empanadas Trio',
      descripcion: 'Set de 3 empanadas (queso, carne y pollo) acompañadas con salsa guasacaca.',
      precio: 4.50,
      image: 'https://img.dbburguer.com/desayunos/empanadas.jpg'
    }
  ];

  return (
    <section className="min-h-screen bg-[var(--body)] pt-28 pb-12 px-4 lg:px-8">
      {/* NOTA: 'pt-28' se usa para dar espacio al Header fijo (que tiene h-20/h-24).
         Así el contenido no queda oculto detrás de la barra de navegación.
      */}

      <div className="container mx-auto max-w-7xl">
        {/* Encabezado de la sección: Mantiene la fuente serif italic del Hero */}
        <div className="text-center mb-16 fade-in">
          <h2 className="text-4xl md:text-5xl font-serif italic font-bold text-[var(--letra)] mb-4">
            Comienza el día <span className="text-red-600">con Sabor</span>
          </h2>
          <p className="text-[var(--letra)]/70 text-lg font-light max-w-2xl mx-auto">
            Ingredientes frescos y preparaciones al momento para un despertar inolvidable.
          </p>
        </div>

        {/* Grid de Productos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {products.map((item) => (
            <div 
              key={item.id} 
              className="group relative flex flex-col bg-[var(--primario)]/5 backdrop-blur-sm border border-[var(--letra)]/10 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-red-900/10 transition-all duration-500 hover:-translate-y-2"
            >
              {/* Contenedor de Imagen */}
              <div className="relative h-64 overflow-hidden">
                {/* Overlay gradiente para que el texto resalte si decides poner algo encima */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity duration-300" />
                
                <img 
                  src={item.image} 
                  alt={item.nombre}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out"
                  // Placeholder por si la imagen externa falla
                  onError={(e) => {e.target.src = "https://images.unsplash.com/photo-1493770348161-369560ae357d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"}} 
                />
                
                {/* Etiqueta de Precio Flotante (Estilo minimalista) */}
                <div className="absolute top-4 right-4 z-20 bg-[var(--body)]/90 backdrop-blur text-[var(--letra)] font-bold px-4 py-2 rounded-full shadow-lg border border-red-500/20">
                  ${item.precio.toFixed(2)}
                </div>
              </div>

              {/* Contenido de la Tarjeta */}
              <div className="p-6 flex flex-col flex-grow relative">
                
                {/* Título */}
                <h3 className="text-2xl font-serif italic font-bold text-[var(--letra)] mb-3 group-hover:text-red-600 transition-colors duration-300">
                  {item.nombre}
                </h3>
                
                {/* Descripción */}
                <p className="text-[var(--letra)]/70 text-sm leading-relaxed mb-6 flex-grow">
                  {item.descripcion}
                </p>

                {/* Botón de Acción - Parte inferior */}
                <div className="mt-auto pt-4 border-t border-[var(--letra)]/10 flex justify-between items-center">
                  <Link 
                    to="#" 
                    className="text-sm font-semibold text-[var(--letra)] hover:text-red-500 transition-colors flex items-center gap-2"
                  >
                    Ver detalles
                  </Link>

                  <button className="bg-red-900 hover:bg-red-700 text-white p-3 rounded-full transition-all duration-300 hover:scale-110 shadow-lg group-hover:shadow-red-500/50">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Desayunos