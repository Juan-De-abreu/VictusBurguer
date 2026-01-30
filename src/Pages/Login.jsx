import React from "react";

const Login = () => {
  return (
    <div className="min-h-screen grid grid-row-[30%_70%] lg:grid-cols-2 pt-24">
      <div className="bg-cover bg-center bg-no-repeat h-full w-full relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black/90 backdrop-blur-sm" />
        <div
          style={{
            backgroundImage: "url('/src/assets/img/FondoLogin.png')",
            opacity: 0.6,
          }}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        />
        <div className="relative z-10 flex items-center justify-center h-full p-8"></div>
      </div>

      <div className="bg-[var(--body2)] inset-shadow-sm inset-shadow-red-900 rounded-left rounded-lg">
        <div className="mx-auto max-w-md w-full">
          <div className="text-center pt-12 ">
            <h1 className="text-xl md:text-5xl font-black bg-gradient-to-r from-white via-gray-100 to-gray-200 bg-clip-text text-transparent mb-6 drop-shadow-2xl">
              Iniciar Sesión
            </h1>
          </div>

          <form className="space-y-6 bg-white/5 backdrop-blur-xl rounded-3xl p-8 lg:p-10 border border-white/20 shadow-2xl shadow-black/30">
            {/* Email Input */}
            <div>
              <label className="block text-white/90 text-sm font-semibold mb-3 tracking-wide">
                Correo Electrónico
              </label>
              <input
                type="email"
                placeholder="tu@correo.com"
                className="w-full p-5 lg:p-6 rounded-2xl bg-white/10 backdrop-blur-xl border-2 border-white/20 hover:border-white/40 text-white placeholder-white/50 text-lg font-medium focus:outline-none focus:ring-4 focus:ring-red-500/40 focus:border-red-400/60 transition-all duration-300 shadow-lg hover:shadow-xl"
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-white/90 text-sm font-semibold mb-3 tracking-wide">
                Contraseña
              </label>
              <input
                type="password"
                placeholder="••••••••••"
                className="w-full p-5 lg:p-6 rounded-2xl bg-white/10 backdrop-blur-xl border-2 border-white/20 hover:border-white/40 text-white placeholder-white/50 text-lg font-medium focus:outline-none focus:ring-4 focus:ring-red-500/40 focus:border-red-400/60 transition-all duration-300 shadow-lg hover:shadow-xl"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full p-6 lg:p-7 rounded-2xl bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white text-xl font-black shadow-2xl shadow-red-500/25 hover:from-red-700 hover:via-red-800 hover:to-red-900 hover:shadow-red-500/40 hover:scale-[1.02] hover:-translate-y-0.5 transform transition-all duration-300 active:scale-[0.98] group"
            >
              <span className="flex items-center justify-center gap-3">
                🔐
                <span>Iniciar Sesión</span>
              </span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center py-4">
              <div className="flex-grow border-t border-white/20" />
              <span className="flex-shrink-0 px-4 text-sm text-white/50 font-medium">
                o
              </span>
              <div className="flex-grow border-t border-white/20" />
            </div>

            {/* Links */}
            <div className="text-center space-y-4 pt-4">
              <a
                href="#"
                className="block w-full text-white/80 hover:text-white font-medium text-lg py-3 px-6 border-2 border-white/20 rounded-2xl hover:border-white/40 hover:bg-white/5 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02]"
              >
                ¿Olvidaste tu contraseña?
              </a>

              <p className="text-sm text-white/60">
                ¿No tienes cuenta?{" "}
                <a
                  href="#"
                  className="text-red-400/90 font-semibold hover:text-red-300 hover:underline transition-colors"
                >
                  Crear cuenta
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
