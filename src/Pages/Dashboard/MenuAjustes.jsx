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
    category_id: '',
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
    nombre_categoria: ''
  });

  const [newIngredient, setNewIngredient] = useState({
    item_id: '',
    quantity_required: '',
    unit: 'kg'
  });

  const IMAGE_BASE_URL = API_BASE_URL.replace('/api', '');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [productsRes, categoriesRes, inventoryRes] = await Promise.all([
        fetch(`${API_BASE_URL}/products?action=get_all`),
        fetch(`${API_BASE_URL}/categories?action=get_all`),
        fetch(`${API_BASE_URL}/inventory?action=get_all`)
      ]);

      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();
      const inventoryData = await inventoryRes.json();

      if (!productsData.success) {
        console.error('Error cargando productos:', productsData.error);
      }

      if (!categoriesData.success) {
        console.error('Error cargando categorías:', categoriesData.error);
      }

      if (!inventoryData.success) {
        console.error('Error cargando inventario:', inventoryData.error);
      }

      setProducts(productsData.data || []);
      setCategories(categoriesData.data || []);
      setInventory(inventoryData.data || []);
    } catch (error) {
      console.error('Error cargando información:', error);
      alert('No se pudo cargar la información del menú');
    } finally {
      setLoading(false);
    }
  };

  const fetchProductIngredients = async (productId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/products?action=get_ingredients&product_id=${productId}`
      );

      const result = await response.json();

      return result.success ? result.data || [] : [];
    } catch (error) {
      console.error('Error cargando ingredientes:', error);
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
        nombre: product.nombre || '',
        category_id: String(product.category_id || ''),
        descripcion: product.descripcion || '',
        precio: String(product.precio || ''),
        descuento: product.descuento || 0,
        is_trending: Boolean(Number(product.is_trending)),
        image: null,
        imagePreview: product.image_url
          ? `${IMAGE_BASE_URL}${product.image_url}`
          : '',
        imageToRemove: false,
        ingredients: existingIngredients.map((ingredient) => ({
          item_id: Number(ingredient.item_id),
          ingredient_name: ingredient.nombre,
          quantity_required: Number(ingredient.quantity_required),
          unit: ingredient.unit
        }))
      });
    } else {
      setEditMode(false);
      setSelectedProduct(null);

      setFormData({
        product_id: null,
        nombre: '',
        category_id: categories.length ? String(categories[0].category_id) : '',
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

  const handleModalBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      closeModal();
    }
  };

  const openCategoryModal = (category = null) => {
    const isEditing = category !== null;

    setEditCategoryMode(isEditing);
    setSelectedCategory(category);

    setCategoryFormData({
      category_id: isEditing ? Number(category.category_id) : null,
      nombre_categoria: isEditing
        ? String(category.nombre_categoria || '')
        : ''
    });

    setCategoryModalOpen(true);
  };

  const closeCategoryModal = () => {
    setCategoryModalOpen(false);
    setEditCategoryMode(false);
    setSelectedCategory(null);

    setCategoryFormData({
      category_id: null,
      nombre_categoria: ''
    });
  };

  const handleCategoryModalBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      closeCategoryModal();
    }
  };

  const handleCategoryNameChange = (event) => {
    const nombreNuevo = event.target.value;

    setCategoryFormData((previousData) => ({
      ...previousData,
      nombre_categoria: nombreNuevo
    }));
  };

  const handleCategorySubmit = async (event) => {
    event.preventDefault();

    const nombreCategoria = categoryFormData.nombre_categoria.trim();
    const categoryId = Number(categoryFormData.category_id);

    if (!nombreCategoria) {
      alert('Escribe un nombre para la categoría');
      return;
    }

    if (editCategoryMode && categoryId <= 0) {
      alert('No se encontró el ID de la categoría a actualizar');
      return;
    }

    const categoriaRepetida = categories.some((category) => {
      const nombreActual = String(category.nombre_categoria || '')
        .trim()
        .toLowerCase();

      const esMismoNombre = nombreActual === nombreCategoria.toLowerCase();

      const esOtraCategoria =
        !editCategoryMode ||
        Number(category.category_id) !== categoryId;

      return esMismoNombre && esOtraCategoria;
    });

    if (categoriaRepetida) {
      alert('Ya existe otra categoría con ese nombre');
      return;
    }

    const payload = editCategoryMode
      ? {
          action: 'update',
          category_id: categoryId,
          nombre_categoria: nombreCategoria
        }
      : {
          action: 'create',
          nombre_categoria: nombreCategoria
        };

    console.log('Enviando categoría al backend:', payload);

    try {
      const response = await fetch(`${API_BASE_URL}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const rawText = await response.text();

      let result;

      try {
        result = JSON.parse(rawText);
      } catch {
        console.error('Respuesta inválida de categories.php:', rawText);
        alert('El backend devolvió una respuesta inválida.');
        return;
      }

      console.log('Respuesta de categories.php:', result);

      if (!response.ok || !result.success) {
        alert('Error: ' + (result.error || 'No se pudo guardar la categoría'));
        return;
      }

      await fetchAll();
      closeCategoryModal();

      alert(
        editCategoryMode
          ? 'Categoría actualizada correctamente'
          : 'Categoría creada correctamente'
      );
    } catch (error) {
      console.error('Error guardando categoría:', error);
      alert('Error de conexión con el servidor');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    const confirmDelete = window.confirm(
      '¿Seguro que deseas eliminar esta categoría? Esta acción no se puede deshacer.'
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'delete',
          category_id: Number(categoryId)
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        alert('Error: ' + (result.error || 'No se pudo eliminar la categoría'));
        return;
      }

      await fetchAll();
      alert('Categoría eliminada correctamente');
    } catch (error) {
      console.error('Error eliminando categoría:', error);
      alert('Error de conexión con el servidor');
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen válida');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no puede superar los 5MB');
      return;
    }

    setFormData((previousData) => ({
      ...previousData,
      image: file,
      imagePreview: URL.createObjectURL(file),
      imageToRemove: false
    }));
  };

  const handleRemoveImage = () => {
    setFormData((previousData) => ({
      ...previousData,
      image: null,
      imagePreview: '',
      imageToRemove: editMode
    }));
  };

  const handleIngredientSelect = (event) => {
    const itemId = event.target.value;
    const inventoryItem = inventory.find(
      (item) => Number(item.item_id) === Number(itemId)
    );

    setNewIngredient({
      item_id: itemId,
      quantity_required: '',
      unit: inventoryItem?.unit || 'kg'
    });
  };

  const createNewIngredient = async () => {
    const ingredientName = newIngredientData.nombre.trim();

    if (!ingredientName) {
      alert('Ingresa un nombre para el ingrediente');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/inventory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'create',
          nombre: ingredientName,
          tipo: newIngredientData.tipo,
          unit: newIngredientData.unit
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        alert('Error: ' + (result.error || 'No se pudo crear el ingrediente'));
        return;
      }

      setShowNewIngredientForm(false);
      setNewIngredientData({
        nombre: '',
        tipo: 'ingredient',
        unit: 'kg'
      });

      await fetchAll();
      alert('Ingrediente creado correctamente');
    } catch (error) {
      console.error('Error creando ingrediente:', error);
      alert('Error de conexión');
    }
  };

  const addIngredient = () => {
    if (!newIngredient.item_id || !newIngredient.quantity_required) {
      alert('Selecciona un ingrediente e indica la cantidad');
      return;
    }

    const inventoryItem = inventory.find(
      (item) => Number(item.item_id) === Number(newIngredient.item_id)
    );

    if (!inventoryItem) {
      alert('Ingrediente no encontrado en inventario');
      return;
    }

    const ingredientExists = formData.ingredients.some(
      (ingredient) =>
        Number(ingredient.item_id) === Number(newIngredient.item_id)
    );

    if (ingredientExists) {
      alert('Este ingrediente ya está agregado');
      return;
    }

    setFormData((previousData) => ({
      ...previousData,
      ingredients: [
        ...previousData.ingredients,
        {
          item_id: Number(newIngredient.item_id),
          ingredient_name: inventoryItem.nombre,
          quantity_required: Number(newIngredient.quantity_required),
          unit: newIngredient.unit || inventoryItem.unit
        }
      ]
    }));

    setNewIngredient({
      item_id: '',
      quantity_required: '',
      unit: 'kg'
    });
  };

  const removeIngredient = (index) => {
    setFormData((previousData) => ({
      ...previousData,
      ingredients: previousData.ingredients.filter(
        (_, ingredientIndex) => ingredientIndex !== index
      )
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.category_id) {
      alert('Selecciona una categoría');
      return;
    }

    const productFormData = new FormData();

    productFormData.append('action', editMode ? 'update' : 'create');
    productFormData.append('product_id', formData.product_id || '');
    productFormData.append('nombre', formData.nombre);
    productFormData.append('category_id', formData.category_id);
    productFormData.append('descripcion', formData.descripcion);
    productFormData.append('precio', formData.precio);
    productFormData.append('descuento', formData.descuento);
    productFormData.append('is_trending', formData.is_trending ? '1' : '0');
    productFormData.append('ingredients', JSON.stringify(formData.ingredients));

    if (formData.image) {
      productFormData.append('image', formData.image);
    }

    if (editMode && formData.imageToRemove) {
      productFormData.append('remove_image', 'true');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        body: productFormData
      });

      const rawText = await response.text();

      let result;

      try {
        result = JSON.parse(rawText);
      } catch {
        console.error('Respuesta inválida de products.php:', rawText);
        alert('El servidor no devolvió un JSON válido.');
        return;
      }

      if (!response.ok || !result.success) {
        alert(
          'Error devuelto por el servidor: ' +
          (result.error || 'Error desconocido')
        );
        return;
      }

      closeModal();
      await fetchAll();

      alert(editMode ? 'Producto actualizado correctamente' : 'Producto creado correctamente');
    } catch (error) {
      console.error('Error guardando producto:', error);
      alert('Error de conexión con el servidor');
    }
  };

  const handleDeleteProduct = async (productId) => {
    const confirmDelete = window.confirm(
      '¿Seguro que deseas eliminar este producto?'
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'delete',
          product_id: productId
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        alert('Error: ' + (result.error || 'No se pudo eliminar el producto'));
        return;
      }

      await fetchAll();
      alert('Producto eliminado correctamente');
    } catch (error) {
      console.error('Error eliminando producto:', error);
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
          <h1 className="text-3xl md:text-4xl font-black text-white">
            🍔 Ajustes Menú
          </h1>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => openCategoryModal()}
              className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-4 md:px-6 py-2 md:py-3 rounded-2xl font-bold hover:scale-105 transition-transform text-sm md:text-base"
            >
              📂 Nueva Categoría
            </button>

            <button
              type="button"
              onClick={() => openModal()}
              className="bg-gradient-to-r from-red-600 to-red-800 text-white px-4 md:px-6 py-2 md:py-3 rounded-2xl font-bold hover:scale-105 transition-transform text-sm md:text-base"
            >
              ➕ Nuevo Producto
            </button>
          </div>
        </div>

        {/* CATEGORÍAS */}
        <div className="mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-black text-white mb-4">
            📂 Categorías
          </h2>

          {categories.length === 0 ? (
            <div className="bg-[var(--primario)]/80 rounded-3xl p-6 text-white/70">
              No hay categorías creadas.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <div
                  key={category.category_id}
                  className="bg-[var(--primario)]/80 rounded-3xl p-4 md:p-6 shadow-xl flex justify-between items-center"
                >
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-white capitalize">
                      {category.nombre_categoria || 'Sin nombre'}
                    </h3>

                    <p className="text-white/60 text-xs md:text-sm">
                      ID: {category.category_id}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => openCategoryModal(category)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-4 py-2 rounded-xl font-bold transition-colors text-sm md:text-base"
                      title="Editar categoría"
                    >
                      ✏️
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(category.category_id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 md:px-4 py-2 rounded-xl font-bold transition-colors text-sm md:text-base"
                      title="Eliminar categoría"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PRODUCTOS */}
        <div>
          <h2 className="text-xl md:text-2xl font-black text-white mb-4">
            🍔 Productos
          </h2>

          {products.length === 0 ? (
            <div className="bg-[var(--primario)]/80 rounded-3xl p-6 text-white/70">
              No hay productos creados.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {products.map((product) => (
                <div
                  key={product.product_id}
                  className="bg-[var(--primario)]/90 rounded-3xl overflow-hidden shadow-xl"
                >
                  {product.image_url && (
                    <img
                      src={`${IMAGE_BASE_URL}${product.image_url}`}
                      alt={product.nombre}
                      className="w-full h-40 md:h-48 object-cover"
                      onError={(event) => {
                        event.currentTarget.style.display = 'none';
                      }}
                    />
                  )}

                  <div className="p-4 md:p-6">
                    <h3 className="text-xl md:text-2xl font-black text-white mb-2">
                      {product.nombre}
                    </h3>

                    <p className="text-white/70 text-xs md:text-sm mb-4 capitalize">
                      {product.nombre_categoria || 'Sin categoría'}
                    </p>

                    <div className="flex justify-between items-center">
                      <span className="text-2xl md:text-3xl font-bold text-white">
                        ${product.precio}
                      </span>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openModal(product)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-4 py-2 rounded-xl font-bold transition-colors text-sm md:text-base"
                        >
                          ✏️
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(product.product_id)}
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
          )}
        </div>
      </div>

      {/* MODAL PRODUCTO */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={handleModalBackdropClick}
        >
          <div className="bg-[var(--primario)] rounded-3xl p-6 md:p-8 max-w-2xl w-full my-4 md:my-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={closeModal}
              className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl"
            >
              ✕
            </button>

            <h2 className="text-2xl md:text-3xl font-black text-white mb-6">
              {editMode ? 'Editar Producto' : 'Nuevo Producto'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-white font-bold block mb-2">
                  Nombre *
                </label>

                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(event) =>
                    setFormData((previousData) => ({
                      ...previousData,
                      nombre: event.target.value
                    }))
                  }
                  className="w-full px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20 focus:border-white/50"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-white font-bold block mb-2">
                    Categoría *
                  </label>

                  <select
                    value={formData.category_id}
                    onChange={(event) =>
                      setFormData((previousData) => ({
                        ...previousData,
                        category_id: event.target.value
                      }))
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20"
                    required
                  >
                    <option value="">Seleccionar categoría</option>

                    {categories.map((category) => (
                      <option
                        key={category.category_id}
                        value={category.category_id}
                      >
                        {category.nombre_categoria}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-white font-bold block mb-2">
                    Precio *
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.precio}
                    onChange={(event) =>
                      setFormData((previousData) => ({
                        ...previousData,
                        precio: event.target.value
                      }))
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-white font-bold block mb-2">
                  Descripción
                </label>

                <textarea
                  value={formData.descripcion}
                  onChange={(event) =>
                    setFormData((previousData) => ({
                      ...previousData,
                      descripcion: event.target.value
                    }))
                  }
                  className="w-full px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20"
                  rows="3"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-white font-bold block mb-2">
                    Descuento %
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={formData.descuento}
                    onChange={(event) =>
                      setFormData((previousData) => ({
                        ...previousData,
                        descuento: Number(event.target.value) || 0
                      }))
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20"
                  />
                </div>

                <div className="flex items-center gap-2 pt-7">
                  <input
                    id="is_trending"
                    type="checkbox"
                    checked={formData.is_trending}
                    onChange={(event) =>
                      setFormData((previousData) => ({
                        ...previousData,
                        is_trending: event.target.checked
                      }))
                    }
                    className="w-6 h-6"
                  />

                  <label
                    htmlFor="is_trending"
                    className="text-white font-bold"
                  >
                    Trending ⭐
                  </label>
                </div>
              </div>

              <div>
                <label className="text-white font-bold block mb-2">
                  Imagen
                </label>

                {formData.imagePreview && (
                  <div className="relative mb-3 w-32">
                    <img
                      src={formData.imagePreview}
                      alt="Vista previa"
                      className="w-32 h-32 object-cover rounded-xl border-2 border-white/20"
                    />

                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white w-8 h-8 rounded-full font-bold shadow-lg"
                    >
                      ✕
                    </button>
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20"
                />

                {formData.image && (
                  <p className="text-white/60 text-sm mt-2">
                    {formData.image.name}
                  </p>
                )}
              </div>

              {/* INGREDIENTES */}
              <div className="border-t border-white/20 pt-4">
                <div className="flex justify-between items-center gap-3 mb-4">
                  <h3 className="text-xl font-black text-white">
                    🥗 Ingredientes
                  </h3>

                  <button
                    type="button"
                    onClick={() =>
                      setShowNewIngredientForm((currentValue) => !currentValue)
                    }
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-bold transition-colors text-sm"
                  >
                    ➕ Crear Ingrediente
                  </button>
                </div>

                {showNewIngredientForm && (
                  <div className="bg-white/10 p-4 rounded-xl mb-4 space-y-3">
                    <h4 className="text-white font-bold">
                      Nuevo Ingrediente
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        placeholder="Nombre"
                        value={newIngredientData.nombre}
                        onChange={(event) =>
                          setNewIngredientData((previousData) => ({
                            ...previousData,
                            nombre: event.target.value
                          }))
                        }
                        className="w-full px-3 py-2 rounded-xl bg-white/20 text-white border border-white/20 text-sm"
                      />

                      <select
                        value={newIngredientData.tipo}
                        onChange={(event) =>
                          setNewIngredientData((previousData) => ({
                            ...previousData,
                            tipo: event.target.value
                          }))
                        }
                        className="w-full px-3 py-2 rounded-xl bg-white/20 text-white border border-white/20 text-sm"
                      >
                        <option value="ingredient">Ingrediente</option>
                        <option value="complement">Complemento</option>
                      </select>

                      <select
                        value={newIngredientData.unit}
                        onChange={(event) =>
                          setNewIngredientData((previousData) => ({
                            ...previousData,
                            unit: event.target.value
                          }))
                        }
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

                    {inventory.map((item) => (
                      <option key={item.item_id} value={item.item_id}>
                        {item.nombre} ({item.unit})
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Cantidad"
                    value={newIngredient.quantity_required}
                    onChange={(event) =>
                      setNewIngredient((previousData) => ({
                        ...previousData,
                        quantity_required: event.target.value
                      }))
                    }
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
                    {formData.ingredients.map((ingredient, index) => (
                      <div
                        key={`${ingredient.item_id}-${index}`}
                        className="flex justify-between items-center bg-white/10 p-3 rounded-xl"
                      >
                        <span className="text-white text-sm md:text-base">
                          {ingredient.ingredient_name} —{' '}
                          {ingredient.quantity_required} {ingredient.unit}
                        </span>

                        <button
                          type="button"
                          onClick={() => removeIngredient(index)}
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
                {editMode ? '💾 Actualizar producto' : '✅ Crear producto'}
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
            <button
              type="button"
              onClick={closeCategoryModal}
              className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl"
            >
              ✕
            </button>

            <h2 className="text-2xl md:text-3xl font-black text-white mb-6">
              {editCategoryMode ? 'Editar Categoría' : 'Nueva Categoría'}
            </h2>

            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="nombre_categoria"
                  className="text-white font-bold block mb-2"
                >
                  Nombre *
                </label>

                <input
                  id="nombre_categoria"
                  name="nombre_categoria"
                  type="text"
                  value={categoryFormData.nombre_categoria}
                  onChange={handleCategoryNameChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20 focus:border-white/50 outline-none"
                  placeholder="Ej: postres"
                  autoComplete="off"
                  autoFocus
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white py-4 rounded-2xl font-black text-xl hover:scale-105 transition-transform"
              >
                {editCategoryMode
                  ? '💾 Guardar cambios'
                  : '✅ Crear categoría'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuAjustes;