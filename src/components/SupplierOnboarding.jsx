import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const initialFormData = {
  name: '',
  contact_details: '',
  product_service: '',
  certifications: '',
  compliance_history: '',
  classification: '',
  geographical_location: '',
  performance_rating: '',
  approved: false,
  financial_stability_score: '',
  quantity_capacity: '',
  delivery_reliability_score: '',
  product_types: '',
  delivery_capabilities: '',
};

const SupplierOnboarding = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAddSupplier = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const supplier = {
        ...formData,
        contact_details: JSON.parse(formData.contact_details || '{}'),
        certifications: formData.certifications ? formData.certifications.split(',').map(s => s.trim()) : [],
        product_types: formData.product_types ? formData.product_types.split(',').map(s => s.trim()) : [],
        delivery_capabilities: formData.delivery_capabilities ? formData.delivery_capabilities.split(',').map(s => s.trim()) : [],
        performance_rating: formData.performance_rating ? Number(formData.performance_rating) : null,
        financial_stability_score: formData.financial_stability_score ? Number(formData.financial_stability_score) : null,
        quantity_capacity: formData.quantity_capacity ? Number(formData.quantity_capacity) : null,
        delivery_reliability_score: formData.delivery_reliability_score ? Number(formData.delivery_reliability_score) : null,
        approved: !!formData.approved,
      };
      const { error } = await supabase.from('suppliers').insert([supplier]);
      if (error) {
        setMessage('Error: ' + error.message);
      } else {
        setMessage('Supplier added successfully!');
        setFormData(initialFormData);
        setIsModalOpen(false);
      }
    } catch (err) {
      setMessage('Invalid input: ' + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Supplier Onboarding</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <form>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input type="text" name="name" className="mt-1 block w-full rounded-md border-gray-300" value={formData.name} onChange={handleInputChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Contact Details (JSON)</label>
              <input type="text" name="contact_details" className="mt-1 block w-full rounded-md border-gray-300" value={formData.contact_details} onChange={handleInputChange} placeholder='{"email": "", "phone": ""}' />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Product/Service</label>
              <input type="text" name="product_service" className="mt-1 block w-full rounded-md border-gray-300" value={formData.product_service} onChange={handleInputChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Certifications (comma separated)</label>
              <input type="text" name="certifications" className="mt-1 block w-full rounded-md border-gray-300" value={formData.certifications} onChange={handleInputChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Compliance History</label>
              <input type="text" name="compliance_history" className="mt-1 block w-full rounded-md border-gray-300" value={formData.compliance_history} onChange={handleInputChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Classification</label>
              <input type="text" name="classification" className="mt-1 block w-full rounded-md border-gray-300" value={formData.classification} onChange={handleInputChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Geographical Location</label>
              <input type="text" name="geographical_location" className="mt-1 block w-full rounded-md border-gray-300" value={formData.geographical_location} onChange={handleInputChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Performance Rating</label>
              <input type="number" name="performance_rating" className="mt-1 block w-full rounded-md border-gray-300" value={formData.performance_rating} onChange={handleInputChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Approved</label>
              <input type="checkbox" name="approved" className="mt-2" checked={formData.approved} onChange={handleInputChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Financial Stability Score</label>
              <input type="number" name="financial_stability_score" className="mt-1 block w-full rounded-md border-gray-300" value={formData.financial_stability_score} onChange={handleInputChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Quantity Capacity</label>
              <input type="number" name="quantity_capacity" className="mt-1 block w-full rounded-md border-gray-300" value={formData.quantity_capacity} onChange={handleInputChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Delivery Reliability Score</label>
              <input type="number" name="delivery_reliability_score" className="mt-1 block w-full rounded-md border-gray-300" value={formData.delivery_reliability_score} onChange={handleInputChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Product Types (comma separated)</label>
              <input type="text" name="product_types" className="mt-1 block w-full rounded-md border-gray-300" value={formData.product_types} onChange={handleInputChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Delivery Capabilities (comma separated)</label>
              <input type="text" name="delivery_capabilities" className="mt-1 block w-full rounded-md border-gray-300" value={formData.delivery_capabilities} onChange={handleInputChange} />
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
              onClick={handleAddSupplier}
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Supplier'}
            </button>
          </div>
          {message && <div className={`mt-4 ${message.startsWith('Error') ? 'text-red-600' : 'text-green-600'}`}>{message}</div>}
        </form>
      </div>
      {/* Modal for Add Supplier */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Add Supplier</h3>
              <form onSubmit={handleAddSupplier}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300" required />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Contact Details (JSON)</label>
                  <input type="text" name="contact_details" value={formData.contact_details} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300" placeholder='{"email": "", "phone": ""}' required />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Product/Service</label>
                  <input type="text" name="product_service" value={formData.product_service} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300" required />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Certifications (comma separated)</label>
                  <input type="text" name="certifications" value={formData.certifications} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300" />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Compliance History</label>
                  <input type="text" name="compliance_history" value={formData.compliance_history} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300" />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Classification</label>
                  <input type="text" name="classification" value={formData.classification} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300" />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Geographical Location</label>
                  <input type="text" name="geographical_location" value={formData.geographical_location} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300" />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Performance Rating</label>
                  <input type="number" name="performance_rating" value={formData.performance_rating} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300" />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Approved</label>
                  <input type="checkbox" name="approved" checked={formData.approved} onChange={handleInputChange} className="mt-2" />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Financial Stability Score</label>
                  <input type="number" name="financial_stability_score" value={formData.financial_stability_score} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300" />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Quantity Capacity</label>
                  <input type="number" name="quantity_capacity" value={formData.quantity_capacity} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300" />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Delivery Reliability Score</label>
                  <input type="number" name="delivery_reliability_score" value={formData.delivery_reliability_score} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300" />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Product Types (comma separated)</label>
                  <input type="text" name="product_types" value={formData.product_types} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300" />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Delivery Capabilities (comma separated)</label>
                  <input type="text" name="delivery_capabilities" value={formData.delivery_capabilities} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300" />
                </div>
                <div className="flex justify-end mt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="mr-3 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                    disabled={loading}
                  >
                    {loading ? 'Adding...' : 'Add Supplier'}
                  </button>
                </div>
                {message && <div className={`mt-4 ${message.startsWith('Error') ? 'text-red-600' : 'text-green-600'}`}>{message}</div>}
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierOnboarding; 