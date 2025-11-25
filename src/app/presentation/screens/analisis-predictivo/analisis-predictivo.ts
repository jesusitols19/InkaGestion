import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { environment } from '../../../../environments/environments';

// --- LIBRERÍAS PDF ---
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // Importación correcta para versiones recientes

// --- INTERFACES (El "Contrato" con tu IA) ---
interface MetricasValidacion {
  r2_score: number;
  interpretacion_r2: string;
  error_cuadratico_medio_mse: number;
}

interface ResponseCostos {
  prediccion_costo_siguiente_periodo: number;
  metodo: string;
  metricas_validacion: MetricasValidacion;
  variables_usadas: string[];
  datos_historicos_usados: number;
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

interface ApiResponse<T> {
  status: string;
  data: T;
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
export class AnalisisPredictivo implements OnInit {

  // Inyección de dependencias moderna
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/api/v1/ia';

  // Variables de Estado (State)
  public dataCostos: ResponseCostos | null = null;
  public dataPatrones: ResponsePatrones | null = null;

  public loading: boolean = true;
  public isGenerandoPDF: boolean = false;

  public dataAnomalias: ResponseAnomalias | null = null;

  ngOnInit(): void {
    this.cargarDatosIA();
  }

  cargarDatosIA() {
    this.loading = true;

    // 1. Cargar Predicción de Costos
    this.http.get<ApiResponse<ResponseCostos>>(`${this.apiUrl}/predecir-costos-planilla`)
      .subscribe({
        next: (res) => {
          this.dataCostos = res.data;
        },
        error: (err) => console.error('Error costos:', err)
      });

    // 2. Cargar Patrones de Adelantos
    this.http.get<ApiResponse<ResponsePatrones>>(`${this.apiUrl}/patrones-adelantos`)
      .subscribe({
        next: (res) => {
          this.dataPatrones = res.data;
          this.loading = false; // Terminamos de cargar
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

    // --- ENCABEZADO ---
    doc.setFontSize(18);
    doc.setTextColor(0, 102, 204); // Azul corporativo
    doc.text('Informe de Inteligencia Artificial InkaPeru', margen, cursorY);

    cursorY += 10;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Fecha de generación: ${new Date().toLocaleString()}`, margen, cursorY);
    doc.line(margen, cursorY + 2, 190, cursorY + 2);

    cursorY += 15;

    // --- SECCIÓN 1: COSTOS ---
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
    cursorY += 7;
    doc.text(`Método: ${this.dataCostos.metodo}`, margen, cursorY);

    cursorY += 15;

    // --- SECCIÓN 2: PATRONES ---
    doc.setFontSize(14);
    doc.text('2. Segmentación de Adelantos (Clustering)', margen, cursorY);
    cursorY += 5; // Espacio antes de la tabla

    // Tabla generada con autoTable
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
      headStyles: { fillColor: [22, 160, 133] }, // Verde InkaPeru
      margin: { left: margen }
    });

    // Pie de página
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text('Este reporte fue generado automáticamente por el módulo de IA.', margen, finalY);

    doc.save('Reporte_IA_InkaPeru.pdf');
    this.isGenerandoPDF = false;
  }
}