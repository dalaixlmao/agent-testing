import { useState, useEffect } from 'react';

interface TodoFiltersProps {
  onFilterChange: (filters: Record<string, string>) => void;
}

const TodoFilters: React.FC<TodoFiltersProps> = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: '',
    search: '',
  });

  // Apply filters when they change
  useEffect(() => {
    // Remove empty filters
    const activeFilters: Record<string, string> = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        activeFilters[key] = value;
      }
    });
    onFilterChange(activeFilters);
  }, [filters, onFilterChange]);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      priority: '',
      category: '',
      search: '',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <h3 className="text-lg font-medium mb-4">Filters</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label htmlFor="search" className="form-label">
            Search
          </label>
          <input
            id="search"
            type="text"
            name="search"
            placeholder="Search todos..."
            className="form-input"
            value={filters.search}
            onChange={handleFilterChange}
          />
        </div>

        <div>
          <label htmlFor="status" className="form-label">
            Status
          </label>
          <select
            id="status"
            name="status"
            className="form-input"
            value={filters.status}
            onChange={handleFilterChange}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div>
          <label htmlFor="priority" className="form-label">
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            className="form-input"
            value={filters.priority}
            onChange={handleFilterChange}
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label htmlFor="category" className="form-label">
            Category
          </label>
          <input
            id="category"
            type="text"
            name="category"
            placeholder="Filter by category..."
            className="form-input"
            value={filters.category}
            onChange={handleFilterChange}
          />
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={clearFilters}
          className="btn btn-secondary"
          type="button"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
};

export default TodoFilters;