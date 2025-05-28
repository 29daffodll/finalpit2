import React, { useState, useEffect } from 'react';
import SearchBar from './SearchBar';
import PurchaseOrderForm from './PurchaseOrderForm';
import { supabase } from '../supabaseClient';
import LoadingOrError from './LoadingOrError';
import { FiMoreVertical } from 'react-icons/fi';

const PurchaseOrderList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [receiveModalOpen, setReceiveModalOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState(null);
  const [receiveForm, setReceiveForm] = useState({ received_quantity: '', received_date: '' });
  const [goodsReceipts, setGoodsReceipts] = useState([]);
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Move fetch functions to top-level so they can be reused
  const fetchPurchaseOrders = async () => {
    setLoading(true);
    setError('');
    const { data, error } = await supabase
      .from('purchase_order')
      .select('*');
    if (error) {
      setError('Failed to fetch purchase orders: ' + error.message);
    } else {
      setPurchaseOrders(data);
    }
    setLoading(false);
  };

  const fetchGoodsReceipts = async () => {
    const { data, error } = await supabase
      .from('goods_receipt')
      .select('*');
    if (!error && data) setGoodsReceipts(data);
  };

  useEffect(() => {
    fetchPurchaseOrders();
    fetchGoodsReceipts();
  }, []);

  // Enable adding new purchase orders to Supabase
  const handleSubmit = async (formData) => {
    // Validation
    if (!formData.supplier || !formData.orderDate || !formData.deliveryDate || !formData.description) {
      alert('Please fill in all fields.');
      return;
    }
    if (!formData.quantity || isNaN(formData.quantity) || Number(formData.quantity) <= 0) {
      alert('Quantity must be a positive number.');
      return;
    }
    if (!formData.unitPrice || isNaN(formData.unitPrice) || Number(formData.unitPrice) <= 0) {
      alert('Unit price must be a positive number.');
      return;
    }

    const newPO = {
      supplier: formData.supplier,
      order_date: formData.orderDate,
      delivery_date: formData.deliveryDate,
      description: formData.description,
      quantity: Number(formData.quantity),
      unit_price: Number(formData.unitPrice),
      total_price: Number(formData.total_price),
    };

    const { data, error } = await supabase
      .from('purchase_order')
      .insert([newPO])
      .select();

    if (error) {
      alert('Error adding purchase order: ' + (error.message || 'Unknown error'));
    } else if (!data || !data.length) {
      alert('No data returned from Supabase. Please try again.');
    } else {
      setPurchaseOrders(prev => [...prev, ...data]);
      setIsFormOpen(false);
    }
  };

  // Filter using only the columns in the table
  const filteredPOs = purchaseOrders.filter(po => {
    const matchesSearch =
      po.po_id.toString().includes(searchTerm) ||
      (po.supplier && po.supplier.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (po.description && po.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (po.order_date && po.order_date.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (po.delivery_date && po.delivery_date.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  // Helper to get receipt for a PO
  const getReceiptForPO = (po_id) => goodsReceipts.find(r => r.po_id === po_id);

  // Handle open receive modal
  const handleOpenReceive = (po) => {
    setSelectedPO(po);
    setReceiveForm({ received_quantity: '', received_date: '' });
    setReceiveModalOpen(true);
  };

  // Handle receive form input
  const handleReceiveInput = (e) => {
    const { name, value } = e.target;
    setReceiveForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle submit receive goods
  const handleReceiveSubmit = async (e) => {
    e.preventDefault();
    if (!receiveForm.received_quantity || !receiveForm.received_date) {
      alert('Please enter received quantity and date.');
      return;
    }
    const { error } = await supabase
      .from('goods_receipt')
      .insert([{
        po_id: selectedPO.po_id,
        received_quantity: Number(receiveForm.received_quantity),
        received_date: receiveForm.received_date,
      }]);
    if (error) {
      alert('Error recording goods receipt: ' + error.message);
    } else {
      alert('Goods receipt recorded!');
      setReceiveModalOpen(false);
      setSelectedPO(null);
      // Refresh data after receipt
      fetchPurchaseOrders();
      fetchGoodsReceipts();
    }
  };

  // View handler: open modal with PO details
  const handleView = (po) => {
    setSelectedPO(po);
    setViewModalOpen(true);
    setActionMenuOpen(null);
  };

  // Edit handler: open form pre-filled for editing
  const handleEdit = (po) => {
    setSelectedPO(po);
    setEditMode(true);
    setIsFormOpen(true);
    setActionMenuOpen(null);
  };

  // Delete handler: delete from Supabase and update UI
  const handleDelete = async (po) => {
    if (window.confirm('Are you sure you want to delete PO #' + po.po_id + '?')) {
      const { error } = await supabase
        .from('purchase_order')
        .delete()
        .eq('po_id', po.po_id);
      if (error) {
        alert('Error deleting PO: ' + error.message);
      } else {
        setPurchaseOrders(prev => prev.filter(p => p.po_id !== po.po_id));
      }
      setActionMenuOpen(null);
    }
  };

  // Placeholder for notes handler
  const handleNotes = (po) => {
    alert('Notes for PO: ' + po.po_id);
    setActionMenuOpen(null);
  };

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
          <div className="mb-4">
            <SearchBar 
              placeholder="Search by PO ID, supplier, description, order or delivery date..."
              onSearch={setSearchTerm}
            />
          </div>
          <LoadingOrError loading={loading} error={error} loadingText="Loading purchase orders...">
            <div className="overflow-x-auto bg-white rounded-lg shadow">
              {filteredPOs.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No purchase orders found matching your criteria.
                </div>
              ) : (
                <table className="min-w-full table-auto">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PO ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPOs.map((po) => (
                      <tr key={po.po_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{po.po_id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{po.supplier}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{po.order_date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{po.delivery_date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{po.description}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{po.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₱{po.unit_price}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₱{po.total_price ? po.total_price : (po.unit_price && po.quantity ? po.unit_price * po.quantity : '')}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {(() => {
                            const receipt = getReceiptForPO(po.po_id);
                            if (!receipt) return <span className="text-red-600">Not Received</span>;
                            if (receipt.received_quantity === po.quantity) return <span className="text-green-600">Fully Received<br/>({receipt.received_quantity} on {receipt.received_date})</span>;
                            if (receipt.received_quantity < po.quantity) return <span className="text-yellow-600">Partial ({receipt.received_quantity} of {po.quantity} on {receipt.received_date})<br/>Short: {po.quantity - receipt.received_quantity}</span>;
                            if (receipt.received_quantity > po.quantity) return <span className="text-orange-600">Over Received ({receipt.received_quantity} of {po.quantity} on {receipt.received_date})</span>;
                            return null;
                          })()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium relative">
                          <button
                            className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-gray-200"
                            onClick={() => setActionMenuOpen(actionMenuOpen === po.po_id ? null : po.po_id)}
                          >
                            <FiMoreVertical size={20} className="text-white" />
                          </button>
                          {actionMenuOpen === po.po_id && (
                            <div className="absolute right-0 mt-2 w-40 bg-gray-800 border border-gray-200 rounded-lg shadow-lg z-10">
                              <button
                                className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
                                onClick={() => handleView(po)}
                              >
                                View
                              </button>
                              <button
                                className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
                                onClick={() => handleEdit(po)}
                              >
                                Edit
                              </button>
                              <button
                                className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
                                onClick={() => handleOpenReceive(po)}
                              >
                                Receive Goods
                              </button>
                              <button
                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-100"
                                onClick={() => handleDelete(po)}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </LoadingOrError>
        </div>
      </div>

      <PurchaseOrderForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditMode(false);
          setSelectedPO(null);
        }}
        onSubmit={async (formData) => {
          if (editMode && selectedPO) {
            // Update existing PO
            const updatedPO = {
              supplier: formData.supplier,
              order_date: formData.orderDate,
              delivery_date: formData.deliveryDate,
              description: formData.description,
              quantity: Number(formData.quantity),
              unit_price: Number(formData.unitPrice),
              total_price: Number(formData.total_price),
            };
            const { error } = await supabase
              .from('purchase_order')
              .update(updatedPO)
              .eq('po_id', selectedPO.po_id);
            if (error) {
              alert('Error updating purchase order: ' + error.message);
            } else {
              fetchPurchaseOrders();
              setIsFormOpen(false);
              setEditMode(false);
              setSelectedPO(null);
            }
          } else {
            // Create new PO
            handleSubmit(formData);
          }
        }}
        initialData={editMode && selectedPO ? {
          supplier: selectedPO.supplier,
          orderDate: selectedPO.order_date,
          deliveryDate: selectedPO.delivery_date,
          description: selectedPO.description,
          quantity: selectedPO.quantity,
          unitPrice: selectedPO.unit_price,
          total_price: selectedPO.total_price,
        } : undefined}
      />

      {receiveModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Receive Goods for PO #{selectedPO?.po_id}</h2>
            <form onSubmit={handleReceiveSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Received Quantity</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    name="received_quantity"
                    value={receiveForm.received_quantity}
                    onChange={handleReceiveInput}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                    required
                    min="1"
                    max={selectedPO?.quantity}
                  />
                  <button
                    type="button"
                    className="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    onClick={() => setReceiveForm(f => ({ ...f, received_quantity: selectedPO?.quantity }))}
                  >
                    Max
                  </button>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Received Date</label>
                <input
                  type="date"
                  name="received_date"
                  value={receiveForm.received_date}
                  onChange={handleReceiveInput}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setReceiveModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewModalOpen && selectedPO && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Purchase Order Details</h2>
            <div className="mb-2"><b>PO ID:</b> {selectedPO.po_id}</div>
            <div className="mb-2"><b>Supplier:</b> {selectedPO.supplier}</div>
            <div className="mb-2"><b>Order Date:</b> {selectedPO.order_date}</div>
            <div className="mb-2"><b>Delivery Date:</b> {selectedPO.delivery_date}</div>
            <div className="mb-2"><b>Description:</b> {selectedPO.description}</div>
            <div className="mb-2"><b>Quantity:</b> {selectedPO.quantity}</div>
            <div className="mb-2"><b>Unit Price:</b> ₱{selectedPO.unit_price}</div>
            <div className="mb-2"><b>Total Price:</b> ₱{selectedPO.total_price}</div>
            <div className="flex justify-end mt-4">
              <button onClick={() => { setViewModalOpen(false); setSelectedPO(null); }} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrderList;