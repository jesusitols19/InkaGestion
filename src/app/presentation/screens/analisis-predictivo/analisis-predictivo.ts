import { Component } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http'; // <-- Importamos HttpClientModule
import { CommonModule } from '@angular/common'; 
import { Observable } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { environment } from '../../../../environments/environments'; // <-- IMPORTANTE: Usamos tu environment
import { MatIconModule } from '@angular/material/icon'; 
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
    HttpClientModule,MatIconModule  
  ],
  templateUrl: './analisis-predictivo.html',
  styleUrl: './analisis-predictivo.css' 
})
export class AnalisisPredictivo { 
  
  // La URL base viene de tu archivo environment
  private API_URL = environment.apiUrl; 

  public prediccionCostos$: Observable<ApiResponse>;
  public patronesAdelantos$: Observable<ApiResponse>;

  // Inyectamos HttpClient en el constructor (como en tu LoginComponent)
  constructor(private http: HttpClient) { 
    
    // 1. Llama al endpoint de predicción de costos
    //    environment.apiUrl es '.../api/v1' y mi ruta es '/ia/...'
    this.prediccionCostos$ = this.http.get<ApiResponse>(
      `${this.API_URL}/api/v1/ia/predecir-costos-planilla`
    );

    // 2. Llama al endpoint de patrones de adelantos
    this.patronesAdelantos$ = this.http.get<ApiResponse>(
      `${this.API_URL}/api/v1/ia/patrones-adelantos`
    );
  }
}