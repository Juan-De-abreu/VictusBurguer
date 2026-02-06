import React, { useState, useEffect } from "react";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1200);
  }, []);

  const switchForm = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setIsLogin(!isLogin);
      setIsTransitioning(false);
    }, 500);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900/20 to-black flex items-center justify-center p-4">
        <div className="w-20 h-20 sm:w-24 sm:h-24 border-4 border-white/20 border-t-white rounded-full animate-spin-slow shadow-2xl" />
      </div>
    );
  }

  return (
    <>
      {/* Mobile: Imagen full-screen + formulario centrado */}
      <div className="mt-10 lg:hidden min-h-screen bg-gradient-to-br from-gray-900/20 to-black relative overflow-hidden">
        {/* Fondo de imagen FULL SCREEN */}
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-70" 
             style={{ backgroundImage: "url('/src/assets/img/FondoLogin.png')" }}>
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/60 backdrop-blur-sm" />
        </div>

        {/* Formulario centrado y semi-transparente */}
        <div className="relative z-20 flex items-center justify-center min-h-screen p-4 sm:p-6">
          <div className="w-full max-w-sm sm:max-w-md mx-auto h-fit flex flex-col">
            {/* Header */}
            <div className="text-center mb-6 flex-shrink-0 pt-8">
              <h1 className={`text-3xl sm:text-4xl font-black bg-gradient-to-r from-white via-gray-100 to-gray-200 bg-clip-text text-transparent drop-shadow-2xl transition-all duration-500 ${isTransitioning ? 'scale-95 opacity-75' : 'animate-slide-up'} ${isLogin? '': 'mt-5'}`}>
                {isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
              </h1>
            </div>

            {/* Formulario */}
            <form className="space-y-5 w-full max-w-md mx-auto bg-white/10 backdrop-blur-2xl rounded-3xl p-8 border border-white/30 shadow-2xl shadow-black/40 hover:shadow-red-500/20 transition-all duration-500 flex flex-col justify-center">
              {isLogin ? (
                <>
                  <div>
                    <label className="block text-white/95 text-sm font-semibold mb-2">Email</label>
                    <input type="email" placeholder="ejemplo@correo.com" className="w-full p-4 rounded-2xl bg-white/15 backdrop-blur-xl border border-white/30 hover:border-white/50 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-400/60 transition-all duration-300 text-lg shadow-lg" required />
                  </div>
                  <div>
                    <label className="block text-white/95 text-sm font-semibold mb-2">Contraseña</label>
                    <input type="password" placeholder="••••••••" className="w-full p-4 rounded-2xl bg-white/15 backdrop-blur-xl border border-white/30 hover:border-white/50 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-400/60 transition-all duration-300 text-lg shadow-lg" required />
                  </div>
                  <button type="submit" className="w-full p-4 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 text-white font-bold text-lg shadow-xl hover:from-red-700 hover:to-red-800 hover:shadow-red-500/30 hover:scale-[1.02] transition-all duration-300 mt-4">
                    🔐 Iniciar Sesión
                  </button>
                  <div className="pt-6 border-t border-white/20 text-center space-y-2">
                    <a href="#" className="block text-white/85 hover:text-white text-sm hover:underline transition-colors">¿Olvidaste tu contraseña?</a>
                    <p className="text-sm text-white/75 cursor-pointer hover:text-white/90 transition-all duration-200" onClick={switchForm}>
                      ¿No tienes cuenta? <span className="text-red-400 font-semibold hover:text-red-300">Crear cuenta</span>
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-white/95 text-sm font-semibold mb-2">Nombre Completo</label>
                    <input type="text" placeholder="Juan Pérez" className="w-full p-4 rounded-2xl bg-white/15 backdrop-blur-xl border border-white/30 hover:border-white/50 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-400/60 transition-all duration-300 text-lg shadow-lg" />
                  </div>
                  <div>
                    <label className="block text-white/95 text-sm font-semibold mb-2">Email</label>
                    <input type="email" placeholder="tu@correo.com" className="w-full p-4 rounded-2xl bg-white/15 backdrop-blur-xl border border-white/30 hover:border-white/50 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-400/60 transition-all duration-300 text-lg shadow-lg" />
                  </div>
                  <div>
                    <label className="block text-white/95 text-sm font-semibold mb-2">Teléfono</label>
                    <input type="tel" placeholder="+58 412 123 4567" className="w-full p-4 rounded-2xl bg-white/15 backdrop-blur-xl border border-white/30 hover:border-white/50 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-400/60 transition-all duration-300 text-lg shadow-lg" />
                  </div>
                  <div>
                    <label className="block text-white/95 text-sm font-semibold mb-2">Contraseña</label>
                    <input type="password" placeholder="••••••••" className="w-full p-4 rounded-2xl bg-white/15 backdrop-blur-xl border border-white/30 hover:border-white/50 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-400/60 transition-all duration-300 text-lg shadow-lg" />
                  </div>
                  <button type="submit" className="w-full p-4 rounded-2xl bg-gradient-to-r from-red-600 to-red-900 text-white font-bold text-lg shadow-xl hover:from-red-700 hover:to-red-900 hover:shadow-red-500/30 hover:scale-[1.02] transition-all duration-300 mt-4">
                    Crear Cuenta +
                  </button>
                  <div className="pt-6 border-t border-white/20 text-center space-y-2">
                    <p className="text-sm text-white/75 cursor-pointer hover:text-white/90 transition-all duration-200" onClick={switchForm}>
                      ¿Ya tienes cuenta? <span className="text-red-400 font-semibold hover:text-red-300">Inicia sesión</span>
                    </p>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Desktop: Layout con grid 2 columnas - MISMO TAMAÑO SIEMPRE */}
      <div className="hidden mt-8 lg:grid lg:grid-cols-2  lg:min-h-screen  transition-all duration-700 ease-in-out">
        {/* DIV 1 - Imagen: MISMO tamaño que formulario */}
        <div className={`
          relative overflow-hidden w-full h-full flex items-center justify-center
          ${isLogin ? 'order-1' : 'order-2'}
          ${isTransitioning ? 'animate-slide-left lg:animate-slide-right' : ''}
        `}>
          {/* Imagen de fondo - EXACTAMENTE mismo tamaño */}
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-70" 
               style={{ backgroundImage: "url('/src/assets/img/FondoLogin.png')" }} />
          
          {/* Filtro negro - EXACTAMENTE mismo tamaño */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/80 backdrop-blur-sm" />
          
          {/* Contenido centrado */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full w-full p-12 text-white text-center">
            <div className="w-full max-w-sm animate-float">
              <h2 className="text-4xl lg:text-5xl font-black bg-[var(--segundario)] bg-clip-text text-transparent drop-shadow-2xl mb-6">
                Victu's Burgers
              </h2>
              <p className="text-xl lg:text-2xl text-white/90 max-w-sm leading-relaxed drop-shadow-lg px-4">
                {isLogin ? "Accede a tu cuenta" : "Crea tu cuenta ahora"}
              </p>
            </div>
          </div>
        </div>

        {/* DIV 2 - Formulario: */}
        <div className={`
          bg-[var(--body)] shadow-2xl shadow-red-900/50 w-full h-full flex flex-col items-center justify-center p-12 relative z-10
          ${isLogin ? 'order-2 rounded-t-3xl' : 'order-1 rounded-t-3xl'}
          ${isTransitioning ? 'animate-slide-right lg:animate-slide-left' : ''}
        `}>
          <div className="w-full max-w-lg xl:max-w-xl mx-auto h-fit flex flex-col items-center justify-center">
            {/* Header */}
            <div className="text-center mb-6 flex-shrink-0 pt-12 w-full">
              <h1 className={`text-5xl font-black bg-gradient-to-r from-white via-gray-100 to-gray-200 bg-clip-text text-transparent drop-shadow-2xl transition-all duration-500 ${isTransitioning ? 'scale-95 opacity-75' : 'animate-slide-up'}`}>
                {isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
              </h1>
            </div>

            {/* Formulario */}
            <form className="space-y-5 w-full max-w-md mx-auto bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl shadow-black/30 flex flex-col justify-center transition-all duration-500">
              {isLogin ? (
                <>
                  <div>
                    <label className="block text-white/90 text-sm font-semibold mb-2">Email</label>
                    <input type="email" placeholder="ejemplo@correo.com" className="w-full p-3 rounded-xl bg-white/10 backdrop-blur-xl border-2 border-white/20 hover:border-white/40 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-400/50 transition-all duration-300 text-lg" required />
                  </div>
                  <div>
                    <label className="block text-white/90 text-sm font-semibold mb-2">Contraseña</label>
                    <input type="password" placeholder="••••••••" className="w-full p-3 rounded-xl bg-white/10 backdrop-blur-xl border-2 border-white/20 hover:border-white/40 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-400/50 transition-all duration-300 text-lg" required />
                  </div>
                  <button type="submit" className="w-full p-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-bold text-lg shadow-xl hover:from-red-700 hover:to-red-800 hover:shadow-red-500/25 hover:scale-[1.02] transition-all duration-300 mt-2">
                    🔐 Iniciar Sesión
                  </button>
                  <div className="pt-4 border-t border-white/10 text-center space-y-2">
                    <a href="#" className="block text-white/80 hover:text-white text-sm hover:underline transition-colors">¿Olvidaste tu contraseña?</a>
                    <p className="text-sm text-white/60 cursor-pointer hover:text-white/80 transition-all duration-200" onClick={switchForm}>
                      ¿No tienes cuenta? <span className="text-red-400 font-semibold hover:text-red-300">Crear cuenta</span>
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-white/90 text-sm font-semibold mb-2">Nombre Completo</label>
                    <input type="text" placeholder="Juan Pérez" className="w-full p-3 rounded-xl bg-white/10 backdrop-blur-xl border-2 border-white/20 hover:border-white/40 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-400/50 transition-all duration-300 text-lg" />
                  </div>
                  <div>
                    <label className="block text-white/90 text-sm font-semibold mb-2">Email</label>
                    <input type="email" placeholder="tu@correo.com" className="w-full p-3 rounded-xl bg-white/10 backdrop-blur-xl border-2 border-white/20 hover:border-white/40 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-400/50 transition-all duration-300 text-lg" />
                  </div>
                  <div>
                    <label className="block text-white/90 text-sm font-semibold mb-2">Teléfono</label>
                    <input type="tel" placeholder="+58 412 123 4567" className="w-full p-3 rounded-xl bg-white/10 backdrop-blur-xl border-2 border-white/20 hover:border-white/40 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-400/50 transition-all duration-300 text-lg" />
                  </div>
                  <div>
                    <label className="block text-white/90 text-sm font-semibold mb-2">Contraseña</label>
                    <input type="password" placeholder="••••••••" className="w-full p-3 rounded-xl bg-white/10 backdrop-blur-xl border-2 border-white/20 hover:border-white/40 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-400/50 transition-all duration-300 text-lg" />
                  </div>
                  <button type="submit" className="w-full p-3 rounded-xl bg-gradient-to-r from-red-600 to-red-900 text-white font-bold text-lg shadow-xl hover:from-red-700 hover:to-red-900 hover:shadow-red-500/25 hover:scale-[1.02] transition-all duration-300 mt-2">
                    Crear Cuenta +
                  </button>
                  <div className="pt-4 border-t border-white/10 text-center space-y-2">
                    <p className="text-sm text-white/60 cursor-pointer hover:text-white/80 transition-all duration-200" onClick={switchForm}>
                      ¿Ya tienes cuenta? <span className="text-red-400 font-semibold hover:text-red-300">Inicia sesión</span>
                    </p>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthPage;
