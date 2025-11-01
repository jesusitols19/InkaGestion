import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider'; // Importar MatDividerModule


@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatSlideToggleModule,
    MatCheckboxModule, // Añadido para checkboxes
    MatButtonModule,
    MatSnackBarModule,
    MatIconModule,
    MatDividerModule // Añadir MatDividerModule aquí
  ],
  templateUrl: './notifications.html',
  styleUrls: ['./notifications.css'] // Asegúrate de crear este archivo CSS
})
export class Notifications implements OnInit {

  notificationsForm!: FormGroup;

  // Simulación de las preferencias de notificación actuales
  currentUserNotificationPrefs = {
    // Notificaciones por Email
    emailPlanillas: true,
    emailReportes: false,
    emailAlertasSistema: true,
    // Notificaciones Push (si tuvieras app móvil o PWA)
    pushAsistencia: true,
    pushPagos: true,
    // Notificaciones SMS
    smsRecordatorios: false,
  };

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.notificationsForm = this.fb.group({
      // Email
      emailPlanillas: [this.currentUserNotificationPrefs.emailPlanillas],
      emailReportes: [this.currentUserNotificationPrefs.emailReportes],
      emailAlertasSistema: [this.currentUserNotificationPrefs.emailAlertasSistema],
      // Push
      pushAsistencia: [this.currentUserNotificationPrefs.pushAsistencia],
      pushPagos: [this.currentUserNotificationPrefs.pushPagos],
      // SMS
      smsRecordatorios: [this.currentUserNotificationPrefs.smsRecordatorios],
    });
  }

  onSubmit(): void {
    if (this.notificationsForm.valid) {
      const newPrefs = this.notificationsForm.value;

      // Simulación de guardado de datos
      this.currentUserNotificationPrefs = { ...newPrefs };

      console.log('Preferencias de notificación guardadas:', this.currentUserNotificationPrefs);

      this.snackBar.open('✓ Preferencias de notificación guardadas', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: 'snackbar-success' // Asegúrate de tener esta clase definida si la usas
      });
    }
  }

  onCancel(): void {
    // Restablece el formulario a los valores originales
    this.notificationsForm.patchValue(this.currentUserNotificationPrefs);
  }
}
