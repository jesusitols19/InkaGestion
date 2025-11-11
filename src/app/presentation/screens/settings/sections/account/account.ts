import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { environment } from '../../../../../../environments/environments';

@Component({
  selector: 'app-account',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './account.html',
  styleUrls: ['./account.css']
})
export class Account implements OnInit {
  profileForm!: FormGroup;
  isEditingProfile = false;
  currentUser: any = {};
  userId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.userId = localStorage.getItem('id_usuario_actual');
    this.initializeForms();
    if (this.userId) {
      this.loadUserProfile(this.userId);
    }
  }

  initializeForms(): void {
    this.profileForm = this.fb.group({
      nombre: [
        { value: '', disabled: true },
        [Validators.required, Validators.minLength(3)]
      ],
      correo: [
        { value: '', disabled: true },
        [Validators.required, Validators.email]
      ]
    });
  }

  loadUserProfile(userId: string): void {
    this.http.get<any>(`${environment.apiUrl}/get-user-by-id/${userId}`).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.currentUser = response.data;
          this.currentUser.avatar = `https://ui-avatars.com/api/?name=${this.currentUser.nombre.replace(' ', '+')}&size=200&background=667eea&color=fff`;
          this.profileForm.patchValue({
            nombre: this.currentUser.nombre,
            correo: this.currentUser.correo
          });
        }
      },
      error: () => {
        this.showSnackBar('Error al cargar los datos del usuario', 'error');
      }
    });
  }

  toggleEditProfile(): void {
    this.isEditingProfile = !this.isEditingProfile;
    if (this.isEditingProfile) {
      this.profileForm.enable();
    } else {
      this.profileForm.disable();
      this.profileForm.patchValue(this.currentUser);
    }
  }

  onProfileSubmit(): void {
    if (this.profileForm.valid && this.userId) {
      const updatedData = this.profileForm.getRawValue();
      this.http.put(`${environment.apiUrl}/update-user/${this.userId}`, updatedData).subscribe({
        next: () => {
          this.currentUser = { ...this.currentUser, ...updatedData };
          this.showSnackBar('✓ Perfil actualizado correctamente', 'success');
          this.isEditingProfile = false;
          this.profileForm.disable();
        },
        error: () => {
          this.showSnackBar('Error al actualizar el perfil', 'error');
        }
      });
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.currentUser.avatar = e.target.result;
        this.showSnackBar('✓ Foto de perfil actualizada', 'success');
      };
      reader.readAsDataURL(file);
    }
  }

  private showSnackBar(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: type === 'success' ? 'snackbar-success' : 'snackbar-error'
    });
  }

  getErrorMessage(fieldName: string): string {
    const field = this.profileForm.get(fieldName);
    if (!field || !field.dirty) {
      return '';
    }
    if (field.hasError('required')) {
      return 'Este campo es requerido';
    }
    if (field.hasError('email')) {
      return 'Ingrese un correo válido';
    }
    if (field.hasError('minlength')) {
      const minLength = field.errors?.['minlength'].requiredLength;
      return `Mínimo ${minLength} caracteres`;
    }
    return '';
  }
}
