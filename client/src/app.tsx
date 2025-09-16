// client/src/App.tsx
import mondaySdk from 'monday-sdk-js';
import { useEffect, useState } from 'react';
import './app.css';
import LocationFilterModal from './components/LocationFilterModal';
import FilterInterceptor from './services/FilterInterceptor';

interface MondayContext {
  boardId?: number;
  instanceId?: string;
  user?: {
    id: string;
    name: string;
  };
}

function App() {
  const [monday] = useState(() => mondaySdk());
  const [context, setContext] = useState<MondayContext | null>(null);
  const [showLocationFilter, setShowLocationFilter] = useState(false);
  const [targetColumnId, setTargetColumnId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Get Monday context
    monday.get('context').then((res) => {
      const contextData = res.data as MondayContext;
      setContext(contextData);
      console.log('📍 Location Filter: Context loaded', contextData);
      
      // Initialize filter interceptor after context is loaded
      if (contextData.boardId) {
        initializeInterceptor(contextData.boardId);
      }
    }).catch((error) => {
      console.error('Error getting Monday context:', error);
      // For local development
      if (process.env.NODE_ENV === 'development') {
        console.log('🧪 Running in development mode');
        initializeInterceptor(12345); // Mock board ID
      }
    });
  }, [monday]);

  const initializeInterceptor = (boardId: number) => {
    if (isInitialized) return;
    
    console.log('🚀 Initializing filter interceptor for board:', boardId);
    
    const interceptor = new FilterInterceptor({
      onLocationFilterClick: (columnId: string) => {
        console.log('📍 Location filter clicked for column:', columnId);
        setTargetColumnId(columnId);
        setShowLocationFilter(true);
      },
      boardId: boardId.toString(),
      monday
    });

    interceptor.initialize();
    setIsInitialized(true);
  };

  const handleCloseFilter = () => {
    setShowLocationFilter(false);
    setTargetColumnId(null);
  };

  const handleApplyFilter = async (selectedLocations: string[], operator: string) => {
    console.log('✅ Applying filter:', { selectedLocations, operator, columnId: targetColumnId });
    
    if (!targetColumnId) return;

    try {
      // Apply filter using Monday SDK
      await monday.execute('filterBoard', {
        filterParams: {
          columnId: targetColumnId,
          compareValue: selectedLocations,
          operator: operator === 'is one of' ? 'any_of' : 
                   operator === 'is not one of' ? 'not_any_of' :
                   operator === 'is empty' ? 'is_empty' :
                   operator === 'is not empty' ? 'is_not_empty' :
                   'any_of'
        }
      });

      // Store filter state for persistence
      await monday.storage.instance.setItem(`filter_${targetColumnId}`, {
        locations: selectedLocations,
        operator,
        timestamp: Date.now()
      });

      handleCloseFilter();
    } catch (error) {
      console.error('Error applying filter:', error);
    }
  };

  return (
    <div className="App" style={{ minHeight: '100vh', background: 'transparent' }}>
      {/* Invisible container - the app runs in the background */}
      <div style={{ display: 'none' }}>
        Location Filter Interceptor Active
        {context && (
          <div>
            Board: {context.boardId}
            User: {context.user?.name}
          </div>
        )}
      </div>

      {/* Location Filter Modal */}
      {showLocationFilter && targetColumnId && (
        <LocationFilterModal
          isOpen={showLocationFilter}
          onClose={handleCloseFilter}
          onApply={handleApplyFilter}
          columnId={targetColumnId}
          boardId={context?.boardId?.toString() || ''}
          monday={monday}
        />
      )}

      {/* Development Mode Indicator */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          background: '#00d647',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          zIndex: 9999
        }}>
          🔧 Filter Interceptor Active
        </div>
      )}
    </div>
  );
}

export default App;