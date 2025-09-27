import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { environment } from '../../../../../../environments/environments';
import { Router } from '@angular/router';

@Component({
  selector: 'app-trabajadores',
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './trabajadores.component.html',
  styleUrl: './trabajadores.component.css'
})
export class TrabajadoresComponent implements OnInit {
  trabajadorForm: FormGroup;
  trabajadores: any[] = [];
  editingTrabajadorId: number | null = null;

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private http: HttpClient) {
    this.trabajadorForm = this.fb.group({
      employee_number: ['', Validators.required],
      nombre: ['', Validators.required],
      documento: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      contract_type: ['', Validators.required],
      salary_base: [0, Validators.required],
      bank_account: ['', Validators.required],
      area_id: [null, Validators.required] // se muestra pero no se edita
    });
  }

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

  onSubmit(): void {
    // if (this.trabajadorForm.invalid) return;

    if (this.editingTrabajadorId) {
      // alert("Estoy editando");
      // EDITAR
      this.http.put<any>(`${environment.apiUrl}/update-employee/${this.editingTrabajadorId}`, this.trabajadorForm.value).subscribe({
        next: (res) => {
          if (res.status === "success") {
            alert('✅ Trabajador actualizado');
            this.cargarTrabajadores();
            this.resetForm();
          }
        },
        error: (err) => console.error('❌ Error al actualizar trabajador:', err)
      });
    } else {
      // alert("Estoy guardando");
      // CREAR
      this.http.post<any>(`${environment.apiUrl}/create-employee`, this.trabajadorForm.value).subscribe({
        next: (res) => {
          if (res.status === "success") {
            alert('✅ Trabajador creado');
            this.cargarTrabajadores();
            this.resetForm();
          }
        },
        error: (err) => console.error('❌ Error al crear trabajador:', err)
      });
    }
  }

  editarTrabajador(trabajador: any): void {
    this.editingTrabajadorId = trabajador.id;
    this.trabajadorForm.patchValue({
      employee_number: trabajador.employee_number,
      nombre: trabajador.nombre,
      documento: trabajador.documento,
      correo: trabajador.correo,
      telefono: trabajador.telefono,
      contract_type: trabajador.contract_type,
      salary_base: trabajador.salary_base,
      bank_account: trabajador.bank_account,
      area_id: trabajador.area_id
    });
  }

  verAsistencia(){
    this.router.navigate(['/trabajadores/control-asistencia']);
  }

  resetForm(): void {
    this.editingTrabajadorId = null;
    this.trabajadorForm.reset({ salary_base: 0, area_id: null });
  }
}
