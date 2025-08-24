import React, { useState, useMemo } from 'react';
import './SortableTable.css';

const SortableTable = ({ 
  data = [], 
  columns = [], 
  initialSortField = null,
  initialSortDirection = 'asc',
  filters = {},
  onFilterChange = () => {},
  className = '',
  emptyMessage = 'No data available'
}) => {
  const [sortField, setSortField] = useState(initialSortField);
  const [sortDirection, setSortDirection] = useState(initialSortDirection);

  // Handle column sorting
  const handleSort = (field, sortable = true) => {
    if (!sortable) return;

    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter and sort data
  const processedData = useMemo(() => {
    let filteredData = [...data];

    // Apply filters
    Object.keys(filters).forEach(filterKey => {
      const filterValue = filters[filterKey];
      if (filterValue && filterValue.trim() !== '') {
        filteredData = filteredData.filter(item => {
          const itemValue = item[filterKey];
          if (typeof itemValue === 'string') {
            return itemValue.toLowerCase().includes(filterValue.toLowerCase());
          }
          if (typeof itemValue === 'number') {
            return itemValue.toString().includes(filterValue);
          }
          return false;
        });
      }
    });

    // Apply sorting
    if (sortField) {
      filteredData.sort((a, b) => {
        let aValue = a[sortField];
        let bValue = b[sortField];

        // Handle null/undefined values
        if (aValue == null) aValue = '';
        if (bValue == null) bValue = '';

        // Convert to strings for comparison if needed
        if (typeof aValue === 'string') aValue = aValue.toLowerCase();
        if (typeof bValue === 'string') bValue = bValue.toLowerCase();

        let comparison = 0;
        if (aValue > bValue) comparison = 1;
        if (aValue < bValue) comparison = -1;

        return sortDirection === 'desc' ? comparison * -1 : comparison;
      });
    }

    return filteredData;
  }, [data, filters, sortField, sortDirection]);

  // Get sort icon for column
  const getSortIcon = (field, sortable) => {
    if (!sortable) return null;
    
    if (sortField === field) {
      return sortDirection === 'asc' ? '▲' : '▼';
    }
    return '↕️';
  };

  return (
    <div className={`sortable-table-container ${className}`}>
      {/* Filter controls */}
      {Object.keys(filters).length > 0 && (
        <div className="table-filters">
          {Object.keys(filters).map(filterKey => (
            <div key={filterKey} className="filter-group">
              <label htmlFor={`filter-${filterKey}`}>
                {filterKey.charAt(0).toUpperCase() + filterKey.slice(1)}:
              </label>
              <input
                id={`filter-${filterKey}`}
                type="text"
                placeholder={`Filter by ${filterKey}...`}
                value={filters[filterKey] || ''}
                onChange={(e) => onFilterChange(filterKey, e.target.value)}
                className="filter-input"
              />
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="table-wrapper">
        <table className="sortable-table">
          <thead>
            <tr>
              {columns.map((column, index) => (
                <th
                  key={column.field || index}
                  className={`table-header ${column.sortable !== false ? 'sortable' : ''}`}
                  onClick={() => handleSort(column.field, column.sortable !== false)}
                  style={{ 
                    width: column.width || 'auto',
                    textAlign: column.align || 'left'
                  }}
                >
                  <div className="header-content">
                    <span>{column.title}</span>
                    {column.sortable !== false && (
                      <span className="sort-icon">
                        {getSortIcon(column.field, column.sortable !== false)}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {processedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="empty-message">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              processedData.map((row, rowIndex) => (
                <tr key={row.id || rowIndex} className="table-row">
                  {columns.map((column, colIndex) => (
                    <td
                      key={column.field || colIndex}
                      className="table-cell"
                      style={{ textAlign: column.align || 'left' }}
                    >
                      {column.render ? 
                        column.render(row[column.field], row, rowIndex) : 
                        row[column.field]
                      }
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table footer with count */}
      <div className="table-footer">
        <span className="row-count">
          Showing {processedData.length} of {data.length} entries
          {Object.keys(filters).some(key => filters[key]) && ' (filtered)'}
        </span>
      </div>
    </div>
  );
};

export default SortableTable;
