// client/src/types/monday.d.ts
declare module 'monday-sdk-js' {
  interface MondaySDK {
    get(type: string): Promise<any>;
    api(query: string): Promise<any>;
    execute(command: string, params?: any): Promise<any>;
  }

  export default function mondaySdk(): MondaySDK;
}

// Extend Monday.com context types for Board Column Extensions
declare global {
  interface Window {
    mondaySdk: () => MondaySDK;
  }
}