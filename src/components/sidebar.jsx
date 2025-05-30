import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiUsers, FiShoppingBag, FiFileText, FiDollarSign, FiMessageSquare, FiPackage, FiBox, FiHome } from 'react-icons/fi';

const Sidebar = ({ expanded, setExpanded, isMobile }) => {
  const location = useLocation();

  // Helper to determine active/inactive classes
  const navItemClass = (path) => {
    return `flex items-center px-4 py-3 text-sm transition-colors duration-200 ${
      location.pathname === path ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
    }`;
  };

  const iconClass = (path) => {
    return `w-5 h-5 ${location.pathname === path ? 'text-white' : 'text-gray-500'}`;
  };

  const textStyle = (path) => {
    return location.pathname === path ? { color: 'white' } : {};
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && expanded && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setExpanded(false)}
        />
      )}
      
      <div
        className={`bg-gray-800 text-white h-screen fixed left-0 top-0 transition-all duration-300 z-40
          ${isMobile ? (expanded ? 'w-64' : '-translate-x-full') : ''}`}
        style={{ width: !isMobile ? (expanded ? 256 : 80) : undefined }}
        onMouseEnter={() => !isMobile && setExpanded(true)}
        onMouseLeave={() => !isMobile && setExpanded(false)}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center justify-center w-full">
              {expanded ? (
                <span className="text-xl font-bold text-white">PMS</span>
              ) : (
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
              )}
            </div>
            {isMobile && (
              <button
                onClick={() => setExpanded(false)}
                className="text-gray-400 hover:text-white focus:outline-none"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <nav className="space-y-2">
            <Link to="/dashboard" className={navItemClass('/dashboard')} style={textStyle('/dashboard')}>
              <FiHome className={iconClass('/dashboard')} style={textStyle('/dashboard')} />
              {expanded && <span className="ml-3 font-medium !text-white" style={{ color: 'white' }}>Dashboard</span>}
            </Link>

            <Link to="/suppliers" className={navItemClass('/suppliers')} style={textStyle('/suppliers')}>
              <FiUsers className={iconClass('/suppliers')} style={textStyle('/suppliers')} />
              {expanded && <span className="ml-3 font-medium !text-white" style={{ color: 'white' }}>Suppliers</span>}
            </Link>

            <Link to="/purchase-orders" className={navItemClass('/purchase-orders')} style={textStyle('/purchase-orders')}>
              <FiFileText className={iconClass('/purchase-orders')} style={textStyle('/purchase-orders')} />
              {expanded && <span className="ml-3 font-medium !text-white" style={{ color: 'white' }}>Purchase Orders</span>}
            </Link>

            <Link to="/invoices" className={navItemClass('/invoices')} style={textStyle('/invoices')}>
              <FiDollarSign className={iconClass('/invoices')} style={textStyle('/invoices')} />
              {expanded && <span className="ml-3 font-medium !text-white" style={{ color: 'white' }}>Invoices</span>}
            </Link>

            <Link to="/relationship-management" className={navItemClass('/relationship-management')} style={textStyle('/relationship-management')}>
              <FiMessageSquare className={iconClass('/relationship-management')} style={textStyle('/relationship-management')} />
              {expanded && <span className="ml-3 font-medium !text-white" style={{ color: 'white' }}>Relationship Management</span>}
            </Link>

            <Link to="/products" className={navItemClass('/products')} style={textStyle('/products')}>
              <FiPackage className={iconClass('/products')} style={textStyle('/products')} />
              {expanded && <span className="ml-3 font-medium !text-white" style={{ color: 'white' }}>Products</span>}
            </Link>

            <Link to="/inventory" className={navItemClass('/inventory')} style={textStyle('/inventory')}>
              <FiBox className={iconClass('/inventory')} style={textStyle('/inventory')} />
              {expanded && <span className="ml-3 font-medium !text-white" style={{ color: 'white' }}>Inventory Management</span>}
            </Link>
          </nav>
        </div>
      </div>

      {/* Mobile menu button */}
      {isMobile && !expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="fixed top-4 left-4 z-50 p-2 rounded-md bg-gray-800 text-white focus:outline-none"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}
    </>
  );
};

export default Sidebar;
