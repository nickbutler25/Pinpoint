import React, { useMemo, useState } from 'react';
import './LocationFilter.css';

interface LocationFilterProps {
  locations: string[];
  selectedLocations: string[];
  onLocationChange: (locations: string[]) => void;
  onApplyFilter: () => void;
  totalItems: number;
  filteredItems: number;
  locationColumnName: string;
}

const LocationFilter: React.FC<LocationFilterProps> = ({
  locations,
  selectedLocations,
  onLocationChange,
  onApplyFilter,
  totalItems,
  filteredItems,
  locationColumnName
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const filteredLocations = useMemo(() => {
    if (!searchTerm) return locations;
    return locations.filter(location =>
      location.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [locations, searchTerm]);

  const handleLocationToggle = (location: string) => {
    const isSelected = selectedLocations.includes(location);
    let newSelected: string[];

    if (isSelected) {
      newSelected = selectedLocations.filter(loc => loc !== location);
    } else {
      newSelected = [...selectedLocations, location];
    }

    onLocationChange(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedLocations.length === filteredLocations.length) {
      // Deselect all
      onLocationChange([]);
    } else {
      // Select all filtered locations
      const allFiltered = [...new Set([...selectedLocations, ...filteredLocations])];
      onLocationChange(allFiltered);
    }
  };

  const handleClearAll = () => {
    onLocationChange([]);
    setSearchTerm('');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const isAllSelected = filteredLocations.length > 0 &&
    filteredLocations.every(loc => selectedLocations.includes(loc));

  return (
    <div className="location-filter-container">
      <div className="filter-header">
        <div className="filter-title">
          <span>Filter by {locationColumnName}</span>
          <span className="selected-count">
            ({selectedLocations.length} selected)
          </span>
        </div>

        <div className="filter-actions">
          <button
            className="clear-button"
            onClick={handleClearAll}
            disabled={selectedLocations.length === 0}
          >
            Clear All
          </button>
          <button
            className="apply-button"
            onClick={onApplyFilter}
          >
            Apply Filter
          </button>
        </div>
      </div>

      <div className="dropdown-container">
        <div className="dropdown-trigger" onClick={toggleDropdown}>
          <div className="selected-locations-display">
            {selectedLocations.length === 0 ? (
              <span className="placeholder">Select {locationColumnName.toLowerCase()}...</span>
            ) : selectedLocations.length === 1 ? (
              <span>{selectedLocations[0]}</span>
            ) : (
              <span>{selectedLocations.length} locations selected</span>
            )}
          </div>
          <span className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}>
            ▼
          </span>
        </div>

        {isDropdownOpen && (
          <div className="dropdown-content">
            <div className="search-container">
              <input
                type="text"
                className="search-input"
                placeholder={`Search ${locationColumnName.toLowerCase()}...`}
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>

            <div className="select-all-container">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  className="checkbox-input"
                />
                <span className="checkbox-text">
                  {isAllSelected ? 'Deselect All' : 'Select All'}
                  ({filteredLocations.length})
                </span>
              </label>
            </div>

            <div className="locations-list">
              {filteredLocations.length === 0 ? (
                <div className="no-results">No locations found</div>
              ) : (
                filteredLocations.map((location) => {
                  const isSelected = selectedLocations.includes(location);
                  return (
                    <label key={location} className="checkbox-label location-item">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleLocationToggle(location)}
                        className="checkbox-input"
                      />
                      <span className="checkbox-text">{location}</span>
                    </label>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      <div className="filter-summary">
        <div className="summary-stats">
          <span>Total: {totalItems}</span>
          <span>•</span>
          <span>Showing: {filteredItems}</span>
          <span>•</span>
          <span>Available: {locations.length} locations</span>
        </div>
        
        {selectedLocations.length > 0 && (
          <div className="active-filters">
            <strong>Filtering by:</strong>
            <div className="filter-tags">
              {selectedLocations.map(location => (
                <span key={location} className="filter-tag">
                  {location}
                  <button
                    className="remove-filter"
                    onClick={() => handleLocationToggle(location)}
                    title={`Remove ${location}`}
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

export default LocationFilter;