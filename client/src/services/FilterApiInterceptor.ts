// client/src/services/FilterAPIInterceptor.ts
// Complete version with debugging capabilities

interface InterceptorOptions {
  boardId: string;
  monday: any;
}

interface FilterSettings {
  filterConfig?: {
    supportedOperators: string[];
    availableValues: Array<{
      id: string;
      name: string;
      value: string;
    }>;
  };
  [key: string]: any;
}

class FilterAPIInterceptor {
  private boardId: string;
  private monday: any;
  private locationValues: Map<string, string[]> = new Map();
  private originalFetch: typeof window.fetch;
  private locationColumns: Map<string, string> = new Map(); // columnId -> columnTitle
  private debugMode = true; // Enable for debugging

  constructor(options: InterceptorOptions) {
    this.boardId = options.boardId;
    this.monday = options.monday;
    this.originalFetch = window.fetch.bind(window);
  }

  async initialize() {
    console.log('🔄 Filter API Interceptor: Initializing...');
    
    // Fetch all location columns and their values
    await this.fetchLocationData();
    
    // Set up API interception for both fetch and XHR
    this.interceptAPICalls();
    this.interceptXHR();

    this.watchForFilterDialog();
    
    console.log('✅ Ready to enhance filters from any trigger point');
  }

  private watchForFilterDialog() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            // Look for filter dialog elements
            const dialogSelectors = [
              '[class*="advanced-filter"]',
              '[class*="filter-dialog"]',
              '[class*="filter-modal"]',
              '[data-testid*="filter"]',
              '[aria-label*="filter"]',
              '.dialog-component',
              '[role="dialog"]'
            ];
            
            dialogSelectors.forEach(selector => {
              if (node.matches && node.matches(selector)) {
                console.log('🎯 FILTER DIALOG DETECTED:', node);
                this.inspectFilterDialog(node);
              }
              
              const filterElements = node.querySelectorAll?.(selector);
              filterElements?.forEach(el => {
                console.log('🎯 FILTER ELEMENT FOUND:', el);
                this.inspectFilterDialog(el as HTMLElement);
              });
            });
            
            // Also check for any element with "filter" in text
            if (node.textContent?.toLowerCase().includes('advanced filter')) {
              console.log('📍 Element with "Advanced Filter" text:', node);
            }
          }
        });
      }
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  console.log('👀 Watching for filter dialog in DOM');
}

private inspectFilterDialog(element: HTMLElement) {
  // Look for dropdowns in the filter dialog
  const dropdowns = element.querySelectorAll('select, [role="combobox"], [class*="dropdown"]');
  console.log(`📋 Found ${dropdowns.length} dropdowns in filter dialog`);
  
  dropdowns.forEach((dropdown, index) => {
    console.log(`Dropdown ${index}:`, {
      element: dropdown,
      options: dropdown.querySelectorAll('option'),
      innerHTML: dropdown.innerHTML.substring(0, 200)
    });
  });
  
  // Look for location column references
  const allText = element.textContent || '';
  if (allText.includes('Location')) {
    console.log('✅ Filter dialog contains Location column!');
    
    // Try to find and modify operator dropdowns
    this.tryEnhanceFilterDialog(element);
  }
}

private tryEnhanceFilterDialog(dialogElement: HTMLElement) {
  console.log('🔧 Attempting to enhance filter dialog...');
  
  // Look for operator dropdown (usually the second dropdown)
  const dropdowns = dialogElement.querySelectorAll('select, [role="combobox"]');
  
  if (dropdowns.length >= 2) {
    const operatorDropdown = dropdowns[1] as HTMLSelectElement;
    console.log('📍 Found potential operator dropdown:', operatorDropdown);
    
    // Check if it needs enhancement
    const hasIsOperator = Array.from(operatorDropdown.options || [])
      .some(opt => opt.text === 'is' || opt.value === 'is');
    
    if (!hasIsOperator) {
      console.log('➕ Adding custom operators...');
      
      // Add our custom operators
      const operators = [
        { value: 'is', text: 'is' },
        { value: 'is_not', text: 'is not' }
      ];
      
      operators.forEach(op => {
        const option = document.createElement('option');
        option.value = op.value;
        option.text = op.text;
        operatorDropdown.insertBefore(option, operatorDropdown.firstChild);
      });
      
      console.log('✅ Operators added!');
    }
  }
}

  private async fetchLocationData() {
    try {
      const query = `
        query GetBoardData($boardId: ID!) {
          boards(ids: [$boardId]) {
            columns {
              id
              title
              type
            }
            items_page(limit: 500) {
              items {
                id
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

      const response = await this.monday.api(query, {
        variables: { boardId: this.boardId }
      });

      if (response.data?.boards?.[0]) {
        const board = response.data.boards[0];
        
        // Identify ALL location columns
        board.columns.forEach((column: any) => {
          if (column.type === 'location') {
            this.locationColumns.set(column.id, column.title);
            console.log(`📍 Found location column: ${column.title} (${column.id})`);
          }
        });

        // Extract unique values for each location column
        this.locationColumns.forEach((_title, columnId) => {
          const values = new Set<string>();
          
          board.items_page.items.forEach((item: any) => {
            const columnValue = item.column_values.find((cv: any) => cv.id === columnId);
            if (columnValue?.text && columnValue.text.trim()) {
              values.add(columnValue.text.trim());
            }
          });
          
          this.locationValues.set(columnId, Array.from(values).sort());
          console.log(`📍 Column ${columnId} has ${values.size} unique locations:`, Array.from(values));
        });
      }
    } catch (error) {
      console.error('Error fetching location data:', error);
    }
  }

  private interceptAPICalls() {
    const self = this;
    
    window.fetch = async function(...args: Parameters<typeof fetch>): Promise<Response> {
      const [input, init] = args;
      
      let url: string;
      if (typeof input === 'string') {
        url = input;
      } else if (input instanceof URL) {
        url = input.toString();
      } else if (input instanceof Request) {
        url = input.url;
      } else {
        url = '';
      }
      
      // Debug: Log ALL Monday API calls
      if (self.debugMode && url.includes('monday.com')) {
        const body = init?.body?.toString() || '';
        
        console.log('📡 Monday API Call (fetch):', {
          url: url,
          method: init?.method || 'GET',
          bodyPreview: body.substring(0, 500),
          hasQuery: body.includes('query'),
          hasMutation: body.includes('mutation')
        });
        
        // Look for filter-related keywords
        const filterKeywords = ['filter', 'column', 'setting', 'operator', 'value', 'advanced'];
        const hasFilterKeyword = filterKeywords.some(keyword => 
          body.toLowerCase().includes(keyword)
        );
        
        if (hasFilterKeyword) {
          console.log('🎯 POTENTIAL FILTER CALL - Full body:', body);
        }
      }
      
      // Make the actual request
      const response = await self.originalFetch.apply(window, args);
      
      // Clone and check response
      if (url.includes('monday.com')) {
        const clonedResponse = response.clone();
        try {
          const responseData = await clonedResponse.json();
          
          // Debug: Log responses with location/filter data
          if (self.debugMode) {
            const responseStr = JSON.stringify(responseData);
            for (const columnId of self.locationColumns.keys()) {
              if (responseStr.includes(columnId)) {
                console.log('📦 RESPONSE WITH LOCATION COLUMN:', columnId, responseData);
                break;
              }
            }
            
            if (responseStr.includes('filter') || responseStr.includes('operator')) {
              console.log('📦 RESPONSE WITH FILTER DATA:', responseData);
            }
          }
          
          // Try to modify if it contains column data
          if (self.shouldModifyResponse(responseData, init?.body?.toString() || '')) {
            console.log('✨ Modifying response for location filter enhancement');
            const modifiedData = self.enhanceFilterData(responseData);
            
            return new Response(JSON.stringify(modifiedData), {
              status: response.status,
              statusText: response.statusText,
              headers: response.headers
            });
          }
        } catch (e) {
          // Not JSON or error parsing
        }
      }
      
      return response;
    };
    
    console.log('✅ Fetch interception active');
  }

  private interceptXHR() {
    const self = this;
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;
    
    // Add URL tracking
    XMLHttpRequest.prototype.open = function(method: string, url: string, ...rest: any[]) {
      (this as any)._interceptorUrl = url;
      (this as any)._interceptorMethod = method;
      return originalOpen.apply(this, [method, url, ...rest] as any);
    };
    
    XMLHttpRequest.prototype.send = function(data?: any) {
      const xhr = this as any;
      
      // Debug: Log XHR requests
      if (self.debugMode && xhr._interceptorUrl?.includes('monday.com')) {
        console.log('📡 Monday API Call (XHR):', {
          url: xhr._interceptorUrl,
          method: xhr._interceptorMethod,
          dataPreview: data ? String(data).substring(0, 500) : 'no data'
        });
        
        if (data && String(data).toLowerCase().includes('filter')) {
          console.log('🎯 XHR FILTER REQUEST - Full data:', data);
        }
      }
      
      // Intercept response
      const originalOnReadyState = xhr.onreadystatechange;
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr._interceptorUrl?.includes('monday.com')) {
          try {
            if (self.debugMode && xhr.responseText) {
              const responsePreview = xhr.responseText.substring(0, 500);
              if (responsePreview.includes('filter') || responsePreview.includes('column')) {
                console.log('📦 XHR Response with filter/column:', {
                  url: xhr._interceptorUrl,
                  responsePreview
                });
              }
            }
            
            // Try to modify response if needed
            const responseData = JSON.parse(xhr.responseText);
            if (self.shouldModifyResponse(responseData, data || '')) {
              const modifiedData = self.enhanceFilterData(responseData);
              
              // Override response
              Object.defineProperty(xhr, 'responseText', {
                writable: true,
                value: JSON.stringify(modifiedData)
              });
              Object.defineProperty(xhr, 'response', {
                writable: true,
                value: modifiedData
              });
              
              console.log('✨ XHR Response modified for location filter');
            }
          } catch (e) {
            // Not JSON or couldn't parse
          }
        }
        
        if (originalOnReadyState) {
          originalOnReadyState.apply(xhr, arguments as any);
        }
      };
      
      return originalSend.apply(this, [data]);
    };
    
    console.log('✅ XHR interception active');
  }

  private shouldModifyResponse(data: any, _requestBody: string): boolean {
    // Check various response structures for location columns
    
    // Check if any location column is mentioned
    const dataStr = JSON.stringify(data);
    for (const columnId of this.locationColumns.keys()) {
      if (dataStr.includes(columnId)) {
        if (this.debugMode) {
          console.log(`🔍 Location column ${columnId} found in response`);
        }
        return true;
      }
    }
    
    // Check for board columns with location type
    if (data?.data?.boards?.[0]?.columns) {
      const hasLocation = data.data.boards[0].columns.some((col: any) => 
        col.type === 'location' || this.locationColumns.has(col.id)
      );
      if (hasLocation) {
        if (this.debugMode) {
          console.log('🔍 Location column found in board columns');
        }
        return true;
      }
    }
    
    // Check for filter-specific structures
    if (data?.filter_configuration || data?.filters || data?.column_filters) {
      if (this.debugMode) {
        console.log('🔍 Filter configuration found in response');
      }
      return true;
    }
    
    return false;
  }

  private enhanceFilterData(data: any): any {
    const modifiedData = JSON.parse(JSON.stringify(data));
    
    // Try different response structures
    
    // Structure 1: boards.columns
    if (modifiedData?.data?.boards?.[0]?.columns) {
      modifiedData.data.boards[0].columns = this.enhanceColumns(
        modifiedData.data.boards[0].columns
      );
    }
    
    // Structure 2: Direct columns
    if (modifiedData?.columns && Array.isArray(modifiedData.columns)) {
      modifiedData.columns = this.enhanceColumns(modifiedData.columns);
    }
    
    // Structure 3: Filter configuration
    if (modifiedData?.filter_configuration?.columns) {
      modifiedData.filter_configuration.columns = this.enhanceColumns(
        modifiedData.filter_configuration.columns
      );
    }
    
    // Structure 4: Column filters
    if (modifiedData?.column_filters) {
      for (const columnId of this.locationColumns.keys()) {
        if (modifiedData.column_filters[columnId]) {
          modifiedData.column_filters[columnId] = this.enhanceLocationFilter(
            modifiedData.column_filters[columnId],
            columnId
          );
        }
      }
    }
    
    console.log('✅ Filter data enhanced with location values');
    return modifiedData;
  }

  private enhanceColumns(columns: any[]): any[] {
    return columns.map((column: any) => {
      if (this.locationColumns.has(column.id) || column.type === 'location') {
        console.log(`🔧 Enhancing ${column.title || column.id} with custom operators`);
        
        const locationValues = this.locationValues.get(column.id) || [];
        
        // Parse existing settings
        let settings: FilterSettings = {};
        try {
          settings = column.settings_str ? JSON.parse(column.settings_str) : {};
        } catch (e) {
          settings = {};
        }
        
        // Add enhanced filter configuration
        settings.filterConfig = {
          supportedOperators: ['is', 'is_not', 'is_empty', 'is_not_empty'],
          availableValues: locationValues.map(val => ({
            id: val,
            name: val,
            value: val
          }))
        };
        
        // Also add to standard fields
        column.filter_operators = ['is', 'is_not', 'is_empty', 'is_not_empty'];
        column.filter_values = locationValues;
        column.available_values = locationValues;
        
        column.settings_str = JSON.stringify(settings);
      }
      
      return column;
    });
  }

  private enhanceLocationFilter(filter: any, columnId: string): any {
    const locationValues = this.locationValues.get(columnId) || [];
    
    return {
      ...filter,
      operators: ['is', 'is_not', 'is_empty', 'is_not_empty'],
      values: locationValues,
      available_values: locationValues,
      supported_operators: ['is', 'is_not', 'is_empty', 'is_not_empty']
    };
  }

  destroy() {
    if (this.originalFetch) {
      window.fetch = this.originalFetch;
    }
    console.log('🔄 API interception removed');
  }
}

export default FilterAPIInterceptor;