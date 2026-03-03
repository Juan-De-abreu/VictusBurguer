import React, { useState, useEffect } from 'react';

const Cocina = () => {
    const [inventario, setInventario] = useState([]);
    const [tareas, setTareas] = useState([]);
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);

    const API_BASE = "http://localhost:8081/victus-backend/api";

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [invRes, taskRes, prodRes] = await Promise.all([
                fetch(`${API_BASE}/inventory`),
                fetch(`${API_BASE}/tasks`),
                fetch(`${API_BASE}/products`)
            ]);
            setInventario(await invRes.json());
            setTareas(await taskRes.json());
            setProductos(await prodRes.json());
            setLoading(false);
        } catch (error) {
            console.error("Error cargando datos de cocina:", error);
        }
    };

    const toggleTarea = async (id, estadoActual) => {
        await fetch(`${API_BASE}/tasks`, {
            method: 'PATCH',
            body: JSON.stringify({ id, estado: estadoActual === 1 ? 0 : 1 })
        });
        fetchData(); // Recargar datos
    };

    const toggleProducto = async (id, dispActual) => {
        await fetch(`${API_BASE}/toggle-availability`, {
            method: 'POST',
            body: JSON.stringify({ id, disponible: dispActual === 1 ? 0 : 1 })
        });
        fetchData();
    };

    if (loading) return <div className="pt-32 text-center text-white">Cargando Panel de Control...</div>;

    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white pt-28 px-6 pb-10">
            <h1 className="text-3xl font-bold mb-8 border-b border-red-900 pb-2">👨‍🍳 Panel de Control Cocina</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* SECCIÓN 1: INVENTARIO Y DISPONIBILIDAD */}
                <div className="bg-[#1a1a1a] p-6 rounded-2xl shadow-xl">
                    <h2 className="text-xl font-bold mb-4 text-red-500">Gestión de Platos (Disponibilidad)</h2>
                    <div className="space-y-3">
                        {productos.map(p => (
                            <div key={p.product_id} className="flex justify-between items-center p-3 bg-black/30 rounded-lg">
                                <span>{p.nombre}</span>
                                <button 
                                    onClick={() => toggleProducto(p.product_id, p.disponible)}
                                    className={`px-4 py-1 rounded-full text-xs font-bold transition ${p.disponible ? 'bg-green-600' : 'bg-red-600'}`}
                                >
                                    {p.disponible ? 'DISPONIBLE' : 'AGOTADO'}
                                </button>
                            </div>
                        ))}
                    </div>

                    <h2 className="text-xl font-bold mt-8 mb-4 text-orange-500">Stock de Ingredientes</h2>
                    <div className="grid grid-cols-2 gap-4">
                        {inventario.map(i => (
                            <div key={i.id_ingrediente} className="p-3 bg-black/20 border border-white/10 rounded-lg">
                                <p className="text-sm text-gray-400">{i.nombre}</p>
                                <p className="text-lg font-mono">{i.stock_actual} <span className="text-xs">{i.unidad_medida}</span></p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* SECCIÓN 2: TAREAS */}
                <div className="bg-[#1a1a1a] p-6 rounded-2xl shadow-xl">
                    <h2 className="text-xl font-bold mb-4 text-blue-500">Lista de Tareas</h2>
                    
                    <div className="space-y-6">
                        {/* Pendientes */}
                        <div>
                            <h3 className="text-sm uppercase text-gray-500 mb-2">Pendientes</h3>
                            {tareas.filter(t => t.estado === 0).map(t => (
                                <div key={t.id_tarea} className="flex items-center gap-3 p-3 mb-2 bg-red-900/10 border-l-4 border-red-600 rounded">
                                    <input type="checkbox" onChange={() => toggleTarea(t.id_tarea, t.estado)} />
                                    <span className="flex-grow">{t.descripcion}</span>
                                    <span className="text-[10px] bg-red-600 px-2 py-1 rounded">{t.prioridad}</span>
                                </div>
                            ))}
                        </div>

                        {/* Terminadas */}
                        <div>
                            <h3 className="text-sm uppercase text-gray-500 mb-2">Terminadas</h3>
                            {tareas.filter(t => t.estado === 1).map(t => (
                                <div key={t.id_tarea} className="flex items-center gap-3 p-3 mb-2 bg-green-900/10 border-l-4 border-green-600 rounded opacity-50">
                                    <input type="checkbox" checked readOnly onClick={() => toggleTarea(t.id_tarea, t.estado)} />
                                    <span className="line-through">{t.descripcion}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cocina;