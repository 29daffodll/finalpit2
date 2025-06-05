import React, { useState, useEffect } from 'react';
import SearchBar from './SearchBar';
import { supabase } from '../supabaseClient';

const InvoiceList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('issue_date', { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setIsViewModalOpen(true);
  };

  const filteredInvoices = invoices.filter(invoice => 
    String(invoice.invoice_number).toLowerCase().includes(searchTerm.toLowerCase()) ||
    (invoice.status && invoice.status.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return <div className="p-4">Loading invoices...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="flex-1 min-h-screen bg-gray-100">
      <div className="bg-white h-full">
        <div className="flex justify-between items-center py-8 px-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Invoices
          </h1>
        </div>
        <div className="p-6">
          <SearchBar 
            placeholder="Search invoices by number or status..."
            onSearch={setSearchTerm}
          />

          <div className="overflow-x-auto bg-white rounded-lg shadow">
            {invoices.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No invoices available.
              </div>
            ) : (
              <table className="min-w-full table-auto">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.invoice_number} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">INV-{String(invoice.invoice_number).padStart(3, '0')}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.issue_date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.due_date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₱{invoice.amount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₱{invoice.paid_amount || 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          invoice.status === 'Paid' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleViewInvoice(invoice)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* View Invoice Modal */}
      {isViewModalOpen && selectedInvoice && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Invoice Details</h3>
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
                <label className="block text-sm font-medium text-gray-700">Invoice Number</label>
                <p className="mt-1 text-sm text-gray-900">INV-{String(selectedInvoice.invoice_number).padStart(3, '0')}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Issue Date</label>
                <p className="mt-1 text-sm text-gray-900">{selectedInvoice.issue_date}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Due Date</label>
                <p className="mt-1 text-sm text-gray-900">{selectedInvoice.due_date}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <p className="mt-1 text-sm text-gray-900">₱{selectedInvoice.amount}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Paid Amount</label>
                <p className="mt-1 text-sm text-gray-900">₱{selectedInvoice.paid_amount || 0}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <p className="mt-1">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    selectedInvoice.status === 'Paid' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedInvoice.status}
                  </span>
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

export default InvoiceList; 