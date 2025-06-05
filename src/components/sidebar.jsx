import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiUsers, FiShoppingBag, FiFileText, FiDollarSign, FiMessageSquare, FiPackage, FiHome, FiShoppingCart, FiChevronDown } from 'react-icons/fi';

const Sidebar = ({ expanded, setExpanded, isMobile }) => {
  const location = useLocation();
  const [procurementExpanded, setProcurementExpanded] = useState(false);

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

  const subNavItemClass = (path) => {
    return `flex items-center px-8 py-2 text-sm transition-colors duration-200 ${
      location.pathname === path ? 'bg-blue-500 text-white' : 'text-gray-400 hover:bg-gray-700'
    }`;
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

            <div>
              <button 
                onClick={() => setProcurementExpanded(!procurementExpanded)}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors duration-200 ${
                  location.pathname.startsWith('/procurement') || 
                  location.pathname === '/purchase-orders' || 
                  location.pathname === '/invoices'
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center">
                  <FiShoppingCart className={iconClass('/procurement')} style={textStyle('/procurement')} />
                  {expanded && <span className="ml-3 font-medium !text-white" style={{ color: 'white' }}>Procurement</span>}
                </div>
                {expanded && (
                  <FiChevronDown 
                    className={`w-4 h-4 transition-transform duration-200 ${procurementExpanded ? 'transform rotate-180' : ''}`}
                    style={textStyle('/procurement')}
                  />
                )}
              </button>
              
              {expanded && procurementExpanded && (
                <div className="mt-1 space-y-1">
                  <Link to="/procurement/request" className={subNavItemClass('/procurement/request')}>
                    <span className="ml-8 font-medium">Request</span>
                  </Link>
                  <Link to="/procurement/items" className={subNavItemClass('/procurement/items')}>
                    <span className="ml-8 font-medium">Items</span>
                  </Link>
                  <Link to="/invoices" className={subNavItemClass('/invoices')}>
                    <span className="ml-8 font-medium">Invoices</span>
                  </Link>
                </div>
              )}
            </div>

            <Link to="/suppliers" className={navItemClass('/suppliers')} style={textStyle('/suppliers')}>
              <FiUsers className={iconClass('/suppliers')} style={textStyle('/suppliers')} />
              {expanded && <span className="ml-3 font-medium !text-white" style={{ color: 'white' }}>Suppliers</span>}
            </Link>

            <Link to="/relationship-management" className={navItemClass('/relationship-management')} style={textStyle('/relationship-management')}>
              <FiMessageSquare className={iconClass('/relationship-management')} style={textStyle('/relationship-management')} />
              {expanded && <span className="ml-3 font-medium !text-white" style={{ color: 'white' }}>Relationship Management</span>}
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
