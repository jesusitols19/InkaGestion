import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
// CAMBIO: Se agrega HttpClientModule a los imports
import { HttpClient, HttpClientModule } from '@angular/common/http'; 
import { environment } from '../../../../../../environments/environments';

// Angular Material - Importaciones para el Diálogo
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-trabajador-dialog',
  standalone: true, // Asegúrate que tu componente sea standalone
  // CAMBIO: Añadido HttpClientModule
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatDialogModule, 
    MatButtonModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatSelectModule, 
    MatIconModule,
    HttpClientModule 
  ],
  templateUrl: './trabajador-dialog.html', // Coincide con tu nombre de archivo
  styleUrl: './trabajador-dialog.css'
})
export class TrabajadorDialog implements OnInit { // Coincide con tu nombre de clase
  trabajadorForm: FormGroup;
  editingTrabajadorId: number | null = null;
  titulo: string = 'Nuevo Trabajador';
  
  // CAMBIO: Array con valor temporal
  areas: any[] = [
    { id: 1, nombre: 'Área General (Temporal)' } 
  ];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    public dialogRef: MatDialogRef<TrabajadorDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.trabajadorForm = this.fb.group({
      employee_number: ['', Validators.required],
      nombre: ['', Validators.required],
      documento: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      contract_type: ['', Validators.required],
      salary_base: [0, Validators.required],
      bank_account: ['', Validators.required],
      // CAMBIO: El valor inicial de area_id ahora es '1'
      area_id: [1, Validators.required] 
    });
  }

  ngOnInit(): void {
    // CAMBIO: Se elimina la llamada a cargarAreas()
    // this.cargarAreas(); 

    if (this.data) {
      this.editingTrabajadorId = this.data.id;
      this.titulo = 'Editar Trabajador';
      this.trabajadorForm.patchValue(this.data);
    }
  }

  /**
   * CAMBIO: Se elimina toda la función cargarAreas()
   */
  // cargarAreas(): void { ... }

  onSubmit(): void {
    if (this.trabajadorForm.invalid) {
      this.trabajadorForm.markAllAsTouched();
      return;
    }

    if (this.editingTrabajadorId) {
      // ACTUALIZAR (PUT)
      this.http.put<any>(`${environment.apiUrl}/update-employee/${this.editingTrabajadorId}`, this.trabajadorForm.value).subscribe({
        next: (res) => {
          if (res.status === "success") {
            alert('✅ Trabajador actualizado');
            this.dialogRef.close(true);
          }
        },
        error: (err) => console.error('❌ Error al actualizar trabajador:', err)
      });
    } else {
      // CREAR (POST)
      this.http.post<any>(`${environment.apiUrl}/create-employee`, this.trabajadorForm.value).subscribe({
        next: (res) => {
          if (res.status === "success") {
            alert('✅ Trabajador creado');
            this.dialogRef.close(true);
          }
        },
        error: (err) => console.error('❌ Error al crear trabajador:', err)
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}

