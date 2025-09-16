// client/src/components/LocationFilterModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import './LocationFilterModal.css';

interface LocationFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (selectedLocations: string[], operator: string) => void;
  columnId: string;
  boardId: string;
  monday: any;
}

const LocationFilterModal: React.FC<LocationFilterModalProps> = ({
  isOpen,
  onClose,
  onApply,
  columnId,
  boardId,
  monday
}) => {
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);
  const [operator, setOperator] = useState('is one of');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [filteredItems, setFilteredItems] = useState(0);
  const [showOperatorDropdown, setShowOperatorDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [aiFilterEnabled, setAiFilterEnabled] = useState(false);
  
  const modalRef = useRef<HTMLDivElement>(null);
  const operatorRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchLocationData();
      loadSavedFilter();
    }
  }, [isOpen, columnId, boardId]);

  useEffect(() => {
    // Calculate filtered items based on selection
    if (selectedLocations.length === 0) {
      setFilteredItems(totalItems);
    } else {
      // This would need actual calculation based on board data
      setFilteredItems(selectedLocations.length * 2); // Mock calculation
    }
  }, [selectedLocations, totalItems]);

  useEffect(() => {
    // Close dropdowns when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (operatorRef.current && !operatorRef.current.contains(event.target as Node)) {
        setShowOperatorDropdown(false);
      }
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setShowLocationDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchLocationData = async () => {
    setIsLoading(true);
    try {
      // Query Monday API for board data
      const query = `
        query GetBoardData($boardId: ID!) {
          boards(ids: [$boardId]) {
            items_page(limit: 500) {
              items {
                id
                column_values {
                  id
                  text
                  value
                }
              }
            }
          }
        }
      `;

      const response = await monday.api(query, {
        variables: { boardId }
      });

      if (response.data?.boards?.[0]?.items_page?.items) {
        const items = response.data.boards[0].items_page.items;
        setTotalItems(items.length);
        
        // Extract unique locations
        const locationSet = new Set<string>();
        items.forEach((item: any) => {
          const locationColumn = item.column_values.find((col: any) => col.id === columnId);
          if (locationColumn?.text && locationColumn.text.trim()) {
            locationSet.add(locationColumn.text.trim());
          }
        });
        
        const locations = Array.from(locationSet).sort();
        setAvailableLocations(locations);
      }
    } catch (error) {
      console.error('Error fetching location data:', error);
      // Use mock data for development
      if (process.env.NODE_ENV === 'development') {
        setAvailableLocations([
          'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix',
          'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose',
          'Austin', 'Jacksonville', 'San Francisco', 'Seattle', 'Denver'
        ]);
        setTotalItems(50);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadSavedFilter = async () => {
    try {
      const savedFilter = await monday.storage.instance.getItem(`filter_${columnId}`);
      if (savedFilter) {
        setSelectedLocations(savedFilter.locations || []);
        setOperator(savedFilter.operator || 'is one of');
      }
    } catch (error) {
      console.error('Error loading saved filter:', error);
    }
  };

  const handleLocationToggle = (location: string) => {
    setSelectedLocations(prev => {
      if (prev.includes(location)) {
        return prev.filter(loc => loc !== location);
      } else {
        return [...prev, location];
      }
    });
  };

  const handleClearAll = () => {
    setSelectedLocations([]);
  };

  const handleApply = () => {
    onApply(selectedLocations, operator);
  };

  const filteredLocations = availableLocations.filter(location =>
    location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const operators = [
    'is one of',
    'is not one of',
    'is empty',
    'is not empty',
    'contains',
    'does not contain'
  ];

  const shouldShowValueSelector = !['is empty', 'is not empty'].includes(operator);

  if (!isOpen) return null;

  return (
    <div className="filter-overlay" onClick={onClose}>
      <div 
        ref={modalRef}
        className="filter-modal" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="filter-header">
          <div className="filter-title">
            <span>Advanced filters</span>
            <span className="filter-stats">
              Showing {filteredItems} of {totalItems} items
            </span>
          </div>
          <button className="close-button" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="filter-body">
          {/* AI Filter Toggle */}
          <div className="filter-toggle">
            <div 
              className={`toggle-switch ${aiFilterEnabled ? 'active' : ''}`}
              onClick={() => setAiFilterEnabled(!aiFilterEnabled)}
            >
              <div className="toggle-slider" />
            </div>
            <span>Filter with AI</span>
            <span className="new-badge">New</span>
          </div>

          {/* Filter Conditions */}
          <div className="filter-conditions">
            <div className="condition-label">Where</div>
            
            <div className="condition-row">
              {/* Column Selector (disabled for now as we know it's Location) */}
              <div className="condition-select disabled">
                <span className="select-icon">📍</span>
                <span>Location</span>
                <svg className="dropdown-arrow" width="12" height="12" viewBox="0 0 12 12">
                  <path d="M3 5l3 3 3-3" stroke="currentColor" fill="none" strokeWidth="1.5"/>
                </svg>
              </div>

              {/* Operator Selector */}
              <div 
                ref={operatorRef}
                className={`condition-select ${showOperatorDropdown ? 'active' : ''}`}
                onClick={() => setShowOperatorDropdown(!showOperatorDropdown)}
              >
                <span>{operator}</span>
                <svg className="dropdown-arrow" width="12" height="12" viewBox="0 0 12 12">
                  <path d="M3 5l3 3 3-3" stroke="currentColor" fill="none" strokeWidth="1.5"/>
                </svg>
                
                {showOperatorDropdown && (
                  <div className="dropdown-menu">
                    {operators.map(op => (
                      <div 
                        key={op}
                        className={`dropdown-option ${op === operator ? 'selected' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setOperator(op);
                          setShowOperatorDropdown(false);
                        }}
                      >
                        {op}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Location Values Selector */}
              {shouldShowValueSelector && (
                <div 
                  ref={locationRef}
                  className={`location-values ${showLocationDropdown ? 'active' : ''}`}
                  onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                >
                  {selectedLocations.length === 0 ? (
                    <span className="location-placeholder">Select locations...</span>
                  ) : (
                    <div className="selected-locations">
                      {selectedLocations.map(location => (
                        <span key={location} className="location-tag">
                          {location}
                          <span 
                            className="location-tag-remove"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLocationToggle(location);
                            }}
                          >
                            ×
                          </span>
                        </span>
                      ))}
                    </div>
                  )}

                  {showLocationDropdown && (
                    <div className="dropdown-menu location-dropdown">
                      <div className="dropdown-search">
                        <input 
                          type="text"
                          placeholder="Search locations..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      
                      <div className="location-options">
                        {isLoading ? (
                          <div className="loading">Loading locations...</div>
                        ) : filteredLocations.length === 0 ? (
                          <div className="no-results">No locations found</div>
                        ) : (
                          filteredLocations.map(location => (
                            <div 
                              key={location}
                              className={`dropdown-option ${selectedLocations.includes(location) ? 'selected' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLocationToggle(location);
                              }}
                            >
                              <span className="checkbox">
                                {selectedLocations.includes(location) && '✓'}
                              </span>
                              <span>{location}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Remove Condition Button */}
              <button className="remove-condition" onClick={handleClearAll}>
                <svg width="16" height="16" viewBox="0 0 16 16">
                  <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Add Filter/Group Buttons */}
          <div className="filter-actions">
            <button className="add-button">
              + New filter
            </button>
            <button className="add-button">
              + New group
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="filter-footer">
          <button 
            className="clear-button"
            onClick={handleClearAll}
            disabled={selectedLocations.length === 0}
          >
            Clear all
          </button>
          <button className="save-button" onClick={handleApply}>
            Apply Filter
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationFilterModal;