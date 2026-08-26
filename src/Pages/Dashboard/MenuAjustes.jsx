import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../config/api';

const MenuAjustes = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editCategoryMode, setEditCategoryMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showNewIngredientForm, setShowNewIngredientForm] = useState(false);
  const [newIngredientData, setNewIngredientData] = useState({
    nombre: '',
    tipo: 'ingredient',
    unit: 'kg'
  });

  const [formData, setFormData] = useState({
    product_id: null,
    nombre: '',
    category_id: '1',
    descripcion: '',
    precio: '',
    descuento: 0,
    is_trending: false,
    image: null,
    imagePreview: '',
    imageToRemove: false,
    ingredients: []
  });

  const [categoryFormData, setCategoryFormData] = useState({
    category_id: null,
    nombre_categoria: 'desayuno'
  });

  const [newIngredient, setNewIngredient] = useState({
    item_id: '',
    quantity_required: '',
    unit: 'kg'
  });

  // URL base para imágenes (sin /api)
  const IMAGE_BASE_URL = API_BASE_URL.replace('/api', '');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [productsRes, categoriesRes, inventoryRes] = await Promise.all([
        fetch(`${API_BASE_URL}/products?action=get_all`),
        fetch(`${API_BASE_URL}/products?action=get_categories`),
        fetch(`${API_BASE_URL}/inventory?action=get_all`)
      ]);

      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();
      const inventoryData = await inventoryRes.json();

      setProducts(productsData.data || []);
      setCategories(categoriesData.data || []);
      setInventory(inventoryData.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductIngredients = async (productId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/products?action=get_ingredients&product_id=${productId}`);
      const result = await res.json();
      return result.data || [];
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  const openModal = async (product = null) => {
    if (product) {
      setEditMode(true);
      setSelectedProduct(product);
      
      const existingIngredients = await fetchProductIngredients(product.product_id);
      
      setFormData({
        product_id: product.product_id,
        nombre: product.nombre,
        category_id: String(product.category_id),
        descripcion: product.descripcion || '',
        precio: String(product.precio),
        descuento: product.descuento || 0,
        is_trending: !!product.is_trending,
        image: null,
        imagePreview: product.image_url ? `${IMAGE_BASE_URL}${product.image_url}` : '',
        imageToRemove: false,
        ingredients: existingIngredients.map(ing => ({
          item_id: ing.item_id,
          ingredient_name: ing.nombre,
          quantity_required: ing.quantity_required,
          unit: ing.unit
        }))
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
        image: null,
        imagePreview: '',
        imageToRemove: false,
        ingredients: []
      });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedProduct(null);
    setShowNewIngredientForm(false);
  };

  const handleModalBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  const openCategoryModal = (category = null) => {
    if (category) {
      setEditCategoryMode(true);
      setSelectedCategory(category);
      setCategoryFormData({
        category_id: category.category_id,
        nombre_categoria: category.nombre_categoria
      });
    } else {
      setEditCategoryMode(false);
      setSelectedCategory(null);
      setCategoryFormData({
        category_id: null,
        nombre_categoria: 'desayuno'
      });
    }
    setCategoryModalOpen(true);
  };

  const closeCategoryModal = () => {
    setCategoryModalOpen(false);
    setSelectedCategory(null);
  };

  const handleCategoryModalBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      closeCategoryModal();
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona una imagen válida');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no puede superar los 5MB');
        return;
      }

      setFormData({
        ...formData,
        image: file,
        imagePreview: URL.createObjectURL(file),
        imageToRemove: false
      });
    }
  };

  const handleRemoveImage = () => {
    setFormData({
      ...formData,
      image: null,
      imagePreview: '',
      imageToRemove: editMode
    });
  };

  const handleIngredientSelect = (e) => {
    const itemId = e.target.value;
    const invItem = inventory.find(i => i.item_id === parseInt(itemId));
    
    if (invItem) {
      setNewIngredient({
        item_id: itemId,
        quantity_required: '',
        unit: invItem.unit
      });
    } else {
      setNewIngredient({
        item_id: itemId,
        quantity_required: '',
        unit: 'kg'
      });
    }
  };

  const createNewIngredient = async () => {
    if (!newIngredientData.nombre.trim()) {
      alert('Ingresa un nombre para el ingrediente');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/inventory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          nombre: newIngredientData.nombre,
          tipo: newIngredientData.tipo,
          unit: newIngredientData.unit
        })
      });

      const result = await res.json();
      if (result.success) {
        alert('Ingrediente creado');
        setShowNewIngredientForm(false);
        setNewIngredientData({ nombre: '', tipo: 'ingredient', unit: 'kg' });
        fetchAll();
      } else {
        alert('Error: ' + result.error);
      }
    } catch (err) {
      alert('Error de conexión');
    }
  };

  const addIngredient = () => {
    if (!newIngredient.item_id || !newIngredient.quantity_required) return;
    
    const invItem = inventory.find(i => i.item_id === parseInt(newIngredient.item_id));
    if (!invItem) return;

    const exists = formData.ingredients.some(ing => ing.item_id === parseInt(newIngredient.item_id));
    if (exists) {
      alert('Este ingrediente ya está agregado');
      return;
    }

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

    setNewIngredient({ item_id: '', quantity_required: '', unit: invItem?.unit || 'kg' });
  };

  const removeIngredient = (index) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataImg = new FormData();
    formDataImg.append('action', editMode ? 'update' : 'create');
    formDataImg.append('product_id', formData.product_id || '');
    formDataImg.append('nombre', formData.nombre);
    formDataImg.append('category_id', formData.category_id);
    formDataImg.append('descripcion', formData.descripcion);
    formDataImg.append('precio', formData.precio);
    formDataImg.append('descuento', formData.descuento);
    formDataImg.append('is_trending', formData.is_trending ? 1 : 0);
    
    if (formData.image) {
      formDataImg.append('image', formData.image);
    }
    
    if (editMode && formData.imageToRemove) {
      formDataImg.append('remove_image', 'true');
    }
    
    formDataImg.append('ingredients', JSON.stringify(formData.ingredients));

    try {
      const res = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        body: formDataImg
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

  const handleCategorySubmit = async (e) => {
    e.preventDefault();

    const existingCategories = categories.map(c => c.nombre_categoria.toLowerCase());
    const newCategoryName = categoryFormData.nombre_categoria.toLowerCase();

    if (!editCategoryMode && existingCategories.includes(newCategoryName)) {
      alert('Esta categoría ya existe. Elige otro nombre');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: editCategoryMode ? 'update_category' : 'create_category',
          category_id: categoryFormData.category_id,
          nombre_categoria: categoryFormData.nombre_categoria
        })
      });

      const result = await res.json();
      if (result.success) {
        alert(editCategoryMode ? 'Categoría actualizada' : 'Categoría creada');
        closeCategoryModal();
        fetchAll();
      } else {
        alert('Error: ' + result.error);
      }
    } catch (err) {
      alert('Error de conexión');
    }
  };

  const handleDeleteProduct = async (product_id) => {
    if (!confirm('¿Seguro que deseas eliminar este producto?')) return;

    try {
      const res = await fetch(`${API_BASE_URL}/products`, {
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

  const handleDeleteCategory = async (category_id) => {
    if (!confirm('¿Seguro que deseas eliminar esta categoría?')) return;

    try {
      const res = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_category', category_id })
      });

      const result = await res.json();
      if (result.success) {
        alert('Categoría eliminada');
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
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-white">🍔 Ajustes Menú</h1>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => openCategoryModal()}
              className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-4 md:px-6 py-2 md:py-3 rounded-2xl font-bold hover:scale-105 transition-transform text-sm md:text-base"
            >
              📂 Nueva Categoría
            </button>
            <button
              onClick={() => openModal()}
              className="bg-gradient-to-r from-red-600 to-red-800 text-white px-4 md:px-6 py-2 md:py-3 rounded-2xl font-bold hover:scale-105 transition-transform text-sm md:text-base"
            >
              ➕ Nuevo Producto
            </button>
          </div>
        </div>

        {/* CATEGORÍAS */}
        <div className="mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-black text-white mb-4">📂 Categorías</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div key={cat.category_id} className="bg-[var(--primario)]/80 rounded-3xl p-4 md:p-6 shadow-xl flex justify-between items-center">
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-white capitalize">{cat.nombre_categoria}</h3>
                  <p className="text-white/60 text-xs md:text-sm">ID: {cat.category_id}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openCategoryModal(cat)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-4 py-2 rounded-xl font-bold transition-colors text-sm md:text-base"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(cat.category_id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 md:px-4 py-2 rounded-xl font-bold transition-colors text-sm md:text-base"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PRODUCTOS */}
        <div>
          <h2 className="text-xl md:text-2xl font-black text-white mb-4">🍔 Productos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {products.map((p) => (
              <div key={p.product_id} className="bg-[var(--primario)]/90 rounded-3xl overflow-hidden shadow-xl">
                {p.image_url && (
                  <img 
                    src={`${IMAGE_BASE_URL}${p.image_url}`} 
                    alt={p.nombre} 
                    className="w-full h-40 md:h-48 object-cover"
                    onError={(e) => {
                      console.error('Error cargando imagen:', `${IMAGE_BASE_URL}${p.image_url}`);
                      e.target.style.display = 'none';
                    }}
                  />
                )}
                <div className="p-4 md:p-6">
                  <h3 className="text-xl md:text-2xl font-black text-white mb-2">{p.nombre}</h3>
                  <p className="text-white/70 text-xs md:text-sm mb-4 capitalize">{p.nombre_categoria || 'Sin categoría'}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl md:text-3xl font-bold text-white">${p.precio}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal(p)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-4 py-2 rounded-xl font-bold transition-colors text-sm md:text-base"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.product_id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 md:px-4 py-2 rounded-xl font-bold transition-colors text-sm md:text-base"
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
      </div>

      {/* MODAL PRODUCTO */}
      {modalOpen && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={handleModalBackdropClick}
        >
          <div className="bg-[var(--primario)] rounded-3xl p-6 md:p-8 max-w-2xl w-full my-4 md:my-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={closeModal} className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl">✕</button>
            <h2 className="text-2xl md:text-3xl font-black text-white mb-6">{editMode ? 'Editar Producto' : 'Nuevo Producto'}</h2>

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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-white font-bold block mb-2">Categoría *</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20"
                  >
                    {categories.map((cat) => (
                      <option key={cat.category_id} value={cat.category_id}>
                        {cat.nombre_categoria}
                      </option>
                    ))}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <label className="text-white font-bold">Trending ⭐</label>
                </div>
              </div>

              <div>
                <label className="text-white font-bold block mb-2">Imagen</label>
                
                {formData.imagePreview && (
                  <div className="relative mb-3">
                    <img 
                      src={formData.imagePreview} 
                      alt="Preview" 
                      className="w-32 h-32 object-cover rounded-xl border-2 border-white/20" 
                    />
                    {editMode && (
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white w-8 h-8 rounded-full font-bold shadow-lg"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="flex-1 px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20"
                  />
                  {formData.image && (
                    <span className="text-white/60 text-sm">
                      {formData.image.name}
                    </span>
                  )}
                </div>
                
                {editMode && formData.imagePreview && !formData.image && (
                  <p className="text-white/60 text-xs mt-1">
                    ℹ️ Mantén la imagen actual o sube una nueva
                  </p>
                )}
              </div>

              {/* INGREDIENTES */}
              <div className="border-t border-white/20 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-black text-white">🥗 Ingredientes</h3>
                  <button
                    type="button"
                    onClick={() => setShowNewIngredientForm(!showNewIngredientForm)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-bold transition-colors text-sm"
                  >
                    ➕ Crear Ingrediente
                  </button>
                </div>

                {showNewIngredientForm && (
                  <div className="bg-white/10 p-4 rounded-xl mb-4 space-y-3">
                    <h4 className="text-white font-bold">Nuevo Ingrediente</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        placeholder="Nombre"
                        value={newIngredientData.nombre}
                        onChange={(e) => setNewIngredientData({ ...newIngredientData, nombre: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white/20 text-white border border-white/20 text-sm"
                      />
                      <select
                        value={newIngredientData.tipo}
                        onChange={(e) => setNewIngredientData({ ...newIngredientData, tipo: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white/20 text-white border border-white/20 text-sm"
                      >
                        <option value="ingredient">Ingrediente</option>
                        <option value="complement">Complemento</option>
                      </select>
                      <select
                        value={newIngredientData.unit}
                        onChange={(e) => setNewIngredientData({ ...newIngredientData, unit: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white/20 text-white border border-white/20 text-sm"
                      >
                        <option value="kg">kg</option>
                        <option value="g">g</option>
                        <option value="l">l</option>
                        <option value="ml">ml</option>
                        <option value="unid">unid</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={createNewIngredient}
                      className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-bold transition-colors"
                    >
                      Guardar Ingrediente
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <select
                    value={newIngredient.item_id}
                    onChange={handleIngredientSelect}
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
                        <span className="text-white text-sm md:text-base">{ing.ingredient_name} - {ing.quantity_required} {ing.unit}</span>
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

      {/* MODAL CATEGORÍA */}
      {categoryModalOpen && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={handleCategoryModalBackdropClick}
        >
          <div className="bg-[var(--primario)] rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative">
            <button onClick={closeCategoryModal} className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl">✕</button>
            <h2 className="text-2xl md:text-3xl font-black text-white mb-6">{editCategoryMode ? 'Editar Categoría' : 'Nueva Categoría'}</h2>

            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div>
                <label className="text-white font-bold block mb-2">Nombre *</label>
                <input
                  type="text"
                  value={categoryFormData.nombre_categoria}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, nombre_categoria: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20 focus:border-white/50"
                  placeholder="Ej: postres"
                  required
                  disabled={editCategoryMode}
                />
                {editCategoryMode && (
                  <p className="text-white/60 text-xs mt-1">ℹ️ El nombre no se puede editar, solo eliminar y crear nueva</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white py-4 rounded-2xl font-black text-xl hover:scale-105 transition-transform"
              >
                {editCategoryMode ? '💾 Guardar' : '✅ Crear'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuAjustes;