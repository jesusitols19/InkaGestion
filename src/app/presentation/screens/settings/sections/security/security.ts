import { Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors  } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';


@Component({
  selector: 'app-security',
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    ReactiveFormsModule
  ],
  templateUrl: './security.html',
  styleUrl: './security.css'
})
export class Security implements OnInit{

    
  hideCurrentPassword = true;
  hideNewPassword = true;
  hideConfirmPassword = true;
  isChangingPassword = false;
  passwordForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {}

    ngOnInit(): void {
    this.initializeForms();
  }


  initializeForms(): void {
    // Formulario de perfil

    // Formulario de contraseña
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(8), this.passwordStrengthValidator]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  togglePasswordChange(): void {
    this.isChangingPassword = !this.isChangingPassword;
    
    if (!this.isChangingPassword) {
      this.passwordForm.reset();
    }
  }

    // Validador para confirmar que las contraseñas coincidan
  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

    private showSnackBar(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: type === 'success' ? 'snackbar-success' : 'snackbar-error'
    });
  }
  
  onPasswordSubmit(): void {
    if (this.passwordForm.valid) {
      // Aquí iría la lógica de cambio de contraseña
      // Por ejemplo: this.authService.changePassword(...)
      
      this.showSnackBar('✓ Contraseña actualizada correctamente', 'success');
      this.passwordForm.reset();
      this.isChangingPassword = false;
    }
  }

  getPasswordStrength(): { strength: string; color: string; width: string } {
    const password = this.passwordForm.get('newPassword')?.value || '';
    
    if (password.length === 0) {
      return { strength: '', color: '', width: '0%' };
    }
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

    if (strength <= 2) {
      return { strength: 'Débil', color: '#f44336', width: '33%' };
    } else if (strength <= 4) {
      return { strength: 'Media', color: '#ff9800', width: '66%' };
    } else {
      return { strength: 'Fuerte', color: '#4caf50', width: '100%' };
    }
  }


  // --- Métodos auxiliares para los requisitos de la contraseña en la plantilla ---

  
  private get newPasswordValue(): string {
    return this.passwordForm.get('newPassword')?.value || '';
  }

  hasMinLength(): boolean {
    return this.newPasswordValue.length >= 8;
  }

  hasUpperCase(): boolean {
    return /[A-Z]/.test(this.newPasswordValue);
  }

  hasLowerCase(): boolean {
    return /[a-z]/.test(this.newPasswordValue);
  }

  hasNumeric(): boolean {
    return /[0-9]/.test(this.newPasswordValue);
  }

  hasSpecialChar(): boolean {
    return /[!@#$%^&*(),.?":{}|<>]/.test(this.newPasswordValue);
  }


    // Validador personalizado para contraseñas seguras
  passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumeric = /[0-9]/.test(value);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);

    const valid = hasUpperCase && hasLowerCase && hasNumeric && hasSpecial;

    return !valid ? { passwordStrength: true } : null;
  }



    // Helpers para mensajes de error
  getErrorMessage(fieldName: string): string {
    const field = this.passwordForm.get(fieldName);
    
    // No mostrar error si el campo no ha sido "tocado"
    if (!field || !field.dirty) {
      return '';
    }
    
    if (field.hasError('required')) {
      return 'Este campo es requerido';
    }
    if (field.hasError('minlength')) {
      const minLength = field.errors?.['minlength'].requiredLength;
      return `Mínimo ${minLength} caracteres`;
    }
    if (field.hasError('passwordStrength')) {
      return 'Debe contener mayúsculas, minúsculas, números y caracteres especiales';
    }

    // Comprobación específica para el campo 'confirmPassword'
    if (fieldName === 'confirmPassword' && this.passwordForm.hasError('passwordMismatch')) {
      return 'Las contraseñas no coinciden';
    }
    
    return '';
  }

}
