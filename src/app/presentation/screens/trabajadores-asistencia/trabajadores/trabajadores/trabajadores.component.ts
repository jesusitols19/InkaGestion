import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../../../../environments/environments';

// Imports de Material
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

// Importa tu nuevo componente de diálogo
import { TrabajadorDialog } from '../trabajador-dialog/trabajador-dialog';

@Component({
  selector: 'app-trabajadores',
  standalone: true, // Asegúrate de que tu componente sea standalone
  imports: [
    CommonModule,
    HttpClientModule,
    // Imports de Material
    MatDialogModule,
    MatButtonModule,
    MatIconModule
    // Quita 'ReactiveFormsModule' si ya no lo usas aquí
  ],
  templateUrl: './trabajadores.component.html',
  styleUrl: './trabajadores.component.css'
})
export class TrabajadoresComponent implements OnInit {
  trabajadores: any[] = [];
  // Ya no necesitas 'trabajadorForm' ni 'editingTrabajadorId' aquí

  constructor(
    private router: Router,
    private http: HttpClient,
    public dialog: MatDialog // Inyecta el servicio de Diálogo
  ) {}

  ngOnInit(): void {
    this.cargarTrabajadores();
  }

  cargarTrabajadores(): void {
    this.http.get<any>(`${environment.apiUrl}/list-employees`).subscribe({
      next: (res) => {
        if (res.status === "success") {
          this.trabajadores = res.data;
        }
      },
      error: (err) => console.error('❌ Error al cargar trabajadores:', err)
    });
  }

  /**
   * Abre el modal para crear o editar un trabajador.
   * @param trabajador El trabajador a editar (opcional). Si es nulo, es 'crear'.
   */
  abrirModal(trabajador: any = null): void {
    const dialogRef = this.dialog.open(TrabajadorDialog, {
      width: '700px', // Ancho del modal
      disableClose: true, // Evita que se cierre al hacer clic fuera
      data: trabajador // Pasa el trabajador al diálogo (será 'null' si es nuevo)
    });

    // Escucha el evento 'afterClosed'
    dialogRef.afterClosed().subscribe(result => {
      // Si 'result' es 'true', significa que se guardó exitosamente
      if (result === true) {
        this.cargarTrabajadores(); // Recarga la tabla
      }
    });
  }

  /**
   * Navega a la página de asistencia (esta función no cambia)
   */
  verAsistencia(idtrabajador: any): void {
    this.router.navigate(['/trabajadores/control-asistencia', idtrabajador]);
  }

  // Ya no necesitas 'onSubmit', 'editarTrabajador' ni 'resetForm' aquí
}
