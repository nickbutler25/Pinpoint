import React, { useEffect, useRef, useState } from 'react';

interface Contact {
  id: string;
  name: string;
  company: string;
  location: string;
  status: string;
  priority: string;
}

interface Column {
  id: string;
  title: string;
  type: string;
}

interface TestGridProps {
  onLocationFilterClick: (columnId: string) => void;
}

const TestGrid: React.FC<TestGridProps> = ({ onLocationFilterClick }) => {
  const [contacts] = useState<Contact[]>([
    { id: '1', name: 'John Doe', company: 'ABC Corp', location: 'New York', status: 'Active', priority: 'High' },
    { id: '2', name: 'Jane Smith', company: 'XYZ Inc', location: 'Los Angeles', status: 'Pending', priority: 'Medium' },
    { id: '3', name: 'Bob Johnson', company: 'Tech Solutions', location: 'Chicago', status: 'Active', priority: 'Low' },
    { id: '4', name: 'Sarah Wilson', company: 'Global Industries', location: 'New York', status: 'Completed', priority: 'High' },
    { id: '5', name: 'Mike Chen', company: 'StartupXYZ', location: 'San Francisco', status: 'Active', priority: 'Medium' },
    { id: '6', name: 'Lisa Garcia', company: 'Enterprise Corp', location: 'Miami', status: 'Pending', priority: 'High' },
    { id: '7', name: 'Tom Wilson', company: 'Innovation Labs', location: 'Seattle', status: 'Active', priority: 'Low' },
    { id: '8', name: 'Emma Davis', company: 'Creative Agency', location: 'Los Angeles', status: 'Completed', priority: 'Medium' },
  ]);

  const columns: Column[] = [
    { id: 'name', title: 'Name', type: 'text' },
    { id: 'company', title: 'Company', type: 'text' },
    { id: 'location', title: 'Location', type: 'location' },
    { id: 'status', title: 'Status', type: 'status' },
    { id: 'priority', title: 'Priority', type: 'dropdown' },
  ];

  const [activeContextMenu, setActiveContextMenu] = useState<string | null>(null);
  const contextMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Handle click outside to close context menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeContextMenu) {
        const menuRef = contextMenuRefs.current[activeContextMenu];
        if (menuRef && !menuRef.contains(event.target as Node)) {
          setActiveContextMenu(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeContextMenu]);

  const handleContextMenuToggle = (columnId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setActiveContextMenu(activeContextMenu === columnId ? null : columnId);
  };

  const handleMenuItemClick = (action: string, column: Column) => {
    setActiveContextMenu(null);
    
    if (action === 'filter') {
      if (column.type === 'location') {
        onLocationFilterClick(column.id);
      } else {
        alert(`Generic filter for ${column.title} column would open here`);
      }
    } else if (action === 'sort-asc') {
      alert(`Sort A-Z for ${column.title}`);
    } else if (action === 'sort-desc') {
      alert(`Sort Z-A for ${column.title}`);
    } else if (action === 'hide') {
      alert(`Hide ${column.title} column`);
    }
  };

  return (
    <div style={{
      margin: '20px',
      backgroundColor: 'white',
      borderRadius: '8px',
      border: '1px solid #d0d4d9',
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    }}>
      {/* Grid Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '12px',
        padding: '16px',
        backgroundColor: '#f5f6f8',
        borderBottom: '1px solid #d0d4d9',
        fontWeight: '600',
        fontSize: '14px',
        color: '#323338'
      }}>
        {columns.map((column) => (
          <div key={column.id} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            position: 'relative'
          }}>
            <span>{column.title}</span>
            <div style={{ position: 'relative' }}>
              <button
                onClick={(e) => handleContextMenuToggle(column.id, e)}
                style={{
                  padding: '4px 6px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  borderRadius: '3px',
                  fontSize: '14px',
                  color: '#676879',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#e1e5e9'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'transparent'}
                title="Column options"
              >
                ⋯
              </button>
              
              {/* Context Menu - Conditional Rendering */}
              {activeContextMenu === column.id && (
                <div
                  ref={(el) => { contextMenuRefs.current[column.id] = el; }}
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: '0',
                    backgroundColor: 'white',
                    border: '1px solid #d0d4d9',
                    borderRadius: '6px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    zIndex: 1000,
                    minWidth: '140px',
                    padding: '8px 0'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => handleMenuItemClick('filter', column)}
                    style={{
                      width: '100%',
                      padding: '8px 16px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '14px',
                      color: '#323338',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#f5f6f8'}
                    onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'transparent'}
                  >
                    🔽 Filter
                  </button>
                  <button
                    onClick={() => handleMenuItemClick('sort-asc', column)}
                    style={{
                      width: '100%',
                      padding: '8px 16px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '14px',
                      color: '#323338',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#f5f6f8'}
                    onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'transparent'}
                  >
                    ↑ Sort A-Z
                  </button>
                  <button
                    onClick={() => handleMenuItemClick('sort-desc', column)}
                    style={{
                      width: '100%',
                      padding: '8px 16px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '14px',
                      color: '#323338',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#f5f6f8'}
                    onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'transparent'}
                  >
                    ↓ Sort Z-A
                  </button>
                  <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px solid #e1e5e9' }} />
                  <button
                    onClick={() => handleMenuItemClick('hide', column)}
                    style={{
                      width: '100%',
                      padding: '8px 16px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '14px',
                      color: '#323338',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#f5f6f8'}
                    onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'transparent'}
                  >
                    👁 Hide Column
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Grid Body */}
      <div>
        {contacts.map((contact, index) => (
          <div
            key={contact.id}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '12px',
              padding: '12px 16px',
              borderBottom: index < contacts.length - 1 ? '1px solid #f0f1f3' : 'none',
              backgroundColor: 'white',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = '#f8f9fb'}
            onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = 'white'}
          >
            <div style={{ fontSize: '14px', color: '#323338', fontWeight: '500' }}>
              {contact.name}
            </div>
            <div style={{ fontSize: '14px', color: '#676879' }}>
              {contact.company}
            </div>
            <div style={{ fontSize: '14px', color: '#323338' }}>
              {contact.location}
            </div>
            <div style={{ fontSize: '14px' }}>
              <span style={{
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '500',
                backgroundColor: contact.status === 'Active' ? '#e8f5e8' : 
                                contact.status === 'Pending' ? '#fff3e0' : '#f0f0f0',
                color: contact.status === 'Active' ? '#2e7d32' : 
                       contact.status === 'Pending' ? '#ef6c00' : '#666'
              }}>
                {contact.status}
              </span>
            </div>
            <div style={{ fontSize: '14px' }}>
              <span style={{
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '500',
                backgroundColor: contact.priority === 'High' ? '#ffebee' : 
                                contact.priority === 'Medium' ? '#e3f2fd' : '#f5f5f5',
                color: contact.priority === 'High' ? '#d32f2f' : 
                       contact.priority === 'Medium' ? '#1976d2' : '#666'
              }}>
                {contact.priority}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div style={{
        padding: '16px',
        backgroundColor: '#f8f9fb',
        borderTop: '1px solid #e1e5e9',
        fontSize: '13px',
        color: '#676879',
        textAlign: 'center'
      }}>
        <strong>Test Instructions:</strong> Click the "⋯" button on any column header, then select "Filter". 
        The Location column will open your LocationFilter popup!
      </div>
    </div>
  );
};

export default TestGrid;