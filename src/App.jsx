import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import Dashboard from './components/dashboard.jsx';
import Suppliers from './components/Suppliers';
import InvoiceList from './components/InvoiceList';
import PurchaseOrderList from './components/PurchaseOrderList';
import VendorList from './components/VendorList';
import Sidebar from './components/sidebar';
import SupplierOnboarding from './components/SupplierOnboarding';
import Products from './components/Products';

function App() {
  const [suppliers, setSuppliers] = useState([
    {
      supplier_id: 'SUP001',
      name: 'Tech Solutions Inc.',
      contact_details: 'john.doe@techsolutions.com | +1 234-567-8900',
      product_service_offerings: 'Computer Hardware, Networking Equipment',
      certifications: 'ISO 9001, ISO 27001',
      compliance_history: 'No violations',
      classification: 'Technology',
      geographical_location: 'New York, USA',
      performance_rating: '4.8',
      product_service: 'Hardware Supplier'
    },
    {
      supplier_id: 'SUP002',
      name: 'Office Pro Supplies',
      contact_details: 'contact@officepro.com | +1 555-123-4567',
      product_service_offerings: 'Office Supplies, Furniture',
      certifications: 'ISO 9001',
      compliance_history: 'No violations',
      classification: 'Office Supplies',
      geographical_location: 'Chicago, USA',
      performance_rating: '4.6',
      product_service: 'Office Supplies'
    },
    {
      supplier_id: 'SUP003',
      name: 'Global IT Services',
      contact_details: 'support@globalit.com | +1 777-888-9999',
      product_service_offerings: 'IT Services, Software',
      certifications: 'ISO 27001, CMMI Level 5',
      compliance_history: 'No violations',
      classification: 'IT Services',
      geographical_location: 'San Francisco, USA',
      performance_rating: '4.9',
      product_service: 'IT Services'
    }
  ]);

  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  return (
    <Router>
      <div className="flex min-h-screen">
        <Sidebar expanded={sidebarExpanded} setExpanded={setSidebarExpanded} />
        <main
          className="flex-1 transition-all duration-300"
          style={{ marginLeft: sidebarExpanded ? 256 : 80 }}
        >
          <Routes>
            <Route path="/" element={<Dashboard suppliers={suppliers} />} />
            <Route path="/dashboard" element={<Dashboard suppliers={suppliers} />} />
            <Route path="/suppliers" element={<Suppliers suppliers={suppliers} setSuppliers={setSuppliers} />} />
            <Route path="/suppliers/onboarding" element={<SupplierOnboarding />} />
            <Route path="/invoices" element={<InvoiceList purchaseOrders={purchaseOrders} />} />
            <Route path="/purchase-orders" element={<PurchaseOrderList purchaseOrders={purchaseOrders} setPurchaseOrders={setPurchaseOrders} />} />
            <Route path="/vendors" element={<VendorList />} />
            <Route path="/products" element={<Products />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App; 