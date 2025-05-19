// src/components/Dashboard.jsx
import React from 'react'

const Dashboard = ({ suppliers }) => {
  const data = {
    activeSuppliers: suppliers.length,
    pendingPOs: 8,
    pendingInvoices: 5,
    lateDeliveries: 3,
    upcomingExpirations: 4,
    procurementCost: '₱150,000',
  }

  // Get top 5 suppliers sorted by performance rating
  const topSuppliers = [...suppliers]
    .sort((a, b) => parseFloat(b.performance_rating) - parseFloat(a.performance_rating))
    .slice(0, 5)
    .map(supplier => ({
      name: supplier.name,
      rating: supplier.performance_rating,
      classification: supplier.classification
    }));

  return (
    <div className="flex-1 min-h-screen bg-gray-100">
      <div className="bg-white h-full">
        <h1 className="text-2xl font-bold py-8 text-gray-800 px-8">
          Procurement Dashboard
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-8 mb-8">
          <Card title="Active Suppliers" value={data.activeSuppliers} />
          <Card title="Pending POs" value={data.pendingPOs} />
          <Card title="Pending Invoices" value={data.pendingInvoices} />
          <Card title="Late Deliveries" value={data.lateDeliveries} />
          <Card title="Upcoming Expirations" value={data.upcomingExpirations} />
          <Card
            title="Total Procurement Cost (This Month)"
            value={data.procurementCost}
          />
        </div>

        <div className="mx-8 bg-gray-50 rounded-xl p-6 shadow-inner">
          <h2 className="text-xl font-semibold mb-3 text-black">Top Suppliers</h2>
          <div className="space-y-3">
            {topSuppliers.map((supplier, index) => (
              <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
                <div>
                  <h3 className="font-medium text-gray-900">{supplier.name}</h3>
                  <p className="text-sm text-gray-500">{supplier.classification}</p>
                </div>
                <div className="flex items-center">
                  <span className="text-yellow-500 mr-1">{'★'.repeat(Math.floor(parseFloat(supplier.rating)))}</span>
                  <span className="text-sm text-gray-600">({supplier.rating})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const Card = ({ title, value }) => (
  <div className="bg-white rounded-xl p-6 shadow hover:shadow-md transition">
    <h2 className="text-sm text-gray-500">{title}</h2>
    <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
  </div>
)

export default Dashboard
