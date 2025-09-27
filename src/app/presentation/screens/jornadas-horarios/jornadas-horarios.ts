import { Component, OnInit } from '@angular/core';
import { ReusableTable } from '../../components/reusable-table/reusable-table';


@Component({
  selector: 'app-jornadas-horarios',
  standalone: true,
  imports: [ReusableTable],
  templateUrl: './jornadas-horarios.html',
  styleUrl: './jornadas-horarios.css'
})
export class JornadasHorarios implements OnInit {

  empleados = [
    { 
      id: 1, 
      nombre: 'Juan Pérez', 
      area: 'Campo Norte', 
      cargo: 'Supervisor',
      fechaIngreso: new Date('2023-01-15'),
      salario: 2500,
      activo: true
    },
    { 
      id: 2, 
      nombre: 'María García', 
      area: 'Invernadero', 
      cargo: 'Técnico',
      fechaIngreso: new Date('2023-03-20'),
      salario: 2000,
      activo: true
    },
    { 
      id: 3, 
      nombre: 'Carlos López',
      area: 'Empaque',
      cargo: 'Operario',
      fechaIngreso: new Date('2022-11-05'),
      salario: 1800,
      activo: false
    }
    // ... más datos
  ];

  columnas = [
    { field: 'nombre', header: 'Nombre Completo', type: 'text' as const, sortable: true },
    { field: 'area', header: 'Área de Trabajo', type: 'text' as const, filterable: true },
    { field: 'cargo', header: 'Cargo', type: 'text' as const, filterable: true },

    { field: 'salario', header: 'Salario', type: 'number' as const, format: '1.0-0' },
    { field: 'activo', header: 'Estado', type: 'boolean' as const }
  ];

  filtrosPersonalizados = [
    {
      field: 'fechaIngreso',
      type: 'date' as const,
      label: 'Fecha de Ingreso',
      placeholder: 'Filtrar por fecha'
    },
    {
      field: 'salario',
      type: 'number' as const,
      label: 'Salario Mínimo',
      placeholder: 'Salario desde...'
    }
  ];

  configuracionTabla = {
    exportEnabled: true,
    globalSearch: true,
    columnFilters: true,
    advancedFilters: true,
    selectionMode: 'single' as const,
    responsive: true
  };

  ngOnInit(): void {
    // Cargar datos si es necesario
    this.cargarEmpleados();
  }

  onEmpleadoSeleccionado(event: any): void {
    console.log('Empleado seleccionado:', event.data);
    // Hacer algo con el empleado seleccionado
  }

  onExportarDatos(formato: string): void {
    console.log('Exportando en formato:', formato);
    // Lógica de exportación
    switch(formato) {
      case 'excel':
        this.exportarAExcel();
        break;
      case 'csv':
        this.exportarACSV();
        break;
      case 'pdf':
        this.exportarAPDF();
        break;
    }
  }

  onFiltrosCambiados(filtros: any): void {
    console.log('Filtros aplicados:', filtros);
    // Opcional: guardar estado de filtros
  }

  private cargarEmpleados(): void {
    // Aquí cargarías desde tu servicio
    // this.empleadoService.getEmpleados().subscribe(data => this.empleados = data);
  }

  private exportarAExcel(): void {
    // Implementar exportación a Excel
  }

  private exportarACSV(): void {
    // Implementar exportación a CSV
  }

  private exportarAPDF(): void {
    // Implementar exportación a PDF
  }
}
