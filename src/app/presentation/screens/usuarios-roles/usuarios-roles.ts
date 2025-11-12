import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core'; // Usamos inject (moderno)
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environments';
import { TableComponent } from "../../components/table-dinamic-component/table.component";
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { UsuarioDialog } from './usuario-dialog/usuario-dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'; // Importar SnackBar
import { ConfirmDialog,ConfirmDialogData } from '../../components/confirm-dialog/confirm-dialog';

interface Role {
  id: number;
  nombre: string;
}

interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  role_id: number;
  role_name?: string;
  active: boolean; // true = Activo, false = Inactivo
}

@Component({
  selector: 'app-usuarios-roles',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    HttpClientModule, 
    MatIconModule, 
    MatCardModule, 
    MatTableModule, 
    MatButtonModule,
    MatSnackBarModule,
    MatDialogModule,
    ConfirmDialog
  ],
  templateUrl: './usuarios-roles.html',
  styleUrl: './usuarios-roles.css'
})
export class UsuariosRoles implements OnInit {
  
  // Inyecciones modernas
  private http = inject(HttpClient);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);
  
  usuarios: Usuario[] = [];
  roles: Role[] = [];
  
  // Variables para manejo de estado (opcional, si usas el form para crear en la misma pagina)
  userForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor() {
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
    this.http.get<any[]>(`${environment.apiUrl}/list-roles`).subscribe({
      next: (res) => {
        this.roles = res.map((role: any) => ({
          id: role.id,
          nombre: role.name,
        }));
        this.cargarUsuarios();
      },
      error: (err) => console.error('❌ Error al cargar roles:', err)
    });
  }

  cargarUsuarios(): void {
    this.isLoading = true;
    this.http.get<any>(`${environment.apiUrl}/list-users`).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.status === "success") {
          this.usuarios = res.data.map((usuario: any) => ({
            ...usuario,
            role_name: this.getRoleName(usuario.role_id)
          }));
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('❌ Error al cargar usuarios:', err);
      }
    });
  }

  getRoleName(roleId: number): string {
    const role = this.roles.find(r => r.id === roleId);
    return role ? role.nombre : 'Sin rol';
  }

  // --- LÓGICA DE ACTIVAR / DESACTIVAR ---

  activarUsuario(id: number): void {
    // 3A. Prepara los datos para el diálogo
    const dialogData: ConfirmDialogData = {
      title: 'Confirmar Activación',
      message: '¿Estás seguro de que deseas activar este usuario?',
      confirmText: 'Activar',
      confirmColor: 'primary'
    };

    // 3B. Abre el diálogo
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '450px',
      data: dialogData
    });

    // 3C. Escucha la respuesta (esto es asíncrono)
    dialogRef.afterClosed().subscribe(result => {
      // Solo si el usuario hizo clic en "Activar" (result === true)
      if (result === true) {
        // Mueve tu lógica HTTP aquí dentro
        this.http.put(`${environment.apiUrl}/activate-user/${id}`, {}).subscribe({
          next: () => {
            this.actualizarEstadoLocal(id, true);
            this.mostrarNotificacion('Usuario activado correctamente', 'success');
          },
          error: (err) => {
            console.error(err);
            this.mostrarNotificacion('Error al activar usuario', 'error');
          }
        });
      }
      // Si result es 'false' (cancelar), no hace nada.
    });
  }

  eliminarUsuario(id: number): void {
    // 3A. Prepara los datos para el diálogo (nota el color 'warn')
    const dialogData: ConfirmDialogData = {
      title: 'Confirmar Desactivación',
      message: '¿Estás seguro de que deseas desactivar este usuario? Esta acción es reversible.',
      confirmText: 'Desactivar',
      confirmColor: 'warn' // Color rojo para acciones peligrosas
    };

    // 3B. Abre el diálogo
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '450px',
      data: dialogData
    });

    // 3C. Escucha la respuesta
    dialogRef.afterClosed().subscribe(result => {
      // Solo si el usuario hizo clic en "Desactivar"
      if (result === true) {
        // Mueve tu lógica HTTP aquí dentro
        this.http.delete(`${environment.apiUrl}/delete-user/${id}`).subscribe({
          next: () => {
            this.actualizarEstadoLocal(id, false);
            this.mostrarNotificacion('Usuario desactivado correctamente', 'warn');
          },
          error: (err) => {
            console.error(err);
            this.mostrarNotificacion('Error al desactivar usuario', 'error');
          }
        });
      }
    });
  }

  private actualizarEstadoLocal(id: number, nuevoEstado: boolean) {
    const index = this.usuarios.findIndex(u => u.id === id);
    if (index !== -1) {
      // Creamos una copia del objeto para que Angular detecte el cambio si fuera necesario
      const usuarioActualizado = { ...this.usuarios[index], active: nuevoEstado };
      // Actualizamos el array
      this.usuarios[index] = usuarioActualizado;
    }
  }

  private mostrarNotificacion(mensaje: string, tipo: 'success' | 'error' | 'warn') {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      panelClass: tipo === 'error' ? ['bg-red-500', 'text-white'] : 
                  tipo === 'warn' ? ['bg-yellow-500', 'text-black'] : 
                  ['bg-green-500', 'text-white'],
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  // --- LÓGICA DE DIALOGOS (Mantenida igual) ---
  
  abrirModalNuevoUsuario(): void {
    const dialogRef = this.dialog.open(UsuarioDialog, {
      width: '500px',
      data: { roles: this.roles }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.crearUsuario(result);
    });
  }

  abrirModalEditarUsuario(usuario: Usuario): void {
    const dialogRef = this.dialog.open(UsuarioDialog, {
      width: '500px',
      data: { usuario, roles: this.roles }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.actualizarUsuarioApi(usuario.id, result);
    });
  }

  crearUsuario(data: any): void {
    this.http.post<any>(`${environment.apiUrl}/create-user`, data).subscribe({
      next: (res) => {
        if (res.status === "success") {
          this.mostrarNotificacion('Usuario creado exitosamente', 'success');
          this.cargarUsuarios();
        }
      },
      error: (err) => this.mostrarNotificacion(err.error?.message || 'Error al crear', 'error')
    });
  }

  actualizarUsuarioApi(id: number, data: any): void {
    this.http.put<any>(`${environment.apiUrl}/update-user/${id}`, data).subscribe({
      next: (res) => {
        if (res.status === "success") {
          this.mostrarNotificacion('Usuario actualizado', 'success');
          this.cargarUsuarios();
        }
      },
      error: (err) => this.mostrarNotificacion('Error al actualizar', 'error')
    });
  }
}