import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import NavbarDashboard from '../Components/NavbarDashboard';
import FooterPersonal from '../Components/FooterPersonal';
import AjustesModal from './Dashboard/AjustesPersonal'; // NUEVO

const Dashboard = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [ajustesModalOpen, setAjustesModalOpen] = useState(false);


  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="flex flex-1 overflow-hidden">
        {/* 📱 Toggle Mobile */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden fixed top-6 left-6 z-50 p-3 bg-[var(--primario)] text-white rounded-2xl shadow-2xl hover:shadow-3xl transition-all border border-red-500/30"
        >
          <svg className={`w-6 h-6 ${mobileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* 🧩 NAVBAR FIJO */}
        <div className="w-auto flex-shrink-0 border-r border-red-500/30 z-49 bg-gradient-to-b from-[var(--primario)] to-[var(--primario)]/90">
          <NavbarDashboard isMobileOpen={mobileOpen} onToggle={setMobileOpen} ajustesModalOpen={ajustesModalOpen}      // ← AGREGAR
          setAjustesModalOpen={setAjustesModalOpen}/>
        </div>

        {/* 📄 CONTENIDO CAMBIANTE */}
        <main className="flex-1 p-4 pt-8 bg-[var(--body2)] overflow-y-auto lg:ml-0">
          <Outlet />
        </main>

        {/* 🌑 Overlay Mobile */}
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
        )}
        <AjustesModal isOpen={ajustesModalOpen} onClose={() => setAjustesModalOpen(false)} />
      </div>
      
      {/* 📄 Footer */}
      <FooterPersonal />
    </div>
  );
};

export default Dashboard;