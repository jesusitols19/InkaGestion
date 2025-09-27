import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environments';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mis-datos',
  imports: [CommonModule, ReactiveFormsModule,HttpClientModule],
  templateUrl: './mis-datos.html',
  styleUrl: './mis-datos.css'
})
export class MisDatos implements OnInit{
  userForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient
  ) {
    this.userForm = this.fb.group({
      nombre: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]]
    });


  }

  ngOnInit(): void {
    
    const id_usuario_actual = localStorage.getItem('id_usuario_actual');

    this.http.get<any>(`${environment.apiUrl}/get-user-by-id/${id_usuario_actual}`).subscribe({
      next: (res) => {
        
        if(res.status === "success"){
          this.userForm.patchValue({
            nombre: res.data.nombre,
            correo: res.data.correo
          });
        }
      },
      error: (err) => {
        console.error('❌ Error al cargar datos:', err);
      }
    });
  }

  onSubmit(): void {
    if (this.userForm.valid) {

      const id_usuario_actual = localStorage.getItem('id_usuario_actual');

      this.http.put<any>(`${environment.apiUrl}/update-user/${id_usuario_actual}`, this.userForm.value).subscribe({
        next: (res) => {
          if(res.status === "success"){
            console.log('✅ Datos actualizados:', res);
            alert('Tus datos fueron actualizados con éxito');
          }
        },
        error: (err) => {
          console.error('❌ Error al actualizar:', err);
          alert('Hubo un error al actualizar tus datos');
        }
      });
    }
  }
}
