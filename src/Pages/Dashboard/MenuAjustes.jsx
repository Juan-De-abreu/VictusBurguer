import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../config/api';

const MenuAjustes = () => {
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [formData, setFormData] = useState({
    product_id: null,
    nombre: '',
    category_id: '1',
    descripcion: '',
    precio: '',
    descuento: 0,
    is_trending: false,
    disponible: true,
    image: null,
    imagePreview: '',
    ingredients: []
  });

  const [newIngredient, setNewIngredient] = useState({
    item_id: '',
    quantity_required: '',
    unit: 'unid'
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [productsRes, inventoryRes] = await Promise.all([
        fetch(`${API_BASE_URL}/menu_ajustes?action=get_all`),
        fetch(`${API_BASE_URL}/menu_ajustes?action=get_inventory`)
      ]);

      const productsData = await productsRes.json();
      const inventoryData = await inventoryRes.json();

      setProducts(productsData.data || []);
      setInventory(inventoryData.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (product = null) => {
    if (product) {
      setEditMode(true);
      setSelectedProduct(product);
      setFormData({
        product_id: product.product_id,
        nombre: product.nombre,
        category_id: String(product.category_id),
        descripcion: product.descripcion || '',
        precio: String(product.precio),
        descuento: product.descuento || 0,
        is_trending: !!product.is_trending,
        disponible: !!product.disponible,
        image: null,
        imagePreview: product.image_url || '',
        ingredients: []
      });
    } else {
      setEditMode(false);
      setSelectedProduct(null);
      setFormData({
        product_id: null,
        nombre: '',
        category_id: '1',
        descripcion: '',
        precio: '',
        descuento: 0,
        is_trending: false,
        disponible: true,
        image: null,
        imagePreview: '',
        ingredients: []
      });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedProduct(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        image: file,
        imagePreview: URL.createObjectURL(file)
      });
    }
  };

  const addIngredient = () => {
    if (!newIngredient.item_id || !newIngredient.quantity_required) return;
    
    const invItem = inventory.find(i => i.item_id === parseInt(newIngredient.item_id));
    if (!invItem) return;

    setFormData({
      ...formData,
      ingredients: [
        ...formData.ingredients,
        {
          item_id: parseInt(newIngredient.item_id),
          ingredient_name: invItem.nombre,
          quantity_required: parseFloat(newIngredient.quantity_required),
          unit: newIngredient.unit || invItem.unit
        }
      ]
    });

    setNewIngredient({ item_id: '', quantity_required: '', unit: 'unid' });
  };

  const removeIngredient = (index) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = new FormData();
    payload.append('action', editMode ? 'update' : 'create');
    payload.append('product_id', formData.product_id || '');
    payload.append('nombre', formData.nombre);
    payload.append('category_id', formData.category_id);
    payload.append('descripcion', formData.descripcion);
    payload.append('precio', formData.precio);
    payload.append('descuento', formData.descuento);
    payload.append('is_trending', formData.is_trending ? 1 : 0);
    payload.append('disponible', formData.disponible ? 1 : 0);
    if (formData.image) {
      payload.append('image', formData.image);
    }
    if (editMode && !formData.image && !formData.imagePreview) {
      payload.append('remove_image', 'true');
    }
    payload.append('ingredients', JSON.stringify(formData.ingredients));

    try {
      const res = await fetch(`${API_BASE_URL}/menu_ajustes`, {
        method: 'POST',
        body: payload
      });

      const result = await res.json();
      if (result.success) {
        alert(editMode ? 'Producto actualizado' : 'Producto creado');
        closeModal();
        fetchAll();
      } else {
        alert('Error: ' + result.error);
      }
    } catch (err) {
      alert('Error de conexión');
    }
  };

  const handleDelete = async (product_id) => {
    if (!confirm('¿Seguro que deseas eliminar este producto?')) return;

    try {
      const res = await fetch(`${API_BASE_URL}/menu_ajustes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', product_id })
      });

      const result = await res.json();
      if (result.success) {
        alert('Producto eliminado');
        fetchAll();
      } else {
        alert('Error: ' + result.error);
      }
    } catch (err) {
      alert('Error de conexión');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--body)]">
        <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--body)] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-black text-white">🍔 Ajustes Menú</h1>
          <button
            onClick={() => openModal()}
            className="bg-gradient-to-r from-red-600 to-red-800 text-white px-6 py-3 rounded-2xl font-bold hover:scale-105 transition-transform"
          >
            ➕ Nuevo Producto
          </button>
        </div>

        {/* LISTA PRODUCTOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <div key={p.product_id} className="bg-[var(--primario)]/10 rounded-3xl overflow-hidden shadow-xl">
              {p.image_url && (
                <img src={p.image_url} alt={p.nombre} className="w-full h-48 object-cover" />
              )}
              <div className="p-6">
                <h3 className="text-2xl font-black text-white mb-2">{p.nombre}</h3>
                <p className="text-white/70 text-sm mb-4">{p.category_name || 'Sin categoría'}</p>
                <div className="flex justify-between items-center">
                  <span className="text-3xl font-bold text-white">${p.precio}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal(p)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold transition-colors"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(p.product_id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-bold transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-[var(--primario)] rounded-3xl p-8 max-w-2xl w-full my-8 shadow-2xl relative">
            <button onClick={closeModal} className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl">✕</button>
            <h2 className="text-3xl font-black text-white mb-6">{editMode ? 'Editar Producto' : 'Nuevo Producto'}</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-white font-bold block mb-2">Nombre *</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20 focus:border-white/50"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white font-bold block mb-2">Categoría *</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20"
                  >
                    <option value="1">Desayuno</option>
                    <option value="2">Almuerzo</option>
                    <option value="3">Cena</option>
                  </select>
                </div>
                <div>
                  <label className="text-white font-bold block mb-2">Precio *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.precio}
                    onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-white font-bold block mb-2">Descripción</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20"
                  rows="3"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-white font-bold block mb-2">Descuento %</label>
                  <input
                    type="number"
                    value={formData.descuento}
                    onChange={(e) => setFormData({ ...formData, descuento: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_trending}
                    onChange={(e) => setFormData({ ...formData, is_trending: e.target.checked })}
                    className="w-6 h-6"
                  />
                  <label className="text-white font-bold">Trending</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.disponible}
                    onChange={(e) => setFormData({ ...formData, disponible: e.target.checked })}
                    className="w-6 h-6"
                  />
                  <label className="text-white font-bold">Disponible</label>
                </div>
              </div>

              <div>
                <label className="text-white font-bold block mb-2">Imagen</label>
                {formData.imagePreview && (
                  <img src={formData.imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-xl mb-2" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20"
                />
              </div>

              {/* INGREDIENTES */}
              <div className="border-t border-white/20 pt-4">
                <h3 className="text-xl font-black text-white mb-4">🥗 Ingredientes</h3>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <select
                    value={newIngredient.item_id}
                    onChange={(e) => setNewIngredient({ ...newIngredient, item_id: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20"
                  >
                    <option value="">Seleccionar ingrediente</option>
                    {inventory.map((inv) => (
                      <option key={inv.item_id} value={inv.item_id}>{inv.nombre} ({inv.unit})</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Cantidad"
                    value={newIngredient.quantity_required}
                    onChange={(e) => setNewIngredient({ ...newIngredient, quantity_required: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20"
                  />
                  <button
                    type="button"
                    onClick={addIngredient}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl font-bold transition-colors"
                  >
                    ➕ Agregar
                  </button>
                </div>

                {formData.ingredients.length > 0 && (
                  <div className="space-y-2">
                    {formData.ingredients.map((ing, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-white/10 p-3 rounded-xl">
                        <span className="text-white">{ing.ingredient_name} - {ing.quantity_required} {ing.unit}</span>
                        <button
                          type="button"
                          onClick={() => removeIngredient(idx)}
                          className="text-red-400 hover:text-red-300 font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-red-600 to-red-800 text-white py-4 rounded-2xl font-black text-xl hover:scale-105 transition-transform"
              >
                {editMode ? '💾 Actualizar' : '✅ Crear'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuAjustes;