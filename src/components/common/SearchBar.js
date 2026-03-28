import React, { useState } from 'react';

const SearchBar = ({ onSearch, placeholder = "Search..." }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full p-3 pl-12 pr-12 bg-[#161625] border border-[#7F5CFF]/30 rounded-lg text-white focus:border-[#00FFF0] focus:outline-none"
        />
        <div className="absolute left-3 top-3 text-gray-400">
          <i className="fas fa-search"></i>
        </div>
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-3 text-gray-400 hover:text-white"
          >
            <i className="fas fa-times"></i>
          </button>
        )}
      </div>
    </form>
  );
};

export default SearchBar;