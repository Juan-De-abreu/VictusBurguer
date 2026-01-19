import React from "react";
import { Link } from "react-router-dom";

const Menu = () => {
  const menuItems = [
    {
      title: "Desayunos",
      description: "Deliciosos desayunos para empezar el día con energía. Desde huevos revueltos hasta panquecas esponjosas.",
      svg: `<path d="m19,22H5c-1.1,0-2-.9-2-2v-10.68c-.6-.75-.95-1.66-1-2.62-.05-1.14.36-2.22,1.15-3.05,1.02-1.07,2.59-1.66,4.42-1.66h9.73c1.29,0,2.55.54,3.45,1.48.85.89,1.29,2.04,1.24,3.23h0c-.04.96-.39,1.87-1,2.62v10.68c0,1.1-.9,2-2,2ZM7.58,4c-1.28,0-2.34.37-2.98,1.04-.42.44-.63.98-.6,1.58.03.61.28,1.19.71,1.63.18.19.28.44.28.7v11.06h14v-11.06c0-.26.1-.51.28-.7.43-.44.69-1.02.71-1.63h0c.03-.64-.21-1.26-.68-1.75-.52-.55-1.25-.86-2-.86H7.58Z"/><path d="M12 7A1 1 0 1 0 12 9 1 1 0 1 0 12 7z"/><path d="M15.5 10A.5.5 0 1 0 15.5 11 .5.5 0 1 0 15.5 10z"/><path d="M16 6A1 1 0 1 0 16 8 1 1 0 1  0 16 6z">`,
      link: "/Desayunos"
    },
    {
      title: "Almuerzos",
      description: "Combos completos para el almuerzo. Hamburguesas jugosas, acompañamientos y bebidas incluidas.",
      svg: `<path d="m14,2h-2v7h-2V2h-2v7h-2V2h-2v8c0,1.65,1.35,3,3,3h1v9h2v-9h1c1.65,0,3-1.35,3-3V2Z"/><path d="m17,13h1v9h2V3c0-.55-.45-1-1-1-1.65,0-3,1.35-3,3v7c0,.55.45,1,1,1Z">`,
      link: "/Almuerzos"
    },
    {
      title: "comida rápida",
      description: "Opciones nocturnas irresistibles. Perfectas para compartir en familia o con amigos.",
            svg: `<path d="m16,2h-8c-3.31,0-6,2.69-6,6,0,.55.45,1,1,1h18c.55,0,1-.45,1-1,0-3.31-2.69-6-6-6ZM4.13,7c.45-1.72,2.01-3,3.87-3h8c1.86,0,3.43,1.28,3.87,3H4.13Z"/><path d="m21,15H3c-.55,0-1,.45-1,1,0,3.31,2.69,6,6,6h8c3.31,0,6-2.69,6-6,0-.55-.45-1-1-1Zm-5,5h-8c-1.86,0-3.43-1.28-3.87-3h15.75c-.45,1.72-2.01,3-3.87,3Z"/><path d="m17,10c-1.6,0-2.45.68-3.12,1.22-.59.47-.98.78-1.88.78s-1.29-.31-1.88-.78c-.68-.54-1.52-1.22-3.13-1.22s-2.45.68-3.13,1.22c-.59.47-.98.78-1.88.78v2c1.6,0,2.45-.68,3.13-1.22.59-.47.98-.78,1.88-.78s1.29.31,1.88.78c.68.54,1.52,1.22,3.13,1.22s2.45-.68,3.12-1.22c.59-.47.98-.78,1.87-.78s1.29.31,1.87.78c.68.54,1.52,1.22,3.12,1.22v-2c-.9,0-1.29-.31-1.87-.78-.68-.54-1.52-1.22-3.12-1.22Z"></path>`,

      link: "/ComidaRapida"
    }
  ];

  return (
    <section id="menucards" className="py-20 bg-gradient-to-t from-[var(--body2)] to-[var(--body)]">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Título */}
        <div className="text-center mb-20">
          <h2 className="text-4xl lg:text-5xl font-bold text-[var(--letra)] mb-6">
            Nuestro <span className="text-[var(--segundario)]">Menú</span>
          </h2>
          <p className="text-xl text-[var(--letra)] max-w-2xl mx-auto leading-relaxed">
            Descubre nuestras especialidades preparadas con los mejores ingredientes
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {menuItems.map((item) => (
            <div
              key={item.title}
              className="group relative bg-[var(--body)] rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-4 overflow-hidden border"
            >
              {/* Fondo gradiente */}
              <div className={`absolute inset-0 bg-gradient-to-br  opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
              
              {/* Icono superior */}
              <div className="relative p-8 pt-12 text-center">
                <div className="w-24 h-24 mx-auto bg-[var(--body2)] rounded-2xl p-4 group-hover:scale-110 transition-transform duration-300 shadow-lg border-4 border-[var(--primario)] flex items-center justify-center">
                  <svg
                    className="w-full h-full fill-current text-red-600 group-hover:text-red-500 transition-colors"
                    viewBox="0 0 24 24"
                    dangerouslySetInnerHTML={{ __html: item.svg }}
                  />
                </div>
              </div>

              {/* Contenido */}
              <div className="p-8 pb-12 text-center relative z-10 text-[var(--letra)]">
                <h3 className="text-3xl font-bold  mb-4 group-hover:text-[var(--segundario)] transition-colors">
                  {item.title}
                </h3>
                <p className="text-lg  leading-relaxed mb-8">
                  {item.description}
                </p>
                
                {/* Botón */}
                <Link
                  to={item.link}
                  className="inline-flex items-center group/btn bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800  font-semibold px-8 py-4 rounded-2xl text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 whitespace-nowrap"
                >
                  Ver Menú
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>

              {/* Decoración inferior */}
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tr from-red-500/20 to-transparent rounded-tl-full -mr-20 -mb-20"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Menu;
