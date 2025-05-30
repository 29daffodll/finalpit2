import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import SearchBar from './SearchBar';
import { FiEdit2, FiTrash2, FiMessageSquare, FiMoreVertical } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import LoadingOrError from './LoadingOrError';
import { createPortal } from 'react-dom';

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
  const navigate = useNavigate();
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [dropdownSupplierId, setDropdownSupplierId] = useState(null);

  // Fetch suppliers from Supabase
  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    setLoading(true);
    setError('');
    const { data, error } = await supabase
      .from('suppliers')
      .select('supplier_id, name, contact_details, product_service, certifications, compliance_history, classification, geographical_location, performance_rating, approved, financial_stability_score, quantity_capacity, delivery_reliability_score, product_types, delivery_capabilities')
      .order('supplier_id', { ascending: true });
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

  const handleChat = (supplier) => {
    // Parse contact details
    const contactDetails = typeof supplier.contact_details === 'string' 
      ? supplier.contact_details.split('|').map(detail => detail.trim())
      : ['', ''];

    navigate('/relationship-management', { 
      state: { 
        selectedSupplier: {
          id: supplier.supplier_id,
          name: supplier.name,
          status: 'Online',
          lastActive: 'Just now',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(supplier.name)}&background=0D8ABC&color=fff`,
          contact: {
            email: contactDetails[0] || '',
            phone: contactDetails[1] || '',
            address: supplier.geographical_location || ''
          }
        }
      }
    });
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

  // Helper to open the dropdown and set its position
  const handleActionMenuOpen = (event, supplier_id) => {
    if (actionMenuOpen === supplier_id) {
      setActionMenuOpen(null);
      setDropdownSupplierId(null);
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    setDropdownPosition({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
    });
    setDropdownSupplierId(supplier_id);
    setActionMenuOpen(supplier_id);
  };

  // Helper to close the dropdown
  const handleActionMenuClose = () => {
    setActionMenuOpen(null);
    setDropdownSupplierId(null);
  };

  return (
    <div className="flex-1 min-h-screen bg-white">
      <div className="bg-white h-full">
        <div className="flex justify-between items-center py-8 px-8">
          <h1 className="text-2xl font-bold text-gray-800">Suppliers</h1>
        </div>
        <div className="p-0" style={{ width: '1600px', margin: '0 auto' }}>
          <div className="mb-4">
            <SearchBar
              placeholder="Search suppliers by name, ID, product/service, or certifications..."
              onSearch={setSearchTerm}
            />
          </div>
          <LoadingOrError loading={loading} error={error} loadingText="Loading suppliers...">
            <div className="overflow-x-auto bg-white rounded-lg shadow overflow-visible" style={{ width: '1600px' }}>
              <table className="min-w-full w-[1600px] table-auto border-separate border-spacing-0 overflow-visible">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">supplier_id</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">contact_details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">product_service</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">certifications</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">compliance_history</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">classification</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">geographical_location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">performance_rating</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">approved</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">financial_stability_score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">quantity_capacity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">delivery_reliability_score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">product_types</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">delivery_capabilities</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-white z-20 border-l border-gray-200" style={{ borderRight: 'none' }}>Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-white">
                  {filteredSuppliers.map((supplier) => {
                    let contact = '';
                    if (typeof supplier.contact_details === 'object' && supplier.contact_details !== null) {
                      contact = [supplier.contact_details.email, supplier.contact_details.phone].filter(Boolean).join(' | ');
                    } else if (typeof supplier.contact_details === 'string') {
                      try {
                        const parsed = JSON.parse(supplier.contact_details);
                        contact = [parsed.email, parsed.phone].filter(Boolean).join(' | ');
                      } catch {
                        contact = supplier.contact_details;
                      }
                    }
                    return (
                      <tr key={supplier.supplier_id} className="hover:bg-gray-50 relative">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{supplier.supplier_id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supplier.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 break-all">{contact}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supplier.product_service}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{Array.isArray(supplier.certifications) ? supplier.certifications.join(', ') : supplier.certifications}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supplier.compliance_history}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supplier.classification}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supplier.geographical_location}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supplier.performance_rating}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supplier.approved ? 'Yes' : 'No'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supplier.financial_stability_score}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supplier.quantity_capacity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supplier.delivery_reliability_score}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{Array.isArray(supplier.product_types) ? supplier.product_types.join(', ') : supplier.product_types}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{Array.isArray(supplier.delivery_capabilities) ? supplier.delivery_capabilities.join(', ') : supplier.delivery_capabilities}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium sticky right-0 bg-white z-20 border-l border-gray-200" style={{ borderRight: 'none' }}>
                          <button
                            className="bg-black hover:bg-gray-800 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-gray-900"
                            onClick={(e) => handleActionMenuOpen(e, supplier.supplier_id)}
                          >
                            <FiMoreVertical size={20} className="text-white" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {/* Portal for dropdown menu */}
              {actionMenuOpen && dropdownSupplierId && createPortal(
                <div
                  className="absolute w-40 bg-gray-800 border border-gray-200 rounded-lg shadow-lg z-[9999]"
                  style={{ top: dropdownPosition.top, left: dropdownPosition.left }}
                  onMouseLeave={handleActionMenuClose}
                >
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
                    onClick={() => { handleEdit(filteredSuppliers.find(s => s.supplier_id === dropdownSupplierId)); handleActionMenuClose(); }}
                  >
                    Edit
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
                    onClick={() => { handleDelete(dropdownSupplierId); handleActionMenuClose(); }}
                  >
                    Delete
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
                    onClick={() => { handleChat(filteredSuppliers.find(s => s.supplier_id === dropdownSupplierId)); handleActionMenuClose(); }}
                  >
                    Chat
                  </button>
                </div>,
                document.body
              )}
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
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-white bg-gray-900 placeholder-gray-400"
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
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-white bg-gray-900 placeholder-gray-400"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Product/Service</label>
                  <input
                    type="text"
                    name="product_service"
                    value={formData.product_service}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-white bg-gray-900 placeholder-gray-400"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Certifications (comma separated)</label>
                  <input
                    type="text"
                    name="certifications"
                    value={formData.certifications}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-white bg-gray-900 placeholder-gray-400"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Compliance History</label>
                  <input
                    type="text"
                    name="compliance_history"
                    value={formData.compliance_history}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-white bg-gray-900 placeholder-gray-400"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Classification</label>
                  <input
                    type="text"
                    name="classification"
                    value={formData.classification}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-white bg-gray-900 placeholder-gray-400"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <input
                    type="text"
                    name="geographical_location"
                    value={formData.geographical_location}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-white bg-gray-900 placeholder-gray-400"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Performance Rating</label>
                  <input
                    type="number"
                    name="performance_rating"
                    value={formData.performance_rating}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-white bg-gray-900 placeholder-gray-400"
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