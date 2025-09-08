// client/src/components/ColumnExtension.tsx
import mondaySdk from 'monday-sdk-js';
import React, { useEffect, useState } from 'react';

// Define the column extension context interface
interface ColumnExtensionContext {
  boardId: string;
  columnId: string;
  userId?: string;
  accountId?: string;
  [key: string]: any;
}

interface ColumnExtensionProps {
  // Props will be populated by Monday.com context
}

const ColumnExtension: React.FC<ColumnExtensionProps> = () => {
  const [monday] = useState(() => mondaySdk());
  const [context, setContext] = useState<ColumnExtensionContext | null>(null);
  const [columnId, setColumnId] = useState<string>('');
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Check for local testing mode (URL-based - Option 1)
  const isLocalTestMode = process.env.NODE_ENV === 'development' && 
    (window.location.search.includes('test=column') || window.location.pathname.includes('column-extension'));

  // Move fetchBoardData inside useEffect to fix dependency warning
  useEffect(() => {
    const fetchBoardData = async (boardId: string, columnId: string) => {
      try {
        setIsLoading(true);
        
        // Fetch board data using Monday.com API
        const query = `
          query {
            boards(ids: [${boardId}]) {
              id
              name
              columns(ids: ["${columnId}"]) {
                id
                title
                type
              }
              items_page(limit: 500) {
                items {
                  id
                  name
                  column_values(ids: ["${columnId}"]) {
                    id
                    text
                    value
                  }
                }
              }
            }
          }
        `;

        const response = await monday.api(query);
        const board = response.data.boards[0];
        
        // Extract unique values from the column (works for text, dropdown, location, etc.)
        const items = board.items_page.items;
        const locations = items
          .map((item: any) => {
            const columnValue = item.column_values[0];
            // Handle different column types
            if (columnValue?.text) {
              return columnValue.text;
            }
            // For dropdown/status columns, extract from value JSON
            if (columnValue?.value) {
              try {
                const parsed = JSON.parse(columnValue.value);
                return parsed.text || parsed.label || columnValue.text;
              } catch {
                return columnValue.text;
              }
            }
            return null;
          })
          .filter((location: string) => location && location.trim())
          .filter((location: string, index: number, arr: string[]) => 
            arr.indexOf(location) === index
          );
        
        setAvailableLocations(locations);
      } catch (error) {
        console.error('Error fetching board data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isLocalTestMode) {
      // Use mock data for local testing
      console.log('🧪 Column Extension: Using mock data for local testing');
      setTimeout(() => {
        setAvailableLocations([
          'New York',
          'Los Angeles', 
          'Chicago',
          'Houston',
          'Phoenix',
          'Philadelphia',
          'San Antonio',
          'San Diego',
          'Dallas',
          'San Jose',
          'Austin',
          'Jacksonville',
          'San Francisco',
          'Seattle',
          'Denver',
          'Washington DC',
          'Boston',
          'Nashville',
          'Miami',
          'Atlanta'
        ]);
        setIsLoading(false);
      }, 1000); // Simulate loading time
      return;
    }

    // Get Monday.com context
    monday.get('context').then((res) => {
      const contextData = res.data as ColumnExtensionContext;
      setContext(contextData);
      
      if (contextData.columnId && contextData.boardId) {
        setColumnId(contextData.columnId);
        fetchBoardData(contextData.boardId, contextData.columnId);
      } else {
        console.error('Missing columnId or boardId in context:', contextData);
        setIsLoading(false);
      }
    }).catch((error) => {
      console.error('Error getting Monday context:', error);
      setIsLoading(false);
    });
  }, [monday, isLocalTestMode]);

  const handleLocationToggle = (location: string) => {
    setSelectedLocations(prev => {
      if (prev.includes(location)) {
        return prev.filter(loc => loc !== location);
      } else {
        return [...prev, location];
      }
    });
  };

  const handleApplyFilter = async () => {
    if (isLocalTestMode) {
      // Mock filter application for local testing
      console.log('🧪 Mock filter applied:', selectedLocations);
      alert(`Mock Filter Applied!\n\nSelected locations:\n${selectedLocations.join('\n')}\n\nIn real usage, this would filter the Monday.com board.`);
      return;
    }

    if (selectedLocations.length === 0) {
      // Clear any existing filters
      monday.execute('filterBoard', { filterParams: null });
    } else {
      // Apply location filter
      const filterParams = {
        columnId: columnId,
        compareValue: selectedLocations,
        operator: 'any_of'
      };
      
      monday.execute('filterBoard', { filterParams });
    }
    
    // Close the extension dialog
    monday.execute('closeDialog');
  };

  const handleClearAll = () => {
    setSelectedLocations([]);
  };

  if (isLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div>Loading location data...</div>
        {!context && (
          <div style={{ marginTop: '10px', fontSize: '12px', color: '#999' }}>
            Waiting for Monday.com context...
          </div>
        )}
      </div>
    );
  }

  if (!isLocalTestMode && (!context?.columnId || !context?.boardId)) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ color: '#d83a52', marginBottom: '10px' }}>
          ⚠️ Column Extension Context Missing
        </div>
        <div style={{ fontSize: '14px', color: '#676879' }}>
          This extension requires column context to function properly.
        </div>
        <div style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>
          Make sure you're accessing this from a column menu.
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Roboto, sans-serif',
      maxWidth: '400px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 8px 0', color: '#323338', fontSize: '18px' }}>
          📍 Filter by Location
        </h3>
        <p style={{ margin: '0', color: '#676879', fontSize: '14px' }}>
          Select locations to filter items in this column
        </p>
        {isLocalTestMode && (
          <div style={{ 
            marginTop: '8px', 
            padding: '6px 10px', 
            backgroundColor: '#fff3cd', 
            border: '1px solid #ffeaa7',
            borderRadius: '4px',
            fontSize: '12px',
            color: '#856404'
          }}>
            🧪 <strong>Local Test Mode:</strong> Using mock location data
          </div>
        )}
      </div>

      {/* Statistics */}
      <div style={{ 
        marginBottom: '20px', 
        padding: '12px', 
        backgroundColor: '#f5f6f8', 
        borderRadius: '6px',
        fontSize: '13px',
        color: '#676879'
      }}>
        <div>📊 Available: {availableLocations.length} locations</div>
        <div>✅ Selected: {selectedLocations.length} locations</div>
      </div>

      {/* Action Buttons */}
      <div style={{ 
        marginBottom: '20px', 
        display: 'flex', 
        gap: '8px',
        justifyContent: 'space-between'
      }}>
        <button
          onClick={handleClearAll}
          disabled={selectedLocations.length === 0}
          style={{
            padding: '8px 16px',
            backgroundColor: selectedLocations.length === 0 ? '#ddd' : '#676879',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: selectedLocations.length === 0 ? 'not-allowed' : 'pointer',
            fontSize: '14px'
          }}
        >
          Clear All
        </button>
        <button
          onClick={handleApplyFilter}
          style={{
            padding: '8px 16px',
            backgroundColor: '#0085ff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          Apply Filter ({selectedLocations.length})
        </button>
      </div>

      {/* Location List */}
      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {availableLocations.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            color: '#676879', 
            padding: '20px',
            fontSize: '14px'
          }}>
            No locations found in this column
          </div>
        ) : (
          availableLocations.map((location) => {
            const isSelected = selectedLocations.includes(location);
            return (
              <label 
                key={location}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 12px',
                  margin: '2px 0',
                  borderRadius: '4px',
                  backgroundColor: isSelected ? '#e6f3ff' : 'transparent',
                  border: `1px solid ${isSelected ? '#0085ff' : '#ddd'}`,
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'all 0.2s ease'
                }}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleLocationToggle(location)}
                  style={{ marginRight: '10px' }}
                />
                <span>{location}</span>
              </label>
            );
          })
        )}
      </div>

      {/* Help Text */}
      <div style={{ 
        marginTop: '20px', 
        fontSize: '12px', 
        color: '#9b9b9b',
        textAlign: 'center'
      }}>
        💡 This filter will be applied to the entire board view
      </div>
    </div>
  );
};

export default ColumnExtension;