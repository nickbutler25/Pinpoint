// client/src/App.tsx
import mondaySdk from 'monday-sdk-js';
import { useEffect, useState } from 'react';
import './app.css';
import FilterAPIInterceptor from './services/FilterApiInterceptor';


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
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Get Monday context
    monday.get('context').then((res) => {
      const contextData = res.data as MondayContext;
      setContext(contextData);
      console.log('📍 Location Filter: Context loaded', contextData);
      
      // Initialize API interceptor after context is loaded
      if (contextData.boardId && !isInitialized) {
        const interceptor = new FilterAPIInterceptor({
          boardId: contextData.boardId.toString(),
          monday
        });
        
        interceptor.initialize();
        setIsInitialized(true);
        
        // Store interceptor for cleanup if needed
        (window as any).filterInterceptor = interceptor;
      }
    }).catch((error) => {
      console.error('Error getting Monday context:', error);
    });
  }, [monday, isInitialized]);

  // Return JSX element, not a class
  return (
    <div className="App" style={{ display: 'none' }}>
      API Interceptor Active for Board: {context?.boardId || 'Loading...'}
    </div>
  );
}

export default App;