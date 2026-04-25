import { Link } from 'react-router-dom';
import ProductCartControls from './ProductCartControls';

const ProductCard = ({ item, basePath = '/product' }) => {
  const precioDescuento = item.descuento 
    ? parseFloat(item.precio * (1 - item.descuento / 100)).toFixed(2)
    : parseFloat(item.precio || 0).toFixed(2);

  return (
    <Link to={`${basePath}/${item.product_id}`}>
      <div className="group relative flex flex-col bg-[var(--primario)]/5 backdrop-blur-sm border border-[var(--letra)]/10 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-red-900/10 transition-all duration-500 hover:-translate-y-2">
        
        {/* 🖼️ IMAGEN */}
        <div className="relative h-64 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity duration-300" />
          <img
            src={item.image_url}
            alt={item.nombre}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=800';
            }}
          />
          
          {/* 💰 PRECIO + DESCUENTO */}
          <div className={`absolute top-4 right-4 z-20 bg-[var(--body)]/90 backdrop-blur text-[var(--letra)] font-bold px-4 py-2 rounded-full shadow-lg border border-red-500/20 ${item.descuento ? 'animate-saltorebote' : ''}`}>
            ${precioDescuento}
            {item.descuento ? <span className='line-through text-red-700 pl-2'>{item.precio}$</span> : null}
          </div>
        </div>

        {/* 📝 INFO */}
        <div className="p-6 flex flex-col flex-grow relative">
          <div>
            <h3 className="text-2xl font-serif italic font-bold text-[var(--letra)] mb-3 group-hover:text-red-600 transition-colors duration-300">
              {item.nombre}
            </h3>
            <p className="text-[var(--letra)]/70 text-sm leading-relaxed mb-6 flex-grow">
              {item.descripcion}
            </p>
            
            {/* 🔗 ACCIONES */}
            <div className="mt-auto pt-4 border-t border-[var(--letra)]/10 flex justify-between items-center">
              <Link
                 to={`${basePath}/${item.product_id}`}
                className="text-sm font-semibold text-[var(--letra)] hover:text-red-500 transition-colors flex items-center gap-2"
              >
                Ver detalles →
              </Link>
              <ProductCartControls item={item} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;