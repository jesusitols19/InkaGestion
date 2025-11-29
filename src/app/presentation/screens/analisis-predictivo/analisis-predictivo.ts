import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { environment } from '../../../../environments/environments';

// --- LIBRERÍAS PDF ---
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- CHART.JS ---
import Chart from 'chart.js/auto';

// --- INTERFACES ---
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
  datos_grafico: DatosGrafico; // <--- Nuevo campo del backend
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
  private apiUrl = environment.apiUrl + '/api/v1/ia'; // Verifica si tu ruta incluye /api/v1

  // Estado de Datos
  public dataCostos: ResponseCostos | null = null;
  public dataPatrones: ResponsePatrones | null = null;
  public dataAnomalias: ResponseAnomalias | null = null;

  public loading: boolean = true;
  public isGenerandoPDF: boolean = false;

  // Referencia al gráfico para poder destruirlo antes de redibujar
  private chartInstance: Chart | null = null;

  ngOnInit(): void {
    this.cargarDatosIA();
  }

  ngOnDestroy(): void {
    // Limpieza de memoria al salir de la pantalla
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
  }

  cargarDatosIA() {
    this.loading = true;

    // 1. Cargar Predicción de Costos
    this.http.get<ApiResponse<ResponseCostos>>(`${this.apiUrl}/predecir-costos-planilla`)
      .subscribe({
        next: (res) => {
          this.dataCostos = res.data;
          console.log(this.dataCostos);
          setTimeout(() => {
            this.renderizarGrafico(this.dataCostos?.datos_grafico);
          }, 100);
        },
        error: (err) => console.error('Error costos:', err)
      });


    // 2. Cargar Patrones de Adelantos
    this.http.get<ApiResponse<ResponsePatrones>>(`${this.apiUrl}/patrones-adelantos`)
      .subscribe({
        next: (res) => {
          this.dataPatrones = res.data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error patrones:', err);
          this.loading = false;
        }
      });

    // 3. Cargar Anomalías
    this.http.get<ApiResponse<ResponseAnomalias>>(`${this.apiUrl}/detectar-anomalias-asistencia`)
      .subscribe({
        next: (res) => this.dataAnomalias = res.data,
        error: (err) => console.error('Error anomalías:', err)
      });
  }

  renderizarGrafico(datos?: DatosGrafico) {
    if (!datos) return;

    const canvas = document.getElementById('chartPrediccion') as HTMLCanvasElement;
    if (!canvas) return;

    // Si ya existe un gráfico previo, lo destruimos para evitar superposiciones
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    this.chartInstance = new Chart(canvas, {
      type: 'line',
      data: {
        labels: datos.labels,
        datasets: [{
          label: 'Costo de Planilla (S/)',
          data: datos.valores,
          borderColor: 'rgb(15, 153, 128)', // Color Primario Inka
          backgroundColor: 'rgba(15, 153, 128, 0.1)', // Fondo suave
          borderWidth: 3,
          pointBackgroundColor: 'rgb(255, 255, 255)',
          pointBorderColor: 'rgb(15, 153, 128)',
          pointRadius: 5,
          pointHoverRadius: 8,
          tension: 0.3, // Curva suave
          fill: true,
          // Configuración avanzada de segmentos para la predicción
          segment: {
            borderColor: (ctx) => {
              // Pinta de naranja el último segmento (la predicción)
              if (ctx.p1DataIndex === datos.valores.length - 1) {
                return 'rgb(251, 192, 45)'; // Color Secundario/Alerta
              }
              return 'rgb(15, 153, 128)'; // Color normal
            },
            borderDash: (ctx) => {
              // Hace punteada la línea del último segmento
              if (ctx.p1DataIndex === datos.valores.length - 1) {
                return [6, 6];
              }
              return undefined;
            }
          }
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  label += new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(context.parsed.y);
                }
                // Añadir nota si es el punto de predicción
                if (context.dataIndex === context.dataset.data.length - 1) {
                  label += ' (Proyección IA)';
                }
                return label;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: false, // Empezar dinámicamente para ver mejor la variación
            grid: {
              color: 'rgba(0,0,0,0.05)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });
  }

  exportarExcel() {
    window.open(`${this.apiUrl}/exportar-predicciones-excel`, '_blank');
  }

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