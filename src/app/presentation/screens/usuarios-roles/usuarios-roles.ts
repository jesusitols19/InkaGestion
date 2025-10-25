import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environments';
import { TableComponent } from "../../components/table-dinamic-component/table.component";
import { MatDialog } from '@angular/material/dialog';
import { UsuarioDialog } from './usuario-dialog/usuario-dialog';
import { MatIcon } from '@angular/material/icon';
import { MatCard } from '@angular/material/card';
import { MatCardContent } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import {MatButton} from '@angular/material/button';

interface Role {
  id: number;
  nombre: string; // lo usamos en Angular para mostrar
}

interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  role_id: number;
  role_name?: string;
}

@Component({
  selector: 'app-usuarios-roles',
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, TableComponent, UsuarioDialog, MatIcon, MatCard, MatCardContent, MatTableModule, MatButton],
  templateUrl: './usuarios-roles.html',
  styleUrl: './usuarios-roles.css'
})
export class UsuariosRoles implements OnInit {
  userForm: FormGroup;
  usuarios: Usuario[] = [];
  roles: Role[] = [];
  editingUserId: number | null = null;
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
      private dialog: MatDialog,
    private http: HttpClient
  ) {
    this.userForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role_id: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.cargarRoles();
  }

cargarRoles(): void {
  this.http.get<Role[]>(`${environment.apiUrl}/list-roles`).subscribe({
    next: (res) => {
      // Como el backend devuelve directamente un array
      this.roles = res.map((role: any) => ({
        id: role.id,
        nombre: role.name, // tu API usa "name"
      }));

      // Establecer el primer rol como default si existe
      if (this.roles.length > 0 && !this.editingUserId) {
        this.userForm.patchValue({ role_id: this.roles[0].id });
      }

console.log('✅ Roles cargados:', this.roles);
        
        // AHORA QUE YA TENEMOS LOS ROLES, LLAMAMOS A CARGAR USUARIOS
        this.cargarUsuarios(); // <--- MUEVE LA LLAMADA AQUÍ DENTRO

    },
    error: (err) => {
      console.error('❌ Error al cargar roles:', err);
      this.errorMessage = 'No se pudieron cargar los roles disponibles';
    }
  });
}


  cargarUsuarios(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.http.get<any>(`${environment.apiUrl}/list-users`).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.status === "success") {
          this.usuarios = res.data.map((usuario: Usuario) => ({
            ...usuario,
            role_name: this.getRoleName(usuario.role_id)
          }));
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('❌ Error al cargar usuarios:', err);
        this.errorMessage = 'Error al cargar la lista de usuarios';
      }
    });
  }

  getRoleName(roleId: number): string {
    const role = this.roles.find(r => r.id === roleId);
    return role ? role.nombre : 'Sin rol';
  }

  onSubmit(): void {
    // Marcar todos los campos como tocados para mostrar errores
    Object.keys(this.userForm.controls).forEach(key => {
      this.userForm.get(key)?.markAsTouched();
    });

    if (this.userForm.invalid) {
      this.errorMessage = 'Por favor, completa todos los campos correctamente';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    if (this.editingUserId) {
      // EDITAR usuario
      const updateData = { ...this.userForm.value };
      // Si el password está vacío, no lo enviamos en la actualización
      if (!updateData.password) {
        delete updateData.password;
      }

      this.http.put<any>(`${environment.apiUrl}/update-user/${this.editingUserId}`, updateData).subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res.status === "success") {
            alert('✅ Usuario actualizado exitosamente');
            this.cargarUsuarios();
            this.resetForm();
          } else {
            this.errorMessage = res.message || 'Error al actualizar usuario';
          }
        },
        error: (err) => {
          this.isLoading = false;
          console.error('❌ Error al actualizar usuario:', err);
          this.errorMessage = err.error?.message || 'Error al actualizar el usuario';
        }
      });
    } else {
      // CREAR usuario
      this.http.post<any>(`${environment.apiUrl}/create-user`, this.userForm.value).subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res.status === "success") {
            alert('✅ Usuario creado exitosamente');
            this.cargarUsuarios();
            this.resetForm();
          } else {
            this.errorMessage = res.message || 'Error al crear usuario';
          }
        },
        error: (err) => {
          this.isLoading = false;
          console.error('❌ Error al crear usuario:', err);
          this.errorMessage = err.error?.message || 'Error al crear el usuario. Verifica que el correo no esté registrado.';
        }
      });
    }
  }

  editarUsuario(usuario: Usuario): void {
    this.editingUserId = usuario.id;
    this.errorMessage = '';
    
    this.userForm.patchValue({
      nombre: usuario.nombre,
      correo: usuario.correo,
      password: '', // nunca mostrar password real
      role_id: usuario.role_id
    });

    // Hacer el password opcional al editar
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();

    // Scroll al formulario
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  resetForm(): void {
    this.editingUserId = null;
    this.errorMessage = '';
    
    // Restaurar validación de password
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    
    // Reset con el primer rol disponible
    const defaultRoleId = this.roles.length > 0 ? this.roles[0].id : null;
    this.userForm.reset({ role_id: defaultRoleId });
  }

  // Helpers para mostrar errores en el formulario
  getErrorMessage(fieldName: string): string {
    const control = this.userForm.get(fieldName);
    if (control?.hasError('required')) {
      return 'Este campo es requerido';
    }
    if (control?.hasError('email')) {
      return 'Ingresa un correo válido';
    }
    if (control?.hasError('minlength')) {
      const minLength = control.errors?.['minlength'].requiredLength;
      return `Mínimo ${minLength} caracteres`;
    }
    return '';
  }

  hasError(fieldName: string): boolean {
    const control = this.userForm.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }



  abrirModalNuevoUsuario(): void {
  const dialogRef = this.dialog.open(UsuarioDialog, {
    width: '500px',
    data: { roles: this.roles } // pasamos roles al modal
  });

  dialogRef.afterClosed().subscribe((result) => {
    if (result) {
      this.crearUsuario(result);
    }
  });
}

abrirModalEditarUsuario(usuario: Usuario): void {
  const dialogRef = this.dialog.open(UsuarioDialog, {
    width: '500px',
    data: { usuario, roles: this.roles }
  });

  dialogRef.afterClosed().subscribe((result) => {
    if (result) {
      this.actualizarUsuario(usuario.id, result);
    }
  });
}


crearUsuario(data: any): void {
  this.http.post<any>(`${environment.apiUrl}/create-user`, data).subscribe({
    next: (res) => {
      if (res.status === "success") {
        alert('✅ Usuario creado exitosamente');
        this.cargarUsuarios();
      } else {
        this.errorMessage = res.message;
      }
    },
    error: (err) => {
      this.errorMessage = err.error?.message || 'Error al crear usuario';
    }
  });
}

actualizarUsuario(id: number, data: any): void {
  this.http.put<any>(`${environment.apiUrl}/update-user/${id}`, data).subscribe({
    next: (res) => {
      if (res.status === "success") {
        alert('✅ Usuario actualizado');
        this.cargarUsuarios();
      } else {
        this.errorMessage = res.message;
      }
    },
    error: (err) => {
      this.errorMessage = err.error?.message || 'Error al actualizar usuario';
    }
  });
}




  
}