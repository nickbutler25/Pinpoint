// client/src/components/LocalTestHarness.tsx
import React, { useState } from 'react';

interface LocalTestHarnessProps {
  onTriggerFilter: () => void;
}

const LocalTestHarness: React.FC<LocalTestHarnessProps> = ({ onTriggerFilter }) => {
  const [showMockMenu, setShowMockMenu] = useState(false);

  // Mock Monday.com board data for testing
  const mockBoardData = {
    columns: [
      { id: 'name', title: 'Name', type: 'text' },
      { id: 'location', title: 'Location', type: 'location' },
      { id: 'status', title: 'Status', type: 'status' }
    ],
    items: [
      { id: '1', name: 'Project Alpha', location: 'New York', status: 'Active' },
      { id: '2', name: 'Project Beta', location: 'Los Angeles', status: 'Pending' },
      { id: '3', name: 'Project Gamma', location: 'Chicago', status: 'Active' },
      { id: '4', name: 'Project Delta', location: 'New York', status: 'Done' },
      { id: '5', name: 'Project Epsilon', location: 'San Francisco', status: 'Active' },
    ]
  };

  return (
    <div style={{
      padding: '20px',
      fontFamily: 'Figtree, -apple-system, sans-serif',
      background: '#f6f7fb',
      minHeight: '100vh'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ margin: '0 0 20px 0', color: '#323338' }}>
          📍 Location Filter - Local Test
        </h1>
        
        <div style={{
          padding: '16px',
          background: '#f0f3ff',
          borderRadius: '6px',
          marginBottom: '20px'
        }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#0073ea' }}>Testing Instructions:</h3>
          <ol style={{ margin: '8px 0', paddingLeft: '20px' }}>
            <li>Click the "⋯" button on the Location column header below</li>
            <li>Click "Filter" in the menu</li>
            <li>Your custom filter modal should appear</li>
            <li>Select locations and apply the filter</li>
          </ol>
        </div>

        {/* Mock Monday Board Table */}
        <div style={{
          border: '1px solid #e6e9ef',
          borderRadius: '6px',
          overflow: 'hidden'
        }}>
          {/* Table Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            background: '#f5f6f8',
            borderBottom: '1px solid #e6e9ef'
          }}>
            {mockBoardData.columns.map(column => (
              <div key={column.id} style={{
                padding: '12px 16px',
                fontWeight: '500',
                fontSize: '14px',
                color: '#323338',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'relative'
              }}>
                <span>{column.title}</span>
                {column.type === 'location' && (
                  <>
                    <button
                      data-column-id={column.id}
                      onClick={() => setShowMockMenu(!showMockMenu)}
                      style={{
                        padding: '4px 8px',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '16px',
                        color: '#676879',
                        borderRadius: '4px',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#e6e9ef'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      ⋯
                    </button>
                    
                    {/* Mock Context Menu */}
                    {showMockMenu && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        background: 'white',
                        borderRadius: '6px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                        minWidth: '180px',
                        zIndex: 1000,
                        marginTop: '4px'
                      }}>
                        <div
                          onClick={() => {
                            setShowMockMenu(false);
                            onTriggerFilter();
                          }}
                          style={{
                            padding: '8px 16px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            color: '#323338',
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#f0f3ff'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          🔍 Filter
                        </div>
                        <div style={{
                          padding: '8px 16px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          color: '#323338',
                          transition: 'background 0.2s'
                        }}>
                          ↑ Sort A-Z
                        </div>
                        <div style={{
                          padding: '8px 16px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          color: '#323338',
                          transition: 'background 0.2s'
                        }}>
                          ↓ Sort Z-A
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Table Body */}
          <div>
            {mockBoardData.items.map((item, index) => (
              <div key={item.id} style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                borderBottom: index < mockBoardData.items.length - 1 ? '1px solid #e6e9ef' : 'none'
              }}>
                <div style={{ padding: '12px 16px', fontSize: '14px' }}>{item.name}</div>
                <div style={{ padding: '12px 16px', fontSize: '14px' }}>📍 {item.location}</div>
                <div style={{ padding: '12px 16px', fontSize: '14px' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    background: item.status === 'Active' ? '#00d647' : 
                               item.status === 'Pending' ? '#fdab3d' : '#c4c4c4',
                    color: 'white'
                  }}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          marginTop: '20px',
          padding: '12px',
          background: '#e5f4ff',
          borderRadius: '6px',
          fontSize: '13px',
          color: '#0073ea'
        }}>
          💡 <strong>Tip:</strong> Open DevTools console to see interceptor logs and debug information.
        </div>
      </div>
    </div>
  );
};

export default LocalTestHarness;