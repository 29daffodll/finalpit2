import React, { useState } from 'react';
import SupplierList from './SupplierList';
import SupplierOnboarding from './SupplierOnboarding';

const Suppliers = ({ suppliers, setSuppliers }) => {
  const [activeTab, setActiveTab] = useState('list');

  return (
    <div className="flex-1 min-h-screen bg-gray-100">
      <div className="bg-white h-full">
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-8 py-4">
            <button
              className={`pb-4 px-1 ${
                activeTab === 'list'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('list')}
            >
              Supplier List
            </button>
            <button
              className={`pb-4 px-1 ${
                activeTab === 'onboarding'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('onboarding')}
            >
              Supplier Onboarding
            </button>
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