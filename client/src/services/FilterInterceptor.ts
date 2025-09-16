// client/src/services/FilterInterceptor.ts

interface FilterInterceptorOptions {
  onLocationFilterClick: (columnId: string) => void;
  boardId: string;
  monday: any;
}

class FilterInterceptor {
  private options: FilterInterceptorOptions;
  private observer: MutationObserver | null = null;
  private isIntercepting = false;
  private locationColumnIds: Set<string> = new Set();

  constructor(options: FilterInterceptorOptions) {
    this.options = options;
  }

  async initialize() {
    console.log('🎯 Filter Interceptor: Initializing...');
    
    // First, identify location columns on the board
    await this.identifyLocationColumns();
    
    // Set up DOM observer to detect menu clicks
    this.setupDOMObserver();
    
    // Set up click interceptor
    this.setupClickInterceptor();
  }

  private async identifyLocationColumns() {
    try {
      // Query Monday API for board columns
      const query = `
        query GetBoardColumns($boardId: ID!) {
          boards(ids: [$boardId]) {
            columns {
              id
              title
              type
            }
          }
        }
      `;

      const response = await this.options.monday.api(query, {
        variables: { boardId: this.options.boardId }
      });

      if (response.data?.boards?.[0]?.columns) {
        response.data.boards[0].columns.forEach((column: any) => {
          if (column.type === 'location') {
            this.locationColumnIds.add(column.id);
            console.log(`📍 Found location column: ${column.title} (${column.id})`);
          }
        });
      }
    } catch (error) {
      console.error('Error identifying location columns:', error);
      // Fallback: try to detect from DOM
      this.detectLocationColumnsFromDOM();
    }
  }

  private detectLocationColumnsFromDOM() {
    // Look for location column indicators in the DOM
    const columnHeaders = document.querySelectorAll('[data-column-id]');
    columnHeaders.forEach((header) => {
      const columnId = header.getAttribute('data-column-id');
      // Check for location icon or text
      if (columnId && (
        header.querySelector('[class*="location"]') ||
        header.textContent?.includes('Location') ||
        header.querySelector('[aria-label*="location"]')
      )) {
        this.locationColumnIds.add(columnId);
        console.log(`📍 Detected location column from DOM: ${columnId}`);
      }
    });
  }

  private setupDOMObserver() {
    // Observer to detect when Monday's UI changes
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        // Check if a menu or modal was added
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement) {
              this.checkForFilterMenu(node);
            }
          });
        }
      });
    });

    // Start observing
    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  private checkForFilterMenu(element: HTMLElement) {
    // Look for Monday's filter menu elements
    const filterMenuSelectors = [
      '[data-testid="column-menu"]',
      '[class*="column-menu"]',
      '[class*="menu-content"]',
      '[role="menu"]',
      '.menu-item',
      '[class*="MenuButton"]'
    ];

    filterMenuSelectors.forEach(selector => {
      const menuElements = element.matches(selector) ? [element] : Array.from(element.querySelectorAll(selector));
      
      menuElements.forEach(menuEl => {
        // Check if this menu contains a filter option
        const filterOption = this.findFilterOption(menuEl);
        if (filterOption) {
          this.interceptFilterOption(filterOption);
        }
      });
    });
  }

  private findFilterOption(menuElement: HTMLElement): HTMLElement | null {
    // Look for the filter menu item
    const filterSelectors = [
      '[data-testid="filter-menu-item"]',
      '[aria-label*="Filter"]',
      '.menu-item:has-text("Filter")',
      'button:has-text("Filter")',
      'div[role="menuitem"]:has-text("Filter")'
    ];

    for (const selector of filterSelectors) {
      // Direct selector match
      const filterEl = menuElement.querySelector(selector) as HTMLElement;
      if (filterEl) return filterEl;
      
      // Text content match
      const allMenuItems = menuElement.querySelectorAll('[role="menuitem"], .menu-item, button');
      for (const item of allMenuItems) {
        if (item.textContent?.trim() === 'Filter' || 
            item.textContent?.includes('Filter')) {
          return item as HTMLElement;
        }
      }
    }
    
    return null;
  }

  private interceptFilterOption(filterElement: HTMLElement) {
    // Check if we've already intercepted this element
    if (filterElement.dataset.intercepted === 'true') return;
    
    // Mark as intercepted
    filterElement.dataset.intercepted = 'true';
    
    // Get the column context
    const columnId = this.getColumnIdFromContext(filterElement);
    
    if (columnId && this.locationColumnIds.has(columnId)) {
      console.log(`🎯 Intercepting filter for location column: ${columnId}`);
      
      // Clone the element to remove existing listeners
      const newFilterElement = filterElement.cloneNode(true) as HTMLElement;
      filterElement.parentNode?.replaceChild(newFilterElement, filterElement);
      
      // Add our custom handler
      newFilterElement.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Close the native menu
        this.closeNativeMenu();
        
        // Trigger our custom filter
        this.options.onLocationFilterClick(columnId);
      }, true);
    }
  }

  private setupClickInterceptor() {
    // Global click interceptor as a fallback
    document.addEventListener('click', (e) => {
      if (this.isIntercepting) return;
      
      const target = e.target as HTMLElement;
      
      // Check if this is a filter button click
      if (this.isFilterClick(target)) {
        const columnId = this.getColumnIdFromContext(target);
        
        if (columnId && this.locationColumnIds.has(columnId)) {
          console.log(`🎯 Intercepted filter click for location column: ${columnId}`);
          
          e.preventDefault();
          e.stopPropagation();
          
          this.isIntercepting = true;
          
          // Close any open menus
          this.closeNativeMenu();
          
          // Trigger our custom filter
          this.options.onLocationFilterClick(columnId);
          
          // Reset flag after a delay
          setTimeout(() => {
            this.isIntercepting = false;
          }, 100);
        }
      }
    }, true); // Use capture phase
  }

  private isFilterClick(element: HTMLElement): boolean {
    // Check if the clicked element or its parents are filter-related
    let current: HTMLElement | null = element;
    
    while (current) {
      const text = current.textContent?.trim();
      const ariaLabel = current.getAttribute('aria-label');
      
      if (
        text === 'Filter' ||
        text?.includes('Filter') ||
        ariaLabel?.includes('Filter') ||
        current.dataset.testid === 'filter-menu-item'
      ) {
        // Verify this is in a menu context
        const inMenu = !!current.closest('[role="menu"], [class*="menu"], [data-testid*="menu"]');
        if (inMenu) return true;
      }
      
      current = current.parentElement;
    }
    
    return false;
  }

  private getColumnIdFromContext(element: HTMLElement): string | null {
    // Try to find column ID from various sources
    
    // Method 1: Data attribute
    let columnEl = element.closest('[data-column-id]') as HTMLElement;
    if (columnEl) {
      return columnEl.dataset.columnId || null;
    }
    
    // Method 2: From menu context
    const menu = element.closest('[role="menu"], [class*="column-menu"]');
    if (menu) {
      // Look for column reference in menu attributes or nearby elements
      const columnHeader = document.querySelector('[aria-expanded="true"][data-column-id]') as HTMLElement;
      if (columnHeader) {
        return columnHeader.dataset.columnId || null;
      }
    }
    
    // Method 3: From URL or Monday context
    // Monday sometimes includes column ID in element IDs or classes
    const idMatch = element.id?.match(/column[_-]?([a-zA-Z0-9]+)/);
    if (idMatch) return idMatch[1];
    
    const classMatch = element.className?.match(/column[_-]?([a-zA-Z0-9]+)/);
    if (classMatch) return classMatch[1];
    
    // Method 4: Try to find from active column header
    const activeColumn = document.querySelector('.column-header.active, [class*="column"][class*="active"]');
    if (activeColumn) {
      return activeColumn.getAttribute('data-column-id');
    }
    
    return null;
  }

  private closeNativeMenu() {
    // Close Monday's native menus
    const menus = document.querySelectorAll('[role="menu"], [class*="menu-content"], [data-testid*="menu"]');
    menus.forEach(menu => {
      // Try to remove the menu
      if (menu.parentElement) {
        menu.remove();
      }
    });
    
    // Click outside to ensure menu closes
    const backdrop = document.querySelector('[class*="backdrop"], [class*="overlay"]') as HTMLElement;
    if (backdrop) {
      backdrop.click();
    }
    
    // Remove menu-open classes from body
    document.body.classList.remove('menu-open', 'modal-open');
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}

export default FilterInterceptor;