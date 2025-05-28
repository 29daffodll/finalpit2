import React, { useState, useEffect } from 'react';
import SearchBar from './SearchBar';
import InvoiceForm from './InvoiceForm';
import { supabase } from '../supabaseClient';

const InvoiceList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPOSelectorOpen, setIsPOSelectorOpen] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [selectedPO, setSelectedPO] = useState(null);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => {
    fetchPurchaseOrders();
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
    }
  };

  const fetchPurchaseOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('purchase_order')
        .select('*')
        .order('order_date', { ascending: false });

      if (error) throw error;
      setPurchaseOrders(data || []);
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (!selectedPO) {
        throw new Error('No purchase order selected');
      }

      // Get the latest invoice number
      const { data: latestInvoice, error: countError } = await supabase
        .from('invoices')
        .select('invoice_number')
        .order('invoice_number', { ascending: false })
        .limit(1);

      if (countError) throw countError;

      const nextInvoiceNumber = latestInvoice && latestInvoice.length > 0 
        ? latestInvoice[0].invoice_number + 1 
        : 1;

      const newInvoice = {
        invoice_number: nextInvoiceNumber,
        issue_date: formData.issueDate,
        due_date: formData.dueDate,
        amount: selectedPO.total_amount,
        paid_amount: 0,
        status: 'Pending',
        po_id: selectedPO.order_id
      };

      const { error } = await supabase
        .from('invoices')
        .insert([newInvoice]);

      if (error) throw error;
      
      await fetchInvoices();
      setIsFormOpen(false);
      setSelectedPO(null);
    } catch (error) {
      console.error('Error creating invoice:', error);
      setError(error.message);
    }
  };

  const handleCreateFromPO = (po) => {
    setSelectedPO(po);
    setIsPOSelectorOpen(false);
    setIsFormOpen(true);
  };

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setIsViewModalOpen(true);
  };

  const handleDeleteInvoice = async (invoiceNumber) => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) return;
    
    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('invoice_number', invoiceNumber);

      if (error) throw error;
      
      // Refresh the invoices list
      await fetchInvoices();
    } catch (error) {
      console.error('Error deleting invoice:', error);
      setError(error.message);
    }
  };

  const filteredInvoices = invoices.filter(invoice => 
    String(invoice.invoice_number).toLowerCase().includes(searchTerm.toLowerCase()) ||
    (invoice.status && invoice.status.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredPOs = purchaseOrders.filter(po =>
    String(po.order_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
    (po.supplier_name && po.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return <div className="p-4">Loading purchase orders...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="flex-1 min-h-screen bg-gray-100">
      <div className="bg-white h-full">
        <div className="flex justify-between items-center py-8 px-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Invoices
          </h1>
          <div className="space-x-4">
            <button
              onClick={() => setIsPOSelectorOpen(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Create from PO
            </button>
          </div>
        </div>
        <div className="p-6">
          <SearchBar 
            placeholder="Search invoices by number or status..."
            onSearch={setSearchTerm}
          />

          <div className="overflow-x-auto bg-white rounded-lg shadow">
            {invoices.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No invoices yet. Click the button above to create one.
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
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          View
                        </button>
                        <button 
                          onClick={() => handleDeleteInvoice(invoice.invoice_number)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
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

      {/* PO Selector Modal */}
      {isPOSelectorOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Select Purchase Order
                </h3>
                <button
                  onClick={() => setIsPOSelectorOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="overflow-x-auto">
                {purchaseOrders.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No purchase orders available.
                  </div>
                ) : (
                  <table className="min-w-full table-auto">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PO ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredPOs.map((po) => (
                        <tr key={po.order_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{po.order_id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{po.supplier_name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{po.order_date}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{po.description}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{po.quantity}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₱{po.unit_price}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₱{po.total_amount}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleCreateFromPO(po)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Select
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
        </div>
      )}

      {/* View Invoice Modal */}
      {isViewModalOpen && selectedInvoice && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Invoice Details
                </h3>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Invoice Number</p>
                    <p className="mt-1 text-black">INV-{String(selectedInvoice.invoice_number).padStart(3, '0')}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
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
                  <div>
                    <p className="text-sm font-medium text-gray-500">Issue Date</p>
                    <p className="mt-1 text-black">{selectedInvoice.issue_date}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Due Date</p>
                    <p className="mt-1 text-black">{selectedInvoice.due_date}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Amount</p>
                    <p className="mt-1 text-black">₱{selectedInvoice.amount}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Paid Amount</p>
                    <p className="mt-1 text-black">₱{selectedInvoice.paid_amount || 0}</p>
                  </div>
                </div>
                {selectedInvoice.po_id && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Purchase Order Reference</p>
                    <p className="mt-1 text-black">PO-{selectedInvoice.po_id}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <InvoiceForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedPO(null);
        }}
        onSubmit={handleSubmit}
        selectedPO={selectedPO}
      />
    </div>
  );
};

export default InvoiceList; 