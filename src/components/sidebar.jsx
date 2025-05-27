import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Notifications from './Notifications';

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
    { id: 'products', path: '/products', label: 'Products', icon: 'M4 7V6a2 2 0 012-2h12a2 2 0 012 2v1M4 7v10a2 2 0 002 2h12a2 2 0 002-2V7M4 7h16' },
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

      <Notifications
        notifications={notifications}
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
        isHovered={isHovered}
      />
    </aside>
  );
};

export default Sidebar;
