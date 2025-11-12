import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Inject } from '@angular/core';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText: string;
  confirmColor: 'primary' | 'warn' | 'accent';
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css'
})
export class ConfirmDialog {

// Inyectamos los datos y la referencia al diálogo
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialog>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {
    // Damos un color por defecto si no se especifica
    if (!data.confirmColor) {
      data.confirmColor = 'primary';
    }
  }

  // Cierra el diálogo devolviendo 'false' (cancelar)
  onDismiss(): void {
    this.dialogRef.close(false);
  }

  // Cierra el diálogo devolviendo 'true' (confirmar)
  onConfirm(): void {
    this.dialogRef.close(true);
  }
}