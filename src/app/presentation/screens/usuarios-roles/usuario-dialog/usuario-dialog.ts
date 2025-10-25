import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';


@Component({
  selector: 'app-usuario-dialog',
  imports: [ CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIcon ],
  templateUrl: './usuario-dialog.html',
  styleUrl: './usuario-dialog.css'
})
export class UsuarioDialog {
userForm: FormGroup;
  isEditMode: boolean = false;
  public hidePassword = true;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<UsuarioDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.isEditMode = !!data?.usuario;

    this.userForm = this.fb.group({
      nombre: [data?.usuario?.nombre || '', [Validators.required, Validators.minLength(3)]],
      correo: [data?.usuario?.correo || '', [Validators.required, Validators.email]],
      password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(6)]],
      role_id: [data?.usuario?.role_id || '', Validators.required]
    });
  }

  onSave() {
    if (this.userForm.valid) {
      this.dialogRef.close(this.userForm.value);
    } else {
      this.userForm.markAllAsTouched();
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
