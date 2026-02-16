// src/components/InventoryCRUD.jsx - VERSIÓN COMPLETA CON CRUD
import React, { useState, useEffect } from 'react';
import { supabase } from "../lib/supabase";
import { 
  Package, Edit, Trash2, Plus, Store, 
  TrendingUp, AlertTriangle, RefreshCw 
} from 'lucide-react';

const InventoryCRUD = () => {
  // Estados
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generalInventory, setGeneralInventory] = useState([]);
  const [branches, setBranches] = useState([]);
  const [activeTab, setActiveTab] = useState('general');
  
  // Estados para modales
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Formularios
  const [addForm, setAddForm] = useState({
    product_id: '',
    quantity: 1,
    min_stock: 10,
    max_stock: 100,
    notes: ''
  });
  
  const [assignForm, setAssignForm] = useState({
    branch_id: '',
    quantity: 1,
    notes: ''
  });

  // ================ CARGAR DATOS ================
  const loadAllData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Cargando datos completos...');
      
      // 1. Cargar productos activos
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          general_inventory (
            quantity,
            min_stock,
            max_stock,
            last_updated
          )
        `)
        .eq('is_active', true)
        .order('product_name');
      
      if (productsError) throw productsError;
      
      // 2. Cargar sucursales activas
      const { data: branchesData, error: branchesError } = await supabase
        .from('branches')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (branchesError) throw branchesError;
      
      // 3. Cargar inventario general (usando TU función read_general_inventory si existe)
      try {
        const { data: inventoryData, error: inventoryError } = await supabase
          .rpc('read_general_inventory', { p_product_id: null });
        
        if (!inventoryError && inventoryData?.success) {
          setGeneralInventory(inventoryData.data.inventory || []);
        }
      } catch (rpcError) {
        console.log('⚠️ Función read_general_inventory no disponible, usando consulta directa');
        const { data: directInventory } = await supabase
          .from('general_inventory')
          .select('*');
        setGeneralInventory(directInventory || []);
      }
      
      setProducts(productsData || []);
      setBranches(branchesData || []);
      
      console.log(`✅ Datos cargados: ${productsData?.length || 0} productos, ${branchesData?.length || 0} sucursales`);
      
    } catch (error) {
      console.error('❌ Error cargando datos:', error);
      alert('Error al cargar datos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // ================ FUNCIONES CRUD ================

  // 1. AÑADIR AL INVENTARIO GENERAL (usando TU función create_general_inventory)
  const handleAddToInventory = async (e) => {
    e.preventDefault();
    
    if (!addForm.product_id || addForm.quantity <= 0) {
      alert('Selecciona un producto y cantidad válida');
      return;
    }

    try {
      console.log('📥 Añadiendo stock usando create_general_inventory...');
      
      const { data, error } = await supabase
        .rpc('create_general_inventory', {
          p_product_id: addForm.product_id,
          p_quantity: addForm.quantity,
          p_min_stock: addForm.min_stock || null,
          p_max_stock: addForm.max_stock || null,
          p_notes: addForm.notes || 'Stock añadido desde dashboard',
          p_location: 'Almacén Principal'
        });

      if (error) throw error;

      if (data?.success) {
        alert(data.message || '✅ Stock añadido correctamente');
        setShowAddModal(false);
        setAddForm({
          product_id: '',
          quantity: 1,
          min_stock: 10,
          max_stock: 100,
          notes: ''
        });
        loadAllData(); // Recargar datos
      } else {
        alert(data?.message || '❌ Error al añadir stock');
      }
    } catch (error) {
      console.error('💥 Error en create_general_inventory:', error);
      alert('Error: ' + error.message);
    }
  };

  // 2. ASIGNAR A SUCURSAL (usando TU función assign_to_branch)
  const handleAssignToBranch = async (e) => {
    e.preventDefault();
    
    if (!assignForm.branch_id || assignForm.quantity <= 0 || !selectedProduct) {
      alert('Completa todos los campos correctamente');
      return;
    }

    try {
      console.log('🏬 Asignando a sucursal usando assign_to_branch...');
      
      const { data, error } = await supabase
        .rpc('assign_to_branch', {
          p_product_id: selectedProduct.id,
          p_branch_id: assignForm.branch_id,
          p_quantity: assignForm.quantity,
          p_notes: assignForm.notes || 'Asignación desde dashboard'
        });

      if (error) throw error;

      if (data?.success) {
        alert(data.message || '✅ Producto asignado correctamente');
        setShowAssignModal(false);
        setSelectedProduct(null);
        setAssignForm({ branch_id: '', quantity: 1, notes: '' });
        loadAllData();
      } else {
        alert(data?.message || '❌ Error en la asignación');
      }
    } catch (error) {
      console.error('💥 Error en assign_to_branch:', error);
      alert('Error: ' + error.message);
    }
  };

  // 3. EDITAR PRODUCTO (usando TU función update_general_inventory)
  const handleEditProduct = async (productId, newQuantity, minStock, maxStock) => {
    const notes = prompt('Notas para la actualización:', 'Actualización manual');
    if (notes === null) return; // Usuario canceló

    try {
      const { data, error } = await supabase
        .rpc('update_general_inventory', {
          p_product_id: productId,
          p_new_quantity: newQuantity,
          p_min_stock: minStock,
          p_max_stock: maxStock,
          p_notes: notes
        });

      if (error) throw error;

      if (data?.success) {
        alert(data.message || '✅ Producto actualizado');
        loadAllData();
      } else {
        alert(data?.message || '❌ Error al actualizar');
      }
    } catch (error) {
      console.error('💥 Error en update_general_inventory:', error);
      alert('Error: ' + error.message);
    }
  };

  // 4. ELIMINAR PRODUCTO (usando TU función delete_product)
  const handleDeleteProduct = async (productId, productName) => {
    if (!confirm(`¿Estás seguro de eliminar "${productName}"? Se marcará como inactivo.`)) {
      return;
    }

    try {
      const { data, error } = await supabase
        .rpc('delete_product', {
          p_product_id: productId
        });

      if (error) throw error;

      if (data?.success) {
        alert(data.message || '✅ Producto eliminado (marcado como inactivo)');
        loadAllData();
      } else {
        alert(data?.message || '❌ No se pudo eliminar: ' + (data?.message || ''));
      }
    } catch (error) {
      console.error('💥 Error en delete_product:', error);
      alert('Error: ' + error.message);
    }
  };

  // ================ RENDERIZADO ================

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-2 text-gray-600">Cargando inventario...</p>
        </div>
      </div>
    );
  }

  // Calcular estadísticas
  const totalProducts = products.length;
  const totalStock = products.reduce((sum, product) => {
    return sum + (product.general_inventory?.[0]?.quantity || 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Inventario</h1>
          <p className="text-gray-600">CRUD completo usando tus funciones Supabase</p>
        </div>
        <button
          onClick={loadAllData}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </button>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg mr-4">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Productos Activos</p>
              <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 text-green-600 rounded-lg mr-4">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Stock Total</p>
              <p className="text-2xl font-bold text-gray-900">{totalStock}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-lg mr-4">
              <Store className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Sucursales</p>
              <p className="text-2xl font-bold text-gray-900">{branches.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs y acciones */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <button
            className={`px-4 py-2 rounded-lg ${activeTab === 'general' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setActiveTab('general')}
          >
            <Package className="h-4 w-4 inline mr-2" />
            Inventario General
          </button>
          <button
            className={`px-4 py-2 rounded-lg ${activeTab === 'branches' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setActiveTab('branches')}
          >
            <Store className="h-4 w-4 inline mr-2" />
            Por Sucursal
          </button>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Añadir Stock
          </button>
        </div>
      </div>

      {/* Tabla de productos */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Productos ({products.length})</h2>
          <p className="text-sm text-gray-500">Lista completa de productos en inventario</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Actual
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mín/Máx
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => {
                const inventory = product.general_inventory?.[0];
                const stock = inventory?.quantity || 0;
                const minStock = inventory?.min_stock || 0;
                const maxStock = inventory?.max_stock || 0;
                
                return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {product.product_code}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">
                          {product.product_name}
                        </div>
                        {product.requires_refrigeration && (
                          <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                            ❄️ Refrigerado
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${
                        stock <= minStock ? 'text-red-600' : 'text-gray-900'
                      }`}>
                        {stock}
                        {stock <= minStock && (
                          <AlertTriangle className="h-4 w-4 inline ml-1 text-red-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {minStock} / {maxStock}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedProduct(product);
                            setShowAssignModal(true);
                          }}
                          disabled={stock <= 0}
                          className={`px-3 py-1 rounded flex items-center ${
                            stock <= 0 
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          }`}
                          title={stock <= 0 ? 'Sin stock disponible' : 'Asignar a sucursal'}
                        >
                          <Store className="h-3 w-3 mr-1" />
                          Asignar
                        </button>
                        
                        <button
                          onClick={() => {
                            const newQty = prompt('Nueva cantidad de stock:', stock);
                            if (newQty !== null && !isNaN(newQty)) {
                              handleEditProduct(product.id, parseInt(newQty), minStock, maxStock);
                            }
                          }}
                          className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 flex items-center"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Editar
                        </button>
                        
                        <button
                          onClick={() => handleDeleteProduct(product.id, product.product_name)}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================ MODALES ================ */}

      {/* Modal: Añadir Stock */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Añadir al Inventario General</h3>
            
            <form onSubmit={handleAddToInventory}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Producto *
                  </label>
                  <select
                    value={addForm.product_id}
                    onChange={(e) => setAddForm({...addForm, product_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Seleccionar producto...</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.product_code} - {product.product_name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cantidad *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={addForm.quantity}
                    onChange={(e) => setAddForm({...addForm, quantity: parseInt(e.target.value) || 1})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock Mínimo
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={addForm.min_stock}
                      onChange={(e) => setAddForm({...addForm, min_stock: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock Máximo
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={addForm.max_stock}
                      onChange={(e) => setAddForm({...addForm, max_stock: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notas
                  </label>
                  <textarea
                    value={addForm.notes}
                    onChange={(e) => setAddForm({...addForm, notes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Motivo del ingreso, proveedor, etc."
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Añadir Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Asignar a Sucursal */}
      {showAssignModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Asignar a Sucursal</h3>
            <p className="text-sm text-gray-600 mb-4">
              Producto: <span className="font-semibold">{selectedProduct.product_name}</span>
              <br />
              Stock disponible: <span className="font-semibold">
                {selectedProduct.general_inventory?.[0]?.quantity || 0}
              </span>
            </p>
            
            <form onSubmit={handleAssignToBranch}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sucursal Destino *
                  </label>
                  <select
                    value={assignForm.branch_id}
                    onChange={(e) => setAssignForm({...assignForm, branch_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Seleccionar sucursal...</option>
                    {branches.map(branch => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name} ({branch.branch_code})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cantidad a Asignar *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={selectedProduct.general_inventory?.[0]?.quantity || 0}
                    value={assignForm.quantity}
                    onChange={(e) => setAssignForm({...assignForm, quantity: parseInt(e.target.value) || 1})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Máximo disponible: {selectedProduct.general_inventory?.[0]?.quantity || 0}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instrucciones/Notas
                  </label>
                  <textarea
                    value={assignForm.notes}
                    onChange={(e) => setAssignForm({...assignForm, notes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Instrucciones especiales para la sucursal..."
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedProduct(null);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Asignar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryCRUD;