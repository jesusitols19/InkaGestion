import { Component, Input, OnInit, OnChanges, SimpleChanges, ViewChild, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Table, TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { CardModule } from 'primeng/card';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { PopoverModule } from 'primeng/popover';
import { TableRowSelectEvent } from 'primeng/table';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';


// Interfaces para tipado strict
interface TableColumn {
  field: string;
  header: string;
  type?: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'multiselect';
  sortable?: boolean;
  filterable?: boolean;
  filterType?: 'text' | 'dropdown' | 'multiselect' | 'date' | 'number';
  filterOptions?: FilterOption[];
  format?: string;
  width?: string;
  frozen?: boolean;
  exportable?: boolean;
}

interface FilterOption {
  label: string;
  value: any;
}

interface FilterConfig {
  field: string;
  type: 'dropdown' | 'multiselect' | 'date' | 'text' | 'number';
  options?: FilterOption[];
  label?: string;
  placeholder?: string;
}

interface TableConfig {
  exportEnabled?: boolean;
  globalSearch?: boolean;
  columnFilters?: boolean;
  advancedFilters?: boolean;
  selectionMode?: 'single' | 'multiple' | 'none';
  lazyLoading?: boolean;
  virtualScroll?: boolean;
  responsive?: boolean;
}

interface LazyLoadEvent {
  first: number;
  rows: number;
  sortField?: string;
  sortOrder?: number;
  globalFilter?: string;
  filters: Record<string, any>;
}

interface ExportOption {
  label: string;
  value: 'excel' | 'csv' | 'pdf';
  icon: string;
}

@Component({
  selector: 'app-reusable-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    InputTextModule,
    InputNumberModule,
    IconFieldModule,
    InputIconModule,
    CardModule,
    SelectModule,
    MultiSelectModule,
    DatePickerModule,
    ButtonModule,
    BadgeModule,
    PopoverModule,
    ReactiveFormsModule,
    FloatLabelModule

  ],
  templateUrl: './reusable-table.html',
  styleUrls: ['./reusable-table.css']
})
export class ReusableTable implements OnInit, OnChanges {

  Object = Object; // Para uso en templates
  @ViewChild('dt') dt!: Table;
  @ViewChild('exportPanel') exportPanel!: any;
  
  // Inputs principales
  @Input() data: any[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() loading = signal<boolean>(false);
  @Input() totalRecords: number = 0;
  @Input() title: string = '';
  
  // Configuración de paginación
  @Input() paginator: boolean = true;
  @Input() rows: number = 10;
  @Input() rowsPerPageOptions: number[] = [5, 10, 20, 50];
  @Input() lazy: boolean = false;
  
  // Configuración de filtros
  @Input() autoFilters: string[] = [];
  @Input() customFilters: FilterConfig[] = [];
  @Input() config: TableConfig = {
    exportEnabled: true,
    globalSearch: true,
    columnFilters: true,
    advancedFilters: true,
    selectionMode: 'none',
    lazyLoading: false,
    responsive: true
  };
  
  // Outputs con tipado estricto
  @Output() onLazyLoad = new EventEmitter<LazyLoadEvent>();
  @Output() onRowSelect = new EventEmitter<{data: any, index: number}>();
  @Output() onRowUnselect = new EventEmitter<{data: any, index: number}>();
  @Output() onFiltersChange = new EventEmitter<Record<string, any>>();
  @Output() onSort = new EventEmitter<{field: string, order: number}>();
  @Output() onExport = new EventEmitter<string>();
  

  filterControls: Record<string, FormControl> = {};
  // Signals para estado reactivo (Angular 20)
  globalFilter = signal<string>('');
  selectedRows = signal<any[]>([]);

  activeFilters = signal<Record<string, any>>({});
  dynamicFilters = signal<Record<string, FilterOption[]>>({});
  showAdvancedFilters = signal<boolean>(false);
  
  // Computed signals
  isFilterActive = computed(() => 
    Object.keys(this.activeFilters()).length > 0 || this.globalFilter().length > 0
  );

  hasSelection = computed(() => 
    this.config.selectionMode !== 'none'
  );

  isMultipleSelection = computed(() => 
    this.config.selectionMode === 'multiple'
  );

  exportableColumns = computed(() => 
    this.columns.filter(col => col.exportable !== false)
  );

  filterableColumns = computed(() => 
    this.columns.filter(col => col.filterable !== false)
  );
  
  // Opciones de exportación
  readonly exportOptions: ExportOption[] = [
    { label: 'Excel (.xlsx)', value: 'excel', icon: 'pi pi-file-excel' },
    { label: 'CSV', value: 'csv', icon: 'pi pi-file' },
    { label: 'PDF', value: 'pdf', icon: 'pi pi-file-pdf' }
  ];

  ngOnInit(): void {
    this.initializeTable();
        this.columns.forEach(col => {
      this.filterControls[col.field] = new FormControl('');
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']?.currentValue) {
      this.totalRecords = this.lazy ? this.totalRecords : this.data.length;
      this.generateDynamicFilters();
    }
  }

  private initializeTable(): void {
    this.generateDynamicFilters();
    
    if (this.columns.length === 0 && this.data.length > 0) {
      this.generateColumnsFromData();
    }
  }

  private generateColumnsFromData(): void {
    if (this.data.length === 0) return;
    
    const firstRow = this.data[0];
    this.columns = Object.keys(firstRow).map(key => ({
      field: key,
      header: this.formatHeader(key),
      type: this.inferColumnType(firstRow[key]),
      sortable: true,
      filterable: true,
      exportable: true
    }));
  }

  formatHeader(field: string): string {
    return field
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  private inferColumnType(value: any): TableColumn['type'] {
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    if (value instanceof Date || this.isDateString(value)) return 'date';
    return 'text';
  }

  private isDateString(value: any): boolean {
    return typeof value === 'string' && !isNaN(Date.parse(value));
  }

  private generateDynamicFilters(): void {
    const newDynamicFilters: Record<string, FilterOption[]> = {};
    
    // Generar filtros automáticos para campos especificados
    this.autoFilters.forEach(field => {
      if (this.data.length > 0) {
        const uniqueValues = [...new Set(this.data.map(item => item[field]))]
          .filter(value => value != null && value !== '')
          .sort()
          .map(value => ({
            label: String(value),
            value: value
          }));
        
        newDynamicFilters[field] = uniqueValues;
      }
    });

    // Procesar filtros personalizados
    this.customFilters.forEach(filter => {
      if (!filter.options && this.data.length > 0) {
        const uniqueValues = [...new Set(this.data.map(item => item[filter.field]))]
          .filter(value => value != null && value !== '')
          .sort()
          .map(value => ({
            label: String(value),
            value: value
          }));
        
        filter.options = uniqueValues;
      }
    });

    this.dynamicFilters.set(newDynamicFilters);
  }

  // Métodos de filtrado con signals
  applyGlobalFilter(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    this.globalFilter.set(value);
    
    if (this.lazy) {
      this.emitLazyLoad();
    } else {
      this.dt.filterGlobal(value, 'contains');
    }
  }

  applyColumnFilter(field: string, value: any, matchMode: string = 'equals'): void {
    this.activeFilters.update(filters => ({
      ...filters,
      [field]: value
    }));
    
    if (this.lazy) {
      this.emitLazyLoad();
    } else {
      this.dt.filter(value, field, matchMode);
    }
    
    this.onFiltersChange.emit(this.activeFilters());
  }

  applyMultiSelectFilter(field: string, values: any[]): void {
    this.activeFilters.update(filters => ({
      ...filters,
      [field]: values
    }));
    
    if (this.lazy) {
      this.emitLazyLoad();
    } else {
      if (values && values.length > 0) {
        this.dt.filter(values, field, 'in');
      } else {
        this.dt.filter(null, field, 'equals');
      }
    }
    
    this.onFiltersChange.emit(this.activeFilters());
  }

  clearFilters(): void {
    this.activeFilters.set({});
    this.globalFilter.set('');
    this.dt.clear();
    this.onFiltersChange.emit({});
  }

  toggleAdvancedFilters(): void {
    this.showAdvancedFilters.update(show => !show);
  }

  // Métodos de selección
  onRowSelectHandler(event: TableRowSelectEvent<any>) {
    console.log('Fila seleccionada:', event.data, event.index);
  }

  onRowUnselectHandler(event: TableRowSelectEvent<any>) { // <--- mismo tipo
    console.log('Fila deseleccionada:', event.data, event.index);
  }

  // Métodos de lazy loading
  onLazyLoadHandler(event: any): void {
    if (this.lazy) {
      this.emitLazyLoad(event);
    }
  }

  private emitLazyLoad(event?: any): void {
    const lazyEvent: LazyLoadEvent = {
      first: event?.first || 0,
      rows: event?.rows || this.rows,
      sortField: event?.sortField,
      sortOrder: event?.sortOrder,
      globalFilter: this.globalFilter(),
      filters: this.activeFilters()
    };
    
    this.onLazyLoad.emit(lazyEvent);
  }

  // Métodos de exportación
  exportData(format: string): void {
    this.onExport.emit(format);
  }

  // Métodos utilitarios
  getFilterOptions(field: string): FilterOption[] {
    return this.dynamicFilters()[field] || [];
  }

  getCustomFilterConfig(field: string): FilterConfig | undefined {
    return this.customFilters.find(f => f.field === field);
  }

  hasAutoFilter(field: string): boolean {
    return this.autoFilters.includes(field);
  }

  getFilteredData(): any[] {
    if (this.lazy) {
      return this.data; // En modo lazy, el backend ya filtra
    }
    
    // Aplicar filtros localmente si no es lazy
    let filteredData = [...this.data];
    
    // Aplicar filtro global
    const globalFilterValue = this.globalFilter();
    if (globalFilterValue) {
      const globalFields = this.columns
        .filter(col => col.exportable !== false)
        .map(col => col.field);
      
      filteredData = filteredData.filter(item =>
        globalFields.some(field =>
          String(item[field] || '').toLowerCase()
            .includes(globalFilterValue.toLowerCase())
        )
      );
    }
    
    // Aplicar filtros específicos
    const activeFiltersValue = this.activeFilters();
    Object.entries(activeFiltersValue).forEach(([field, value]) => {
      if (value != null && value !== '') {
        if (Array.isArray(value)) {
          filteredData = filteredData.filter(item => value.includes(item[field]));
        } else {
          filteredData = filteredData.filter(item => item[field] === value);
        }
      }
    });
    
    return filteredData;
  }

  // Tracking functions para performance optimizada
  trackByField = (index: number, column: TableColumn): string => column.field;
  trackByValue = (index: number, option: FilterOption): any => option.value;
  trackByRowIndex = (index: number, row: any): number => index;
}