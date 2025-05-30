import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const initialEditData = {
  contract_id: '',
  supplier_id: '',
  start_date: '',
  expiration_date: '',
  terms: '',
  sla: '',
  auto_renew: '',
};

const ContractManagement = () => {
  const [contracts, setContracts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editData, setEditData] = useState(initialEditData);
  const [editLoading, setEditLoading] = useState(false);
  const [editMessage, setEditMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    const { data: contractData, error: contractError } = await supabase.from('contract').select('*');
    const { data: supplierData, error: supplierError } = await supabase.from('suppliers').select('supplier_id, name');
    if (contractError || supplierError) {
      setError('Failed to fetch data');
    } else {
      setContracts(contractData || []);
      setSuppliers(supplierData || []);
    }
    setLoading(false);
  };

  const getSupplierName = (supplier_id) => {
    const supplier = suppliers.find(s => s.supplier_id === supplier_id);
    return supplier ? supplier.name : supplier_id;
  };

  const handleEditClick = (contract) => {
    setEditData({ ...contract });
    setEditMessage('');
    setEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditMessage('');
    const { contract_id, ...updateFields } = editData;
    const { error } = await supabase.from('contract').update(updateFields).eq('contract_id', contract_id);
    if (error) {
      setEditMessage('Error: ' + error.message);
    } else {
      setEditMessage('Contract updated successfully!');
      setEditModalOpen(false);
      fetchData();
    }
    setEditLoading(false);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Contract Management</h1>
      {loading ? (
        <div>Loading contracts...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">contract_id</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">supplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">start_date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">expiration_date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">terms</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">sla</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">auto_renew</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contracts.map(contract => (
                <tr key={contract.contract_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{contract.contract_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getSupplierName(contract.supplier_id)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contract.start_date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contract.expiration_date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contract.terms}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contract.sla}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contract.auto_renew}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      className="text-indigo-600 hover:text-indigo-900"
                      onClick={() => handleEditClick(contract)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Edit Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Edit Contract</h3>
              <form onSubmit={handleEditSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Supplier</label>
                  <select
                    name="supplier_id"
                    value={editData.supplier_id}
                    onChange={handleEditChange}
                    className="mt-1 block w-full rounded-md border-gray-300"
                  >
                    {suppliers.map(s => (
                      <option key={s.supplier_id} value={s.supplier_id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Start Date</label>
                  <input type="date" name="start_date" value={editData.start_date} onChange={handleEditChange} className="mt-1 block w-full rounded-md border-gray-300" />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Expiration Date</label>
                  <input type="date" name="expiration_date" value={editData.expiration_date} onChange={handleEditChange} className="mt-1 block w-full rounded-md border-gray-300" />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Terms</label>
                  <input type="text" name="terms" value={editData.terms} onChange={handleEditChange} className="mt-1 block w-full rounded-md border-gray-300" />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">SLA</label>
                  <input type="text" name="sla" value={editData.sla} onChange={handleEditChange} className="mt-1 block w-full rounded-md border-gray-300" />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Auto Renew</label>
                  <input type="text" name="auto_renew" value={editData.auto_renew} onChange={handleEditChange} className="mt-1 block w-full rounded-md border-gray-300" />
                </div>
                <div className="flex justify-end mt-6">
                  <button
                    type="button"
                    onClick={() => setEditModalOpen(false)}
                    className="mr-3 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                    disabled={editLoading}
                  >
                    {editLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
                {editMessage && <div className={`mt-4 ${editMessage.startsWith('Error') ? 'text-red-600' : 'text-green-600'}`}>{editMessage}</div>}
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractManagement; 