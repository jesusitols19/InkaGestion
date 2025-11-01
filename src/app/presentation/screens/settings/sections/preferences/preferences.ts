import { Component, OnInit, Inject, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DOCUMENT } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
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
    MatButtonModule, // Ya no se usa MatSlideToggleModule
    MatSnackBarModule,
    MatIconModule
  ],
  templateUrl: './preferences.html',
  styleUrls: ['./preferences.css']
})
export class Preferences implements OnInit {

  preferencesForm!: FormGroup;
  isDarkMode: boolean = false;

  // Simulación de las preferencias actuales del usuario
  currentUserPreferences = {
    theme: 'light', // 'light' o 'dark'
    language: 'es',
  };

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit(): void {
    // Lee el tema guardado desde localStorage
    this.currentUserPreferences.theme = localStorage.getItem('theme') || 'light';
    this.isDarkMode = this.currentUserPreferences.theme === 'dark';
    this.applyTheme(this.isDarkMode); // Aplica el tema al cargar

    this.preferencesForm = this.fb.group({
      theme: [this.currentUserPreferences.theme],
      language: [this.currentUserPreferences.language],
    });
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    const theme = this.isDarkMode ? 'dark' : 'light';
    
    // 1. Aplica el tema visualmente
    this.applyTheme(this.isDarkMode);
    
    // 2. Actualiza el valor en el formulario
    this.preferencesForm.get('theme')?.setValue(theme);
    
    // 3. Guarda en localStorage para persistencia
    localStorage.setItem('theme', theme);
  }

  private applyTheme(isDark: boolean): void {
    if (isDark) {
      this.renderer.addClass(this.document.body, 'dark-theme');
    } else {
      this.renderer.removeClass(this.document.body, 'dark-theme');
    }
  }

  onSubmit(): void {
    if (this.preferencesForm.valid) {
      const newPrefs = this.preferencesForm.value;

      this.currentUserPreferences = {
        theme: newPrefs.theme,
        language: newPrefs.language
      };
      
      // Asegura que localStorage esté sincronizado al guardar
      localStorage.setItem('theme', newPrefs.theme);

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
    // Restablece el formulario a los valores originales guardados
    this.preferencesForm.patchValue({
      theme: this.currentUserPreferences.theme,
      language: this.currentUserPreferences.language,
    });

    // Asegura que el toggle y el tema visual reflejen el estado cancelado
    this.isDarkMode = this.currentUserPreferences.theme === 'dark';
    this.applyTheme(this.isDarkMode);
  }
}

