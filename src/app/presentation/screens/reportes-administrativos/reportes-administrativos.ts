import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-reportes-administrativos',
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './reportes-administrativos.html',
  styleUrls: ['./reportes-administrativos.css']
})
export class ReportesAdministrativos implements OnInit {

  apiUrl = 'http://localhost:8000';

  reportes: any[] = [];
  vistas: any[] = [];

  modalAbierto = false;
  modoEdicion = false;

  nuevoReporte: any = {
    id: 0,
    name: '',
    frequency: 'MANUAL',
    last_run: '',
    next_run: '', // <-- nuevo campo
    recipients: '',
    template: '',
    active: true,
    created_by: null
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.obtenerReportes();
    this.obtenerVistasMySQL();
  }

  obtenerReportes() {
    this.http.get(`${this.apiUrl}/get-all-reports`).subscribe((res: any) => {
      this.reportes = res.data || [];
    });
  }

  obtenerVistasMySQL() {
    this.http.get(`${this.apiUrl}/get-mysql-views`).subscribe((res: any) => {
      this.vistas = res.data || [];
    });
  }

  abrirModal(reporte: any = null) {
    this.modalAbierto = true;
    if (reporte) {
      this.modoEdicion = true;
      this.nuevoReporte.id = reporte.id
      this.nuevoReporte.name = reporte.name;
      this.nuevoReporte.frequency = reporte.frequency;
      this.nuevoReporte.next_run = reporte.next_run;
      this.nuevoReporte.recipients = reporte.recipients;
      this.nuevoReporte.template = reporte.template;
      this.nuevoReporte.active = reporte.active;
      this.nuevoReporte.created_by = reporte.created_by;
      this.nuevoReporte.last_run = reporte.last_run;

    } else {
      this.modoEdicion = false;
      this.nuevoReporte = {
        name: '',
        frequency: 'MANUAL',
        next_run: new Date().toISOString().substring(0, 16), // formato para input datetime-local
        recipients: '',
        template: '',
        created_by: localStorage.getItem('id_usuario_actual') || null
      };
    }
  }

  cerrarModal() {
    this.modalAbierto = false;
  }

  guardarReporte() {
    const dto = { ...this.nuevoReporte };

    console.log(dto);

    if (this.modoEdicion) {
      this.http.put(`${this.apiUrl}/update-scheduled-report`, dto).subscribe(() => {
        this.cerrarModal();
        this.obtenerReportes();
      });
    } else {
      this.http.post(`${this.apiUrl}/create-scheduled-report`, dto).subscribe(() => {
        this.cerrarModal();
        this.obtenerReportes();
      });
    }
  }

  ejecutarManualmente() {
    if (!confirm('¿Deseas ejecutar todos los reportes pendientes ahora?')) return;

    this.http.post(`${this.apiUrl}/execute-manual`, {}).subscribe(() => {
      this.obtenerReportes();
      alert('Reportes ejecutados correctamente.');
    });
  }


  
}
