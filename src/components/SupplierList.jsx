import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import SearchBar from './SearchBar';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import LoadingOrError from './LoadingOrError';

const initialFormData = {
  name: '',
  contact_details: '',
  product_service: '',
  certifications: '',
  compliance_history: '',
  classification: '',
  geographical_location: '',
  performance_rating: ''
};

const SupplierList = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch suppliers from Supabase
  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    setLoading(true);
    setError('');
    const { data, error } = await supabase.from('suppliers').select('*').order('supplier_id', { ascending: true });
    if (error) {
      setError('Failed to fetch suppliers: ' + error.message);
    } else {
      setSuppliers(data || []);
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdd = () => {
    setEditingSupplier(null);
    setFormData(initialFormData);
    setIsModalOpen(true);
    setError('');
  };

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name || '',
      contact_details: typeof supplier.contact_details === 'string' ? supplier.contact_details : JSON.stringify(supplier.contact_details),
      product_service: supplier.product_service || '',
      certifications: (supplier.certifications || []).join(', '),
      compliance_history: supplier.compliance_history || '',
      classification: supplier.classification || '',
      geographical_location: supplier.geographical_location || '',
      performance_rating: supplier.performance_rating || ''
    });
    setIsModalOpen(true);
    setError('');
  };

  const handleDelete = async (supplierId) => {
    if (!window.confirm('Are you sure you want to delete this supplier?')) return;
    const { error } = await supabase.from('suppliers').delete().eq('supplier_id', supplierId);
    if (error) {
      setError('Failed to delete supplier: ' + error.message);
    } else {
      setSuppliers(suppliers.filter((s) => s.supplier_id !== supplierId));
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSupplier(null);
    setFormData(initialFormData);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    let supplierData = {
      name: formData.name,
      contact_details: formData.contact_details,
      product_service: formData.product_service,
      certifications: formData.certifications.split(',').map((s) => s.trim()),
      compliance_history: formData.compliance_history,
      classification: formData.classification,
      geographical_location: formData.geographical_location,
      performance_rating: formData.performance_rating
    };
    if (editingSupplier) {
      // Update
      const { error } = await supabase
        .from('suppliers')
        .update(supplierData)
        .eq('supplier_id', editingSupplier.supplier_id);
      if (error) {
        setError('Failed to update supplier: ' + error.message);
        return;
      }
      setSuppliers(
        suppliers.map((s) =>
          s.supplier_id === editingSupplier.supplier_id ? { ...s, ...supplierData } : s
        )
      );
    } else {
      // Add
      const { data, error } = await supabase.from('suppliers').insert([supplierData]).select();
      if (error) {
        setError('Failed to add supplier: ' + error.message);
        return;
      }
      setSuppliers([...suppliers, ...(data || [])]);
    }
    handleCloseModal();
  };

  const filteredSuppliers = suppliers.filter((supplier) => {
    const certs = (supplier.certifications || []).join(', ');
    return (
      (supplier.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (supplier.supplier_id ? supplier.supplier_id.toString() : '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (supplier.product_service || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      certs.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="flex-1 min-h-screen bg-gray-100">
      <div className="bg-white h-full">
        <div className="flex justify-between items-center py-8 px-8">
          <h1 className="text-2xl font-bold text-gray-800">Suppliers</h1>
          <button
            onClick={handleAdd}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            aria-label="Add Supplier"
          >
            +
          </button>
        </div>
        <div className="p-6">
          <SearchBar
            placeholder="Search suppliers by name, ID, product/service, or certifications..."
            onSearch={setSearchTerm}
          />
          <LoadingOrError loading={loading} error={error} loadingText="Loading suppliers...">
            <div className="overflow-x-auto bg-white rounded-lg shadow">
              <table className="min-w-full table-auto">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product/Service</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Certifications</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Compliance History</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Classification</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSuppliers.map((supplier) => (
                    <tr key={supplier.supplier_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{supplier.supplier_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supplier.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{typeof supplier.contact_details === 'string' ? supplier.contact_details : JSON.stringify(supplier.contact_details)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supplier.product_service}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{(supplier.certifications || []).join(', ')}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supplier.compliance_history}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supplier.classification}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supplier.geographical_location}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supplier.performance_rating}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                        <button
                          onClick={() => handleEdit(supplier)}
                          className="text-indigo-600 hover:text-indigo-900"
                          aria-label="Edit"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={() => handleDelete(supplier.supplier_id)}
                          className="text-red-600 hover:text-red-900"
                          aria-label="Delete"
                        >
                          <FiTrash2 />
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
      {/* Modal for Add/Edit Supplier */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
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
                  <label className="block text-sm font-medium text-gray-700">Contact Details (JSON or string)</label>
                  <input
                    type="text"
                    name="contact_details"
                    value={formData.contact_details}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Product/Service</label>
                  <input
                    type="text"
                    name="product_service"
                    value={formData.product_service}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Certifications (comma separated)</label>
                  <input
                    type="text"
                    name="certifications"
                    value={formData.certifications}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Compliance History</label>
                  <input
                    type="text"
                    name="compliance_history"
                    value={formData.compliance_history}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Classification</label>
                  <input
                    type="text"
                    name="classification"
                    value={formData.classification}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <input
                    type="text"
                    name="geographical_location"
                    value={formData.geographical_location}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Performance Rating</label>
                  <input
                    type="number"
                    name="performance_rating"
                    value={formData.performance_rating}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                    step="0.1"
                  />
                </div>
                <div className="flex justify-end mt-6">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="mr-3 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                  >
                    {editingSupplier ? 'Update' : 'Add'}
                  </button>
                </div>
                {error && <div className="text-red-600 mt-2">{error}</div>}
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierList; 