import React from 'react';

const SearchBar = ({ placeholder, onSearch }) => {
  return (
    <div className="mb-6">
      <input
        type="text"
        placeholder={placeholder}
        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>
  );
};

export default SearchBar; 