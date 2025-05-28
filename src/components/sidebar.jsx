import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ expanded, setExpanded }) => {
  const location = useLocation();

  // Helper to determine active/inactive classes
  const navItemClass = (path) =>
    `flex items-center p-3 rounded-lg transition-all duration-200 mb-1 ` +
    (location.pathname === path
      ? '!text-white !bg-gray-700 shadow-md'
      : '!text-gray-300 hover:!text-white hover:bg-gray-700');
  const iconClass = (path) =>
    `w-6 h-6 mr-0 ${location.pathname === path ? '!text-white' : '!text-gray-300 group-hover:!text-white'}`;
  const textStyle = (path) => location.pathname === path ? { color: 'white' } : { color: '#d1d5db' };

  return (
    <div
      className={`bg-gray-800 text-white h-screen fixed left-0 top-0 transition-all duration-300 z-40`}
      style={{ width: expanded ? 256 : 80 }}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <div className="p-4">
        <div className="flex items-center justify-center mb-8">
          <svg className="w-8 h-8 !text-yellow-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="coinGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fde68a" />
                <stop offset="100%" stopColor="#fbbf24" />
              </radialGradient>
            </defs>
            <circle cx="12" cy="12" r="10" fill="url(#coinGradient)" stroke="#f59e42" strokeWidth="2" filter="drop-shadow(0 1px 2px #0002)" />
            <circle cx="12" cy="12" r="6" stroke="#fbbf24" strokeWidth="2" fill="none" />
            <text x="12" y="16" textAnchor="middle" fontSize="8" fill="#fff" fontWeight="bold" fontFamily="Arial, sans-serif">₱</text>
          </svg>
          {expanded && <span className="ml-2 text-xl font-bold !text-white" style={{ color: 'white' }}>lousyyy</span>}
        </div>

        <nav className="space-y-2">
          <Link to="/dashboard" className={navItemClass('/dashboard')} style={textStyle('/dashboard')}>
            <svg className={iconClass('/dashboard')} style={textStyle('/dashboard')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            {expanded && <span className="ml-3 font-medium !text-white" style={{ color: 'white' }}>Dashboard</span>}
          </Link>

          <Link to="/products" className={navItemClass('/products')} style={textStyle('/products')}>
            <svg className={iconClass('/products')} style={textStyle('/products')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7V6a2 2 0 012-2h12a2 2 0 012 2v1M4 7v10a2 2 0 002 2h12a2 2 0 002-2V7M4 7h16" />
            </svg>
            {expanded && <span className="ml-3 font-medium !text-white" style={{ color: 'white' }}>Products</span>}
          </Link>

          <Link to="/vendors" className={navItemClass('/vendors')} style={textStyle('/vendors')}>
            <svg className={iconClass('/vendors')} style={textStyle('/vendors')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {expanded && <span className="ml-3 font-medium !text-white" style={{ color: 'white' }}>Vendors</span>}
          </Link>

          <Link to="/purchase-orders" className={navItemClass('/purchase-orders')} style={textStyle('/purchase-orders')}>
            <svg className={iconClass('/purchase-orders')} style={textStyle('/purchase-orders')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            {expanded && <span className="ml-3 font-medium !text-white" style={{ color: 'white' }}>Purchase Orders</span>}
          </Link>

          <Link to="/invoices" className={navItemClass('/invoices')} style={textStyle('/invoices')}>
            <svg className={iconClass('/invoices')} style={textStyle('/invoices')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {expanded && <span className="ml-3 font-medium !text-white" style={{ color: 'white' }}>Invoices</span>}
          </Link>

          <Link to="/suppliers" className={navItemClass('/suppliers')} style={textStyle('/suppliers')}>
            <svg className={iconClass('/suppliers')} style={textStyle('/suppliers')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {expanded && <span className="ml-3 font-medium !text-white" style={{ color: 'white' }}>Suppliers</span>}
          </Link>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
