// src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    totalInvoices: 0,
    totalAmount: 0,
    pendingInvoices: 0,
    totalPOs: 0,
    pendingPOs: 0,
    totalSuppliers: 0,
    overdueInvoices: 0,
    overdueAmount: 0,
    monthlyInvoices: 0,
    monthlyAmount: 0
  });
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [recentPOs, setRecentPOs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [monthlyTrend, setMonthlyTrend] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch invoices data
      const { data: invoices, error: invoicesError } = await supabase
        .from('invoices')
        .select('*');
      
      if (invoicesError) throw invoicesError;

      // Fetch purchase orders data
      const { data: purchaseOrders, error: poError } = await supabase
        .from('purchase_order')
        .select('*');
      
      if (poError) throw poError;

      // Calculate metrics
      const totalAmount = invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
      const pendingInvoices = invoices.filter(inv => inv.status === 'Pending').length;
      const pendingPOs = purchaseOrders.filter(po => po.status === 'Pending').length;

      // Calculate overdue invoices
      const today = new Date();
      const overdueInvoices = invoices.filter(inv => {
        const dueDate = new Date(inv.due_date);
        return inv.status === 'Pending' && dueDate < today;
      });
      const overdueAmount = overdueInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);

      // Calculate monthly metrics
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyInvoices = invoices.filter(inv => {
        const invDate = new Date(inv.issue_date);
        return invDate.getMonth() === currentMonth && invDate.getFullYear() === currentYear;
      });
      const monthlyAmount = monthlyInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);

      // Calculate monthly trend (last 6 months)
      const monthlyTrend = Array.from({ length: 6 }, (_, i) => {
        const month = new Date();
        month.setMonth(month.getMonth() - i);
        const monthInvoices = invoices.filter(inv => {
          const invDate = new Date(inv.issue_date);
          return invDate.getMonth() === month.getMonth() && 
                 invDate.getFullYear() === month.getFullYear();
        });
        return {
          month: month.toLocaleString('default', { month: 'short' }),
          count: monthInvoices.length,
          amount: monthInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0)
        };
      }).reverse();

      // Get recent invoices and POs
      const recentInvoices = [...invoices]
        .sort((a, b) => new Date(b.issue_date) - new Date(a.issue_date))
        .slice(0, 5);

      const recentPOs = [...purchaseOrders]
        .sort((a, b) => new Date(b.order_date) - new Date(a.order_date))
        .slice(0, 5);

      setMetrics({
        totalInvoices: invoices.length,
        totalAmount,
        pendingInvoices,
        totalPOs: purchaseOrders.length,
        pendingPOs,
        totalSuppliers: 0,
        overdueInvoices: overdueInvoices.length,
        overdueAmount,
        monthlyInvoices: monthlyInvoices.length,
        monthlyAmount
      });

      setRecentInvoices(recentInvoices);
      setRecentPOs(recentPOs);
      setMonthlyTrend(monthlyTrend);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4">Loading dashboard data...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="flex-1 min-h-screen bg-gray-100">
      <div className="bg-white h-full p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        </div>
        
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow hover:shadow-md transition border-2 border-blue-500">
            <div className="text-sm text-gray-500 mb-2">Total Invoices</div>
            <div className="text-3xl font-bold text-gray-800">{metrics.totalInvoices}</div>
            <div className="text-sm text-gray-500 mt-2">
              ₱{metrics.totalAmount.toLocaleString()} total amount
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow hover:shadow-md transition border-2 border-yellow-500">
            <div className="text-sm text-gray-500 mb-2">Pending Invoices</div>
            <div className="text-3xl font-bold text-gray-800">{metrics.pendingInvoices}</div>
            <div className="text-sm text-gray-500 mt-2">
              {((metrics.pendingInvoices / metrics.totalInvoices) * 100).toFixed(1)}% of total
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow hover:shadow-md transition border-2 border-red-500">
            <div className="text-sm text-gray-500 mb-2">Overdue Invoices</div>
            <div className="text-3xl font-bold text-gray-800">{metrics.overdueInvoices}</div>
            <div className="text-sm text-gray-500 mt-2">
              ₱{metrics.overdueAmount.toLocaleString()} total overdue
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow hover:shadow-md transition border-2 border-green-500">
            <div className="text-sm text-gray-500 mb-2">This Month</div>
            <div className="text-3xl font-bold text-gray-800">{metrics.monthlyInvoices}</div>
            <div className="text-sm text-gray-500 mt-2">
              ₱{metrics.monthlyAmount.toLocaleString()} total amount
            </div>
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Monthly Trend</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-6 gap-4">
              {monthlyTrend.map((month) => (
                <div key={month.month} className="text-center">
                  <div className="text-sm text-gray-500">{month.month}</div>
                  <div className="text-lg font-semibold text-gray-800">{month.count}</div>
                  <div className="text-sm text-gray-500">₱{month.amount.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Invoices */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">Recent Invoices</h2>
                <Link to="/invoices" className="text-blue-600 hover:text-blue-800 text-sm">
                  View All
                </Link>
              </div>
            </div>
            <div className="p-6">
              {recentInvoices.length === 0 ? (
                <p className="text-gray-500 text-center">No recent invoices</p>
              ) : (
                <div className="space-y-4">
                  {recentInvoices.map((invoice) => (
                    <div key={invoice.invoice_number} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-800">INV-{String(invoice.invoice_number).padStart(3, '0')}</p>
                        <p className="text-sm text-gray-500">{invoice.issue_date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-800">₱{invoice.amount}</p>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          invoice.status === 'Paid' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {invoice.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Purchase Orders */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">Recent Purchase Orders</h2>
                <Link to="/purchase-orders" className="text-blue-600 hover:text-blue-800 text-sm">
                  View All
                </Link>
              </div>
            </div>
            <div className="p-6">
              {recentPOs.length === 0 ? (
                <p className="text-gray-500 text-center">No recent purchase orders</p>
              ) : (
                <div className="space-y-4">
                  {recentPOs.map((po) => (
                    <div key={po.order_id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-800">PO-{po.order_id}</p>
                        <p className="text-sm text-gray-500">{po.order_date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-800">₱{po.total_amount}</p>
                        <p className="text-sm text-gray-500">{po.supplier_name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
