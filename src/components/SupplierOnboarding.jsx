import React from 'react';
import { Link } from 'react-router-dom';

const SupplierOnboarding = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Supplier Onboarding</h1>
      <nav className="bg-gray-100 rounded-lg mb-6">
        <ul className="flex space-x-6 p-4">
          <li>
            <Link to="/suppliers" className="text-gray-700 hover:text-blue-600">All Suppliers</Link>
          </li>
          <li>
            <Link to="/suppliers/aproved" className="text-blue-600 font-medium">Recently Approved</Link>
          </li>
          <li>
            <Link to="/suppliers/pending" className="text-gray-700 hover:text-blue-600">Pending Approval</Link>
          </li>
          <li>
            <Link to="/suppliers/rejected" className="text-gray-700 hover:text-blue-600">Rejected Approval</Link>
          </li>
        </ul>
      </nav>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500">Supplier onboarding form will be implemented here.</p>
      </div>
    </div>
  );
};

export default SupplierOnboarding; 