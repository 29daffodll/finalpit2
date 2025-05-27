import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; // adjust path if needed
import SearchBar from './SearchBar';
import LoadingOrError from './LoadingOrError';

const initialFormData = {
  name: '',
  description: '',
  sku: '',
  category_id: '',
  created_at: '',
};

const Products = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch categories and products
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const { data: catData, error: catError } = await supabase.from('pm_Category').select('*');
        if (catError) throw catError;
        setCategories(catData || []);
        const { data: prodData, error: prodError } = await supabase.from('products').select('*');
        if (prodError) throw prodError;
        setProducts(prodData || []);
      } catch (err) {
        setError('Failed to load data: ' + (err.message || err));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getCategoryName = (category_id) => {
    const cat = categories.find(c => c.category_id === category_id);
    return cat ? cat.name : category_id;
  };

  const filteredProducts = products.filter(product =>
    (product.product_id ? product.product_id.toString() : '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.sku || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (getCategoryName(product.category_id) || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.from('products').insert([formData]);
    if (!error) {
      setProducts([...products, ...data]);
      setIsModalOpen(false);
      setFormData(initialFormData);
    } else {
      alert('Error adding product: ' + error.message);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData(initialFormData);
  };

  const handleDelete = async (product_id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    const { error } = await supabase.from('products').delete().eq('product_id', product_id);
    if (!error) {
      setProducts(products.filter(p => p.product_id !== product_id));
    } else {
      alert('Error deleting product: ' + error.message);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      sku: product.sku || '',
      category_id: product.category_id || '',
      created_at: product.created_at ? product.created_at.slice(0, 10) : '',
    });
    setIsModalOpen(true);
  };

  return (
    <div className="flex-1 min-h-screen bg-gray-100">
      <div className="bg-white h-full">
        <div className="flex justify-between items-center py-8 px-8">
          <h1 className="text-2xl font-bold text-gray-800">Products</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Add Product
          </button>
        </div>
        <div className="p-6">
          <SearchBar 
            placeholder="Search by Product ID, Name, Description, SKU, or Category..."
            onSearch={setSearchTerm}
          />
          <LoadingOrError loading={loading} error={error} loadingText="Loading products...">
            <div className="overflow-x-auto bg-white rounded-lg shadow mt-4">
              <table className="min-w-full table-auto">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500">No products found.</td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => (
                      <tr key={product.product_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.product_id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{product.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{product.description}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{product.sku}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{getCategoryName(product.category_id)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{product.created_at}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Edit"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L5 12.828a2 2 0 010-2.828L9 13z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(product.product_id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </LoadingOrError>
        </div>
      </div>

      {/* Modal for Add Product */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                Add New Product
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">SKU</label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat.category_id} value={cat.category_id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Created At</label>
                  <input
                    type="date"
                    name="created_at"
                    value={formData.created_at}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                  >
                    Add Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products; 