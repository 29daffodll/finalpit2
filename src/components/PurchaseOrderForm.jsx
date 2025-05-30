import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const PurchaseOrderForm = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    supplier: '',
    orderDate: '',
    deliveryDate: '',
    description: '',
    products: [],
    total_price: '',
  });
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        supplier: initialData.supplier || '',
        orderDate: initialData.orderDate || '',
        deliveryDate: initialData.deliveryDate || '',
        description: initialData.description || '',
        products: initialData.products || [],
        total_price: initialData.total_price || '',
      });
    } else if (isOpen && !initialData) {
      setFormData({
        supplier: '',
        orderDate: '',
        deliveryDate: '',
        description: '',
        products: [],
        total_price: '',
      });
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    fetchProducts();
    fetchSuppliers();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('*');
    if (!error && data) {
      setProducts(data);
    }
  };

  const fetchSuppliers = async () => {
    const { data, error } = await supabase.from('suppliers').select('supplier_id, name');
    if (!error && data) {
      setSuppliers(data);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProductSelect = (product) => {
    setSelectedProducts([{ ...product, quantity: 1 }]);
    setFormData(prev => ({
      ...prev,
      products: [{ ...product, quantity: 1 }],
      total_price: product.price
    }));
  };

  const handleProductQuantityChange = (productId, quantity) => {
    const updatedProducts = selectedProducts.map(p => 
      p.product_id === productId ? { ...p, quantity: Number(quantity) } : p
    );
    
    setSelectedProducts(updatedProducts);
    setFormData(prev => ({
      ...prev,
      products: updatedProducts,
      total_price: updatedProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0)
    }));
  };

  const handleClose = () => {
    setFormData({
      supplier: '',
      orderDate: '',
      deliveryDate: '',
      description: '',
      products: [],
      total_price: '',
    });
    setSelectedProducts([]);
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    handleClose();
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
            {initialData ? 'Edit Purchase Order' : 'Create Purchase Order'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Supplier</label>
                <select
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900 bg-white placeholder-gray-400"
                  required
                >
                  <option value="" disabled>Select a supplier</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.supplier_id} value={supplier.name}>{supplier.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Order Date</label>
                <input
                  type="date"
                  name="orderDate"
                  value={formData.orderDate}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900 bg-white placeholder-gray-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Delivery Date</label>
                <input
                  type="date"
                  name="deliveryDate"
                  value={formData.deliveryDate}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900 bg-white placeholder-gray-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900 bg-white placeholder-gray-400"
                  required
                />
              </div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium text-gray-700">Products</label>
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(true)}
                  className="px-3 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
                >
                  Select Products
                </button>
              </div>
              {selectedProducts.length > 0 ? (
                <div className="space-y-4">
                  {selectedProducts.map((product) => (
                    <div key={product.product_id} className="flex items-center space-x-4 p-3 rounded bg-white">
                      <div className="flex-1">
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.description}</p>
                        <p className="text-sm text-gray-500">Unit Price: ₱{Number(product.price).toFixed(2)}</p>
                      </div>
                      <div className="w-24">
                        <label className="block text-sm font-medium text-gray-700">Quantity</label>
                        <input
                          type="number"
                          min="1"
                          value={product.quantity}
                          onChange={(e) => handleProductQuantityChange(product.product_id, e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900 bg-white"
                        />
                      </div>
                      <div className="w-24 text-right">
                        <p className="font-medium">₱{(product.price * product.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No products selected
                </div>
              )}
            </div>

            {/* Formula and total price under products */}
            <div className="mb-6">
              {selectedProducts.length > 0 && (
                <div className="text-right text-sm text-gray-700 mb-1">
                  {selectedProducts.map((product) => (
                    <div key={product.product_id}>
                      {product.name}: ₱{Number(product.price).toFixed(2)} x {product.quantity}
                    </div>
                  ))}
                </div>
              )}
              <div className="text-right font-bold text-lg text-black">
                Total Price: ₱{Number(formData.total_price).toFixed(2)}
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
              >
                {initialData ? 'Update Purchase Order' : 'Create Purchase Order'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Product Selection Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Select Products
                </h3>
                <button
                  onClick={() => setIsProductModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="overflow-y-auto max-h-96">
                <table className="min-w-full divide-y divide-white">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Select</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock Quantity</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-white">
                    {filteredProducts.map((product) => (
                      <tr key={product.product_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <input
                            type="radio"
                            name="selected_product"
                            checked={selectedProducts.length > 0 && selectedProducts[0].product_id === product.product_id}
                            onChange={() => handleProductSelect(product)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.description}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.sku}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₱{Number(product.price).toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.stock_quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrderForm; 