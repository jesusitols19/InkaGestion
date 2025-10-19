import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../../../environments/environments';

@Component({
  selector: 'app-control-asistencia',
  imports: [CommonModule,HttpClientModule, FormsModule],
  templateUrl: './control-asistencia.html',
  styleUrl: './control-asistencia.css'
})
export class ControlAsistencia {

  empleado: any;
  asistencias: any[] = [];
  asistenciaActiva: any = null;


  registro = { justificacion: '' };

  trabajadorId!: string | null;

  turnoActual: any = null;

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    this.trabajadorId = this.route.snapshot.paramMap.get('id');
    if(this.trabajadorId){
      this.cargarEmpleado(this.trabajadorId);
      this.cargarAsistencias(this.trabajadorId);
      this.cargarTurnoActual(this.trabajadorId);
    }
  }

  cargarEmpleado(id: string | null) {
    if (id) {
      this.http.get<any>(`${environment.apiUrl}/search-employee-by-id/${id}`).subscribe(
        response => {

          if(response.status === 'success'){
            this.empleado = response.data;
          }
        }
      );
    }
  }

  cargarAsistencias(id: string | null) {
    if (!id) return;
    this.http.get<any>(`${environment.apiUrl}/inicio-modulo-asistencia/${id}`).subscribe(
      response => {
        if (response.status === 'success') {
          this.asistencias = response.data.records;
          this.asistenciaActiva = response.data.active_record;
        }
      }
    );
  }

  cargarTurnoActual(id: string | null) {
    if (!id) return;
    this.http.get<any>(`${environment.apiUrl}/obtener-turno-activo/${id}`).subscribe(
      response => {
        if (response.status === 'success') {
          this.turnoActual = response.data;
        } else {
          this.turnoActual = null;
        }
      }
    );
  }

  registrarEntrada() {
    const payload = {
      employee_id: this.empleado.id,
      supervisor_user_id: 7,
      justification: this.registro.justificacion || null
    };

    this.http.post(`${environment.apiUrl}/crear-asistencia`, payload).subscribe({
      next: (response: any) => {
        if (response.status === 'success') {
          alert(response.data.message || 'Entrada registrada correctamente');
          this.cargarAsistencias(this.empleado.id);
          this.registro.justificacion = '';
        } else {
          alert(response.data.message);
        }
      }
    });
  }

  registrarSalida() {
    const payload = {
      employee_id: this.empleado.id,
      supervisor_user_id: 7
    };

    this.http.post(`${environment.apiUrl}/finalizar-asistencia`, payload).subscribe({
      next: (response: any) => {
        if (response.status === 'success') {
          alert(response.data.message || 'Salida registrada correctamente');
          this.cargarAsistencias(this.empleado.id);
          this.registro.justificacion = '';
        } else {
          alert(response.data.message);
        }
      }
    });
  }

}
