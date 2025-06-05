import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import SearchBar from '../SearchBar';
import LoadingOrError from '../LoadingOrError';

const ProcurementItems = () => {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error: fetchError } = await supabase
        .from('procurementitem')
        .select(`
          *,
          products:product_id (
            name
          )
        `);
      
      if (fetchError) throw fetchError;
      setItems(data || []);
    } catch (err) {
      setError('Failed to fetch items: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (item) => {
    setSelectedItem(item);
    setIsViewModalOpen(true);
  };

  // Filter items based on search term
  const filteredItems = items.filter(item =>
    Object.values({
      ...item,
      productName: item.products?.name || ''
    }).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="flex-1 min-h-screen bg-gray-100">
      <div className="bg-white h-full">
        <div className="flex justify-between items-center py-8 px-8">
          <h1 className="text-2xl font-bold text-gray-800">Procurement Items</h1>
        </div>
        <div className="p-6">
          <SearchBar
            placeholder="Search items..."
            onSearch={setSearchTerm}
          />
          <LoadingOrError loading={loading} error={error}>
            <div className="bg-white rounded-lg shadow p-6 mt-4">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Procurement ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Delivery Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredItems.map((item) => (
                    <tr key={item.item_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.item_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.procurement_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.products?.name || 'Unknown Product'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₱{item.unit_price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(item.delivery_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleView(item)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </LoadingOrError>
        </div>
      </div>

      {/* View Modal */}
      {isViewModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Item Details</h3>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Item ID</label>
                <p className="mt-1 text-sm text-gray-900">{selectedItem.item_id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Procurement ID</label>
                <p className="mt-1 text-sm text-gray-900">{selectedItem.procurement_id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Product</label>
                <p className="mt-1 text-sm text-gray-900">{selectedItem.products?.name || 'Unknown Product'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                <p className="mt-1 text-sm text-gray-900">{selectedItem.quantity}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Unit Price</label>
                <p className="mt-1 text-sm text-gray-900">₱{selectedItem.unit_price}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Delivery Date</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(selectedItem.delivery_date).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="mt-6">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcurementItems; 