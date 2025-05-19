import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();

  // Sample notifications - in a real app, this would come from a backend
  const notifications = [
    { id: 1, message: "New invoice received from Tech Solutions Inc.", time: "5 min ago" },
    { id: 2, message: "Purchase order PO-2024-001 approved", time: "10 min ago" },
    { id: 3, message: "Supplier rating updated", time: "1 hour ago" }
  ];

  const menuItems = [
    { id: 'dashboard', path: '/dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'suppliers', path: '/suppliers', label: 'Suppliers', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { id: 'vendors', path: '/vendors', label: 'Vendors', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { id: 'purchase-orders', path: '/purchase-orders', label: 'Purchase Orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
    { id: 'invoices', path: '/invoices', label: 'Invoices', icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
    { id: 'settings', path: '/settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
  ];

  return (
    <aside 
      className={`bg-gray-800 text-white min-h-screen transition-all duration-300 ease-in-out relative ${isHovered ? 'w-64' : 'w-16'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowNotifications(false);
      }}
    >
      <div className={`p-4 ${isHovered ? 'px-6' : 'px-2'}`}>
        <h2 className={`font-bold mb-6 transition-opacity duration-300 text-white ${isHovered ? 'text-2xl opacity-100' : 'text-xl opacity-0 h-0'}`}>
          Menu
        </h2>
        <ul>
          {menuItems.map((item) => (
            <li key={item.id} className="mb-4">
              <Link 
                to={item.path}
                className={`flex items-center transition-all duration-300 hover:bg-gray-700 rounded-lg p-2 text-white ${
                  location.pathname === item.path ? 'bg-gray-700' : ''
                }`}
              >
                <svg 
                  className={`h-6 w-6 text-white ${isHovered ? 'mr-3' : 'mx-auto'}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d={item.icon}
                  />
                </svg>
                <span className={`transition-opacity duration-300 text-white ${isHovered ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>
                  {item.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Notification Button */}
      <div className="absolute bottom-4 left-0 w-full px-4">
        <div className="relative">
          <button
            className={`flex items-center justify-center ${isHovered ? 'w-full' : 'w-8'} h-8 bg-gray-700 rounded-lg hover:bg-gray-600 transition-all duration-300 text-white`}
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <div className="relative">
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <span className="absolute -top-2 -right-2 h-4 w-4 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                {notifications.length}
              </span>
            </div>
            {isHovered && (
              <span className="ml-2 text-white">Notifications</span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && isHovered && (
            <div className="absolute bottom-full left-0 w-full mb-2 bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700">
              <div className="max-h-64 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="p-3 border-b border-gray-700 hover:bg-gray-700 cursor-pointer"
                  >
                    <p className="text-white text-sm">{notification.message}</p>
                    <p className="text-gray-400 text-xs mt-1">{notification.time}</p>
                  </div>
                ))}
              </div>
              <div className="p-2 bg-gray-700">
                <button className="text-sm text-white hover:text-gray-300 w-full text-center">
                  View All Notifications
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
