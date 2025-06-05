import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import Dashboard from './components/dashboard.jsx';
import Suppliers from './components/Suppliers';
import InvoiceList from './components/InvoiceList';
import PurchaseOrderList from './components/PurchaseOrderList';
import Sidebar from './components/sidebar';
import SupplierOnboarding from './components/SupplierOnboarding';
import Products from './components/Products';
import RelationshipManagement from './components/RelationshipManagement';
import Procurement from './components/Procurement';
import ProcurementItems from './components/procurement/Items';
import ProcurementRequest from './components/procurement/Request';

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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarExpanded(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="flex min-h-screen bg-white">
        <Sidebar 
          expanded={sidebarExpanded} 
          setExpanded={setSidebarExpanded} 
          isMobile={isMobile}
        />
        <main
          className={`flex-1 transition-all duration-300 ${
            isMobile ? 'w-full' : ''
          }`}
          style={{ 
            marginLeft: isMobile ? 0 : (sidebarExpanded ? 256 : 80),
            width: isMobile ? '100%' : 'auto'
          }}
        >
          <div className="p-0 md:p-6">
            <Routes>
              <Route path="/" element={<Dashboard suppliers={suppliers} />} />
              <Route path="/dashboard" element={<Dashboard suppliers={suppliers} />} />
              <Route path="/procurement" element={<Procurement />} />
              <Route path="/procurement/items" element={<ProcurementItems />} />
              <Route path="/procurement/request" element={<ProcurementRequest />} />
              <Route path="/suppliers" element={<Suppliers suppliers={suppliers} setSuppliers={setSuppliers} />} />
              <Route path="/suppliers/onboarding" element={<SupplierOnboarding />} />
              <Route path="/invoices" element={<InvoiceList purchaseOrders={purchaseOrders} />} />
              <Route path="/purchase-orders" element={<PurchaseOrderList purchaseOrders={purchaseOrders} setPurchaseOrders={setPurchaseOrders} />} />
              <Route path="/products" element={<Products />} />
              <Route path="/relationship-management" element={<RelationshipManagement />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App; 