import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

const Header = () => {
  const botones = [
    { to: "/", label: "Inicio", svg: `` },
    {
      to: "/ComidaRapida",
      label: "Comida rapida",
      svg: `<path d="m16,2h-8c-3.31,0-6,2.69-6,6,0,.55.45,1,1,1h18c.55,0,1-.45,1-1,0-3.31-2.69-6-6-6ZM4.13,7c.45-1.72,2.01-3,3.87-3h8c1.86,0,3.43,1.28,3.87,3H4.13Z"/><path d="m21,15H3c-.55,0-1,.45-1,1,0,3.31,2.69,6,6,6h8c3.31,0,6-2.69,6-6,0-.55-.45-1-1-1Zm-5,5h-8c-1.86,0-3.43-1.28-3.87-3h15.75c-.45,1.72-2.01,3-3.87,3Z"/><path d="m17,10c-1.6,0-2.45.68-3.12,1.22-.59.47-.98.78-1.88.78s-1.29-.31-1.88-.78c-.68-.54-1.52-1.22-3.13-1.22s-2.45.68-3.13,1.22c-.59.47-.98.78-1.88.78v2c1.6,0,2.45-.68,3.13-1.22.59-.47.98-.78,1.88-.78s1.29.31,1.88.78c.68.54,1.52,1.22,3.13,1.22s2.45-.68,3.12-1.22c.59-.47.98-.78,1.87-.78s1.29.31,1.87.78c.68.54,1.52,1.22,3.12,1.22v-2c-.9,0-1.29-.31-1.87-.78-.68-.54-1.52-1.22-3.12-1.22Z"></path>`,
    },
    {
      to: "/Desayunos",
      label: "Desayunos",
      svg: `<path d="m19,22H5c-1.1,0-2-.9-2-2v-10.68c-.6-.75-.95-1.66-1-2.62-.05-1.14.36-2.22,1.15-3.05,1.02-1.07,2.59-1.66,4.42-1.66h9.73c1.29,0,2.55.54,3.45,1.48.85.89,1.29,2.04,1.24,3.23h0c-.04.96-.39,1.87-1,2.62v10.68c0,1.1-.9,2-2,2ZM7.58,4c-1.28,0-2.34.37-2.98,1.04-.42.44-.63.98-.6,1.58.03.61.28,1.19.71,1.63.18.19.28.44.28.7v11.06h14v-11.06c0-.26.1-.51.28-.7.43-.44.69-1.02.71-1.63h0c.03-.64-.21-1.26-.68-1.75-.52-.55-1.25-.86-2-.86H7.58Z"/><path d="M12 7A1 1 0 1 0 12 9 1 1 0 1 0 12 7z"/><path d="M15.5 10A.5.5 0 1 0 15.5 11 .5.5 0 1 0 15.5 10z"/><path d="M16 6A1 1 0 1 0 16 8 1 1 0 1 0 16 6z">`,
    },
    {
      to: "/Almuerzos",
      label: "Almuerzos",
      svg: `<path d="m14,2h-2v7h-2V2h-2v7h-2V2h-2v8c0,1.65,1.35,3,3,3h1v9h2v-9h1c1.65,0,3-1.35,3-3V2Z"/><path d="m17,13h1v9h2V3c0-.55-.45-1-1-1-1.65,0-3,1.35-3,3v7c0,.55.45,1,1,1Z">`,
    },
  ];
  
  const [MenuisOpen, setMenuIsOpen] = useState(false);
  const menuRef = useRef(null);

  const toggleMenu = () => {
    setMenuIsOpen(!MenuisOpen);
  };

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (MenuisOpen && menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [MenuisOpen]);

  // Cerrar menú al hacer scroll
  useEffect(() => {
    const handleScroll = () => {
      if (MenuisOpen) {
        setMenuIsOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [MenuisOpen]);

  return (
    <>
      <nav 
        ref={menuRef}
        className="fixed top-0 left-0 right-0 z-50 bg-[var(--primario)] backdrop-blur-md shadow-lg border-b border-red-500/30 text-2xl"
      >
        <div className="lg:mx-10 px-4 lg:px-0">
          <div className="flex justify-between items-center h-20 lg:h-24">
            {/* Logo */}
            <Link
              to="/"
              className="text-3xl hidden lg:flex lg:text-4xl font-serif italic font-bold text-red-600 hover:text-red-500 transition-colors duration-300"
            >
              Victu's Burgers
            </Link>

            {/* Botón hamburguesa móvil */}
            <button 
              className="lg:hidden p-2 rounded-md transition-all duration-300 text-white hover:text-red-800"
              onClick={toggleMenu}
              aria-label="Toggle navigation"
            >
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  className={`${MenuisOpen ? 'hidden' : ''}`}
                  d="M4 6h16M4 12h16M4 18h16" 
                />
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  className={`${MenuisOpen ? '' : 'hidden'}`}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Menú desktop */}
            <div className="hidden lg:flex flex-grow justify-center items-center space-x-1 ">
              <ul className="flex space-x-1 mx-auto">
                {botones.map((boton) => (
                  <li key={boton.to}>
                    <Link
                      to={boton.to}
                      className="flex items-center px-4 py-2 mx-1 text-xl font-medium text-[var(--letra)] hover:scale-105 hover:text-red-600 border-b-2 border-transparent hover:border-red-500 rounded-lg transition-all duration-200 group"
                    >
                      {boton.label}
                      {boton.svg !== `` && (
                        <svg
                          className="w-6 h-6 ml-2 group-hover:scale-110 transition-transform fill-current"
                          viewBox="0 0 24 24"
                          dangerouslySetInnerHTML={{ __html: boton.svg }}
                        />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Botón Instagram */}
            <a
              href=""
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center bg-red-900 hover:bg-[var(--segundario)]/80 text-white font-semibold text-lg px-4 mx-10 py-2 rounded-full hover:scale-105 transition-all duration-300 ml-8 whitespace-nowrap"
            >
              Contactanos
              <img 
                className={`ml-2 w-6 h-6 bg-gradient-to-br from-[#405DE6] via-[#E1306C] to-[#F77737] rounded-lg`}
                src="/src/assets/instagram.svg" 
                alt="instagram"           
              />      
            </a>
            {/* login de usuario */}
            <Link to={'/login'} className="text-[var(--letra)] hover:scale-110 transition-all duration-200 hover:text-[var(--segundario)]">
              <svg  xmlns="http://www.w3.org/2000/svg" width={30} height={30} fill={"currentColor"} viewBox="0 0 24 24">{/* Boxicons v3.0.8 https://boxicons.com | License  https://docs.boxicons.com/free */}<path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5m0-8c1.65 0 3 1.35 3 3s-1.35 3-3 3-3-1.35-3-3 1.35-3 3-3M4 22h16c.55 0 1-.45 1-1v-1c0-3.86-3.14-7-7-7h-4c-3.86 0-7 3.14-7 7v1c0 .55.45 1 1 1m6-7h4c2.76 0 5 2.24 5 5H5c0-2.76 2.24-5 5-5"></path></svg>
            </Link>
          </div>

          {/* Menú móvil desplegable */}
          <div 
            className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
              MenuisOpen 
                ? 'max-h-96 opacity-100 visible' 
                : 'max-h-0 opacity-0 invisible'
            }`}
          >
            <div className="bg-[var(--primario)]/95  backdrop-blur-md border-t border-red-500/30 pt-4 pb-8">
              <ul className="space-y-2 px-4">
                {botones.map((boton) => (
                  <li key={boton.to}>
                    <Link
                      to={boton.to}
                      className="flex justify-center items-center py-3 px-4 text-xl text-[var(--letra)] hover:bg-red-600/20 hover:scale-105 rounded-xl transition-all duration-200"
                      onClick={() => setMenuIsOpen(false)}
                    >
                      {boton.label}
                      {boton.svg !== `` && (
                        <svg
                          className="w-8 h-8 ml-4 fill-current"
                          viewBox="0 0 24 24"
                          dangerouslySetInnerHTML={{ __html: boton.svg }}
                        />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </nav>

      {/* Overlay transparente para cerrar al tocar fuera (solo móvil) */}
      {MenuisOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          onClick={() => setMenuIsOpen(false)}
        />
      )}
    </>
  );
};

export default Header;
