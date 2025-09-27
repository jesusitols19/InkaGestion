import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environments';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule,HttpClientModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent { 

  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient
  ) {
    this.loginForm = this.fb.group({
      CORREO: ['', Validators.required],
      CONTRASENIA: ['', Validators.required]
    });
  }


  onSubmit() {
    if (this.loginForm.valid) {
      const { CORREO, CONTRASENIA } = this.loginForm.value;

      const body = {
        email: CORREO,
        password: CONTRASENIA
      };

      this.http.post<any>(`${environment.apiUrl}/login`, body).subscribe({
        next: res => {
          if(res.status === "success"){
            console.log('✅ Login exitoso:', res);
            // Guardar en localStorage
            localStorage.setItem('id_usuario_actual', JSON.stringify(res.data.id));
            localStorage.setItem('nombre_usuario_actual', JSON.stringify(res.data.nombre));
            localStorage.setItem('correo_usuario_actual', JSON.stringify(res.data.correo));
            this.router.navigate(['/dashboard']);
          }
          else{
            alert('Credenciales incorrectas');
          }
        },
        error: err => {
          console.error('❌ Error de login:', err);
          alert('Credenciales incorrectas');
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

}
