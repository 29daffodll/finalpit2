import React from 'react';

const Procurement = () => {
  return (
    <div className="flex-1 min-h-screen bg-gray-100">
      <div className="bg-white h-full">
        <div className="flex justify-between items-center py-8 px-8">
          <h1 className="text-2xl font-bold text-gray-800">Procurement</h1>
        </div>
        <div className="p-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Procurement Dashboard</h2>
            {/* Add your procurement content here */}
            <p className="text-gray-600">Welcome to the procurement management section.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Procurement; 