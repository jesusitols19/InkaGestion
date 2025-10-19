import { Component } from '@angular/core';
import { TableComponent } from '../../components/table-dinamic-component/table.component';

@Component({
  selector: 'app-reportes-administrativos',
  imports: [TableComponent],
  templateUrl: './reportes-administrativos.html',
  styleUrl: './reportes-administrativos.css'
})
export class ReportesAdministrativos {

  usuarios = [
    { nombre: 'Juan Pérez', rol: 'Administrador', descripcion: 'Encargado del sistema' },
    { nombre: 'María López', rol: 'Usuario', descripcion: 'Accede a reportes básicos' },
    { nombre: 'Carlos Gómez', rol: 'Supervisor', descripcion: 'Gestiona a los empleados' },
    { nombre: 'Ana Torres', rol: 'Usuario', descripcion: 'Solicita servicios y genera tickets' },
    { nombre: 'Luis Fernández', rol: 'Administrador', descripcion: 'Gestiona permisos y roles' },
    { nombre: 'Victor Llanos', rol: 'Administrador', descripcion: 'Encargado del sistema' },
    { nombre: 'Jean Terrones', rol: 'Usuario', descripcion: 'Accede a reportes básicos' },
    { nombre: 'Lucero Vaca', rol: 'Supervisor', descripcion: 'Gestiona a los empleados' },
    { nombre: 'Diego Fernando', rol: 'Usuario', descripcion: 'Solicita servicios y genera tickets' },
  ];
  planillas = [
    { mes: 'Enero', total: 12500 },
    { mes: 'Febrero', total: 9800 },
    { mes: 'Marzo', total: 14300 },
    { mes: 'Abril', total: 11200 },
    { mes: 'Mayo', total: 15650 },
  ];

  
}
