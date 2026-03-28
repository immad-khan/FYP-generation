import React, { useState } from 'react';

const FilterPanel = ({ filters, onFilterChange, availableTags = [] }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = (filterName, value) => {
    onFilterChange({
      ...filters,
      [filterName]: value
    });
  };

  const handleTagToggle = (tag) => {
    const currentTags = filters.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    
    handleFilterChange('tags', newTags);
  };

  const clearFilters = () => {
    onFilterChange({
      department: '',
      semester: '',
      difficulty: '',
      tags: []
    });
  };

  const hasActiveFilters = filters.department || filters.semester || filters.difficulty || (filters.tags && filters.tags.length > 0);

  return (
    <div className="bg-[#161625] rounded-xl border border-[#7F5CFF]/30 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-cyan-300">Filter Ideas</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-gray-400 hover:text-white"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Department</label>
          <select
            value={filters.department || ''}
            onChange={(e) => handleFilterChange('department', e.target.value)}
            className="w-full p-2 bg-[#2A004E] border border-[#7F5CFF]/30 rounded text-white text-sm"
          >
            <option value="">All Departments</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Software Engineering">Software Engineering</option>
            <option value="Artificial Intelligence">AI</option>
            <option value="Data Science">Data Science</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Semester</label>
          <select
            value={filters.semester || ''}
            onChange={(e) => handleFilterChange('semester', e.target.value)}
            className="w-full p-2 bg-[#2A004E] border border-[#7F5CFF]/30 rounded text-white text-sm"
          >
            <option value="">All Semesters</option>
            {[8, 7, 6, 5, 4, 3, 2, 1].map(sem => (
              <option key={sem} value={sem}>Semester {sem}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty</label>
          <select
            value={filters.difficulty || ''}
            onChange={(e) => handleFilterChange('difficulty', e.target.value)}
            className="w-full p-2 bg-[#2A004E] border border-[#7F5CFF]/30 rounded text-white text-sm"
          >
            <option value="">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>

        {availableTags.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-1 rounded-full text-xs transition ${
                    filters.tags?.includes(tag)
                      ? 'bg-[#00FFF0] text-[#12042B] font-medium'
                      : 'bg-[#7F5CFF]/20 text-[#7F5CFF] hover:bg-[#7F5CFF]/30'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {hasActiveFilters && (
          <div className="pt-4 border-t border-gray-700">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Active Filters:</h4>
            <div className="flex flex-wrap gap-2">
              {filters.department && (
                <span className="px-2 py-1 bg-purple-600/30 text-purple-300 rounded text-xs">
                  Dept: {filters.department}
                  <button
                    onClick={() => handleFilterChange('department', '')}
                    className="ml-1 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.semester && (
                <span className="px-2 py-1 bg-blue-600/30 text-blue-300 rounded text-xs">
                  Sem: {filters.semester}
                  <button
                    onClick={() => handleFilterChange('semester', '')}
                    className="ml-1 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.difficulty && (
                <span className="px-2 py-1 bg-green-600/30 text-green-300 rounded text-xs">
                  {filters.difficulty}
                  <button
                    onClick={() => handleFilterChange('difficulty', '')}
                    className="ml-1 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.tags?.map((tag) => (
                <span key={tag} className="px-2 py-1 bg-cyan-600/30 text-cyan-300 rounded text-xs">
                  {tag}
                  <button
                    onClick={() => handleTagToggle(tag)}
                    className="ml-1 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterPanel;