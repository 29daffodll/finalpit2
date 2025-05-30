import React, { useState } from 'react';
import SupplierList from './SupplierList';
import SupplierOnboarding from './SupplierOnboarding';
import { motion } from 'framer-motion';

const Suppliers = ({ suppliers, setSuppliers }) => {
  const [activeTab, setActiveTab] = useState('list');

  return (
    <div className="flex-1 min-h-screen bg-gray-100">
      <div className="bg-white h-full">
        <div className="border-b border-gray-200">
          <div className="flex space-x-4 px-8 mb-6 border-b border-gray-200">
            {[
              { id: 'list', label: 'Supplier List' },
              { id: 'onboarding', label: 'Supplier Onboarding' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 font-medium text-sm transition-colors duration-200 relative ${
                  activeTab === tab.id
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'list' ? (
          <SupplierList suppliers={suppliers} setSuppliers={setSuppliers} />
        ) : (
          <SupplierOnboarding />
        )}
      </div>
    </div>
  );
};

export default Suppliers; 