import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-control-asistencia',
  imports: [CommonModule],
  templateUrl: './control-asistencia.html',
  styleUrl: './control-asistencia.css'
})
export class ControlAsistencia {
  estadoAsistencia: string | null = null;

  asistencias = [
    { fecha: '2025-09-18', horaIngreso: '08:15', horaSalida: '17:10', estado: 'A tiempo' },
    { fecha: '2025-09-17', horaIngreso: '08:40', horaSalida: '17:05', estado: 'Tardanza' },
  ];

  marcarEntrada() {
    this.estadoAsistencia = 'Dentro';
    console.log('Entrada registrada');
  }

  marcarSalida() {
    this.estadoAsistencia = 'Fuera';
    console.log('Salida registrada');
  }

  descargarReporte() {
    console.log('Descargando reporte...');
  }
}
