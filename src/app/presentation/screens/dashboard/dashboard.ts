import { Component } from '@angular/core';
import {OnInit, OnDestroy, signal, computed, inject, DestroyRef } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { interval, Observable } from 'rxjs';

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

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, CurrencyPipe, DecimalPipe, HttpClientModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit, OnDestroy {
  
  // Inject dependencies
  private destroyRef = inject(DestroyRef);

  // Signals para estado reactivo (Angular 19)
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

  // Signal para controlar el estado de carga
  isLoading = signal<boolean>(false);

  // Signal para fecha actual
  fechaActual = signal<Date>(new Date());

  // Actividades recientes con signal
  actividadesRecientes = signal<ActividadReciente[]>([
    {
      id: 1,
      tipo: 'asistencia',
      mensaje: 'Juan Pérez marcó entrada - Campo Norte',
      hora: '08:15',
      estado: 'success',
      icono: 'user-check'
    },
    {
      id: 2,
      tipo: 'planilla',
      mensaje: 'Planilla Marzo 2025 generada correctamente',
      hora: '07:30',
      estado: 'info',
      icono: 'file-text'
    },
    {
      id: 3,
      tipo: 'alerta',
      mensaje: '5 empleados sin marcar salida ayer',
      hora: '18:45',
      estado: 'warning',
      icono: 'alert-circle'
    },
    {
      id: 4,
      tipo: 'pago',
      mensaje: 'Pago procesado: María López - S/ 1,250.00',
      hora: '16:20',
      estado: 'success',
      icono: 'dollar-sign'
    },
    {
      id: 5,
      tipo: 'registro',
      mensaje: 'Nuevo empleado registrado: Carlos Mendoza',
      hora: '14:15',
      estado: 'info',
      icono: 'user-plus'
    }
  ]);

  // Personal de campo con signal
  personalCampo = signal<PersonalCampo[]>([
    {
      id: 1,
      nombre: 'Carlos Mendoza',
      sector: 'Campo Norte',
      estado: 'activo',
      horasHoy: 8.5,
      entrada: '06:00',
      actividad: 'Cosecha de maíz'
    },
    {
      id: 2,
      nombre: 'Ana Quispe',
      sector: 'Campo Sur',
      estado: 'activo',
      horasHoy: 8.0,
      entrada: '06:15',
      actividad: 'Riego y fumigación'
    },
    {
      id: 3,
      nombre: 'Luis Huamán',
      sector: 'Invernadero 1',
      estado: 'descanso',
      horasHoy: 0,
      entrada: '-',
      actividad: 'Día de descanso'
    },
    {
      id: 4,
      nombre: 'Rosa Chávez',
      sector: 'Campo Este',
      estado: 'activo',
      horasHoy: 7.5,
      entrada: '06:30',
      actividad: 'Preparación de terreno'
    },
    {
      id: 5,
      nombre: 'Pedro Vargas',
      sector: 'Almacén',
      estado: 'activo',
      horasHoy: 8.0,
      entrada: '07:00',
      actividad: 'Control de inventario'
    },
    {
      id: 6,
      nombre: 'María Flores',
      sector: 'Invernadero 2',
      estado: 'activo',
      horasHoy: 8.5,
      entrada: '05:45',
      actividad: 'Siembra de hortalizas'
    }
  ]);

  // Datos semanales con signal
  datosSemanales = signal<DatoSemanal[]>([
    { dia: 'Lun', asistencia: 142, ausencias: 14, porcentaje: 91 },
    { dia: 'Mar', asistencia: 138, ausencias: 18, porcentaje: 88 },
    { dia: 'Mié', asistencia: 145, ausencias: 11, porcentaje: 93 },
    { dia: 'Jue', asistencia: 140, ausencias: 16, porcentaje: 90 },
    { dia: 'Vie', asistencia: 134, ausencias: 22, porcentaje: 86 },
    { dia: 'Sáb', asistencia: 98, ausencias: 58, porcentaje: 63 },
    { dia: 'Dom', asistencia: 76, ausencias: 80, porcentaje: 49 }
  ]);

  // Distribución por sectores con signal
  distribucionSectores = signal<DistribucionSector[]>([
    { sector: 'Campo Norte', empleados: 45, activos: 42, porcentaje: 93 },
    { sector: 'Campo Sur', empleados: 38, activos: 35, porcentaje: 92 },
    { sector: 'Campo Este', empleados: 32, activos: 28, porcentaje: 88 },
    { sector: 'Invernaderos', empleados: 25, activos: 23, porcentaje: 92 },
    { sector: 'Almacén/Admin', empleados: 16, activos: 14, porcentaje: 88 }
  ]);

  // Alertas importantes con signal
  alertasImportantes = signal<AlertaImportante[]>([
    {
      tipo: 'urgent',
      titulo: 'Pagos Vencidos',
      mensaje: '12 empleados tienen pagos pendientes desde hace 3 días',
      accion: 'Revisar planillas'
    },
    {
      tipo: 'warning',
      titulo: 'Horas Extras',
      mensaje: '8 empleados superaron las 48 horas semanales',
      accion: 'Revisar horarios'
    },
    {
      tipo: 'info',
      titulo: 'Mantenimiento',
      mensaje: 'Sistema de marcado en Campo Sur requiere mantenimiento',
      accion: 'Programar revisión'
    }
  ]);

  // Computed signals (valores derivados reactivos)
  empleadosActivos = computed(() => 
    this.personalCampo().filter(p => p.estado === 'activo').length
  );

  promedioHorasDiarias = computed(() => {
    const personal = this.personalCampo();
    const activos = personal.filter(p => p.estado === 'activo');
    if (activos.length === 0) return 0;
    
    const totalHoras = activos.reduce((sum, p) => sum + p.horasHoy, 0);
    return totalHoras / activos.length;
  });

  eficienciaGeneral = computed(() => {
    const statsData = this.stats();
    return (statsData.asistenciaHoy / statsData.totalEmpleados) * 100;
  });

  // Computed para estadísticas en tiempo real
  estadisticasEnTiempoReal = computed(() => {
    const statsData = this.stats();
    return {
      ...statsData,
      ausentes: statsData.totalEmpleados - statsData.asistenciaHoy,
      asistenciaPorcentaje: (statsData.asistenciaHoy / statsData.totalEmpleados) * 100
    };
  });

  constructor(private http: HttpClient) {
    // Inicializar actualizaciones automáticas
    this.datosGeneralesDashboard();
    this.inicializarActualizacionesAutomaticas();
  }

  datosGeneralesDashboard(): void {
    this.http.get<any>('http://localhost:8000/get-full-dashboard')
        .subscribe( (response => {
          this.stats.update(stats => ({
            ...stats,
            totalEmpleados: response.data.total_empleados.total_empleados,
            gastosPersonal: response.data.gasto_personal_total.gasto_total_personal,
            horasTrabajadasMes: response.data.horas_trabajadas_total_general.total_general ?? 0,
            pagosPendientes: response.data.pagos_pendientes.pagos_pendientes,
            promedioHorasDiarias: response.data.promedio_horas_hoy.promedio_horas_hoy ?? 0,
            asistenciaHoy: response.data.resumen_asistencia_hoy.empleados_presentes ?? 0,
            asistenciaPorcentaje: response.data.resumen_asistencia_hoy.porcentaje_asistencia ?? 0

          }));
          console.log(response.data.total_empleados.total_empleados);
        }));
  }

  ngOnInit(): void {
    this.calcularMetricas();
    this.configurarActualizacionesPeriodicas();
  }

  ngOnDestroy(): void {
    // Los observables se limpian automáticamente con takeUntilDestroyed
    console.log('Dashboard component destruido');
  }

  private inicializarActualizacionesAutomaticas(): void {
    // Actualizar fecha cada minuto
    interval(60000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.fechaActual.set(new Date());
      });
  }

  private configurarActualizacionesPeriodicas(): void {
    // Simular actualización de datos cada 30 segundos
    interval(30000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.actualizarDatosEnTiempoReal();
      });
  }

  calcularMetricas(): void {
    // Actualizar métricas usando signals
    const currentStats = this.stats();
    this.stats.set({
      ...currentStats,
      asistenciaPorcentaje: (currentStats.asistenciaHoy / currentStats.totalEmpleados) * 100
    });
  }

  private actualizarDatosEnTiempoReal(): void {
    // Simular pequeños cambios usando signals
    const currentStats = this.stats();
    const variacion = Math.floor(Math.random() * 3) - 1; // -1, 0, o 1
    
    const nuevaAsistencia = Math.max(0, 
      Math.min(currentStats.totalEmpleados, currentStats.asistenciaHoy + variacion)
    );

    this.stats.update(stats => ({
      ...stats,
      asistenciaHoy: nuevaAsistencia,
      ausentes: stats.totalEmpleados - nuevaAsistencia,
      asistenciaPorcentaje: (nuevaAsistencia / stats.totalEmpleados) * 100
    }));

    // Simular nueva actividad ocasionalmente
    if (Math.random() > 0.7) {
      this.agregarNuevaActividad();
    }
  }

  private agregarNuevaActividad(): void {
    const actividades = [
      'Sistema actualizado correctamente',
      'Nuevo registro de asistencia',
      'Backup completado exitosamente',
      'Mantenimiento programado'
    ];

    const nuevaActividad: ActividadReciente = {
      id: Date.now(),
      tipo: 'registro',
      mensaje: actividades[Math.floor(Math.random() * actividades.length)],
      hora: new Date().toLocaleTimeString('es-PE', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      estado: 'info',
      icono: 'info-circle'
    };

    this.actividadesRecientes.update(actividades => {
      const nuevasActividades = [nuevaActividad, ...actividades];
      return nuevasActividades.slice(0, 5); // Mantener solo las 5 más recientes
    });
  }

  // Métodos para interacciones con mejor tipado
  verDetalleEmpleado(empleado: PersonalCampo): void {
    console.log('Ver detalle del empleado:', empleado);
    // TODO: Implementar navegación o modal con datos del empleado
    // Ejemplo: this.router.navigate(['/empleado', empleado.id]);
  }

  procesarAlerta(alerta: AlertaImportante): void {
    console.log('Procesando alerta:', alerta);
    
    // Marcar alerta como procesada
    this.alertasImportantes.update(alertas => 
      alertas.filter(a => a.titulo !== alerta.titulo)
    );

    // Agregar actividad
    const nuevaActividad: ActividadReciente = {
      id: Date.now(),
      tipo: 'alerta',
      mensaje: `Alerta procesada: ${alerta.titulo}`,
      hora: new Date().toLocaleTimeString('es-PE', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      estado: 'success',
      icono: 'alert-circle'
    };

    this.actividadesRecientes.update(actividades => 
      [nuevaActividad, ...actividades].slice(0, 5)
    );
  }

  async exportarReporte(): Promise<void> {
    this.isLoading.set(true);
    
    try {
      console.log('Exportando reporte...');
      
      // Simular proceso de exportación
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Crear datos del reporte
      const reporte = {
        fecha: this.fechaActual(),
        estadisticas: this.estadisticasEnTiempoReal(),
        personalCampo: this.personalCampo(),
        distribucionSectores: this.distribucionSectores(),
        actividadesRecientes: this.actividadesRecientes()
      };
      
      console.log('Reporte generado:', reporte);
      
      // Agregar actividad de exportación
      this.agregarActividadExportacion();
      
    } catch (error) {
      console.error('Error al exportar:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  async refrescarDatos(): Promise<void> {
    this.isLoading.set(true);
    
    try {
      console.log('Refrescando datos...');
      
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Actualizar datos (simulado)
      this.actualizarDatosEnTiempoReal();
      
      // Agregar actividad de actualización
      const nuevaActividad: ActividadReciente = {
        id: Date.now(),
        tipo: 'registro',
        mensaje: 'Datos actualizados correctamente',
        hora: new Date().toLocaleTimeString('es-PE', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        estado: 'success',
        icono: 'user-check'
      };

      this.actividadesRecientes.update(actividades => 
        [nuevaActividad, ...actividades].slice(0, 5)
      );
      
    } catch (error) {
      console.error('Error al refrescar:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  private agregarActividadExportacion(): void {
    const nuevaActividad: ActividadReciente = {
      id: Date.now(),
      tipo: 'registro',
      mensaje: 'Reporte exportado exitosamente',
      hora: new Date().toLocaleTimeString('es-PE', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      estado: 'success',
      icono: 'file-text'
    };

    this.actividadesRecientes.update(actividades => 
      [nuevaActividad, ...actividades].slice(0, 5)
    );
  }

  // Métodos auxiliares para el template
  obtenerClaseEstado(estado: string): string {
    return estado === 'activo' ? 'status-active' : 'status-rest';
  }

  obtenerIconoTipo(tipo: string): string {
    const iconos = {
      'asistencia': 'fa-user-check',
      'planilla': 'fa-file-alt',
      'alerta': 'fa-exclamation-circle',
      'pago': 'fa-dollar-sign',
      'registro': 'fa-user-plus'
    };
    return iconos[tipo as keyof typeof iconos] || 'fa-info-circle';
  }

  // Tracking functions para mejor performance en loops
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