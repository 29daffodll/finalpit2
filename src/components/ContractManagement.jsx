import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const ContractManagement = () => {
  const [contracts, setContracts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
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
    fetchData();
  }, []);

  const getSupplierName = (supplier_id) => {
    const supplier = suppliers.find(s => s.supplier_id === supplier_id);
    return supplier ? supplier.name : supplier_id;
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ContractManagement; 