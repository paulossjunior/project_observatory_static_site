/**
 * SortableTable - Adds sorting and search functionality to tables
 */
export class SortableTable {
  constructor(tableElement) {
    this.table = tableElement;
    this.tbody = this.table.querySelector('tbody');
    this.headers = Array.from(this.table.querySelectorAll('th'));
    this.rows = Array.from(this.tbody.querySelectorAll('tr'));
    this.currentSort = { column: -1, ascending: true };
    
    this.init();
  }

  init() {
    // Add sort icons to headers
    this.headers.forEach((header, index) => {
      header.style.cursor = 'pointer';
      header.style.userSelect = 'none';
      header.style.position = 'relative';
      header.style.paddingRight = '1.5rem';
      
      const sortIcon = document.createElement('span');
      sortIcon.className = 'sort-icon';
      sortIcon.innerHTML = '⇅';
      sortIcon.style.position = 'absolute';
      sortIcon.style.right = '0.5rem';
      sortIcon.style.opacity = '0.3';
      header.appendChild(sortIcon);
      
      header.addEventListener('click', () => this.sortByColumn(index));
    });
  }

  sortByColumn(columnIndex) {
    const ascending = this.currentSort.column === columnIndex ? !this.currentSort.ascending : true;
    this.currentSort = { column: columnIndex, ascending };
    
    // Update sort icons
    this.headers.forEach((header, index) => {
      const icon = header.querySelector('.sort-icon');
      if (index === columnIndex) {
        icon.innerHTML = ascending ? '↑' : '↓';
        icon.classList.add('active');
      } else {
        icon.innerHTML = '⇅';
        icon.classList.remove('active');
      }
    });
    
    // Sort rows
    const sortedRows = this.rows.sort((a, b) => {
      const aCell = a.cells[columnIndex]?.textContent.trim() || '';
      const bCell = b.cells[columnIndex]?.textContent.trim() || '';
      
      // Try to parse as number
      const aNum = parseFloat(aCell);
      const bNum = parseFloat(bCell);
      
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return ascending ? aNum - bNum : bNum - aNum;
      }
      
      // String comparison
      return ascending 
        ? aCell.localeCompare(bCell, 'pt-BR')
        : bCell.localeCompare(aCell, 'pt-BR');
    });
    
    // Re-append rows in sorted order
    sortedRows.forEach(row => this.tbody.appendChild(row));
  }

  filter(searchTerm) {
    const term = searchTerm.toLowerCase();
    
    this.rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(term) ? '' : 'none';
    });
  }
}

/**
 * Initialize all sortable tables on the page
 */
export function initSortableTables() {
  const tables = document.querySelectorAll('.data-table');
  const instances = [];
  
  tables.forEach(table => {
    const sortableTable = new SortableTable(table);
    instances.push(sortableTable);
  });
  
  return instances;
}
