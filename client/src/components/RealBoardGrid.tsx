// client/src/components/RealBoardGrid.tsx
import React, { useEffect, useState } from 'react';

interface BoardData {
  id: string;
  name: string;
  columns: Array<{
    id: string;
    title: string;
    type: string;
  }>;
  items: Array<{
    id: string;
    name: string;
    column_values: Array<{
      id: string;
      text: string;
      value: any;
    }>;
  }>;
}

interface RealBoardGridProps {
  onLocationFilterClick: (columnId: string, locations: string[], itemCount: number) => void;
}

const RealBoardGrid: React.FC<RealBoardGridProps> = ({ onLocationFilterClick }) => {
  const [boardData, setBoardData] = useState<BoardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [boardId, setBoardId] = useState<string>('');

  // Get board ID from URL parameter or use default
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const boardIdParam = urlParams.get('boardId');
    setBoardId(boardIdParam || ''); // You'll need to provide a real board ID
  }, []);

  const fetchBoardData = async () => {
    if (!boardId) {
      setError('No board ID provided. Add ?boardId=YOUR_BOARD_ID to the URL');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const query = `
        query {
          boards(ids: [${boardId}]) {
            id
            name
            columns {
              id
              title
              type
            }
            items_page(limit: 50) {
              items {
                id
                name
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

      const response = await fetch('/api/monday/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'GraphQL error');
      }

      if (!result.data?.boards?.[0]) {
        throw new Error('Board not found');
      }

      const board = result.data.boards[0];
      setBoardData({
        id: board.id,
        name: board.name,
        columns: board.columns,
        items: board.items_page.items
      });

    } catch (err) {
      console.error('Error fetching board data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoardData();
  }, [boardId]);

const handleColumnFilterClick = (column: any) => {
  if (!boardData) return;

  console.log('🎯 Filter clicked for column:', column.title);

  // Only use custom filter for columns named "Location"
  if (column.title.toLowerCase() === 'location') {
    // Extract unique values from this column
    const columnValues = boardData.items
      .map(item => {
        const columnValue = item.column_values.find(cv => cv.id === column.id);
        return columnValue?.text || '';
      })
      .filter(value => value.trim())
      .filter((value, index, arr) => arr.indexOf(value) === index);

    console.log('📍 Found locations:', columnValues);
    onLocationFilterClick(column.id, columnValues, boardData.items.length);
  } else {
    // For all other columns, show a message about native Monday.com filtering
    alert(`Native Monday.com filtering would handle "${column.title}" column. Custom location filter only works on columns named "Location".`);
  }
};

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', marginBottom: '10px' }}>
          🔗 Loading real Monday.com board data...
        </div>
        <div style={{ fontSize: '14px', color: '#676879' }}>
          Board ID: {boardId || 'Not specified'}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ color: '#d83a52', fontSize: '18px', marginBottom: '10px' }}>
          ❌ Error loading board data
        </div>
        <div style={{ fontSize: '14px', color: '#676879', marginBottom: '20px' }}>
          {error}
        </div>
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '15px', 
          borderRadius: '6px',
          fontSize: '13px',
          textAlign: 'left'
        }}>
          <strong>To use real board data:</strong>
          <ol style={{ margin: '10px 0', paddingLeft: '20px' }}>
            <li>Get a board ID from Monday.com (from the board URL)</li>
            <li>Add it to the URL: <code>?board=real&boardId=YOUR_BOARD_ID</code></li>
            <li>Make sure your API endpoint supports Monday.com authentication</li>
          </ol>
        </div>
        <button 
          onClick={fetchBoardData}
          style={{
            marginTop: '15px',
            padding: '8px 16px',
            backgroundColor: '#0085ff',
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

  if (!boardData) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        No board data available
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      {/* Board Header */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ margin: '0 0 8px 0', color: '#323338' }}>
          {boardData.name}
        </h2>
        <div style={{ color: '#676879', fontSize: '14px' }}>
          Board ID: {boardData.id} | {boardData.items.length} items | {boardData.columns.length} columns
        </div>
      </div>

      {/* Columns Header */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: `200px repeat(${Math.min(boardData.columns.length, 12)}, 1fr)`,
        gap: '8px',
        marginBottom: '10px',
        padding: '12px',
        backgroundColor: '#f5f6f8',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: '600',
        color: '#323338'
      }}>
        <div>Item Name</div>
        {boardData.columns.slice(0, 12).map(column => (
          <div key={column.id} style={{ 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span>{column.title}</span>
                <button
                onClick={() => handleColumnFilterClick(column)}
                style={{
                    padding: '4px 8px',
                    fontSize: '12px',
                    backgroundColor: column.title.toLowerCase() === 'location' ? '#0085ff' : '#676879',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    marginLeft: '8px'
                }}
                title={column.title.toLowerCase() === 'location' ? 
                    `Custom location filter for ${column.title}` : 
                    `Native Monday.com filter for ${column.title}`
                }
                >
                ⋯
                </button>
          </div>
        ))}
      </div>

      {/* Items */}
      <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
        {boardData.items.map(item => (
          <div key={item.id} style={{
            display: 'grid',
            gridTemplateColumns: `200px repeat(${Math.min(boardData.columns.length, 6)}, 1fr)`,
            gap: '8px',
            padding: '12px',
            borderBottom: '1px solid #e1e4e9',
            fontSize: '14px',
            alignItems: 'center'
          }}>
            <div style={{ fontWeight: '500', color: '#323338' }}>
              {item.name}
            </div>
            {boardData.columns.slice(0, 6).map(column => {
              const columnValue = item.column_values.find(cv => cv.id === column.id);
              return (
                <div key={column.id} style={{ 
                  color: '#676879',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {columnValue?.text || '-'}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {boardData.columns.length > 6 && (
        <div style={{ 
          marginTop: '15px', 
          fontSize: '12px', 
          color: '#676879', 
          textAlign: 'center' 
        }}>
          Showing first 6 columns. Total: {boardData.columns.length} columns
        </div>
      )}
    </div>
  );
};

export default RealBoardGrid;