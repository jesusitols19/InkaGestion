import { Component, OnInit, inject, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { environment } from '../../../../environments/environments';
import { forkJoin } from 'rxjs'; // <--- IMPORTANTE

// --- LIBRERÍAS PDF ---
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- CHART.JS ---
import Chart from 'chart.js/auto';

// --- INTERFACES (Las mantengo igual) ---
interface MetricasValidacion {
  r2_score: number;
  interpretacion_r2: string;
  error_cuadratico_medio_mse: number;
}

interface DatosGrafico {
  labels: string[];
  valores: number[];
}

interface ResponseCostos {
  prediccion_costo_siguiente_periodo: number;
  metodo: string;
  metricas_validacion: MetricasValidacion;
  variables_usadas: string[];
  datos_historicos_usados: number;
  datos_grafico: DatosGrafico;
}

interface Patron {
  grupo_cluster: number;
  etiqueta_sugerida: string;
  monto_promedio: number;
}

interface ResponsePatrones {
  patrones_detectados: Patron[];
  metodo: string;
  mejor_k_encontrado: number;
  calidad_agrupamiento_score: number;
  analisis_optimizacion: any[];
}

interface Anomalia {
  empleado: string;
  fecha: string;
  hora_ingreso: string;
  horas_trabajadas: number;
  motivo_ia: string;
}

interface ResponseAnomalias {
  total_registros_analizados: number;
  anomalias_detectadas: number;
  registros_sospechosos: Anomalia[];
  metodo: string;
}

interface ApiResponse<T> {
  status: string;
  data: T;
}

@Component({
  selector: 'app-analisis-predictivo',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    HttpClientModule
  ],
  templateUrl: './analisis-predictivo.html',
  styleUrl: './analisis-predictivo.css'
})
export class AnalisisPredictivo implements OnInit, OnDestroy {

  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef); // <--- Para forzar renderizado
  private apiUrl = environment.apiUrl + '/api/v1/ia';

  // Acceso directo al Canvas desde Angular (Más seguro que getElementById)
  @ViewChild('chartPrediccion') chartCanvas!: ElementRef<HTMLCanvasElement>;

  // Estado de Datos
  public dataCostos: ResponseCostos | null = null;
  public dataPatrones: ResponsePatrones | null = null;
  public dataAnomalias: ResponseAnomalias | null = null;

  public loading: boolean = true;
  public isGenerandoPDF: boolean = false;

  private chartInstance: Chart | null = null;

  ngOnInit(): void {
    this.cargarDatosIA();
  }

  ngOnDestroy(): void {
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
  }

  cargarDatosIA() {
    this.loading = true;

    // Usamos forkJoin para hacer las 3 peticiones en paralelo y esperar a todas
    forkJoin({
      costos: this.http.get<ApiResponse<ResponseCostos>>(`${this.apiUrl}/predecir-costos-planilla`),
      patrones: this.http.get<ApiResponse<ResponsePatrones>>(`${this.apiUrl}/patrones-adelantos`),
      anomalias: this.http.get<ApiResponse<ResponseAnomalias>>(`${this.apiUrl}/detectar-anomalias-asistencia`)
    }).subscribe({
      next: (results) => {
        // 1. Asignamos todos los datos
        this.dataCostos = results.costos.data;
        this.dataPatrones = results.patrones.data;
        this.dataAnomalias = results.anomalias.data;

        // 2. Apagamos el loading
        this.loading = false;

        // 3. Forzamos a Angular a detectar cambios para que el <canvas> aparezca en el DOM
        this.cdr.detectChanges();

        // 4. Renderizamos sin delays artificiales
        if (this.dataCostos?.datos_grafico) {
          this.renderizarGrafico(this.dataCostos.datos_grafico);
        }
      },
      error: (err) => {
        console.error('Error cargando datos de IA:', err);
        this.loading = false;
      }
    });
  }

  renderizarGrafico(datos: DatosGrafico) {
    // Verificación de seguridad usando ViewChild
    if (!this.chartCanvas?.nativeElement) return;

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    this.chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: datos.labels,
        datasets: [{
          label: 'Costo de Planilla (S/)',
          data: datos.valores,
          borderColor: 'rgb(15, 153, 128)',
          backgroundColor: 'rgba(15, 153, 128, 0.1)',
          borderWidth: 3,
          pointBackgroundColor: 'rgb(255, 255, 255)',
          pointBorderColor: 'rgb(15, 153, 128)',
          pointRadius: 5,
          pointHoverRadius: 8,
          tension: 0.3,
          fill: true,
          segment: {
            borderColor: (ctx) => {
              if (ctx.p1DataIndex === datos.valores.length - 1) {
                return 'rgb(251, 192, 45)'; // Naranja para predicción
              }
              return 'rgb(15, 153, 128)';
            },
            borderDash: (ctx) => {
              if (ctx.p1DataIndex === datos.valores.length - 1) {
                return [6, 6]; // Línea punteada para predicción
              }
              return undefined;
            }
          }
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 800 // Animación un poco más rápida (default es 1000)
        },
        plugins: {
          legend: { display: true, position: 'top' },
          tooltip: {
            callbacks: {
              label: function (context) {
                let label = context.dataset.label || '';
                if (label) label += ': ';
                if (context.parsed.y !== null) {
                  label += new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(context.parsed.y);
                }
                if (context.dataIndex === context.dataset.data.length - 1) {
                  label += ' (Proyección IA)';
                }
                return label;
              }
            }
          }
        },
        scales: {
          y: { beginAtZero: false, grid: { color: 'rgba(0,0,0,0.05)' } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  exportarExcel() {
    window.open(`${this.apiUrl}/exportar-predicciones-excel`, '_blank');
  }

  // ... (El método exportarPDF queda igual que en tu código original)
  exportarPDF() {
    if (!this.dataCostos || !this.dataPatrones) {
      alert('Los datos aún se están procesando. Intente en unos segundos.');
      return;
    }

    this.isGenerandoPDF = true;
    const doc = new jsPDF();
    const margen = 20;
    let cursorY = 20;

    // Encabezado
    doc.setFontSize(18);
    doc.setTextColor(15, 153, 128); // Verde Inka
    doc.text('Informe de Inteligencia Artificial InkaPeru', margen, cursorY);

    cursorY += 10;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Fecha de generación: ${new Date().toLocaleString()}`, margen, cursorY);
    doc.line(margen, cursorY + 2, 190, cursorY + 2);

    cursorY += 15;

    // Sección Costos
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('1. Proyección de Costos Operativos', margen, cursorY);
    cursorY += 10;

    doc.setFontSize(11);
    doc.text(`Predicción Siguiente Periodo: S/ ${this.dataCostos.prediccion_costo_siguiente_periodo.toFixed(2)}`, margen, cursorY);
    cursorY += 7;
    doc.text(`Confianza del Modelo (R²): ${(this.dataCostos.metricas_validacion.r2_score * 100).toFixed(2)}%`, margen, cursorY);
    cursorY += 7;
    doc.text(`Calidad: ${this.dataCostos.metricas_validacion.interpretacion_r2}`, margen, cursorY);

    cursorY += 15;

    // Sección Patrones
    doc.setFontSize(14);
    doc.text('2. Segmentación de Adelantos (Clustering)', margen, cursorY);
    cursorY += 5;

    const columnas = ['Grupo', 'Descripción', 'Monto Promedio (S/)'];
    const filas = this.dataPatrones.patrones_detectados.map(p => [
      `Grupo ${p.grupo_cluster}`,
      p.etiqueta_sugerida,
      `S/ ${p.monto_promedio.toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: cursorY,
      head: [columnas],
      body: filas,
      theme: 'grid',
      headStyles: { fillColor: [15, 153, 128] },
      margin: { left: margen }
    });

    doc.save('Reporte_IA_InkaPeru.pdf');
    this.isGenerandoPDF = false;
  }
}