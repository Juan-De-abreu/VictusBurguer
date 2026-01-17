import React from 'react';

const Hero = () => {
  return (
    <>
      {/* Header tiene fixed top, por eso el padding-top */}
      <div className="pt-16 md:pt-24"></div>
      
      <section className="relative bg-gradient-to-b from-gray-900/90 to-black/90 overflow-hidden h-[70vh] sm:h-[80vh] md:h-screen max-h-[600px] lg:max-h-[700px] flex items-center justify-center px-4">
        {/* Fondo fijo - NO REPITE */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed opacity-70"
          style={{ backgroundImage: "url('/src/assets/img/Hero2.jpg')" }}
        />
        
        {/* Overlay oscuro */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/80 z-10"></div>
        
        {/* Contenido centrado */}
        <div className="relative z-20 text-center text-white max-w-5xl mx-auto px-4">
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-9xl font-serif italic mb-4 md:mb-6 drop-shadow-2xl leading-tight">
            <span className="text-5xl md:text-7xl lg:text-9xl text-[#FF4500]">V</span>ictu<span className="text-[#FF4500]">’</span>s <span className='text-[#FF4500]'>B</span>urguers
          </h1>
          
          <h4 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif italic mb-6 md:mb-8 drop-shadow-xl leading-tight">
             Sabor que conquista desde el primer mordisco
          </h4>
          
          <p className="text-md sm:text-lg md:text-xl mb-8 md:mb-12 font-light drop-shadow-lg max-w-2xl mx-auto leading-relaxed">
transforma cada comida en una experiencia dorada que no olvidarás jamás.          </p>
          
          <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 md:py-4 md:px-12 rounded-full text-lg md:text-2xl shadow-2xl hover:shadow-red-500/50 transition-all duration-300 transform hover:-translate-y-1 drop-shadow-2xl">
            Únete ahora
          </button>
        </div>
      </section>
    </>
  );
};

export default Hero;
