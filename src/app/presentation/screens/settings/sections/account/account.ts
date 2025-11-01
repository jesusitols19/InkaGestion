import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors  } from '@angular/forms';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-account',
  imports: [CommonModule, ReactiveFormsModule,HttpClientModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  templateUrl: './account.html',
  styleUrl: './account.css'
})
export class Account implements OnInit{

  profileForm!: FormGroup;
  isEditingProfile = false;

  
  // Simulación de datos del usuario actual
currentUser = {
    nombre: 'Arturo Pérez',
    correo: 'arturo.perez@ejemplo.com',
    telefono: '+51 987 654 321',
    avatar: 'https://ui-avatars.com/api/?name=Arturo+Pérez&size=200&background=667eea&color=fff'
  };

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeForms();
  }

  initializeForms(): void {
    // Formulario de perfil
    this.profileForm = this.fb.group({
      nombre: [
        { value: this.currentUser.nombre, disabled: true },
        [Validators.required, Validators.minLength(3)]
      ],
      correo: [
        { value: this.currentUser.correo, disabled: true },
        [Validators.required, Validators.email]
      ],
      telefono: [
        { value: this.currentUser.telefono, disabled: true },
        [Validators.pattern(/^[+]?[\d\s-()]+$/)]
      ]
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
    if (this.profileForm.valid) {
      const updatedData = this.profileForm.getRawValue();
      
      // Simulación de actualización
      this.currentUser = { ...this.currentUser, ...updatedData };
      
      this.showSnackBar('✓ Perfil actualizado correctamente', 'success');
      this.isEditingProfile = false;
      this.profileForm.disable();
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

  // Helpers para mensajes de error
  getErrorMessage(fieldName: string): string {
    const field = this.profileForm.get(fieldName);
    
    // No mostrar error si el campo no ha sido "tocado"
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
    if (field.hasError('pattern')) {
      return 'Formato inválido';
    }
    
    return '';
  }


}
