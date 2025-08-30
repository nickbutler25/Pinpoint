import mondaySDK from 'monday-sdk-js';
import React, { useCallback, useEffect, useState } from 'react';
import './App.css';
import LocationFilter from './components/LocationFilter';

const monday = mondaySDK();

interface BoardItem {
  id: string;
  name: string;
  column_values: {
    id: string;
    text: string;
    value: string;
  }[];
}

interface BoardColumn {
  id: string;
  title: string;
  type: string;
}

interface BoardData {
  id: string;
  name: string;
  columns: BoardColumn[];
  items: BoardItem[];
}

function App() {
  const [boardData, setBoardData] = useState<BoardData | null>(null);
  const [filteredItems, setFilteredItems] = useState<BoardItem[]>([]);
  const [locationColumn, setLocationColumn] = useState<BoardColumn | null>(null);
  const [allLocations, setAllLocations] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [boardId, setBoardId] = useState<string>('');

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = useCallback(async () => {
    try {
      // Get board context from Monday
      const context = await monday.get('context');
      
      // Type guard to check if we're in a board context
      const boardContext = context.data as any;
      let currentBoardId = boardContext?.boardId || boardContext?.boardIds?.[0];
      
      // For local development, use a mock board ID
      if (!currentBoardId && window.location.hostname === 'localhost') {
        console.warn('No board context found. Using mock data for local development.');
        currentBoardId = 'mock-board-123';
        // Set mock data instead of fetching from API
        setMockData();
        return;
      }
      
      if (!currentBoardId) {
        throw new Error('No board ID found in context. Please make sure this app is used on a board.');
      }

      setBoardId(currentBoardId);
      await fetchBoardData(currentBoardId);
    } catch (err) {
      console.error('Error initializing app:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize app');
    } finally {
      setLoading(false);
    }
  }, []);

  const setMockData = () => {
    const mockData: BoardData = {
      id: 'mock-board-123',
      name: 'Sample CRM Board',
      columns: [
        { id: 'location', title: 'Location', type: 'text' },
        { id: 'name', title: 'Name', type: 'text' },
        { id: 'company', title: 'Company', type: 'text' }
      ],
      items: [
        {
          id: '1',
          name: 'John Doe',
          column_values: [
            { id: 'location', text: 'New York', value: 'New York' },
            { id: 'name', text: 'John Doe', value: 'John Doe' },
            { id: 'company', text: 'ABC Corp', value: 'ABC Corp' }
          ]
        },
        {
          id: '2',
          name: 'Jane Smith',
          column_values: [
            { id: 'location', text: 'Los Angeles', value: 'Los Angeles' },
            { id: 'name', text: 'Jane Smith', value: 'Jane Smith' },
            { id: 'company', text: 'XYZ Inc', value: 'XYZ Inc' }
          ]
        },
        {
          id: '3',
          name: 'Bob Johnson',
          column_values: [
            { id: 'location', text: 'Chicago', value: 'Chicago' },
            { id: 'name', text: 'Bob Johnson', value: 'Bob Johnson' },
            { id: 'company', text: 'Tech Solutions', value: 'Tech Solutions' }
          ]
        }
      ]
    };

    setBoardData(mockData);
    processLocationData(mockData);
    setLoading(false);
  };

  const fetchBoardData = async (boardId: string) => {
    try {
      const response = await fetch(`/api/boards/${boardId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch board data: ${response.status}`);
      }

      const data = await response.json();
      setBoardData(data.board);
      processLocationData(data.board);
    } catch (err) {
      console.error('Error fetching board data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch board data');
    }
  };

  const processLocationData = (board: BoardData) => {
    // Find the first text or location column to use for filtering
    const locationCol = board.columns.find(col => 
      col.title.toLowerCase().includes('location') || 
      col.title.toLowerCase().includes('city') ||
      col.title.toLowerCase().includes('office') ||
      col.type === 'text'
    );

    if (!locationCol) {
      setError('No location column found in this board');
      return;
    }

    setLocationColumn(locationCol);

    // Extract unique locations
    const locations = new Set<string>();
    board.items.forEach(item => {
      const locationValue = item.column_values.find(col => col.id === locationCol.id);
      if (locationValue?.text) {
        locations.add(locationValue.text);
      }
    });

    const sortedLocations = Array.from(locations).sort();
    setAllLocations(sortedLocations);
    setSelectedLocations(sortedLocations); // Start with all selected
    setFilteredItems(board.items);
  };

  const handleLocationChange = (locations: string[]) => {
    setSelectedLocations(locations);
  };

  const handleApplyFilter = () => {
    if (!boardData || !locationColumn) return;

    const filtered = boardData.items.filter(item => {
      if (selectedLocations.length === 0) return true;
      
      const locationValue = item.column_values.find(col => col.id === locationColumn.id);
      return locationValue?.text && selectedLocations.includes(locationValue.text);
    });

    setFilteredItems(filtered);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ fontSize: '18px', color: '#323338' }}>Loading board data...</div>
        <div style={{ fontSize: '14px', color: '#676879' }}>Connecting to Monday.com</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '20px', 
        color: '#d93025',
        textAlign: 'center',
        backgroundColor: '#ffeaa7',
        border: '1px solid #d93025',
        borderRadius: '8px',
        margin: '20px'
      }}>
        <h3>Error</h3>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          style={{
            marginTop: '10px',
            padding: '8px 16px',
            backgroundColor: '#0073ea',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!boardData || !locationColumn) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center',
        color: '#676879'
      }}>
        No board data available
      </div>
    );
  }

  return (
    <div className="App">
      <header style={{ 
        padding: '20px', 
        backgroundColor: '#f5f6f8', 
        borderBottom: '1px solid #d0d4d9' 
      }}>
        <h1 style={{ margin: 0, color: '#323338' }}>
          📍 {boardData.name} - Location Filter
        </h1>
        <p style={{ margin: '8px 0 0 0', color: '#676879' }}>
          Filter board items by location to focus on specific regions
        </p>
      </header>

      <main style={{ padding: '20px' }}>
        <LocationFilter
          locations={allLocations}
          selectedLocations={selectedLocations}
          onLocationChange={handleLocationChange}
          onApplyFilter={handleApplyFilter}
          totalItems={boardData.items.length}
          filteredItems={filteredItems.length}
          locationColumnName={locationColumn.title}
        />

        <div style={{ marginTop: '20px' }}>
          <h2 style={{ color: '#323338', marginBottom: '16px' }}>
            Filtered Results ({filteredItems.length} items)
          </h2>
          
          {filteredItems.length === 0 ? (
            <div style={{ 
              padding: '40px', 
              textAlign: 'center', 
              color: '#676879',
              backgroundColor: '#f8f9fb',
              borderRadius: '8px',
              border: '1px solid #e1e5e9'
            }}>
              No items match the selected location filters
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gap: '12px',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
            }}>
              {filteredItems.map(item => (
                <div 
                  key={item.id}
                  style={{
                    padding: '16px',
                    backgroundColor: 'white',
                    border: '1px solid #d0d4d9',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <h3 style={{ 
                    margin: '0 0 12px 0', 
                    color: '#323338',
                    fontSize: '16px'
                  }}>
                    {item.name}
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {item.column_values.map(colVal => {
                      const column = boardData.columns.find(col => col.id === colVal.id);
                      if (!column || !colVal.text) return null;
                      
                      return (
                        <div key={colVal.id} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '14px'
                        }}>
                          <span style={{ color: '#676879', fontWeight: '500' }}>
                            {column.title}:
                          </span>
                          <span style={{ color: '#323338' }}>
                            {colVal.text}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;