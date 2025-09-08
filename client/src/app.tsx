// client/src/App.tsx
import mondaySdk from 'monday-sdk-js';
import { useEffect, useState } from 'react';
import './app.css';
import ColumnExtension from './components/ColumnExtension';
import LocationFilter from './components/LocationFilter';
import TestGrid from './components/TestGrid';

interface BoardColumn {
  id: string;
  title: string;
  type: string;
}

function App() {
  const [monday] = useState(() => mondaySdk());
  const [context, setContext] = useState<any>(null);
  const [appType, setAppType] = useState<'board_view' | 'column_extension' | 'unknown'>('unknown');
  const [isLoading, setIsLoading] = useState(true);

  // Board view state
  const [showLocationFilter, setShowLocationFilter] = useState(false);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [filterColumn, setFilterColumn] = useState<BoardColumn | null>(null);
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    // Determine app context
    monday.get('context').then((res) => {
      const contextData = res.data;
      setContext(contextData);

      // Determine app type based on context
      if (contextData.columnId) {
        // Column extension context
        setAppType('column_extension');
      } else if (contextData.boardId) {
        // Board view context
        setAppType('board_view');
      } else {
        // Fallback to board view for testing
        setAppType('board_view');
      }

      setIsLoading(false);
    }).catch((error) => {
      console.error('Error getting Monday context:', error);
      // Fallback for local development
      setAppType('board_view');
      setIsLoading(false);
    });
  }, [monday]);

  // Board view handlers
  const handleLocationFilterClick = (columnId: string, locations: string[], itemCount: number) => {
    if (columnId === 'location') {
      const locationColumn = { id: 'location', title: 'Location', type: 'location' };
      setFilterColumn(locationColumn);
      setAvailableLocations(locations);
      setTotalItems(itemCount);
      setShowLocationFilter(true);
    }
  };

  const handleLocationChange = (locations: string[]) => {
    setSelectedLocations(locations);
  };

  const handleApplyFilter = () => {
    alert(`Filter applied! Selected locations: ${selectedLocations.join(', ')}`);
    setShowLocationFilter(false);
  };

  const handleCloseFilter = () => {
    setShowLocationFilter(false);
    setSelectedLocations([]);
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '200px',
        fontFamily: 'Roboto, sans-serif'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  // Render based on app type
  if (appType === 'column_extension') {
    return (
      <div>
        {process.env.NODE_ENV === 'development' && (
          <details style={{ marginBottom: '10px', fontSize: '12px' }}>
            <summary>🔍 Debug Context (Development Only)</summary>
            <pre style={{ 
              backgroundColor: '#f5f5f5', 
              padding: '10px', 
              fontSize: '11px',
              overflow: 'auto',
              maxHeight: '200px'
            }}>
              {JSON.stringify(context, null, 2)}
            </pre>
          </details>
        )}
        <ColumnExtension />
      </div>
    );
  }

  // Board view interface (original functionality)
  return (
    <div className="App">
      {/* Header */}
      <header style={{ 
        padding: '20px', 
        backgroundColor: '#f5f6f8', 
        borderBottom: '1px solid #d0d4d9' 
      }}>
        <h1 style={{ margin: 0, color: '#323338', fontSize: '24px' }}>
          📍 Pinpoint Location Filter
        </h1>
        <p style={{ margin: '8px 0 0 0', color: '#676879' }}>
          {context && 'boardId' in context && context.boardId ? 
            `Connected to Board: ${context.boardId}` : 
            'Test your location filter by clicking the "⋯" button on the Location column'
          }
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