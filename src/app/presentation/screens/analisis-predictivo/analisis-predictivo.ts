import { Component } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http'; // <-- Importamos HttpClientModule
import { CommonModule } from '@angular/common'; 
import { Observable, of } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { environment } from '../../../../environments/environments'; // <-- IMPORTANTE: Usamos tu environment
import { MatIconModule } from '@angular/material/icon'; 
import { MatButtonModule } from '@angular/material/button';

// --- 2. IMPORTAR 'jsPDF' (html2canvas ya no es necesario) ---
import jsPDF from 'jspdf'; 
import { applyPlugin } from 'jspdf-autotable';
import { catchError, tap } from 'rxjs/operators';

interface ApiResponse {
  status: string;
  data: any;
}

@Component({
  selector: 'app-analisis-predictivo',
  standalone: true, 
  
  imports: [
    CommonModule,     
    MatCardModule,
    HttpClientModule,MatIconModule ,MatButtonModule
  ],
  templateUrl: './analisis-predictivo.html',
  styleUrl: './analisis-predictivo.css' 
})
export class AnalisisPredictivo { 
  
  // La URL base viene de tu archivo environment
  public API_URL = environment.apiUrl; 

  public prediccionCostos$: Observable<ApiResponse | null> | null = null;
  public patronesAdelantos$: Observable<ApiResponse | null> | null = null;

  private prediccionData: any = null;
  private patronesData: any = null;

  public isGenerandoPDF = false;

  

  constructor(private http: HttpClient) { 
    
    this.prediccionCostos$ = this.http.get<ApiResponse>(
      `${this.API_URL}/api/v1/ia/predecir-costos-planilla`
    ).pipe(
      tap(res => this.prediccionData = res.data), // Guardamos los datos para el PDF
      catchError(error => {
        console.error('Error al obtener la predicción de costos:', error);
        alert('No se pudo cargar la predicción de costos. Inténtalo de nuevo más tarde.');
        return of(null); 
      })
    );

    this.patronesAdelantos$ = this.http.get<ApiResponse>(
      `${this.API_URL}/api/v1/ia/patrones-adelantos`
    ).pipe(
      tap(res => this.patronesData = res.data), // Guardamos los datos para el PDF
      catchError(error => {
        console.error('Error al obtener los patrones de adelantos:', error);
        alert('No se pudieron cargar los patrones de adelantos. Inténtalo de nuevo más tarde.');
        return of(null); // Devuelve un observable nulo
      })
    );
  }




 // --- 4. FUNCIÓN PDF TOTALMENTE NUEVA Y PROFESIONAL ---
  public exportarPDF(): void { 
    if (!this.prediccionData || !this.patronesData) {
      alert("Espera a que los datos carguen antes de exportar.");
      return;
    }
    
    this.isGenerandoPDF = true;
    
    try {
      // --- CORRECCIÓN: Aplicar el plugin de autotable ---
      applyPlugin(jsPDF);

      const pdf = new jsPDF('p', 'pt', 'a4'); // 'p' = portrait, 'pt' = points, 'a4'
      const margin = 40;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const contentWidth = pageWidth - margin * 2;
      let cursorY = margin; // Posición Y inicial

      // --- TÍTULO ---
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(20);
      pdf.text("Reporte de Análisis Predictivo (IA)", pageWidth / 2, cursorY, { align: 'center' });
      cursorY += 30; // Mover cursor

      // --- FECHA DE GENERACIÓN ---
      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(10);
      const fecha = new Date().toLocaleString('es-ES');
      pdf.text(`Generado el: ${fecha}`, pageWidth / 2, cursorY, { align: 'center' });
      cursorY += 30;

      // --- SECCIÓN 1: PREDICCIÓN DE COSTOS (REQ-35/36) ---
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.text("1. Predicción de Costos de Planilla", margin, cursorY);
      cursorY += 20;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(12);
      // Formatear el número como moneda
      const costoPredicho = Number(this.prediccionData.prediccion_costo_siguiente_periodo).toLocaleString('es-PE', {
        style: 'currency',
        currency: 'PEN'
      });
      pdf.text(`Predicción de costo para el siguiente periodo:`, margin, cursorY);
      pdf.setFont('helvetica', 'bold');
      pdf.text(costoPredicho, margin + 270, cursorY); // Ajustar posición X
      cursorY += 20;
      
      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(10);
      pdf.text(`Método utilizado: ${this.prediccionData.metodo}`, margin, cursorY);
      cursorY += 30;

      // --- SECCIÓN 2: PATRONES DE ADELANTOS (REQ-37) ---
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.text("2. Patrones en Solicitudes de Adelantos", margin, cursorY);
      cursorY += 20;
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(12);
      pdf.text("Se identificaron los siguientes patrones (clusters) en las solicitudes:", margin, cursorY);
      cursorY += 20;

      // Usar jsPDF-AutoTable para crear una tabla profesional
      (pdf as any).autoTable({
        startY: cursorY,
        head: [['Patrón Detectado', 'Monto Promedio']],
        body: this.patronesData.patrones_clusters.map((p: any) => [
          p.cluster,
          Number(p.monto_promedio).toLocaleString('es-PE', { style: 'currency', currency: 'PEN' })
        ]),
        theme: 'striped', // 'striped', 'grid', 'plain'
        headStyles: {
          fillColor: [15, 153, 128] // Tu color --primary-color
        }
      });
      
      // Mover cursor Y después de la tabla
      cursorY = (pdf as any).lastAutoTable.finalY + 20; 

      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(10);
      pdf.text(`Método utilizado: ${this.patronesData.metodo}`, margin, cursorY);

      // --- PIE DE PÁGINA ---
      const pageCount = (pdf as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.text(`Página ${i} de ${pageCount}`, pageWidth / 2, pageHeight - margin / 2, { align: 'center' });
      }

      // --- Guardar PDF ---
      pdf.save('Reporte_Formal_IA.pdf');

    } catch (error) {
      console.error("Error al generar el PDF:", error);
      alert("Hubo un error al generar el PDF.");
    }

    this.isGenerandoPDF = false;
  }
}