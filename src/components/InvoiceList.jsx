import React, { useState } from 'react';
import SearchBar from './SearchBar';
import InvoiceForm from './InvoiceForm';

const InvoiceList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [invoices, setInvoices] = useState([]);

  const handleSubmit = (formData) => {
    const newInvoice = {
      invoice_id: `INV-${String(invoices.length + 1).padStart(3, '0')}`,
      supplier_name: formData.supplier,
      invoice_date: formData.issueDate,
      due_date: formData.dueDate,
      amount: `₱${formData.totalAmount}`,
      status: 'Pending',
      po_reference: `PO-${String(invoices.length + 1).padStart(3, '0')}`,
      payment_terms: formData.paymentTerms || 'Net 30',
      items: formData.items.map(item => `${item.quantity}x ${item.description} @ ₱${item.unitPrice}`).join(', '),
      remarks: formData.notes || 'Pending review'
    };
    setInvoices(prev => [...prev, newInvoice]);
  };

  const filteredInvoices = invoices.filter(invoice => 
    invoice.invoice_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.po_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 min-h-screen bg-gray-100">
      <div className="bg-white h-full">
        <div className="flex justify-between items-center py-8 px-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Invoices
          </h1>
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Invoice
          </button>
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

      <InvoiceForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default InvoiceList; 