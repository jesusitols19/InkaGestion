import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe, DatePipe } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { environment } from '../../../../environments/environments';

// --- INTERFACES QUE COINCIDEN CON TU BACKEND ---
interface KpiResponse {
  total_empleados: { total_empleados: number };
  eficiencia_general_hoy: { fecha_actual: string; eficiencia_general_porcentaje: number };
  pagos_pendientes: { pagos_pendientes: number };
  resumen_asistencia_hoy: { porcentaje_asistencia: number; empleados_presentes: number };
  gasto_personal_total: { gasto_total_personal: number; total_empleados: number; fecha_actual: string };
  promedio_horas_hoy: { promedio_horas_hoy: number; fecha_actual: string };
  horas_trabajadas_total_general: { total_general: number; total_horas_trabajadas: number; total_horas_extra: number; mes: string };
  costos_personal_mensual: Array<{ periodo: string; total_pagado: number; total_ingresos: number; total_descuentos: number }>;
}

interface ChartsResponse {
  tendencia_asistencia: {
    labels: string[];
    dataset_a_tiempo: number[];
    dataset_tardanza: number[];
    dataset_ausencia: number[];
  };
  distribucion_costos_area: {
    labels: string[];
    data: number[];
  };
  top_horas_extra: {
    labels: string[];
    data: number[];
  };
}

interface DashboardResponse {
  kpis: KpiResponse;
  charts: ChartsResponse;
}

// --- INTERFACES PARA LA VISTA (Mapeo) ---
interface DatoSemanal {
  dia: string;
  a_tiempo: number;
  tardanza: number;
  total: number;
  porcentaje: number; // Para la altura de la barra CSS
}

interface CostoMensual {
  mes: string;
  monto: number;
  porcentajeRelativo: number; // Para dibujar barritas
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DecimalPipe,
    DatePipe,
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
export class Dashboard implements OnInit {

  private http = inject(HttpClient);
  private fb = inject(FormBuilder);

  private apiUrl = environment.apiUrl; // Verifica si tu ruta incluye /api/v1

  // --- SIGNALS ---

  // 1. Datos Crudos del Backend (Inicializados en 0/vacío para evitar errores de undefined)
  kpis = signal<KpiResponse>({
    total_empleados: { total_empleados: 0 },
    eficiencia_general_hoy: { fecha_actual: '', eficiencia_general_porcentaje: 0 },
    pagos_pendientes: { pagos_pendientes: 0 },
    resumen_asistencia_hoy: { porcentaje_asistencia: 0, empleados_presentes: 0 },
    gasto_personal_total: { gasto_total_personal: 0, total_empleados: 0, fecha_actual: '' },
    promedio_horas_hoy: { promedio_horas_hoy: 0, fecha_actual: '' },
    horas_trabajadas_total_general: { total_general: 0, total_horas_trabajadas: 0, total_horas_extra: 0, mes: '' },
    costos_personal_mensual: []
  });

  // 2. Datos Transformados para Gráficos Visuales
  datosTendencia = signal<DatoSemanal[]>([]);
  datosCostosMensuales = signal<CostoMensual[]>([]);
  topEmpleadosExtra = signal<{ nombre: string, horas: number, porcentaje: number }[]>([]);

  // 3. Listas para filtros
  areas = signal<any[]>([]);
  employees = signal<any[]>([]);

  filterForm: FormGroup = this.fb.group({
    startDate: [null],
    endDate: [null],
    areaId: [null],
    employeeId: [null]
  });

  constructor() { }

  ngOnInit(): void {
    this.cargarDatosDashboard();
    this.loadAreas();
    this.loadEmployees();
  }

  cargarDatosDashboard(filters: any = {}): void {
    let params = new HttpParams();
    if (filters.startDate) params = params.set('start_date', new Date(filters.startDate).toISOString().split('T')[0]);
    if (filters.endDate) params = params.set('end_date', new Date(filters.endDate).toISOString().split('T')[0]);
    if (filters.areaId) params = params.set('area_id', filters.areaId);
    if (filters.employeeId) params = params.set('employee_id', filters.employeeId);

    this.http.get<any>(`${this.apiUrl}/get-full-dashboard`)
      .subscribe({
        next: (response) => {
          if (response.status === 'success') {
            const data: DashboardResponse = response.data;

            // 1. Actualizar KPIs Directos
            this.kpis.set(data.kpis);

            // 2. Transformar Gráfico de Tendencia (Para las barras CSS)
            // Tomamos los arrays paralelos y creamos objetos
            const tendencia = data.charts.tendencia_asistencia;
            const datosTransformados: DatoSemanal[] = tendencia.labels.map((label, index) => {
              const aTiempo = tendencia.dataset_a_tiempo[index] || 0;
              const tardanza = tendencia.dataset_tardanza[index] || 0;
              const total = aTiempo + tardanza + (tendencia.dataset_ausencia[index] || 0);

              // Evitar división por cero
              const porcentaje = total > 0 ? ((aTiempo + tardanza) / data.kpis.total_empleados.total_empleados) * 100 : 0;

              return {
                dia: label,
                a_tiempo: aTiempo,
                tardanza: tardanza,
                total: total,
                porcentaje: Math.min(porcentaje, 100) // Tope 100% para CSS
              };
            });
            this.datosTendencia.set(datosTransformados);

            // 3. Transformar Costos Mensuales (Para gráfico histórico)
            const costos = data.kpis.costos_personal_mensual;
            const maxCosto = Math.max(...costos.map(c => c.total_pagado), 1); // Para escalar barras

            const costosTransformados = costos.slice(0, 6).map(c => ({ // Últimos 6 meses
              mes: c.periodo,
              monto: c.total_pagado,
              porcentajeRelativo: (c.total_pagado / maxCosto) * 100
            })).reverse(); // Ordenar cronológicamente
            this.datosCostosMensuales.set(costosTransformados);

            // 4. Transformar Top Horas Extra
            const top = data.charts.top_horas_extra;
            const maxExtra = Math.max(...top.data.map(d => d || 0), 1);

            const topTransformado = top.labels.map((label, index) => ({
              nombre: label,
              horas: top.data[index] || 0,
              porcentaje: ((top.data[index] || 0) / maxExtra) * 100
            }));
            this.topEmpleadosExtra.set(topTransformado);

          }
        },
        error: (err) => console.error('Error cargando dashboard', err)
      });
  }

  loadAreas(): void {
    this.http.get<any>(`${this.apiUrl}/list-areas`) // Asegúrate que esta ruta exista o sea la correcta
      .subscribe(res => { if (res.status === 'success') this.areas.set(res.data) });
  }

  loadEmployees(): void {
    this.http.get<any>(`${this.apiUrl}/list-employees`)
      .subscribe(res => { if (res.status === 'success') this.employees.set(res.data) });
  }

  applyFilters(): void {
    this.cargarDatosDashboard(this.filterForm.value);
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.cargarDatosDashboard();
  }
}