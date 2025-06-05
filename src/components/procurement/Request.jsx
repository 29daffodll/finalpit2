import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import SearchBar from '../SearchBar';
import LoadingOrError from '../LoadingOrError';

const ProcurementRequest = () => {
  const [requests, setRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [newRequest, setNewRequest] = useState({
    product_id: '',
    quantity: '',
    status: 'Pending',
    request_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchRequests();
    fetchProducts();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error: fetchError } = await supabase
        .from('procurement_request')
        .select(`
          *,
          products:product_id (
            name
          )
        `);
      
      if (fetchError) throw fetchError;
      setRequests(data || []);
    } catch (err) {
      setError('Failed to fetch requests: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setAvailableProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const handleView = (request) => {
    setSelectedRequest(request);
    setIsViewModalOpen(true);
  };

  const handleNewRequestSubmit = async (e) => {
    e.preventDefault();
    try {
      // Get the latest request ID
      const { data: latestRequest, error: countError } = await supabase
        .from('procurement_request')
        .select('request_id')
        .order('request_id', { ascending: false })
        .limit(1);

      if (countError) throw countError;

      // Calculate next request ID
      const nextRequestId = latestRequest && latestRequest.length > 0 
        ? latestRequest[0].request_id + 1 
        : 1;

      // Create the new request
      const { data, error } = await supabase
        .from('procurement_request')
        .insert([{
          request_id: nextRequestId,
          product_id: parseInt(newRequest.product_id),
          quantity: parseInt(newRequest.quantity),
          status: newRequest.status,
          request_date: newRequest.request_date
        }])
        .select();

      if (error) throw error;

      // Reset form and close modal
      setNewRequest({
        product_id: '',
        quantity: '',
        status: 'Pending',
        request_date: new Date().toISOString().split('T')[0]
      });
      setIsNewRequestModalOpen(false);

      // Show success message
      alert('Request created successfully!');
      
      // Refresh the requests list
      fetchRequests();
    } catch (err) {
      console.error('Error creating request:', err);
      alert('Failed to create request. Please try again.');
    }
  };

  // Filter requests based on search term
  const filteredRequests = requests.filter(request =>
    Object.values({
      ...request,
      productName: request.products?.name || ''
    }).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="flex-1 min-h-screen bg-gray-100">
      <div className="bg-white h-full">
        <div className="flex justify-between items-center py-8 px-8">
          <h1 className="text-2xl font-bold text-gray-800">Procurement Request</h1>
          <button
            onClick={() => setIsNewRequestModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            New Request
          </button>
        </div>
        <div className="p-6">
          <SearchBar
            placeholder="Search requests..."
            onSearch={setSearchTerm}
          />
          <LoadingOrError loading={loading} error={error}>
            <div className="bg-white rounded-lg shadow p-6 mt-4">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Request ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Request Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRequests.map((request) => (
                    <tr key={request.request_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {request.request_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.products?.name || 'Unknown Product'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          request.status === 'Approved' ? 'bg-green-100 text-green-800' :
                          request.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(request.request_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleView(request)}
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
      {isViewModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Request Details</h3>
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
                <label className="block text-sm font-medium text-gray-700">Request ID</label>
                <p className="mt-1 text-sm text-gray-900">{selectedRequest.request_id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Product</label>
                <p className="mt-1 text-sm text-gray-900">{selectedRequest.products?.name || 'Unknown Product'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                <p className="mt-1 text-sm text-gray-900">{selectedRequest.quantity}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <p className="mt-1">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    selectedRequest.status === 'Approved' ? 'bg-green-100 text-green-800' :
                    selectedRequest.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {selectedRequest.status}
                  </span>
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Request Date</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(selectedRequest.request_date).toLocaleDateString()}
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

      {/* New Request Modal */}
      {isNewRequestModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">New Request</h3>
              <button
                onClick={() => setIsNewRequestModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleNewRequestSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Product</label>
                <select
                  value={newRequest.product_id}
                  onChange={(e) => setNewRequest({ ...newRequest, product_id: e.target.value })}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
                  required
                >
                  <option value="">Select a product</option>
                  {availableProducts.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
                <a 
                  href="https://pms-five-weld.vercel.app/products"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View All Products
                </a>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={newRequest.quantity}
                  onChange={(e) => setNewRequest({ ...newRequest, quantity: e.target.value })}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Request Date</label>
                <input
                  type="date"
                  value={newRequest.request_date}
                  onChange={(e) => setNewRequest({ ...newRequest, request_date: e.target.value })}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
                  required
                />
              </div>
              <div className="mt-6 flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                >
                  Create Request
                </button>
                <button
                  type="button"
                  onClick={() => setIsNewRequestModalOpen(false)}
                  className="flex-1 inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcurementRequest; 