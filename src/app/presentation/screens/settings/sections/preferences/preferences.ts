import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-preferences',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatSnackBarModule,
    MatIconModule
  ],
  templateUrl: './preferences.html',
  styleUrls: ['./preferences.css']
})
export class Preferences implements OnInit {

  preferencesForm!: FormGroup;

  // Simulación de las preferencias actuales del usuario
  currentUserPreferences = {
    theme: 'light',
    language: 'es',
    notifications: {
      email: true,
      push: false
    }
  };

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.preferencesForm = this.fb.group({
      theme: [this.currentUserPreferences.theme],
      language: [this.currentUserPreferences.language],
      emailNotifications: [this.currentUserPreferences.notifications.email],
      pushNotifications: [this.currentUserPreferences.notifications.push]
    });
  }

  onThemeChange(event: any): void {
    const theme = event.checked ? 'dark' : 'light';
    this.preferencesForm.get('theme')?.setValue(theme);
    // Aquí podrías añadir lógica para cambiar el tema de la aplicación en tiempo real
    document.body.classList.toggle('dark-theme', event.checked);
    console.log(`Tema cambiado a: ${theme}`);
  }

  onSubmit(): void {
    if (this.preferencesForm.valid) {
      const newPrefs = this.preferencesForm.value;
      
      // Simulación de guardado de datos
      this.currentUserPreferences = {
        theme: newPrefs.theme,
        language: newPrefs.language,
        notifications: {
          email: newPrefs.emailNotifications,
          push: newPrefs.pushNotifications
        }
      };

      console.log('Preferencias guardadas:', this.currentUserPreferences);
      
      this.snackBar.open('✓ Preferencias guardadas correctamente', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: 'snackbar-success'
      });
    }
  }

  onCancel(): void {
    // Restablece el formulario a los valores originales
    this.preferencesForm.patchValue({
      theme: this.currentUserPreferences.theme,
      language: this.currentUserPreferences.language,
      emailNotifications: this.currentUserPreferences.notifications.email,
      pushNotifications: this.currentUserPreferences.notifications.push
    });
    
    // Asegura que el toggle visualmente refleje el estado correcto
    document.body.classList.toggle('dark-theme', this.currentUserPreferences.theme === 'dark');
  }
}