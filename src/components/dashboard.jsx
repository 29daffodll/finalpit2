// src/components/Dashboard.jsx
import React from 'react'

const purchaseOrderSummary = [
  { label: 'Open', value: 48 },
  { label: 'Pending', value: 61 },
  { label: 'Not Sent', value: 32 },
  { label: 'Performing', value: 153 },
];

const purchaseOrders = [
  { id: 2135, status: 'Open', sendingStatus: 'Sent', payment: 'Not Received', purchaser: 'Leslie Alexander', department: 'Sale', supplier: 'Marvin McKinney', total: '$646.61', date: '02 Sep 2020', dueDate: '12 Sep 2020' },
  { id: 2134, status: 'Open', sendingStatus: 'Sent', payment: 'Not Received', purchaser: 'Arlene McCoy', department: 'Sale', supplier: 'Bessie Cooper', total: '$948.55', date: '19 Oct 2020', dueDate: '29 Oct 2020' },
  { id: 2133, status: 'Open', sendingStatus: 'Sent', payment: 'Not Received', purchaser: 'Devon Lane', department: 'Sale', supplier: 'Wade Warren', total: '$778.35', date: '12 Sep 2020', dueDate: '19 Sep 2020' },
  { id: 2132, status: 'Open', sendingStatus: 'Sent', payment: 'Not Received', purchaser: 'Jane Cooper', department: 'Sale', supplier: 'Esther Howard', total: '$106.58', date: '27 Oct 2020', dueDate: '30 Oct 2020' },
  { id: 2131, status: 'Open', sendingStatus: 'Sent', payment: 'Not Received', purchaser: 'Robert Fox', department: 'Sale', supplier: 'Cameron Williamson', total: '$202.67', date: '22 Sep 2020', dueDate: '27 Sep 2020' },
  { id: 2130, status: 'Open', sendingStatus: 'Sent', payment: 'Not Received', purchaser: 'Savannah Nguyen', department: 'Sale', supplier: 'Ronald Richards', total: '$328.85', date: '5 May 2020', dueDate: '18 May 2020' },
];

const Dashboard = () => {
  return (
    <div className="flex-1 min-h-screen bg-gray-100">
      <div className="bg-white h-full p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-8">Dashboard</h1>
        {/* Status Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {purchaseOrderSummary.map((card, idx) => (
            <div key={card.label} className={`rounded-xl p-6 shadow hover:shadow-md transition border-2 ${idx === 0 ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}>
              <div className="text-sm text-gray-500 mb-2">{card.label} Orders</div>
              <div className="text-3xl font-bold text-gray-800">{card.value}</div>
            </div>
          ))}
        </div>
        <div className="flex justify-end mb-4">
          <button className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center">
            <span className="text-2xl mr-2">+</span> CREATE PURCHASE
          </button>
        </div>
        {/* Table */}
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID#</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sending Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purchaser</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {purchaseOrders.map((po) => (
                <tr key={po.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{po.id}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{po.status}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600">{po.sendingStatus}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-red-600">{po.payment}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{po.purchaser}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{po.department}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{po.supplier}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{po.total}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{po.date}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{po.dueDate}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                    <button className="text-gray-400 hover:text-gray-600">•••</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Chart Placeholder */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <div className="text-gray-500 mb-2">Purchase requests</div>
          <div className="h-32 flex items-center justify-center text-gray-400">[Chart Placeholder]</div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
