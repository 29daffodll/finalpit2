import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import SearchBar from './SearchBar';
import LoadingOrError from './LoadingOrError';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

const initialFormData = {
  company_name: '',
  contact_person: '',
  email: '',
  phone: '',
  category_id: '',
  rating: '',
  status: '',
  tax_id: '',
  payment_terms: ''
};

const VendorList = () => {
  const [vendors, setVendors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    setLoading(true);
    setError('');
    const { data, error } = await supabase.from('vendors').select('*').order('vendor_id', { ascending: true });
    if (error) {
      setError('Failed to fetch vendors: ' + error.message);
    } else {
      setVendors(data || []);
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAdd = () => {
    setEditingVendor(null);
    setFormData(initialFormData);
    setIsModalOpen(true);
    setError('');
  };

  const handleEdit = (vendor) => {
    setEditingVendor(vendor);
    setFormData({
      company_name: vendor.company_name || '',
      contact_person: vendor.contact_person || '',
      email: vendor.email || '',
      phone: vendor.phone || '',
      category_id: vendor.category_id || '',
      rating: vendor.rating || '',
      status: vendor.status || '',
      tax_id: vendor.tax_id || '',
      payment_terms: vendor.payment_terms || ''
    });
    setIsModalOpen(true);
    setError('');
  };

  const handleDelete = async (vendorId) => {
    if (!window.confirm('Are you sure you want to delete this vendor?')) return;
    const { error } = await supabase.from('vendors').delete().eq('vendor_id', vendorId);
    if (error) {
      setError('Failed to delete vendor: ' + error.message);
    } else {
      setVendors(vendors.filter((v) => v.vendor_id !== vendorId));
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingVendor(null);
    setFormData(initialFormData);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    let vendorData = {
      company_name: formData.company_name,
      contact_person: formData.contact_person,
      email: formData.email,
      phone: formData.phone,
      category_id: formData.category_id ? parseInt(formData.category_id) : null,
      rating: formData.rating ? parseFloat(formData.rating) : null,
      status: formData.status,
      tax_id: formData.tax_id,
      payment_terms: formData.payment_terms
    };
    if (editingVendor) {
      // Update
      const { error } = await supabase
        .from('vendors')
        .update(vendorData)
        .eq('vendor_id', editingVendor.vendor_id);
      if (error) {
        setError('Failed to update vendor: ' + error.message);
        return;
      }
      setVendors(
        vendors.map((v) =>
          v.vendor_id === editingVendor.vendor_id ? { ...v, ...vendorData } : v
        )
      );
    } else {
      // Add
      const { data, error } = await supabase.from('vendors').insert([vendorData]).select();
      if (error) {
        setError('Failed to add vendor: ' + error.message);
        return;
      }
      setVendors([...vendors, ...(data || [])]);
    }
    handleCloseModal();
  };

  const filteredVendors = vendors.filter(vendor =>
    (vendor.vendor_id ? vendor.vendor_id.toString() : '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (vendor.company_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (vendor.contact_person || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (vendor.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (vendor.phone || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (vendor.status || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 min-h-screen bg-gray-100">
      <div className="bg-white h-full">
        <div className="flex justify-between items-center py-8 px-8">
          <h1 className="text-2xl font-bold text-gray-800">Vendors</h1>
          <button
            onClick={handleAdd}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            aria-label="Add Vendor"
          >
            +
          </button>
        </div>
        <div className="p-6">
          <SearchBar
            placeholder="Search by vendor ID, company name, contact person, email, phone, or status..."
            onSearch={setSearchTerm}
          />
          <LoadingOrError loading={loading} error={error} loadingText="Loading vendors...">
            <div className="overflow-x-auto bg-white rounded-lg shadow">
              <table className="min-w-full table-auto">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Person</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tax ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Terms</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredVendors.map((vendor) => (
                    <tr key={vendor.vendor_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{vendor.vendor_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vendor.company_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vendor.contact_person}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vendor.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vendor.phone}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vendor.category_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vendor.rating}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          vendor.status === 'Approved'
                            ? 'bg-green-100 text-green-800'
                            : vendor.status === 'Inactive'
                            ? 'bg-red-100 text-red-800'
                            : vendor.status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {vendor.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vendor.tax_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vendor.payment_terms}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                        <button
                          onClick={() => handleEdit(vendor)}
                          className="text-indigo-600 hover:text-indigo-900"
                          aria-label="Edit"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={() => handleDelete(vendor.vendor_id)}
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
      {/* Modal for Add/Edit Vendor */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                {editingVendor ? 'Edit Vendor' : 'Add New Vendor'}
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Company Name</label>
                  <input
                    type="text"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Contact Person</label>
                  <input
                    type="text"
                    name="contact_person"
                    value={formData.contact_person}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Category ID</label>
                  <input
                    type="number"
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Rating</label>
                  <input
                    type="number"
                    name="rating"
                    value={formData.rating}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                    step="0.1"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <input
                    type="text"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Tax ID</label>
                  <input
                    type="text"
                    name="tax_id"
                    value={formData.tax_id}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Payment Terms</label>
                  <input
                    type="text"
                    name="payment_terms"
                    value={formData.payment_terms}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
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
                    {editingVendor ? 'Update' : 'Add'}
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

export default VendorList; 