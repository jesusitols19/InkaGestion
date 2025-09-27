import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environments';

@Component({
  selector: 'app-usuarios-roles',
  imports: [CommonModule, ReactiveFormsModule,HttpClientModule],
  templateUrl: './usuarios-roles.html',
  styleUrl: './usuarios-roles.css'
})
export class UsuariosRoles implements OnInit{
  userForm: FormGroup;
  usuarios: any;
  editingUserId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient
  ) {
    this.userForm = this.fb.group({
      nombre: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      role_id: [2, Validators.required] // default 2
    });
    


  }

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.http.get<any>(`${environment.apiUrl}/list-users`).subscribe({
      next: (res) => {
        if(res.status === "success"){
          this.usuarios = res.data;
        }
        else{
          // alert("Ingrese al failed");
        }
      },
      error: (err) => {
        // alert('❌ Error al cargar usuarios:');
        console.error('❌ Error al cargar usuarios:', err);
      }
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) return;

    if (this.editingUserId) {
      // EDITAR usuario
      this.http.put<any>(`${environment.apiUrl}/update-user/${this.editingUserId}`, this.userForm.value).subscribe({
        next: (res) => {
          if(res.status === "success"){
            alert('✅ Usuario actualizado');
            this.cargarUsuarios();
            this.resetForm();
          }
        },
        error: (err) => console.error('❌ Error al actualizar usuario:', err)
      });
    } else {
      // CREAR usuario
      this.http.post<any>(`${environment.apiUrl}/create-user`, this.userForm.value).subscribe({
        next: (res) => {
          if(res.status === "success"){
            alert('✅ Usuario creado');
            this.cargarUsuarios();
            this.resetForm();
          }
        },
        error: (err) => console.error('❌ Error al crear usuario:', err)
      });
    }
  }

  editarUsuario(usuario: any): void {
    this.editingUserId = usuario.id;
    this.userForm.patchValue({
      nombre: usuario.nombre,
      correo: usuario.correo,
      password: '', // nunca mostrar password real
      role_id: usuario.role_id
    });
  }

  resetForm(): void {
    this.editingUserId = null;
    this.userForm.reset({ role_id: 2 }); // default role
  }
}
