// client/src/components/DebugContext.tsx
import mondaySdk from 'monday-sdk-js';
import React, { useEffect, useState } from 'react';

const DebugContext: React.FC = () => {
  const [monday] = useState(() => mondaySdk());
  const [context, setContext] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    monday.get('context')
      .then((res) => {
        console.log('Monday.com context received:', res.data);
        setContext(res.data);
      })
      .catch((err) => {
        console.error('Error getting context:', err);
        setError(err.message);
      });
  }, [monday]);

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'monospace', 
      backgroundColor: '#f5f5f5',
      border: '1px solid #ddd',
      borderRadius: '4px',
      margin: '10px'
    }}>
      <h3>🔍 Monday.com Context Debug</h3>
      
      {error && (
        <div style={{ color: 'red', marginBottom: '10px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {context ? (
        <div>
          <h4>Available Context Properties:</h4>
          <pre style={{ 
            backgroundColor: 'white', 
            padding: '10px', 
            borderRadius: '4px',
            overflow: 'auto'
          }}>
            {JSON.stringify(context, null, 2)}
          </pre>
          
          <h4>Context Analysis:</h4>
          <ul>
            <li><strong>Has boardId:</strong> {context.boardId ? '✅ Yes' : '❌ No'}</li>
            <li><strong>Has columnId:</strong> {context.columnId ? '✅ Yes' : '❌ No'}</li>
            <li><strong>App Type:</strong> {context.columnId ? 'Column Extension' : 'Board View'}</li>
            <li><strong>User ID:</strong> {context.userId || 'Not available'}</li>
            <li><strong>Account ID:</strong> {context.accountId || 'Not available'}</li>
          </ul>
        </div>
      ) : (
        <div>Loading context...</div>
      )}
    </div>
  );
};

export default DebugContext;