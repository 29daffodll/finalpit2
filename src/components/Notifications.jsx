import React from 'react';

const Notifications = ({ notifications, showNotifications, setShowNotifications, isHovered }) => (
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
);

export default Notifications; 