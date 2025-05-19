import React, { useState } from 'react';
import SearchBar from './SearchBar';
import PurchaseOrderForm from './PurchaseOrderForm';

const PurchaseOrderList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [purchaseOrders, setPurchaseOrders] = useState([
    {
      po_number: 'PO-001',
      supplier_name: 'ABC Office Supplies',
      order_date: '2024-03-15',
      delivery_date: '2024-03-22',
      total_amount: '₱45,750',
      status: 'Delivered',
      items: [
        { item: 'Office Chair', quantity: 5, unit_price: '₱4,500' },
        { item: 'Desk Lamp', quantity: 10, unit_price: '₱1,575' },
        { item: 'Filing Cabinet', quantity: 2, unit_price: '₱5,000' }
      ],
      payment_terms: 'Net 30',
      shipping_address: 'Main Office',
      requestor: 'Maria Santos',
      department: 'Administration'
    },
    {
      po_number: 'PO-002',
      supplier_name: 'Tech Solutions Inc.',
      order_date: '2024-03-16',
      delivery_date: '2024-03-30',
      total_amount: '₱128,000',
      status: 'Pending',
      items: [
        { item: 'Laptop', quantity: 2, unit_price: '₱45,000' },
        { item: 'Monitor', quantity: 4, unit_price: '₱8,500' },
        { item: 'Wireless Mouse', quantity: 5, unit_price: '₱1,200' }
      ],
      payment_terms: 'Net 30',
      shipping_address: 'Main Office',
      requestor: 'Juan dela Cruz',
      department: 'IT'
    },
    {
      po_number: 'PO-003',
      supplier_name: 'Global Paper Co.',
      order_date: '2024-03-17',
      delivery_date: '2024-03-24',
      total_amount: '₱32,500',
      status: 'Processing',
      items: [
        { item: 'A4 Paper (Boxes)', quantity: 50, unit_price: '₱450' },
        { item: 'Sticky Notes', quantity: 100, unit_price: '₱75' },
        { item: 'Printer Ink', quantity: 10, unit_price: '₱850' }
      ],
      payment_terms: 'Net 30',
      shipping_address: 'Main Office',
      requestor: 'Ana Reyes',
      department: 'Operations'
    }
  ]);

  const handleSubmit = (formData) => {
    const newPO = {
      po_number: `PO-${String(purchaseOrders.length + 1).padStart(3, '0')}`,
      supplier_name: formData.supplier,
      order_date: formData.orderDate,
      delivery_date: formData.deliveryDate,
      total_amount: `₱${formData.totalAmount}`,
      status: 'Pending',
      items: formData.items.map(item => ({
        item: item.description,
        quantity: item.quantity,
        unit_price: `₱${item.unitPrice}`
      })),
      payment_terms: 'Net 30',
      shipping_address: 'Main Office',
      requestor: 'System User',
      department: 'Procurement'
    };
    setPurchaseOrders(prev => [...prev, newPO]);
  };

  const filteredPOs = purchaseOrders.filter(po => 
    po.po_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    po.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    po.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    po.requestor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    po.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 min-h-screen bg-gray-100">
      <div className="bg-white h-full">
        <div className="flex justify-between items-center py-8 px-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Purchase Orders
          </h1>
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Purchase Order
          </button>
        </div>
        <div className="p-6">
          <SearchBar 
            placeholder="Search by PO number, supplier, status, requestor, or department..."
            onSearch={setSearchTerm}
          />

          <div className="overflow-x-auto bg-white rounded-lg shadow">
            {purchaseOrders.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No purchase orders yet. Click the button above to create one.
              </div>
            ) : (
              <table className="min-w-full table-auto">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PO Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPOs.map((po) => (
                    <tr key={po.po_number} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{po.po_number}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{po.supplier_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{po.order_date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{po.delivery_date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{po.total_amount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          po.status === 'Delivered' 
                            ? 'bg-green-100 text-green-800'
                            : po.status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {po.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {po.items.map((item, index) => (
                          <div key={index}>
                            {item.quantity}x {item.item} @ {item.unit_price}
                          </div>
                        ))}
                      </td>
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

      <PurchaseOrderForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default PurchaseOrderList; 