import { Component, OnInit, OnDestroy, signal, computed, inject, DestroyRef } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpClient, HttpClientModule, HttpParams } from '@angular/common/http';
import { interval, Observable } from 'rxjs';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';

// Interfaces para type safety
interface EstadisticasPrincipales {
  totalEmpleados: number;
  asistenciaHoy: number;
  ausentes: number;
  asistenciaPorcentaje: number;
  planillasGeneradas: number;
  pagosPendientes: number;
  ingresosMes: number;
  gastosPersonal: number;
  horasTrabajadasMes: number;
  promedioHorasDiarias: number;
}

interface ActividadReciente {
  id: number;
  tipo: 'asistencia' | 'planilla' | 'alerta' | 'pago' | 'registro';
  mensaje: string;
  hora: string;
  estado: 'success' | 'info' | 'warning' | 'error';
  icono: string;
}

interface PersonalCampo {
  id: number;
  nombre: string;
  sector: string;
  estado: 'activo' | 'descanso';
  horasHoy: number;
  entrada: string;
  actividad: string;
}

interface DatoSemanal {
  dia: string;
  asistencia: number;
  ausencias: number;
  porcentaje: number;
}

interface DistribucionSector {
  sector: string;
  empleados: number;
  activos: number;
  porcentaje: number;
}

interface AlertaImportante {
  tipo: 'urgent' | 'warning' | 'info';
  titulo: string;
  mensaje: string;
  accion: string;
}

interface Area {
  id: number;
  nombre: string;
}

interface Employee {
  id: number;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    CurrencyPipe,
    DecimalPipe,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    MatSelectModule
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit, OnDestroy {
  
  // Inject dependencies
  private destroyRef = inject(DestroyRef);
  private fb = inject(FormBuilder);

  // Signals para estado reactivo
  stats = signal<EstadisticasPrincipales>({
    totalEmpleados: 156,
    asistenciaHoy: 134,
    ausentes: 22,
    asistenciaPorcentaje: 85.9,
    planillasGeneradas: 4,
    pagosPendientes: 12,
    ingresosMes: 45680.50,
    gastosPersonal: 28450.75,
    horasTrabajadasMes: 3248,
    promedioHorasDiarias: 8.2
  });

  isLoading = signal<boolean>(false);
  fechaActual = signal<Date>(new Date());
  actividadesRecientes = signal<ActividadReciente[]>([]);
  personalCampo = signal<PersonalCampo[]>([]);
  datosSemanales = signal<DatoSemanal[]>([]);
  distribucionSectores = signal<DistribucionSector[]>([]);
  alertasImportantes = signal<AlertaImportante[]>([]);
  areas = signal<Area[]>([]);
  employees = signal<Employee[]>([]);

  // Formulario de filtros
  filterForm: FormGroup;

  // Computed signals
  empleadosActivos = computed(() => 
    this.personalCampo().filter(p => p.estado === 'activo').length
  );

  eficienciaGeneral = computed(() => {
    const statsData = this.stats();
    if (statsData.totalEmpleados === 0) return 0;
    return (statsData.asistenciaHoy / statsData.totalEmpleados) * 100;
  });

  constructor(private http: HttpClient) {
    this.filterForm = this.fb.group({
      startDate: [null],
      endDate: [null],
      areaId: [null],
      employeeId: [null]
    });

    this.datosGeneralesDashboard();
    this.inicializarActualizacionesAutomaticas();
  }

  ngOnInit(): void {
    this.loadAreas();
    this.loadEmployees();
    this.configurarActualizacionesPeriodicas();
  }

  ngOnDestroy(): void {
    console.log('Dashboard component destruido');
  }

  datosGeneralesDashboard(filters: any = {}): void {
    let params = new HttpParams();
    if (filters.startDate) {
      params = params.set('start_date', new Date(filters.startDate).toISOString().split('T')[0]);
    }
    if (filters.endDate) {
      params = params.set('end_date', new Date(filters.endDate).toISOString().split('T')[0]);
    }
    if (filters.areaId) {
      params = params.set('area_id', filters.areaId);
    }
    if (filters.employeeId) {
      params = params.set('employee_id', filters.employeeId);
    }

    this.http.get<any>('http://localhost:8000/get-full-dashboard', { params })
        .subscribe(response => {
          const data = response.data;
          this.stats.update(stats => ({
            ...stats,
            totalEmpleados: data.total_empleados.total_empleados,
            gastosPersonal: data.gasto_personal_total.gasto_total_personal,
            horasTrabajadasMes: data.horas_trabajadas_total_general.total_general ?? 0,
            pagosPendientes: data.pagos_pendientes.pagos_pendientes,
            promedioHorasDiarias: data.promedio_horas_hoy.promedio_horas_hoy ?? 0,
            asistenciaHoy: data.resumen_asistencia_hoy.empleados_presentes ?? 0,
            asistenciaPorcentaje: data.resumen_asistencia_hoy.porcentaje_asistencia ?? 0
          }));
        });
  }

  loadAreas(): void {
    this.http.get<any>('http://localhost:8000/areas')
      .subscribe(response => {
        this.areas.set(response.data);
      });
  }

  loadEmployees(): void {
    this.http.get<any>('http://localhost:8000/employees')
      .subscribe(response => {
        this.employees.set(response.data);
      });
  }

  applyFilters(): void {
    this.datosGeneralesDashboard(this.filterForm.value);
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.datosGeneralesDashboard();
  }

  private inicializarActualizacionesAutomaticas(): void {
    interval(60000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.fechaActual.set(new Date());
      });
  }

  private configurarActualizacionesPeriodicas(): void {
    interval(30000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        // Lógica de actualización si es necesaria
      });
  }

  // Métodos para interacciones
  verDetalleEmpleado(empleado: PersonalCampo): void {
    console.log('Ver detalle del empleado:', empleado);
  }

  procesarAlerta(alerta: AlertaImportante): void {
    console.log('Procesando alerta:', alerta);
    this.alertasImportantes.update(alertas => 
      alertas.filter(a => a.titulo !== alerta.titulo)
    );
  }

  // Tracking functions
  trackByEmpleadoId(index: number, empleado: PersonalCampo): number {
    return empleado.id;
  }

  trackByActividadId(index: number, actividad: ActividadReciente): number {
    return actividad.id;
  }

  trackBySector(index: number, sector: DistribucionSector): string {
    return sector.sector;
  }

  trackByDia(index: number, dia: DatoSemanal): string {
    return dia.dia;
  }

  trackByAlertaTitulo(index: number, alerta: AlertaImportante): string {
    return alerta.titulo;
  }
}