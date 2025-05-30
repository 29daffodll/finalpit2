import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [dropdownPoId, setDropdownPoId] = useState(null);

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
    if (!formData.products || formData.products.length === 0) {
      alert('Please select at least one product.');
      return;
    }

    const newPO = {
      supplier: formData.supplier,
      order_date: formData.orderDate,
      delivery_date: formData.deliveryDate,
      description: formData.description,
      products: formData.products,
      total_price: formData.total_price,
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

  // Helper to get receipt status for a PO
  const getReceiptStatus = (po) => {
    if (!po || !po.products) return { status: 'not_received', text: 'Not Received' };
    
    const receipt = getReceiptForPO(po.po_id);
    if (!receipt) return { status: 'not_received', text: 'Not Received' };

    const productStatuses = po.products.map(product => {
      if (!product || !receipt.received_products) return { status: 'not_received', quantity: 0 };
      
      const receivedProduct = receipt.received_products.find(rp => rp.product_id === product.product_id);
      if (!receivedProduct) return { status: 'not_received', quantity: 0 };
      
      return {
        status: receivedProduct.received_quantity === product.quantity ? 'full' :
                receivedProduct.received_quantity < product.quantity ? 'partial' : 'over',
        received: receivedProduct.received_quantity,
        ordered: product.quantity
      };
    });

    const allFull = productStatuses.every(s => s.status === 'full');
    const anyOver = productStatuses.some(s => s.status === 'over');
    const anyPartial = productStatuses.some(s => s.status === 'partial');
    const anyNotReceived = productStatuses.some(s => s.status === 'not_received');

    if (allFull) {
      return {
        status: 'full',
        text: `Fully Received on ${receipt.received_date}`,
        details: productStatuses
      };
    } else if (anyOver) {
      return {
        status: 'over',
        text: `Over Received on ${receipt.received_date}`,
        details: productStatuses
      };
    } else if (anyPartial || anyNotReceived) {
      return {
        status: 'partial',
        text: `Partially Received on ${receipt.received_date}`,
        details: productStatuses
      };
    }
    
    return { status: 'not_received', text: 'Not Received' };
  };

  // Handle open receive modal
  const handleOpenReceive = (po) => {
    setSelectedPO(po);
    setReceiveForm({
      received_date: '',
      ...Object.fromEntries(po.products.map((_, idx) => [`received_quantity_${idx}`, '']))
    });
    setReceiveModalOpen(true);
  };

  // Handle submit receive goods
  const handleReceiveSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all products have received quantities
    const hasAllQuantities = selectedPO.products.every((_, idx) => 
      receiveForm[`received_quantity_${idx}`] && Number(receiveForm[`received_quantity_${idx}`]) >= 0
    );
    
    if (!hasAllQuantities || !receiveForm.received_date) {
      alert('Please enter received quantities and date for all products.');
      return;
    }

    const receivedProducts = selectedPO.products.map((product, idx) => ({
      product_id: product.product_id,
      received_quantity: Number(receiveForm[`received_quantity_${idx}`])
    }));

    const { error } = await supabase
      .from('goods_receipt')
      .insert([{
        po_id: selectedPO.po_id,
        received_products: receivedProducts,
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

  // Helper to open the dropdown and set its position
  const handleActionMenuOpen = (event, po_id) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setDropdownPosition({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
    });
    setDropdownPoId(po_id);
    setActionMenuOpen(po_id);
  };

  // Helper to close the dropdown
  const handleActionMenuClose = () => {
    setActionMenuOpen(null);
    setDropdownPoId(null);
  };

  return (
    <div className="flex-1 min-h-screen bg-white">
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
        <div className="p-0" style={{ width: '1600px', margin: '0 auto' }}>
          <div className="mb-4">
            <SearchBar 
              placeholder="Search by PO ID, supplier, description, order or delivery date..."
              onSearch={setSearchTerm}
            />
          </div>
          <LoadingOrError loading={loading} error={error} loadingText="Loading purchase orders...">
            <div className="overflow-x-auto bg-white rounded-lg shadow overflow-visible" style={{ width: '1600px' }}>
              {filteredPOs.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No purchase orders found matching your criteria.
                </div>
              ) : (
                <table className="min-w-full w-[1600px] table-auto border-separate border-spacing-0 overflow-visible">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PO ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variant ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approval Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approved By</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent to Supplier</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Flagged for Review</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Procurement ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-white z-20 border-l border-gray-200" style={{ borderRight: 'none' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-white">
                    {filteredPOs.map((po) => (
                      <tr key={po.po_id} className="hover:bg-gray-50 relative">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{po.po_id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{po.description}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{po.order_date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{po.delivery_date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{po.category_id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{po.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{po.unit_price}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{po.total_price}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{po.variant_id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{po.approval_status}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{po.approved_by}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{po.sent_to_supplier ? 'TRUE' : 'FALSE'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{po.flagged_for_review ? 'TRUE' : 'FALSE'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{po.supplier_id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{po.procurement_id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{po.sent_date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium sticky right-0 bg-white z-20 border-l border-gray-200" style={{ borderRight: 'none' }}>
                          <button
                            className="bg-black hover:bg-gray-800 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-gray-900"
                            onClick={(e) => handleActionMenuOpen(e, po.po_id)}
                          >
                            <FiMoreVertical size={20} className="text-white" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {/* Portal for dropdown menu */}
              {actionMenuOpen && dropdownPoId && createPortal(
                <div
                  className="absolute w-40 bg-gray-800 border border-gray-200 rounded-lg shadow-lg z-[9999]"
                  style={{ top: dropdownPosition.top, left: dropdownPosition.left }}
                  onMouseLeave={handleActionMenuClose}
                >
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
                    onClick={() => { handleView(filteredPOs.find(po => po.po_id === dropdownPoId)); handleActionMenuClose(); }}
                  >
                    View
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
                    onClick={() => { handleEdit(filteredPOs.find(po => po.po_id === dropdownPoId)); handleActionMenuClose(); }}
                  >
                    Edit
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
                    onClick={() => { handleOpenReceive(filteredPOs.find(po => po.po_id === dropdownPoId)); handleActionMenuClose(); }}
                  >
                    Receive Goods
                  </button>
                </div>,
                document.body
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
              products: formData.products,
              total_price: formData.total_price,
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
          products: selectedPO.products || [],
          total_price: selectedPO.total_price,
        } : undefined}
      />

      {receiveModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-2xl">
            <h2 className="text-lg font-bold mb-4">Receive Goods for PO #{selectedPO?.po_id}</h2>
            <form onSubmit={handleReceiveSubmit}>
              <div className="mb-6">
                <h3 className="font-bold mb-2">Products</h3>
                {selectedPO?.products?.map((product, idx) => (
                  <div key={idx} className="mb-4 bg-gray-50 p-4 rounded">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-600">{product.description}</p>
                        <p className="text-sm text-gray-600">Ordered Quantity: {product.quantity}</p>
                      </div>
                      <div className="w-32">
                        <label className="block text-sm font-medium text-gray-700">Received</label>
                        <input
                          type="number"
                          name={`received_quantity_${idx}`}
                          value={receiveForm[`received_quantity_${idx}`] || ''}
                          onChange={(e) => setReceiveForm(prev => ({
                            ...prev,
                            [`received_quantity_${idx}`]: e.target.value
                          }))}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          required
                          min="0"
                          max={product.quantity}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Received Date</label>
                <input
                  type="date"
                  name="received_date"
                  value={receiveForm.received_date}
                  onChange={(e) => setReceiveForm(prev => ({ ...prev, received_date: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
          <div className="bg-white p-6 rounded shadow-md w-full max-w-2xl">
            <h2 className="text-lg font-bold mb-4">Purchase Order Details</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div><b>PO ID:</b> {selectedPO.po_id}</div>
              <div><b>Supplier:</b> {selectedPO.supplier}</div>
              <div><b>Order Date:</b> {selectedPO.order_date}</div>
              <div><b>Delivery Date:</b> {selectedPO.delivery_date}</div>
              <div className="col-span-2"><b>Description:</b> {selectedPO.description}</div>
            </div>

            <div className="mb-6">
              <h3 className="font-bold mb-2">Products</h3>
              {selectedPO.products && selectedPO.products.length > 0 ? (
                <div className="bg-white rounded-lg p-4">
                  <table className="min-w-full">
                    <thead>
                      <tr>
                        <th className="text-left text-sm font-medium text-gray-500 pb-2">Product</th>
                        <th className="text-left text-sm font-medium text-gray-500 pb-2">Description</th>
                        <th className="text-right text-sm font-medium text-gray-500 pb-2">Quantity</th>
                        <th className="text-right text-sm font-medium text-gray-500 pb-2">Unit Price</th>
                        <th className="text-right text-sm font-medium text-gray-500 pb-2">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPO.products.map((product, idx) => (
                        <tr key={idx}>
                          <td className="py-2 text-sm">{product.name}</td>
                          <td className="py-2 text-sm text-gray-600">{product.description}</td>
                          <td className="py-2 text-sm text-right">{product.quantity}</td>
                          <td className="py-2 text-sm text-right">₱{product.price}</td>
                          <td className="py-2 text-sm text-right">₱{product.price * product.quantity}</td>
                        </tr>
                      ))}
                      <tr className="font-bold">
                        <td colSpan="4" className="py-2 text-right">Total:</td>
                        <td className="py-2 text-right">₱{selectedPO.total_price}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-gray-500">No products</div>
              )}
            </div>

            <div className="flex justify-end">
              <button onClick={() => { setViewModalOpen(false); setSelectedPO(null); }} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrderList;