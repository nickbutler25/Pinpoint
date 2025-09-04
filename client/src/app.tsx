import { useState } from 'react';
import './app.css';
import LocationFilter from './components/LocationFilter';
import TestGrid from './components/TestGrid';

interface BoardColumn {
  id: string;
  title: string;
  type: string;
}

function App() {
  // UI state management only
  const [showLocationFilter, setShowLocationFilter] = useState(false);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [filterColumn, setFilterColumn] = useState<BoardColumn | null>(null);
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);
  const [totalItems, setTotalItems] = useState(0);

  // Handle when TestGrid triggers location filter
  const handleLocationFilterClick = (columnId: string, locations: string[], itemCount: number) => {
    if (columnId === 'location') {
      const locationColumn = { id: 'location', title: 'Location', type: 'location' };
      setFilterColumn(locationColumn);
      setAvailableLocations(locations);
      setTotalItems(itemCount);
      setShowLocationFilter(true);
    }
  };

  // Handle location selection changes
  const handleLocationChange = (locations: string[]) => {
    setSelectedLocations(locations);
  };

  // Handle apply filter
  const handleApplyFilter = () => {
    alert(`Filter applied! Selected locations: ${selectedLocations.join(', ')}`);
    setShowLocationFilter(false);
  };

  // Handle close filter
  const handleCloseFilter = () => {
    setShowLocationFilter(false);
    setSelectedLocations([]);
  };

  return (
    <div className="App">
      {/* Header */}
      <header style={{ 
        padding: '20px', 
        backgroundColor: '#f5f6f8', 
        borderBottom: '1px solid #d0d4d9' 
      }}>
        <h1 style={{ margin: 0, color: '#323338', fontSize: '24px' }}>
          📍 Location Filter Test Environment
        </h1>
        <p style={{ margin: '8px 0 0 0', color: '#676879' }}>
          Test your location filter by clicking the "⋯" button on the Location column
        </p>
      </header>

      {/* Test Grid */}
      <TestGrid onLocationFilterClick={handleLocationFilterClick} />

      {/* Location Filter Popup */}
      {showLocationFilter && filterColumn && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            maxWidth: '400px',
            width: '90%',
            maxHeight: 'none',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)'
          }}>
            <LocationFilter
              locations={availableLocations}
              selectedLocations={selectedLocations}
              onLocationChange={handleLocationChange}
              onApplyFilter={handleApplyFilter}
              totalItems={totalItems}
              filteredItems={selectedLocations.length === 0 ? totalItems : selectedLocations.length}
              locationColumnName={filterColumn.title}
            />
            
            <div style={{ 
              padding: '16px', 
              borderTop: '1px solid #d0d4d9',
              backgroundColor: '#f5f6f8'
            }}>
              <button
                onClick={handleCloseFilter}
                style={{
                  width: '100%',
                  padding: '8px 16px',
                  backgroundColor: '#676879',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Close Filter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;