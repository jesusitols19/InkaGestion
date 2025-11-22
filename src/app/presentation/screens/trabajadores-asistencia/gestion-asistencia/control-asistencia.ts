import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../../../environments/environments';
import {  OnInit, inject, DestroyRef } from '@angular/core';
import { interval } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';

registerLocaleData(localeEs, 'es-ES');

@Component({
  selector: 'app-control-asistencia',
  imports: [CommonModule,HttpClientModule, FormsModule],
  templateUrl: './control-asistencia.html',
  styleUrl: './control-asistencia.css'
})
export class ControlAsistencia implements OnInit {

  empleado: any;
  asistencias: any[] = [];
  asistenciaActiva: any = null;
  registro = { justificacion: '' };
  trabajadorId!: string | null;
  turnoActual: any = null;

  private destroyRef = inject(DestroyRef);
  public fechaHoraActual: Date = new Date();
  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    this.trabajadorId = this.route.snapshot.paramMap.get('id');
    if(this.trabajadorId){
      this.cargarEmpleado(this.trabajadorId);
      this.cargarAsistencias(this.trabajadorId);
      this.cargarTurnoActual(this.trabajadorId);
    }
    this.iniciarReloj();
  }

    private iniciarReloj(): void {
    interval(1000) // Se ejecuta cada 1000ms (1 segundo)
      .pipe(takeUntilDestroyed(this.destroyRef)) // Se destruye automáticamente con el componente
      .subscribe(() => {
        this.fechaHoraActual = new Date();
      });
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

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        const payload = {
          employee_id: this.empleado.id,
          supervisor_user_id: localStorage.getItem('id_usuario_actual'),
          justification: this.registro.justificacion || null,
          lat: lat,
          lng: lng,
          // device_info: navigator.userAgent
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
          },
          error: (err) => {
            console.error(err);
            alert('Error al registrar la asistencia');
          }
        });
      },
      (error) => {
        console.error('Error de geolocalización:', error);
        alert('No se pudo obtener la ubicación. Debes permitir el acceso a tu ubicación.');
      }
    );
  }

  registrarSalida() {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        const payload = {
          employee_id: this.empleado.id,
          supervisor_user_id: localStorage.getItem('id_usuario_actual'),
          lat: lat,
          lng: lng,
          // device_info: navigator.userAgent
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
          },
          error: (err) => {
            console.error(err);
            alert('Error al registrar la asistencia');
          }
        });
      },
      (error) => {
        console.error('Error de geolocalización:', error);
        alert('No se pudo obtener la ubicación. Debes permitir el acceso a tu ubicación.');
      }
    );

  }

}
