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
  } catch (error) {
    console.error('Error initializing app:', error);
    setError('Failed to initialize app');
    setLoading(false);
  }
  }, []);

  const fetchBoardData = async (boardId: string) => {
    try {
      // Call our backend API endpoint
      const response = await fetch(`/api/boards/${boardId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch board data');
      }

      const data = await response.json();
      setBoardData(data.board);

      // Find location column
      const locationCol = data.board.columns.find((col: BoardColumn) =>
        col.title.toLowerCase().includes('location') ||
        col.title.toLowerCase().includes('address') ||
        col.title.toLowerCase().includes('city') ||
        col.title.toLowerCase().includes('state')
      );

      if (locationCol) {
        setLocationColumn(locationCol);
        extractUniqueLocations(data.board.items, locationCol.id);
      } else {
        setError('No location column found. Please add a column with "Location", "Address", or "City" in its name.');
      }

      setFilteredItems(data.board.items);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching board data:', error);
      setError('Failed to fetch board data');
      setLoading(false);
    }
  };

  const extractUniqueLocations = (items: BoardItem[], columnId: string) => {
    const locations = new Set<string>();

    items.forEach(item => {
      const locationValue = item.column_values.find(col => col.id === columnId);
      if (locationValue && locationValue.text && locationValue.text.trim()) {
        locations.add(locationValue.text.trim());
      }
    });

    setAllLocations(Array.from(locations).sort());
  };

  const handleLocationFilterChange = (locations: string[]) => {
    setSelectedLocations(locations);

    if (!boardData || !locationColumn) return;

    if (locations.length === 0) {
      setFilteredItems(boardData.items);
      return;
    }

    const filtered = boardData.items.filter(item => {
      const locationValue = item.column_values.find(col => col.id === locationColumn.id);
      if (!locationValue || !locationValue.text) return false;

      return locations.some(selectedLocation =>
        locationValue.text.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    });

    setFilteredItems(filtered);
  };

  // Add mock data function for local development
const setMockData = () => {
  const mockBoard: BoardData = {
    id: 'mock-board-123',
    name: 'Sample CRM Board',
    columns: [
      { id: 'location', title: 'Location', type: 'text' },
      { id: 'name', title: 'Name', type: 'text' }
    ],
    items: [
      {
        id: '1',
        name: 'John Doe',
        column_values: [
          { id: 'location', text: 'New York', value: 'New York' },
          { id: 'name', text: 'John Doe', value: 'John Doe' }
        ]
      },
      {
        id: '2',
        name: 'Jane Smith',
        column_values: [
          { id: 'location', text: 'Los Angeles', value: 'Los Angeles' },
          { id: 'name', text: 'Jane Smith', value: 'Jane Smith' }
        ]
      }
    ]
  };
  
  setBoardData(mockBoard);
  const locationCol = mockBoard.columns.find(col => col.id === 'location');
  if (locationCol) {
    setLocationColumn(locationCol);
    extractUniqueLocations(mockBoard.items, locationCol.id);
  }
  setFilteredItems(mockBoard.items);
  setLoading(false);
};

  const applyFilterToBoard = async () => {
    try {
      if (!boardId || !locationColumn) return;

      // Note: Board filtering might not work in all contexts
      // For now, we'll just show the filtered results in our UI
      monday.execute('notice', {
        message: selectedLocations.length === 0 
          ? 'Filter cleared - showing all contacts' 
          : `Showing ${filteredItems.length} contacts filtered by ${selectedLocations.length} location(s)`,
        type: 'success'
      });

      // TODO: Implement actual board filtering when Monday SDK supports it
      // This would require Monday.com's board filtering API
      
    } catch (error) {
      console.error('Error applying filter:', error);
      monday.execute('notice', {
        message: 'Filter applied locally in the app',
        type: 'info'
      });
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading board data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h3>⚠️ Error</h3>
        <p>{error}</p>
        <button onClick={initializeApp} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  if (!locationColumn) {
    return (
      <div className="error-container">
        <h3>📍 No Location Column Found</h3>
        <p>Please make sure your board has a column with "Location", "Address", "City", or "State" in its name.</p>
        <button onClick={initializeApp} className="retry-button">
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="app-header">
        <h2>📍 Pinpoint Location Filter</h2>
        <p>Filter contacts by location in "{boardData?.name}"</p>
      </div>

      <LocationFilter
        locations={allLocations}
        selectedLocations={selectedLocations}
        onLocationChange={handleLocationFilterChange}
        onApplyFilter={applyFilterToBoard}
        totalItems={boardData?.items.length || 0}
        filteredItems={filteredItems.length}
        locationColumnName={locationColumn.title}
      />

      <div className="results-summary">
        <div className="summary-content">
          <span className="summary-main">
            Showing {filteredItems.length} of {boardData?.items.length || 0} contacts
          </span>
          {selectedLocations.length > 0 && (
            <div className="summary-filters">
              <strong>Active filters:</strong> {selectedLocations.join(', ')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;