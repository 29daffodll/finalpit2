import React, { useState } from 'react';
import SearchBar from './SearchBar';
import InvoiceForm from './InvoiceForm';

const InvoiceList = ({ purchaseOrders }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPOSelectorOpen, setIsPOSelectorOpen] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [selectedPO, setSelectedPO] = useState(null);

  const handleSubmit = (formData) => {
    const newInvoice = {
      invoice_id: `INV-${String(invoices.length + 1).padStart(3, '0')}`,
      supplier_name: formData.supplier,
      invoice_date: formData.issueDate,
      due_date: formData.dueDate,
      amount: `₱${formData.totalAmount}`,
      status: 'Pending',
      po_reference: formData.po_reference || `PO-${String(invoices.length + 1).padStart(3, '0')}`,
      payment_terms: formData.paymentTerms || 'Net 30',
      items: formData.items.map(item => `${item.quantity}x ${item.description} @ ₱${item.unitPrice}`).join(', '),
      remarks: formData.notes || 'Pending review'
    };
    setInvoices(prev => [...prev, newInvoice]);
  };

  const handleCreateFromPO = (po) => {
    setSelectedPO(po);
    setIsPOSelectorOpen(false);
    setIsFormOpen(true);
  };

  const filteredInvoices = invoices.filter(invoice => 
    invoice.invoice_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.po_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPOs = purchaseOrders.filter(po => 
    po.status === 'Approved' || po.status === 'Purchased'
  );

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
            placeholder="Search invoices by ID, supplier, PO reference, or status..."
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PO Reference</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.invoice_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{invoice.invoice_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.supplier_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.invoice_date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.due_date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.amount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          invoice.status === 'Paid' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.po_reference}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.items}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-indigo-600 hover:text-indigo-900 mr-3">View</button>
                        <button className="text-red-600 hover:text-red-900">Delete</button>
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
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
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
                <table className="min-w-full table-auto">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PO Number</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPOs.map((po) => (
                      <tr key={po.po_number} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{po.po_number}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{po.supplier_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{po.order_date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{po.total_amount}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            po.status === 'Approved' 
                              ? 'bg-green-100 text-green-800'
                              : po.status === 'Purchased'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {po.status}
                          </span>
                        </td>
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